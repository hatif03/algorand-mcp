import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PeraSwap } from '@perawallet/swap';
import algosdk from 'algosdk';

export class SwapService {
    private peraSwap: PeraSwap;
    private algodClient: algosdk.Algodv2;

    constructor(network: 'testnet' | 'mainnet' = 'testnet') {
        this.peraSwap = new PeraSwap(network);
        this.algodClient = new algosdk.Algodv2(
            '',
            network === 'testnet' ? 'https://testnet-api.algonode.cloud' : 'https://mainnet-api.algonode.cloud',
            ''
        );
    }

    async getSwapQuote(
        fromAssetId: number,
        toAssetId: number,
        amount: string,
        walletAddress: string,
        slippage: string = '0.005' // 0.5% default slippage
    ): Promise<any> {
        try {
            const response = await this.peraSwap.createQuote({
                providers: ['tinyman', 'vestige-v4'],
                swapper_address: walletAddress,
                swap_type: 'fixed-input',
                asset_in_id: fromAssetId,
                asset_out_id: toAssetId,
                amount: amount,
                slippage: slippage
            });

            return response.results[0]; // Return the best quote
        } catch (error) {
            throw new Error(`Failed to get swap quote: ${error}`);
        }
    }

    async executeSwap(
        quoteId: string,
        mnemonic: string
    ): Promise<{ txId: string; confirmedRound: number }> {
        const account = algosdk.mnemonicToSecretKey(mnemonic);

        try {
            // Get prepared transactions from Pera
            const preparedTxns = await this.peraSwap.prepareTransactions(quoteId);
            
            if (!preparedTxns.transaction_groups || preparedTxns.transaction_groups.length === 0) {
                throw new Error("No transaction groups received from Pera Swap");
            }

            console.log(`Processing ${preparedTxns.transaction_groups.length} transaction groups`);

            // Process each transaction group separately and submit them individually
            let finalTxId = "";
            let finalConfirmedRound = 0;
            
            for (const group of preparedTxns.transaction_groups) {
                console.log(`Processing group: ${group.purpose}`);
                
                if (!group.transactions || group.transactions.length === 0) {
                    console.log("No transactions in this group, skipping");
                    continue;
                }

                const txnGroup: algosdk.Transaction[] = [];
                
                // Decode all transactions in this group
                for (let i = 0; i < group.transactions.length; i++) {
                    const txnB64 = group.transactions[i];
                    if (!txnB64) {
                        console.log(`Skipping null transaction at index ${i}`);
                        continue;
                    }
                    
                    try {
                        const txnBytes = new Uint8Array(Buffer.from(txnB64, 'base64'));
                        const txn = algosdk.decodeUnsignedTransaction(txnBytes);
                        txnGroup.push(txn);
                        
                        const fromAddr = (txn as any).from;
                        const txnFromAddress = typeof fromAddr === 'string' ? fromAddr : algosdk.encodeAddress(fromAddr.publicKey);
                        console.log(`Transaction ${i + 1}: from ${txnFromAddress}, type: ${txn.type}`);
                    } catch (error) {
                        console.error(`Error decoding transaction ${i}:`, error);
                    }
                }

                if (txnGroup.length === 0) {
                    console.log("No valid transactions to process in this group");
                    continue;
                }

                // DON'T assign new group IDs - Pera has already set them correctly
                console.log(`Keeping original group IDs for ${txnGroup.length} transactions`);

                // Sign only the transactions that are from our address
                const signedTxns: Uint8Array[] = [];
                
                for (let i = 0; i < txnGroup.length; i++) {
                    const txn = txnGroup[i];
                    const fromAddr = (txn as any).from;
                    const txnFromAddress = typeof fromAddr === 'string' ? fromAddr : algosdk.encodeAddress(fromAddr.publicKey);
                    
                    if (txnFromAddress === String(account.addr)) {
                        // This transaction is from our address - we sign it
                        const signedTxn = txn!.signTxn(account.sk);
                        signedTxns.push(signedTxn);
                        console.log(`Signed transaction ${i + 1} from our address`);
                    } else {
                        // This transaction is from another address - check if Pera provided a signed version
                        if (group.signed_transactions && group.signed_transactions[i]) {
                            const signedTxnB64 = group.signed_transactions[i];
                            if (signedTxnB64) {
                                const signedTxnBytes = new Uint8Array(Buffer.from(signedTxnB64, 'base64'));
                                signedTxns.push(signedTxnBytes);
                                console.log(`Using pre-signed transaction ${i + 1} from ${txnFromAddress}`);
                            }
                        } else {
                            // This is likely a logic signature transaction - include it unsigned
                            const encodedTxn = algosdk.encodeUnsignedTransaction(txn!);
                            signedTxns.push(encodedTxn);
                            console.log(`Including unsigned transaction ${i + 1} from ${txnFromAddress} (likely LogicSig)`);
                        }
                    }
                }

                if (signedTxns.length === 0) {
                    console.log("No transactions to submit in this group");
                    continue;
                }

                console.log(`Submitting ${signedTxns.length} transactions for group: ${group.purpose}`);

                // Submit this group of transactions
                const response = await this.algodClient.sendRawTransaction(signedTxns).do();
                const txId = response.txid;
                console.log(`Group ${group.purpose} submitted with txId: ${txId}`);
                
                // Wait for confirmation
                const confirmedTxn = await algosdk.waitForConfirmation(this.algodClient, txId, 4);
                
                finalTxId = txId;
                finalConfirmedRound = Number(confirmedTxn.confirmedRound || 0);
                
                console.log(`Group ${group.purpose} confirmed in round: ${finalConfirmedRound}`);
            }
            
            if (!finalTxId) {
                throw new Error("No transactions were submitted");
            }
            
            return {
                txId: finalTxId,
                confirmedRound: finalConfirmedRound
            };
        } catch (error) {
            console.error("Detailed swap error:", error);
            throw new Error(`Swap execution failed: ${error}`);
        }
    }

