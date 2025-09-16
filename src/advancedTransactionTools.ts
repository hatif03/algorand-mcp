import algosdk from 'algosdk';
import { z } from 'zod';

/**
 * Advanced transaction tools for Algorand
 * Includes atomic groups, application transactions, and complex operations
 */

export const AdvancedTransactionTools = [
    // Atomic Transaction Groups
    {
        name: 'create_atomic_group',
        description: 'Create an atomic transaction group from multiple transactions',
        inputSchema: {
            type: 'object' as const,
            properties: {
                transactions: {
                    type: 'array',
                    description: 'Array of transaction objects to group together',
                    items: {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                enum: ['pay', 'axfer', 'acfg', 'appl', 'afrz', 'keyreg']
                            },
                            from: { type: 'string' },
                            to: { type: 'string' },
                            amount: { type: 'number' },
                            assetId: { type: 'number' },
                            appId: { type: 'number' },
                            appArgs: { type: 'array', items: { type: 'string' } },
                            note: { type: 'string' }
                        }
                    }
                }
            },
            required: ['transactions']
        }
    },
    {
        name: 'sign_atomic_group',
        description: 'Sign an atomic transaction group',
        inputSchema: {
            type: 'object' as const,
            properties: {
                transactions: {
                    type: 'array',
                    description: 'Array of unsigned transactions'
                },
                mnemonic: {
                    type: 'string',
                    description: 'Mnemonic phrase for signing'
                }
            },
            required: ['transactions', 'mnemonic']
        }
    },
    {
        name: 'submit_atomic_group',
        description: 'Submit a signed atomic transaction group to the network',
        inputSchema: {
            type: 'object' as const,
            properties: {
                signedTransactions: {
                    type: 'array',
                    description: 'Array of signed transactions'
                }
            },
            required: ['signedTransactions']
        }
    },
    
    // Application Transactions
    {
        name: 'create_application',
        description: 'Create a new smart contract application on Algorand',
        inputSchema: {
            type: 'object' as const,
            properties: {
                from: {
                    type: 'string',
                    description: 'Creator address'
                },
                approvalProgram: {
                    type: 'string',
                    description: 'Approval program TEAL code'
                },
                clearProgram: {
                    type: 'string',
                    description: 'Clear program TEAL code'
                },
                globalSchema: {
                    type: 'object',
                    properties: {
                        numUint: { type: 'number' },
                        numByteSlice: { type: 'number' }
                    }
                },
                localSchema: {
                    type: 'object',
                    properties: {
                        numUint: { type: 'number' },
                        numByteSlice: { type: 'number' }
                    }
                },
                appArgs: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Application arguments'
                }
            },
            required: ['from', 'approvalProgram', 'clearProgram']
        }
    },
    {
        name: 'call_application',
        description: 'Call a smart contract application on Algorand',
        inputSchema: {
            type: 'object' as const,
            properties: {
                from: {
                    type: 'string',
                    description: 'Caller address'
                },
                appId: {
                    type: 'number',
                    description: 'Application ID to call'
                },
                appArgs: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Application arguments'
                },
                accounts: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Additional accounts'
                },
                foreignApps: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Foreign applications'
                },
                foreignAssets: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Foreign assets'
                }
            },
            required: ['from', 'appId']
        }
    },
    {
        name: 'optin_application',
        description: 'Opt-in to an Algorand application',
        inputSchema: {
            type: 'object' as const,
            properties: {
                from: {
                    type: 'string',
                    description: 'Account address opting in'
                },
                appId: {
                    type: 'number',
                    description: 'Application ID to opt-in to'
                }
            },
            required: ['from', 'appId']
        }
    },
    {
        name: 'closeout_application',
        description: 'Close out from an Algorand application',
        inputSchema: {
            type: 'object' as const,
            properties: {
                from: {
                    type: 'string',
                    description: 'Account address closing out'
                },
                appId: {
                    type: 'number',
                    description: 'Application ID to close out from'
                }
            },
            required: ['from', 'appId']
        }
    },
    
    // Key Registration
    {
        name: 'create_key_registration_transaction',
        description: 'Create a key registration transaction for participation',
        inputSchema: {
            type: 'object' as const,
            properties: {
                from: {
                    type: 'string',
                    description: 'Account address'
                },
                voteKey: {
                    type: 'string',
                    description: 'Vote key'
                },
                selectionKey: {
                    type: 'string',
                    description: 'Selection key'
                },
                stateProofKey: {
                    type: 'string',
                    description: 'State proof key'
                },
                voteFirst: {
                    type: 'number',
                    description: 'First round to vote'
                },
                voteLast: {
                    type: 'number',
                    description: 'Last round to vote'
                },
                voteKeyDilution: {
                    type: 'number',
                    description: 'Vote key dilution'
                }
            },
            required: ['from', 'voteKey', 'selectionKey', 'voteFirst', 'voteLast', 'voteKeyDilution']
        }
    },
    
    // Asset Freeze
    {
        name: 'freeze_asset',
        description: 'Freeze or unfreeze an asset for an account',
        inputSchema: {
            type: 'object' as const,
            properties: {
                from: {
                    type: 'string',
                    description: 'Freeze manager address'
                },
                assetId: {
                    type: 'number',
                    description: 'Asset ID to freeze/unfreeze'
                },
                target: {
                    type: 'string',
                    description: 'Target account address'
                },
                freezeState: {
                    type: 'boolean',
                    description: 'True to freeze, false to unfreeze'
                }
            },
            required: ['from', 'assetId', 'target', 'freezeState']
        }
    }
];

