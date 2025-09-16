import algosdk from 'algosdk';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import * as crypto from 'crypto';

export interface AlgorandConfig {
    network: 'testnet' | 'mainnet' | 'localnet';
    nodeToken?: string;
    nodeServer?: string;
    nodePort?: number;
}

export interface SecureWallet {
    address: string;
    encryptedMnemonic: string;
    iv: string;
}

export class AlgorandService {
    private client: AlgorandClient;
    private algodClient: algosdk.Algodv2;
    private config: AlgorandConfig;

    constructor(config: AlgorandConfig) {
        this.config = config;
        this.client = this.initializeClient();
        this.algodClient = this.initializeAlgodClient();
    }

    private initializeClient(): AlgorandClient {
        switch (this.config.network) {
            case 'testnet':
                return AlgorandClient.testNet();
            case 'mainnet':
                return AlgorandClient.mainNet();
            case 'localnet':
                return AlgorandClient.defaultLocalNet();
            default:
                throw new Error(`Unsupported network: ${this.config.network}`);
        }
    }

    private initializeAlgodClient(): algosdk.Algodv2 {
        switch (this.config.network) {
            case 'testnet':
                return new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
            case 'mainnet':
                return new algosdk.Algodv2('', 'https://mainnet-api.algonode.cloud', '');
            case 'localnet':
                return new algosdk.Algodv2(
                    this.config.nodeToken || '',
                    this.config.nodeServer || 'http://localhost',
                    this.config.nodePort || 4001
                );
            default:
                throw new Error(`Unsupported network: ${this.config.network}`);
        }
    }