    async searchSwapAssets(query: string): Promise<any[]> {
        try {
            return await this.peraSwap.searchAssets(query);
        } catch (error) {
            console.error("Error searching assets:", error);
            return [];
        }
    }

    async getAvailableSwapAssets(assetInId: number): Promise<any[]> {
        try {
            const response = await this.peraSwap.getAvailableAssets({ asset_in_id: assetInId });
            return response.results;
        } catch (error) {
            console.error("Error getting available assets:", error);
            return [];
        }
    }

    async getSwapAsset(assetId: number): Promise<any | null> {
        try {
            return await this.peraSwap.getAsset(assetId);
        } catch (error) {
            console.error("Error getting swap asset:", error);
            return null;
        }
    }
}

export const SwapTools: Tool[] = [
    {
        name: 'get_swap_quote',
        description: 'Get a swap quote for exchanging Algorand assets using Pera Swap',
        inputSchema: {
            type: 'object',
            properties: {
                fromAssetId: {
                    type: 'number',
                    description: 'Asset ID to swap from (0 for ALGO)',
                },
                toAssetId: {
                    type: 'number',
                    description: 'Asset ID to swap to (0 for ALGO)',
                },
                amount: {
                    type: 'string',
                    description: 'Amount to swap (in base units)',
                },
                walletAddress: {
                    type: 'string',
                    description: 'Wallet address performing the swap',
                },
                slippage: {
                    type: 'string',
                    description: 'Slippage tolerance (default: 0.005 for 0.5%)',
                },
            },
            required: ['fromAssetId', 'toAssetId', 'amount', 'walletAddress'],
        },
    },
    {
        name: 'execute_swap',
        description: 'Execute a swap transaction using a quote ID from Pera Swap (WARNING: Requires mnemonic phrase)',
        inputSchema: {
            type: 'object',
            properties: {
                quoteId: {
                    type: 'string',
                    description: 'Quote ID from get_swap_quote',
                },
                mnemonic: {
                    type: 'string',
                    description: 'Wallet mnemonic phrase (25 words)',
                },
            },
            required: ['quoteId', 'mnemonic'],
        },
    },
    {
        name: 'search_swap_assets',
        description: 'Search for assets available for swapping',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query for asset name or symbol',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'get_available_swap_assets',
        description: 'Get assets that can be swapped with a given input asset',
        inputSchema: {
            type: 'object',
            properties: {
                assetInId: {
                    type: 'number',
                    description: 'Input asset ID to find swap pairs for',
                },
            },
            required: ['assetInId'],
        },
    },
    {
        name: 'get_swap_asset_info',
        description: 'Get detailed information about an asset for swapping',
        inputSchema: {
            type: 'object',
            properties: {
                assetId: {
                    type: 'number',
                    description: 'Asset ID to get information for',
                },
            },
            required: ['assetId'],
        },
    },
];
