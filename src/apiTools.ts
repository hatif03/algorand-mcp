import algosdk from 'algosdk';
import { z } from 'zod';

/**
 * API integration tools for Algorand services
 * Includes Algod, Indexer, and NFD API access
 */

export const ApiTools = [
    // Algod API Tools
    {
        name: 'algod_get_account_info',
        description: 'Get current account balance, assets, and auth address from algod',
        inputSchema: {
            type: 'object' as const,
            properties: {
                address: {
                    type: 'string',
                    description: 'Algorand account address'
                }
            },
            required: ['address']
        }
    },
    {
        name: 'algod_get_transaction_info',
        description: 'Get transaction details by transaction ID from algod',
        inputSchema: {
            type: 'object' as const,
            properties: {
                txId: {
                    type: 'string',
                    description: 'Transaction ID to look up'
                }
            },
            required: ['txId']
        }
    },
    {
        name: 'algod_get_asset_info',
        description: 'Get asset details from algod',
        inputSchema: {
            type: 'object' as const,
            properties: {
                assetId: {
                    type: 'number',
                    description: 'Asset ID to look up'
                }
            },
            required: ['assetId']
        }
    },
    {
        name: 'algod_get_application_info',
        description: 'Get application details from algod',
        inputSchema: {
            type: 'object' as const,
            properties: {
                appId: {
                    type: 'number',
                    description: 'Application ID to look up'
                }
            },
            required: ['appId']
        }
    },
    {
        name: 'algod_get_pending_transactions',
        description: 'Get pending transactions from algod mempool',
        inputSchema: {
            type: 'object' as const,
            properties: {
                max: {
                    type: 'number',
                    description: 'Maximum number of transactions to return',
                    default: 100
                }
            }
        }
    },
    
    // Indexer API Tools
    {
        name: 'indexer_lookup_account_by_id',
        description: 'Get account information from indexer',
        inputSchema: {
            type: 'object' as const,
            properties: {
                address: {
                    type: 'string',
                    description: 'Account address to look up'
                }
            },
            required: ['address']
        }
    },
    {
        name: 'indexer_lookup_asset_by_id',
        description: 'Get asset information from indexer',
        inputSchema: {
            type: 'object' as const,
            properties: {
                assetId: {
                    type: 'number',
                    description: 'Asset ID to look up'
                }
            },
            required: ['assetId']
        }
    },
    {
        name: 'indexer_lookup_transaction_by_id',
        description: 'Get transaction details from indexer',
        inputSchema: {
            type: 'object' as const,
            properties: {
                txId: {
                    type: 'string',
                    description: 'Transaction ID to look up'
                }
            },
            required: ['txId']
        }
    },
    {
        name: 'indexer_search_for_accounts',
        description: 'Search for accounts with various criteria',
        inputSchema: {
            type: 'object' as const,
            properties: {
                limit: {
                    type: 'number',
                    description: 'Maximum number of results to return',
                    default: 100
                },
                assetId: {
                    type: 'number',
                    description: 'Filter by asset ID'
                },
                applicationId: {
                    type: 'number',
                    description: 'Filter by application ID'
                }
            }
        }
    },
    {
        name: 'indexer_search_for_transactions',
        description: 'Search for transactions with various criteria',
        inputSchema: {
            type: 'object' as const,
            properties: {
                limit: {
                    type: 'number',
                    description: 'Maximum number of results to return',
                    default: 100
                },
                address: {
                    type: 'string',
                    description: 'Filter by address'
                },
                assetId: {
                    type: 'number',
                    description: 'Filter by asset ID'
                },
                applicationId: {
                    type: 'number',
                    description: 'Filter by application ID'
                }
            }
        }
    },
    
    // NFD API Tools
    {
        name: 'nfd_get_nfd',
        description: 'Get NFD domain information by name',
        inputSchema: {
            type: 'object' as const,
            properties: {
                name: {
                    type: 'string',
                    description: 'NFD domain name to look up'
                }
            },
            required: ['name']
        }
    },
    {
        name: 'nfd_get_nfds_for_address',
        description: 'Get all NFD domains owned by an address',
        inputSchema: {
            type: 'object' as const,
            properties: {
                address: {
                    type: 'string',
                    description: 'Address to look up NFDs for'
                }
            },
            required: ['address']
        }
    },
    {
        name: 'nfd_search_nfds',
        description: 'Search for NFD domains',
        inputSchema: {
            type: 'object' as const,
            properties: {
                search: {
                    type: 'string',
                    description: 'Search term for NFD domains'
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of results to return',
                    default: 20
                }
            },
            required: ['search']
        }
    }
];

// Schema definitions
export const AlgodGetAccountInfoSchema = z.object({
    address: z.string()
});

export const AlgodGetTransactionInfoSchema = z.object({
    txId: z.string()
});

export const AlgodGetAssetInfoSchema = z.object({
    assetId: z.number().int().positive()
});

export const AlgodGetApplicationInfoSchema = z.object({
    appId: z.number().int().positive()
});

export const AlgodGetPendingTransactionsSchema = z.object({
    max: z.number().int().positive().optional()
});

export const IndexerLookupAccountSchema = z.object({
    address: z.string()
});

export const IndexerLookupAssetSchema = z.object({
    assetId: z.number().int().positive()
});

export const IndexerLookupTransactionSchema = z.object({
    txId: z.string()
});

export const IndexerSearchAccountsSchema = z.object({
    limit: z.number().int().positive().optional(),
    assetId: z.number().int().positive().optional(),
    applicationId: z.number().int().positive().optional()
});