    /**
     * Securely encrypt a mnemonic phrase using AES-256-GCM
     */
    encryptMnemonic(mnemonic: string, password: string): { encryptedMnemonic: string; iv: string } {
        const key = crypto.scryptSync(password, 'salt', 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        let encrypted = cipher.update(mnemonic, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return {
            encryptedMnemonic: encrypted + ':' + authTag.toString('hex'),
            iv: iv.toString('hex')
        };
    }

    /**
     * Decrypt a mnemonic phrase
     */
    decryptMnemonic(encryptedData: string, iv: string, password: string): string {
        const key = crypto.scryptSync(password, 'salt', 32);
        const [encrypted, authTag] = encryptedData.split(':');

        if (!encrypted || !authTag) {
            throw new Error('Invalid encrypted data format');
        }

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Generate a new Algorand account
     */
    generateAccount(): { account: algosdk.Account; mnemonic: string } {
        const account = algosdk.generateAccount();
        const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

        return { account, mnemonic };
    }

    /**
     * Import account from mnemonic
     */
    importAccountFromMnemonic(mnemonic: string): algosdk.Account {
        return algosdk.mnemonicToSecretKey(mnemonic);
    }

    /**
     * Get account information
     */
    async getAccountInfo(address: string) {
        try {
            const accountInfo = await this.algodClient.accountInformation(address).do();
            return {
                address: accountInfo.address,
                balance: accountInfo.amount,
                minBalance: accountInfo.minBalance,
                status: accountInfo.status,
                assets: accountInfo.assets || [],
                appsLocalState: accountInfo.appsLocalState || [],
                createdApps: accountInfo.createdApps || [],
                createdAssets: accountInfo.createdAssets || []
            };
        } catch (error) {
            throw new Error(`Failed to get account info: ${error}`);
        }
    }

    /**
     * Send payment transaction
     */
    async sendPayment(
        fromMnemonic: string,
        toAddress: string,
        amount: number,
        note?: string
    ) {
        try {
            const fromAccount = this.importAccountFromMnemonic(fromMnemonic);
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const txnParams: any = {
                sender: fromAccount.addr,
                receiver: toAddress,
                amount: amount,
                suggestedParams,
            };

            if (note) {
                txnParams.note = new TextEncoder().encode(note);
            }

            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject(txnParams);

            const signedTxn = txn.signTxn(fromAccount.sk);
            const response = await this.algodClient.sendRawTransaction(signedTxn).do();
            const txId = response.txid || txn.txID();

            // Wait for confirmation
            const result = await algosdk.waitForConfirmation(this.algodClient, txId, 4);

            return {
                txId,
                confirmedRound: result.confirmedRound,
            };
        } catch (error) {
            throw new Error(`Payment failed: ${error}`);
        }
    }

    /**
     * Create and configure an asset (ASA)
     */
    async createAsset(
        creatorMnemonic: string,
        assetName: string,
        unitName: string,
        totalSupply: number,
        decimals: number = 0,
        defaultFrozen: boolean = false,
        url?: string,
        metadataHash?: string
    ) {
        try {
            const creatorAccount = this.importAccountFromMnemonic(creatorMnemonic);
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const assetParams: any = {
                sender: creatorAccount.addr,
                assetName,
                unitName,
                total: totalSupply,
                decimals,
                defaultFrozen,
                manager: creatorAccount.addr,
                reserve: creatorAccount.addr,
                freeze: creatorAccount.addr,
                clawback: creatorAccount.addr,
                suggestedParams,
            };

            if (url) {
                assetParams.assetURL = url;
            }

            if (metadataHash) {
                assetParams.assetMetadataHash = new TextEncoder().encode(metadataHash);
            }

            const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject(assetParams);

            const signedTxn = txn.signTxn(creatorAccount.sk);
            const response = await this.algodClient.sendRawTransaction(signedTxn).do();
            const txId = response.txid || txn.txID();

            // Wait for confirmation
            const result = await algosdk.waitForConfirmation(this.algodClient, txId, 4);

            return {
                txId,
                confirmedRound: result.confirmedRound,
                assetId: result.assetIndex,
            };
        } catch (error) {
            throw new Error(`Asset creation failed: ${error}`);
        }
    }

    /**
     * Opt into an asset
     */
    async optInToAsset(accountMnemonic: string, assetId: number) {
        try {
            const account = this.importAccountFromMnemonic(accountMnemonic);
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                sender: account.addr,
                receiver: account.addr,
                amount: 0,
                assetIndex: assetId,
                suggestedParams,
            });

            const signedTxn = txn.signTxn(account.sk);
            const response = await this.algodClient.sendRawTransaction(signedTxn).do();
            const txId = response.txid || txn.txID();

            // Wait for confirmation
            const result = await algosdk.waitForConfirmation(this.algodClient, txId, 4);

            return {
                txId,
                confirmedRound: result.confirmedRound,
            };
        } catch (error) {
            throw new Error(`Asset opt-in failed: ${error}`);
        }
    }

    /**
     * Transfer an asset
     */
    async transferAsset(
        fromMnemonic: string,
        toAddress: string,
        assetId: number,
        amount: number,
        note?: string
    ) {
        try {
            const fromAccount = this.importAccountFromMnemonic(fromMnemonic);
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const transferParams: any = {
                sender: fromAccount.addr,
                receiver: toAddress,
                amount,
                assetIndex: assetId,
                suggestedParams,
            };

            if (note) {
                transferParams.note = new TextEncoder().encode(note);
            }

            const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(transferParams);

            const signedTxn = txn.signTxn(fromAccount.sk);
            const response = await this.algodClient.sendRawTransaction(signedTxn).do();
            const txId = response.txid || txn.txID();

            // Wait for confirmation
            const result = await algosdk.waitForConfirmation(this.algodClient, txId, 4);

            return {
                txId,
                confirmedRound: result.confirmedRound,
            };
        } catch (error) {
            throw new Error(`Asset transfer failed: ${error}`);
        }
    }

    /**
     * Get asset information
     */
    async getAssetInfo(assetId: number) {
        try {
            const assetInfo = await this.algodClient.getAssetByID(assetId).do();
            return {
                id: assetInfo.index,
                params: assetInfo.params,
            };
        } catch (error) {
            throw new Error(`Failed to get asset info: ${error}`);
        }
    }

    /**
     * Get transaction information
     */
    async getTransaction(txId: string) {
        try {
            const txInfo = await this.algodClient.pendingTransactionInformation(txId).do();
            return txInfo;
        } catch (error) {
            throw new Error(`Failed to get transaction: ${error}`);
        }
    }

    /**
     * Store wallet securely with encrypted mnemonic
     */
    async storeWallet(name: string, mnemonic: string, password: string): Promise<SecureWallet> {
        try {
            const account = this.importAccountFromMnemonic(mnemonic);
            
            // Generate a random IV
            const iv = crypto.randomBytes(16);
            
            // Create cipher
            const key = crypto.scryptSync(password, 'salt', 32);
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
            
            // Encrypt the mnemonic
            let encrypted = cipher.update(mnemonic, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            // Combine IV, auth tag, and encrypted data
            const encryptedMnemonic = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
            
            return {
                address: account.addr.toString(),
                encryptedMnemonic,
                iv: iv.toString('hex')
            };
        } catch (error) {
            throw new Error(`Failed to store wallet: ${error}`);
        }
    }

    /**
     * Load wallet and return address
     */
    async loadWallet(name: string, password: string): Promise<{ address: string }> {
        try {
            // This is a placeholder - in a real implementation, you'd retrieve from storage
            // For now, we'll just return a mock response
            throw new Error('Wallet storage not implemented - use in-memory storage instead');
        } catch (error) {
            throw new Error(`Failed to load wallet: ${error}`);
        }
    }
}