// Schema definitions
export const CreateAtomicGroupSchema = z.object({
    transactions: z.array(z.object({
        type: z.enum(['pay', 'axfer', 'acfg', 'appl', 'afrz', 'keyreg']),
        from: z.string().optional(),
        to: z.string().optional(),
        amount: z.number().optional(),
        assetId: z.number().optional(),
        appId: z.number().optional(),
        appArgs: z.array(z.string()).optional(),
        note: z.string().optional()
    }))
});

export const SignAtomicGroupSchema = z.object({
    transactions: z.array(z.any()),
    mnemonic: z.string()
});

export const SubmitAtomicGroupSchema = z.object({
    signedTransactions: z.array(z.any())
});

export const CreateApplicationSchema = z.object({
    from: z.string(),
    approvalProgram: z.string(),
    clearProgram: z.string(),
    globalSchema: z.object({
        numUint: z.number(),
        numByteSlice: z.number()
    }).optional(),
    localSchema: z.object({
        numUint: z.number(),
        numByteSlice: z.number()
    }).optional(),
    appArgs: z.array(z.string()).optional()
});

export const CallApplicationSchema = z.object({
    from: z.string(),
    appId: z.number().int().positive(),
    appArgs: z.array(z.string()).optional(),
    accounts: z.array(z.string()).optional(),
    foreignApps: z.array(z.number()).optional(),
    foreignAssets: z.array(z.number()).optional()
});

export const OptinApplicationSchema = z.object({
    from: z.string(),
    appId: z.number().int().positive()
});

export const CloseoutApplicationSchema = z.object({
    from: z.string(),
    appId: z.number().int().positive()
});

export const CreateKeyRegistrationSchema = z.object({
    from: z.string(),
    voteKey: z.string(),
    selectionKey: z.string(),
    stateProofKey: z.string().optional(),
    voteFirst: z.number().int().positive(),
    voteLast: z.number().int().positive(),
    voteKeyDilution: z.number().int().positive()
});

export const FreezeAssetSchema = z.object({
    from: z.string(),
    assetId: z.number().int().positive(),
    target: z.string(),
    freezeState: z.boolean()
});

// Advanced Transaction Service
export class AdvancedTransactionService {
    private algodClient: algosdk.Algodv2;

    constructor(algodClient: algosdk.Algodv2) {
        this.algodClient = algodClient;
    }