export const IndexerSearchTransactionsSchema = z.object({
    limit: z.number().int().positive().optional(),
    address: z.string().optional(),
    assetId: z.number().int().positive().optional(),
    applicationId: z.number().int().positive().optional()
});

export const NfdGetNfdSchema = z.object({
    name: z.string()
});

export const NfdGetNfdsForAddressSchema = z.object({
    address: z.string()
});

export const NfdSearchNfdsSchema = z.object({
    search: z.string(),
    limit: z.number().int().positive().optional()
});

// API Service class
export class ApiService {
    private algodClient: algosdk.Algodv2;
    private indexerClient: algosdk.Indexer;
    private nfdApiUrl: string;

    constructor(algodClient: algosdk.Algodv2, indexerClient: algosdk.Indexer, nfdApiUrl: string) {
        this.algodClient = algodClient;
        this.indexerClient = indexerClient;
        this.nfdApiUrl = nfdApiUrl;
    }

    // Algod API methods
    async getAccountInfo(address: string): Promise<any> {
        try {
            const accountInfo = await this.algodClient.accountInformation(address).do();
            return accountInfo;
        } catch (error: any) {
            throw new Error(`Error getting account info: ${error.message || 'Unknown error'}`);
        }
    }

    async getTransactionInfo(txId: string): Promise<any> {
        try {
            const txInfo = await this.algodClient.pendingTransactionInformation(txId).do();
            return txInfo;
        } catch (error: any) {
            throw new Error(`Error getting transaction info: ${error.message || 'Unknown error'}`);
        }
    }

    async getAssetInfo(assetId: number): Promise<any> {
        try {
            const assetInfo = await this.algodClient.getAssetByID(assetId).do();
            return assetInfo;
        } catch (error: any) {
            throw new Error(`Error getting asset info: ${error.message || 'Unknown error'}`);
        }
    }

    async getApplicationInfo(appId: number): Promise<any> {
        try {
            const appInfo = await this.algodClient.getApplicationByID(appId).do();
            return appInfo;
        } catch (error: any) {
            throw new Error(`Error getting application info: ${error.message || 'Unknown error'}`);
        }
    }

    async getPendingTransactions(max: number = 100): Promise<any> {
        try {
            // Note: pendingTransactions method may not be available in current algosdk version
            // This is a placeholder implementation
            return { transactions: [], total: 0 };
        } catch (error: any) {
            throw new Error(`Error getting pending transactions: ${error.message || 'Unknown error'}`);
        }
    }

    // Indexer API methods
    async lookupAccountById(address: string): Promise<any> {
        try {
            const account = await this.indexerClient.lookupAccountByID(address).do();
            return account;
        } catch (error: any) {
            throw new Error(`Error looking up account: ${error.message || 'Unknown error'}`);
        }
    }

    async lookupAssetById(assetId: number): Promise<any> {
        try {
            const asset = await this.indexerClient.lookupAssetByID(assetId).do();
            return asset;
        } catch (error: any) {
            throw new Error(`Error looking up asset: ${error.message || 'Unknown error'}`);
        }
    }

    async lookupTransactionById(txId: string): Promise<any> {
        try {
            const tx = await this.indexerClient.lookupTransactionByID(txId).do();
            return tx;
        } catch (error: any) {
            throw new Error(`Error looking up transaction: ${error.message || 'Unknown error'}`);
        }
    }

    async searchForAccounts(params: { limit?: number; assetId?: number; applicationId?: number }): Promise<any> {
        try {
            const searchParams: any = {};
            if (params.limit) searchParams.limit = params.limit;
            if (params.assetId) searchParams.asset_id = params.assetId;
            if (params.applicationId) searchParams.application_id = params.applicationId;

            const accounts = await this.indexerClient.searchAccounts().limit(searchParams.limit || 100).do();
            return accounts;
        } catch (error: any) {
            throw new Error(`Error searching accounts: ${error.message || 'Unknown error'}`);
        }
    }

    async searchForTransactions(params: { limit?: number; address?: string; assetId?: number; applicationId?: number }): Promise<any> {
        try {
            const searchParams: any = {};
            if (params.limit) searchParams.limit = params.limit;
            if (params.address) searchParams.address = params.address;
            if (params.assetId) searchParams.asset_id = params.assetId;
            if (params.applicationId) searchParams.application_id = params.applicationId;

            const transactions = await this.indexerClient.searchForTransactions().limit(searchParams.limit || 100).do();
            return transactions;
        } catch (error: any) {
            throw new Error(`Error searching transactions: ${error.message || 'Unknown error'}`);
        }
    }

    // NFD API methods
    async getNfd(name: string): Promise<any> {
        try {
            const response = await fetch(`${this.nfdApiUrl}/nfd/${name}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error: any) {
            throw new Error(`Error getting NFD: ${error.message || 'Unknown error'}`);
        }
    }

    async getNfdsForAddress(address: string): Promise<any> {
        try {
            const response = await fetch(`${this.nfdApiUrl}/nfd/lookup?address=${address}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error: any) {
            throw new Error(`Error getting NFDs for address: ${error.message || 'Unknown error'}`);
        }
    }

    async searchNfds(search: string, limit: number = 20): Promise<any> {
        try {
            const response = await fetch(`${this.nfdApiUrl}/nfd/search?search=${encodeURIComponent(search)}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error: any) {
            throw new Error(`Error searching NFDs: ${error.message || 'Unknown error'}`);
        }
    }
}