    async createAtomicGroup(transactions: any[]): Promise<{ groupId: string; transactions: any[] }> {
        try {
            // Get transaction params once
            const suggestedParams = await this.algodClient.getTransactionParams().do();
            
            // Convert transaction objects to algosdk transactions
            const algosdkTxs = await Promise.all(transactions.map(async tx => {
                let algosdkTx;
                
                switch (tx.type) {
                    case 'pay':
                        algosdkTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                            sender: tx.from,
                            receiver: tx.to,
                            amount: tx.amount,
                            note: tx.note,
                            suggestedParams
                        });
                        break;
                    case 'axfer':
                        algosdkTx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                            sender: tx.from,
                            receiver: tx.to,
                            amount: tx.amount,
                            assetIndex: tx.assetId,
                            note: tx.note,
                            suggestedParams
                        });
                        break;
                    case 'appl':
                        algosdkTx = algosdk.makeApplicationCallTxnFromObject({
                            sender: tx.from,
                            appIndex: tx.appId,
                            appArgs: tx.appArgs?.map((arg: string) => new Uint8Array(Buffer.from(arg, 'base64'))),
                            onComplete: algosdk.OnApplicationComplete.NoOpOC,
                            suggestedParams
                        });
                        break;
                    default:
                        throw new Error(`Unsupported transaction type: ${tx.type}`);
                }
                
                return algosdkTx;
            }));

            // Assign group ID
            algosdk.assignGroupID(algosdkTxs);
            
            return {
                groupId: algosdkTxs[0]?.group ? Buffer.from(algosdkTxs[0].group).toString('base64') : '',
                transactions: algosdkTxs
            };
        } catch (error: any) {
            throw new Error(`Error creating atomic group: ${error.message || 'Unknown error'}`);
        }
    }

    async signAtomicGroup(transactions: any[], mnemonic: string): Promise<{ signedTransactions: any[] }> {
        try {
            const account = algosdk.mnemonicToSecretKey(mnemonic);
            const signedTxs = transactions.map(tx => algosdk.signTransaction(tx, account.sk));
            
            return { signedTransactions: signedTxs };
        } catch (error: any) {
            throw new Error(`Error signing atomic group: ${error.message || 'Unknown error'}`);
        }
    }

    async submitAtomicGroup(signedTransactions: any[]): Promise<{ txId: string; confirmedRound: number }> {
        try {
            const result = await this.algodClient.sendRawTransaction(signedTransactions).do();
            return {
                txId: result.txid,
                confirmedRound: 0
            };
        } catch (error: any) {
            throw new Error(`Error submitting atomic group: ${error.message || 'Unknown error'}`);
        }
    }

    async createApplication(params: any): Promise<{ txId: string; appId: number }> {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();
            
            const createAppTxn = algosdk.makeApplicationCreateTxnFromObject({
                sender: params.from,
                suggestedParams,
                onComplete: algosdk.OnApplicationComplete.NoOpOC,
                approvalProgram: Buffer.from(params.approvalProgram, 'base64'),
                clearProgram: Buffer.from(params.clearProgram, 'base64'),
                numGlobalByteSlices: params.globalSchema?.numByteSlice || 0,
                numGlobalInts: params.globalSchema?.numUint || 0,
                numLocalByteSlices: params.localSchema?.numByteSlice || 0,
                numLocalInts: params.localSchema?.numUint || 0,
                appArgs: params.appArgs?.map((arg: string) => new Uint8Array(Buffer.from(arg, 'base64')))
            });

            const result = await this.algodClient.sendRawTransaction(createAppTxn.signTxn(algosdk.mnemonicToSecretKey(params.mnemonic).sk)).do();
            
            // Get the created app ID from the transaction result
            const txInfo = await this.algodClient.pendingTransactionInformation(result.txid).do();
            const appId = txInfo.applicationIndex;

            return {
                txId: result.txid,
                appId: Number(appId)
            };
        } catch (error: any) {
            throw new Error(`Error creating application: ${error.message || 'Unknown error'}`);
        }
    }

    async callApplication(params: any): Promise<{ txId: string }> {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();
            
            const callAppTxn = algosdk.makeApplicationCallTxnFromObject({
                sender: params.from,
                suggestedParams,
                appIndex: params.appId,
                appArgs: params.appArgs?.map((arg: string) => new Uint8Array(Buffer.from(arg, 'base64'))),
                accounts: params.accounts,
                foreignApps: params.foreignApps,
                foreignAssets: params.foreignAssets,
                onComplete: algosdk.OnApplicationComplete.NoOpOC
            });

            const result = await this.algodClient.sendRawTransaction(callAppTxn.signTxn(algosdk.mnemonicToSecretKey(params.mnemonic).sk)).do();
            
            return { txId: result.txid };
        } catch (error: any) {
            throw new Error(`Error calling application: ${error.message || 'Unknown error'}`);
        }
    }

    async optinApplication(params: any): Promise<{ txId: string }> {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();
            
            const optInTxn = algosdk.makeApplicationOptInTxnFromObject({
                sender: params.from,
                suggestedParams,
                appIndex: params.appId
            });

            const result = await this.algodClient.sendRawTransaction(optInTxn.signTxn(algosdk.mnemonicToSecretKey(params.mnemonic).sk)).do();
            
            return { txId: result.txid };
        } catch (error: any) {
            throw new Error(`Error opting in to application: ${error.message || 'Unknown error'}`);
        }
    }

    async closeoutApplication(params: any): Promise<{ txId: string }> {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();
            
            const closeOutTxn = algosdk.makeApplicationCloseOutTxnFromObject({
                sender: params.from,
                suggestedParams,
                appIndex: params.appId
            });

            const result = await this.algodClient.sendRawTransaction(closeOutTxn.signTxn(algosdk.mnemonicToSecretKey(params.mnemonic).sk)).do();
            
            return { txId: result.txid };
        } catch (error: any) {
            throw new Error(`Error closing out application: ${error.message || 'Unknown error'}`);
        }
    }

    async createKeyRegistrationTransaction(params: any): Promise<{ transaction: any }> {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();
            
            const keyRegTxn = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
                sender: params.from,
                suggestedParams,
                voteKey: Buffer.from(params.voteKey, 'base64'),
                selectionKey: Buffer.from(params.selectionKey, 'base64'),
                stateProofKey: params.stateProofKey ? Buffer.from(params.stateProofKey, 'base64') : new Uint8Array(0),
                voteFirst: params.voteFirst,
                voteLast: params.voteLast,
                voteKeyDilution: params.voteKeyDilution
            });

            return { transaction: keyRegTxn };
        } catch (error: any) {
            throw new Error(`Error creating key registration transaction: ${error.message || 'Unknown error'}`);
        }
    }

    async freezeAsset(params: any): Promise<{ txId: string }> {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();
            
            const freezeTxn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject({
                sender: params.from,
                suggestedParams,
                assetIndex: params.assetId,
                freezeTarget: params.target, frozen: params.freezeState,
                
            });

            const result = await this.algodClient.sendRawTransaction(freezeTxn.signTxn(algosdk.mnemonicToSecretKey(params.mnemonic).sk)).do();
            
            return { txId: result.txid };
        } catch (error: any) {
            throw new Error(`Error freezing asset: ${error.message || 'Unknown error'}`);
        }
    }
}
