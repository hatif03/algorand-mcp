import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { AlgorandService } from './algorand.js';
import { UtilityTools, UtilityService } from './utilityTools.js';
import { ApiTools, ApiService } from './apiTools.js';
import { AdvancedTransactionTools, AdvancedTransactionService } from './advancedTransactionTools.js';
import { Arc26Tools, Arc26Service } from './arc26Tools.js';
import { KnowledgeTools, KnowledgeService } from './knowledgeTools.js';
import * as dotenv from 'dotenv';
import algosdk from 'algosdk';

// Load environment variables
dotenv.config();

// Define schemas for existing tool arguments
const EchoArgsSchema = z.object({
    message: z.string(),
});

const CalculateArgsSchema = z.object({
    expression: z.string(),
});

const GetTimeArgsSchema = z.object({
    timezone: z.string().optional(),
});

const FundTestnetArgsSchema = z.object({
    address: z.string(),
});

// Algorand tool schemas
const GenerateAccountArgsSchema = z.object({});

const GetAccountInfoArgsSchema = z.object({
    address: z.string(),
});

const SendPaymentArgsSchema = z.object({
    mnemonic: z.string(),
    toAddress: z.string(),
    amount: z.number(),
    note: z.string().optional(),
});

const CreateAssetArgsSchema = z.object({
    creatorMnemonic: z.string(),
    assetName: z.string(),
    unitName: z.string(),
    totalSupply: z.number(),
    decimals: z.number().optional(),
    defaultFrozen: z.boolean().optional(),
    url: z.string().optional(),
    metadataHash: z.string().optional(),
});

const OptInToAssetArgsSchema = z.object({
    accountMnemonic: z.string(),
    assetId: z.number(),
});

const TransferAssetArgsSchema = z.object({
    fromMnemonic: z.string(),
    toAddress: z.string(),
    assetId: z.number(),
    amount: z.number(),
    note: z.string().optional(),
});

const GetAssetInfoArgsSchema = z.object({
    assetId: z.number(),
});

const GetTransactionArgsSchema = z.object({
    txId: z.string(),
});

const StoreWalletArgsSchema = z.object({
    name: z.string(),
    mnemonic: z.string(),
    password: z.string(),
});

const LoadWalletArgsSchema = z.object({
    name: z.string(),
    password: z.string(),
});

// Initialize services
const algorandService = new AlgorandService({
    network: (process.env.ALGORAND_NETWORK as 'testnet' | 'mainnet' | 'localnet') || 'testnet',
});

// Initialize API services
const algodClient = new algosdk.Algodv2(
    process.env.ALGORAND_TOKEN || '',
    process.env.ALGORAND_ALGOD || 'https://testnet-api.algonode.cloud',
    ''
);

const indexerClient = new algosdk.Indexer(
    process.env.ALGORAND_TOKEN || '',
    process.env.ALGORAND_INDEXER || 'https://testnet-idx.algonode.cloud',
    ''
);

const utilityService = new UtilityService(algodClient);
const apiService = new ApiService(algodClient, indexerClient, process.env.NFD_API_URL || 'https://api.nf.domains');
const advancedTransactionService = new AdvancedTransactionService(algodClient);
const arc26Service = new Arc26Service();
const knowledgeService = new KnowledgeService();

// Simple in-memory wallet storage
const walletStorage = new Map<string, { encryptedMnemonic: string; iv: string; address: string }>();

// Combine all tools
const ALL_TOOLS: Tool[] = [
    // Basic tools
    {
        name: 'echo',
        description: 'Echo back the provided message',
        inputSchema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'The message to echo back',
                },
            },
            required: ['message'],
        },
    },
    {
        name: 'calculate',
        description: 'Perform basic mathematical calculations',
        inputSchema: {
            type: 'object',
            properties: {
                expression: {
                    type: 'string',
                    description: 'Mathematical expression to evaluate (e.g., "2 + 2", "10 * 5")',
                },
            },
            required: ['expression'],
        },
    },
    {
        name: 'get_current_time',
        description: 'Get the current time in a specified timezone',
        inputSchema: {
            type: 'object',
            properties: {
                timezone: {
                    type: 'string',
                    description: 'Timezone identifier (e.g., "UTC", "America/New_York")',
                },
            },
            required: [],
        },
    },
    {
        name: 'fund_testnet',
        description: 'Fund an Algorand testnet account using the official faucet',
        inputSchema: {
            type: 'object',
            properties: {
                address: {
                    type: 'string',
                    description: 'Algorand testnet address to fund',
                },
            },
            required: ['address'],
        },
    },
    
    // Basic Algorand tools
    {
        name: 'generate_algorand_account',
        description: 'Generate a new Algorand account with address and mnemonic',
        inputSchema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'get_account_info',
        description: 'Get account information including balance and assets',
        inputSchema: {
            type: 'object',
            properties: {
                address: {
                    type: 'string',
                    description: 'Algorand account address',
                },
            },
            required: ['address'],
        },
    },
    {
        name: 'send_payment',
        description: 'Send Algo payment transaction (WARNING: Requires mnemonic phrase)',
        inputSchema: {
            type: 'object',
            properties: {
                mnemonic: {
                    type: 'string',
                    description: 'Sender account mnemonic phrase (25 words)',
                },
                toAddress: {
                    type: 'string',
                    description: 'Recipient address',
                },
                amount: {
                    type: 'number',
                    description: 'Amount in microAlgos (1 Algo = 1,000,000 microAlgos)',
                },
                note: {
                    type: 'string',
                    description: 'Optional transaction note',
                },
            },
            required: ['mnemonic', 'toAddress', 'amount'],
        },
    },
    {
        name: 'create_asset',
        description: 'Create a new Algorand Standard Asset (ASA)',
        inputSchema: {
            type: 'object',
            properties: {
                creatorMnemonic: {
                    type: 'string',
                    description: 'Creator account mnemonic phrase (25 words)',
                },
                assetName: {
                    type: 'string',
                    description: 'Name of the asset',
                },
                unitName: {
                    type: 'string',
                    description: 'Unit name/symbol of the asset',
                },
                totalSupply: {
                    type: 'number',
                    description: 'Total supply of the asset',
                },
                decimals: {
                    type: 'number',
                    description: 'Number of decimal places (default: 0)',
                },
                defaultFrozen: {
                    type: 'boolean',
                    description: 'Whether asset starts frozen (default: false)',
                },
                url: {
                    type: 'string',
                    description: 'Optional URL for asset metadata',
                },
                metadataHash: {
                    type: 'string',
                    description: 'Optional metadata hash',
                },
            },
            required: ['creatorMnemonic', 'assetName', 'unitName', 'totalSupply'],
        },
    },
    {
        name: 'opt_in_to_asset',
        description: 'Opt into an Algorand Standard Asset',
        inputSchema: {
            type: 'object',
            properties: {
                accountMnemonic: {
                    type: 'string',
                    description: 'Account mnemonic phrase (25 words)',
                },
                assetId: {
                    type: 'number',
                    description: 'Asset ID to opt into',
                },
            },
            required: ['accountMnemonic', 'assetId'],
        },
    },
    {
        name: 'transfer_asset',
        description: 'Transfer an Algorand Standard Asset',
        inputSchema: {
            type: 'object',
            properties: {
                fromMnemonic: {
                    type: 'string',
                    description: 'Sender account mnemonic phrase (25 words)',
                },
                toAddress: {
                    type: 'string',
                    description: 'Recipient address',
                },
                assetId: {
                    type: 'number',
                    description: 'Asset ID to transfer',
                },
                amount: {
                    type: 'number',
                    description: 'Amount to transfer',
                },
                note: {
                    type: 'string',
                    description: 'Optional transaction note',
                },
            },
            required: ['fromMnemonic', 'toAddress', 'assetId', 'amount'],
        },
    },
    {
        name: 'get_asset_info',
        description: 'Get information about an Algorand Standard Asset',
        inputSchema: {
            type: 'object',
            properties: {
                assetId: {
                    type: 'number',
                    description: 'Asset ID to query',
                },
            },
            required: ['assetId'],
        },
    },
    {
        name: 'get_transaction',
        description: 'Get transaction details by transaction ID',
        inputSchema: {
            type: 'object',
            properties: {
                txId: {
                    type: 'string',
                    description: 'Transaction ID',
                },
            },
            required: ['txId'],
        },
    },
    {
        name: 'store_wallet',
        description: 'Securely store a wallet with encrypted mnemonic',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Wallet name/identifier',
                },
                mnemonic: {
                    type: 'string',
                    description: 'Mnemonic phrase to store securely',
                },
                password: {
                    type: 'string',
                    description: 'Password to encrypt the mnemonic',
                },
            },
            required: ['name', 'mnemonic', 'password'],
        },
    },
    {
        name: 'load_wallet',
        description: 'Load a stored wallet and return the address',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Wallet name/identifier',
                },
                password: {
                    type: 'string',
                    description: 'Password to decrypt the mnemonic',
                },
            },
            required: ['name', 'password'],
        },
    },
    
    // Add all utility tools
    ...UtilityTools,
    
    // Add all API tools
    ...ApiTools,
    
    // Add all advanced transaction tools
    ...AdvancedTransactionTools,
    
    // Add all ARC-26 tools
    ...Arc26Tools,
    
    // Add all knowledge tools
    ...KnowledgeTools,
];

// Create server instance
const server = new Server(
    {
        name: 'algorand-mcp-server',
        version: '3.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: ALL_TOOLS,
    };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            // Basic tools
            case 'echo': {
                const parsed = EchoArgsSchema.parse(args);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Echo: ${parsed.message}`,
                        },
                    ],
                };
            }

            case 'calculate': {
                const parsed = CalculateArgsSchema.parse(args);
                try {
                    // Note: Using eval for demonstration - in production, use a safer math evaluation library
                    const result = eval(parsed.expression);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `${parsed.expression} = ${result}`,
                            },
                        ],
                    };
                } catch (error: any) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error evaluating expression: ${error.message}`,
                            },
                        ],
                    };
                }
            }

            case 'get_current_time': {
                const parsed = GetTimeArgsSchema.parse(args);
                const now = new Date();
                const timezone = parsed.timezone || 'UTC';
                
                try {
                    const timeString = now.toLocaleString('en-US', { 
                        timeZone: timezone,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });
                    
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Current time in ${timezone}: ${timeString}`,
                            },
                        ],
                    };
                } catch (error: any) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error with timezone ${timezone}: ${error.message}`,
                            },
                        ],
                    };
                }
            }

            case 'fund_testnet': {
                const parsed = FundTestnetArgsSchema.parse(args);
                try {
                    const fetch: typeof import('node-fetch') = (await import('node-fetch')).default;
                    const faucetUrl = `https://bank.testnet.algorand.network/api/v2/accounts/${parsed.address}`;
                    const response = await fetch(faucetUrl, { method: 'POST' });
                    if (!response.ok) {
                        throw new Error(`Faucet request failed: ${response.statusText}`);
                    }
                    const result = await response.json();
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Successfully funded testnet account ${parsed.address}. Amount: ${result.amount} microAlgos`,
                            },
                        ],
                    };
                } catch (error: any) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error funding testnet account: ${error.message}`,
                            },
                        ],
                    };
                }
            }

            // Basic Algorand tools
            case 'generate_algorand_account': {
                const parsed = GenerateAccountArgsSchema.parse(args);
                const result = await algorandService.generateAccount();
                return {
                    content: [
                        {
                            type: 'text',
                            text: `New Algorand Account Generated:\nAddress: ${result.account.addr}\nMnemonic: ${result.mnemonic}\n\n⚠️ SECURITY WARNING: Store the mnemonic phrase securely and never share it.`,
                        },
                    ],
                };
            }

            case 'get_account_info': {
                const parsed = GetAccountInfoArgsSchema.parse(args);
                const result = await algorandService.getAccountInfo(parsed.address);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Account Information:\nAddress: ${result.address}\nBalance: ${result.balance} ALGO\nMicroAlgos: ${result.balance * BigInt(1000000)}\nMin Balance: ${result.minBalance}`,
                        },
                    ],
                };
            }

            case 'send_payment': {
                const parsed = SendPaymentArgsSchema.parse(args);
                const result = await algorandService.sendPayment(
                    parsed.mnemonic,
                    parsed.toAddress,
                    parsed.amount,
                    parsed.note
                );
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Payment Successful!\nTransaction ID: ${result.txId}\nConfirmed in Round: ${result.confirmedRound}\nAmount: ${parsed.amount / 1000000} ALGO`,
                        },
                    ],
                };
            }

            case 'create_asset': {
                const parsed = CreateAssetArgsSchema.parse(args);
                const result = await algorandService.createAsset(
                    parsed.creatorMnemonic,
                    parsed.assetName,
                    parsed.unitName,
                    parsed.totalSupply,
                    parsed.decimals,
                    parsed.defaultFrozen,
                    parsed.url,
                    parsed.metadataHash
                );
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Asset Created Successfully!\nAsset ID: ${result.assetId}\nTransaction ID: ${result.txId}\nName: ${parsed.assetName}\nUnit: ${parsed.unitName}\nTotal Supply: ${parsed.totalSupply}`,
                        },
                    ],
                };
            }

            case 'opt_in_to_asset': {
                const parsed = OptInToAssetArgsSchema.parse(args);
                const result = await algorandService.optInToAsset(parsed.accountMnemonic, parsed.assetId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Asset Opt-in Successful!\nTransaction ID: ${result.txId}\nAsset ID: ${parsed.assetId}`,
                        },
                    ],
                };
            }

            case 'transfer_asset': {
                const parsed = TransferAssetArgsSchema.parse(args);
                const result = await algorandService.transferAsset(
                    parsed.fromMnemonic,
                    parsed.toAddress,
                    parsed.assetId,
                    parsed.amount,
                    parsed.note
                );
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Asset Transfer Successful!\nTransaction ID: ${result.txId}\nAsset ID: ${parsed.assetId}\nAmount: ${parsed.amount}`,
                        },
                    ],
                };
            }

            case 'get_asset_info': {
                const parsed = GetAssetInfoArgsSchema.parse(args);
                const result = await algorandService.getAssetInfo(parsed.assetId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Asset Information:\nAsset ID: ${result.id}\nName: ${result.params.name}\nUnit Name: ${result.params.unitName}\nTotal Supply: ${result.params.total}\nDecimals: ${result.params.decimals}`,
                        },
                    ],
                };
            }

            case 'get_transaction': {
                const parsed = GetTransactionArgsSchema.parse(args);
                const result = await algorandService.getTransaction(parsed.txId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Transaction Information:\nTransaction ID: ${parsed.txId}\nStatus: ${result.poolError ? 'Failed' : 'Success'}\nConfirmed Round: ${result.confirmedRound || 'Pending'}`,
                        },
                    ],
                };
            }

            case 'store_wallet': {
                const parsed = StoreWalletArgsSchema.parse(args);
                const result = await algorandService.storeWallet(parsed.name, parsed.mnemonic, parsed.password);
                walletStorage.set(parsed.name, result);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Wallet "${parsed.name}" stored securely!\nAddress: ${result.address}\n\n⚠️ Remember your password - it's required to access the wallet.`,
                        },
                    ],
                };
            }

            case 'load_wallet': {
                const parsed = LoadWalletArgsSchema.parse(args);
                const stored = walletStorage.get(parsed.name);
                if (!stored) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Wallet "${parsed.name}" not found.`,
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Wallet "${parsed.name}" loaded successfully!\nAddress: ${stored.address}`,
                        },
                    ],
                };
            }

            // Utility tools
            case 'validate_address': {
                const parsed = z.object({ address: z.string() }).parse(args);
                const result = await utilityService.validateAddress(parsed.address);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Address validation result: ${result.isValid ? 'Valid' : 'Invalid'}`,
                        },
                    ],
                };
            }

            case 'encode_address': {
                const parsed = z.object({ publicKey: z.string() }).parse(args);
                const result = await utilityService.encodeAddress(parsed.publicKey);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Encoded address: ${result.address}`,
                        },
                    ],
                };
            }

            case 'decode_address': {
                const parsed = z.object({ address: z.string() }).parse(args);
                const result = await utilityService.decodeAddress(parsed.address);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Decoded public key: ${result.publicKey}`,
                        },
                    ],
                };
            }

            case 'get_application_address': {
                const parsed = z.object({ appId: z.number() }).parse(args);
                const result = await utilityService.getApplicationAddress(parsed.appId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Application address: ${result.address}`,
                        },
                    ],
                };
            }

            case 'verify_bytes': {
                const parsed = z.object({ 
                    bytes: z.string(), 
                    signature: z.string(), 
                    address: z.string() 
                }).parse(args);
                const result = await utilityService.verifyBytes(parsed.bytes, parsed.signature, parsed.address);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Signature verification: ${result.verified ? 'Valid' : 'Invalid'}`,
                        },
                    ],
                };
            }

            case 'sign_bytes': {
                const parsed = z.object({ 
                    bytes: z.string(), 
                    sk: z.string() 
                }).parse(args);
                const result = await utilityService.signBytes(parsed.bytes, parsed.sk);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Signature: ${result.signature}`,
                        },
                    ],
                };
            }

            case 'compile_teal': {
                const parsed = z.object({ tealCode: z.string() }).parse(args);
                const result = await utilityService.compileTeal(parsed.tealCode);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `TEAL compiled successfully!\nResult: ${result.result}\nHash: ${result.hash}`,
                        },
                    ],
                };
            }

            case 'disassemble_teal': {
                const parsed = z.object({ bytecode: z.string() }).parse(args);
                const result = await utilityService.disassembleTeal(parsed.bytecode);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `TEAL disassembled:\n${result.source}`,
                        },
                    ],
                };
            }

            case 'encode_obj': {
                const parsed = z.object({ obj: z.any() }).parse(args);
                const result = await utilityService.encodeObj(parsed.obj);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Object encoded: ${result.encoded}`,
                        },
                    ],
                };
            }

            case 'decode_obj': {
                const parsed = z.object({ bytes: z.string() }).parse(args);
                const result = await utilityService.decodeObj(parsed.bytes);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Object decoded: ${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            // API tools
            case 'algod_get_account_info': {
                const parsed = z.object({ address: z.string() }).parse(args);
                const result = await apiService.getAccountInfo(parsed.address);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Account info from Algod:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            case 'algod_get_transaction_info': {
                const parsed = z.object({ txId: z.string() }).parse(args);
                const result = await apiService.getTransactionInfo(parsed.txId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Transaction info from Algod:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            case 'algod_get_asset_info': {
                const parsed = z.object({ assetId: z.number() }).parse(args);
                const result = await apiService.getAssetInfo(parsed.assetId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Asset info from Algod:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            case 'algod_get_application_info': {
                const parsed = z.object({ appId: z.number() }).parse(args);
                const result = await apiService.getApplicationInfo(parsed.appId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Application info from Algod:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            case 'algod_get_pending_transactions': {
                const parsed = z.object({ max: z.number().optional() }).parse(args);
                const result = await apiService.getPendingTransactions(parsed.max);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Pending transactions from Algod:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            case 'indexer_lookup_account_by_id': {
                const parsed = z.object({ address: z.string() }).parse(args);
                const result = await apiService.lookupAccountById(parsed.address);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Account info from Indexer:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            case 'indexer_lookup_asset_by_id': {
                const parsed = z.object({ assetId: z.number() }).parse(args);
                const result = await apiService.lookupAssetById(parsed.assetId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Asset info from Indexer:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            case 'indexer_lookup_transaction_by_id': {
                const parsed = z.object({ txId: z.string() }).parse(args);
                const result = await apiService.lookupTransactionById(parsed.txId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Transaction info from Indexer:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            case 'indexer_search_for_accounts': {
                const parsed = z.object({ 
                    limit: z.number().optional(),
                    assetId: z.number().optional(),
                    applicationId: z.number().optional()
                }).parse(args);
                const searchParams: any = {};
                if (parsed.limit !== undefined) searchParams.limit = parsed.limit;
                if (parsed.assetId !== undefined) searchParams.assetId = parsed.assetId;
                if (parsed.applicationId !== undefined) searchParams.applicationId = parsed.applicationId;
                const result = await apiService.searchForAccounts(searchParams);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Account search results from Indexer:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            case 'indexer_search_for_transactions': {
                const parsed = z.object({ 
                    limit: z.number().optional(),
                    address: z.string().optional(),
                    assetId: z.number().optional(),
                    applicationId: z.number().optional()
                }).parse(args);
                const searchParams: any = {};
                if (parsed.limit !== undefined) searchParams.limit = parsed.limit;
                if (parsed.address !== undefined) searchParams.address = parsed.address;
                if (parsed.assetId !== undefined) searchParams.assetId = parsed.assetId;
                if (parsed.applicationId !== undefined) searchParams.applicationId = parsed.applicationId;
                const result = await apiService.searchForTransactions(searchParams);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Transaction search results from Indexer:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            case 'nfd_get_nfd': {
                const parsed = z.object({ name: z.string() }).parse(args);
                const result = await apiService.getNfd(parsed.name);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `NFD info:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            case 'nfd_get_nfds_for_address': {
                const parsed = z.object({ address: z.string() }).parse(args);
                const result = await apiService.getNfdsForAddress(parsed.address);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `NFDs for address:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            case 'nfd_search_nfds': {
                const parsed = z.object({ 
                    search: z.string(),
                    limit: z.number().optional()
                }).parse(args);
                const result = await apiService.searchNfds(parsed.search, parsed.limit);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `NFD search results:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            }

            // Advanced transaction tools
            case 'create_atomic_group': {
                const parsed = z.object({ 
                    transactions: z.array(z.any())
                }).parse(args);
                const result = await advancedTransactionService.createAtomicGroup(parsed.transactions);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Atomic group created!\nGroup ID: ${result.groupId}\nNumber of transactions: ${result.transactions.length}`,
                        },
                    ],
                };
            }

            case 'sign_atomic_group': {
                const parsed = z.object({ 
                    transactions: z.array(z.any()),
                    mnemonic: z.string()
                }).parse(args);
                const result = await advancedTransactionService.signAtomicGroup(parsed.transactions, parsed.mnemonic);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Atomic group signed!\nNumber of signed transactions: ${result.signedTransactions.length}`,
                        },
                    ],
                };
            }

            case 'submit_atomic_group': {
                const parsed = z.object({ 
                    signedTransactions: z.array(z.any())
                }).parse(args);
                const result = await advancedTransactionService.submitAtomicGroup(parsed.signedTransactions);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Atomic group submitted!\nTransaction ID: ${result.txId}\nConfirmed Round: ${result.confirmedRound}`,
                        },
                    ],
                };
            }

            case 'create_application': {
                const parsed = z.object({ 
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
                }).parse(args);
                const result = await advancedTransactionService.createApplication(parsed);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Application created!\nApplication ID: ${result.appId}\nTransaction ID: ${result.txId}`,
                        },
                    ],
                };
            }

            case 'call_application': {
                const parsed = z.object({ 
                    from: z.string(),
                    appId: z.number(),
                    appArgs: z.array(z.string()).optional(),
                    accounts: z.array(z.string()).optional(),
                    foreignApps: z.array(z.number()).optional(),
                    foreignAssets: z.array(z.number()).optional()
                }).parse(args);
                const result = await advancedTransactionService.callApplication(parsed);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Application called!\nTransaction ID: ${result.txId}`,
                        },
                    ],
                };
            }

            case 'optin_application': {
                const parsed = z.object({ 
                    from: z.string(),
                    appId: z.number()
                }).parse(args);
                const result = await advancedTransactionService.optinApplication(parsed);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Application opt-in successful!\nTransaction ID: ${result.txId}`,
                        },
                    ],
                };
            }

            case 'closeout_application': {
                const parsed = z.object({ 
                    from: z.string(),
                    appId: z.number()
                }).parse(args);
                const result = await advancedTransactionService.closeoutApplication(parsed);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Application close-out successful!\nTransaction ID: ${result.txId}`,
                        },
                    ],
                };
            }

            case 'create_key_registration_transaction': {
                const parsed = z.object({ 
                    from: z.string(),
                    voteKey: z.string(),
                    selectionKey: z.string(),
                    stateProofKey: z.string().optional(),
                    voteFirst: z.number(),
                    voteLast: z.number(),
                    voteKeyDilution: z.number()
                }).parse(args);
                const result = await advancedTransactionService.createKeyRegistrationTransaction(parsed);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Key registration transaction created!\nTransaction: ${JSON.stringify(result.transaction, null, 2)}`,
                        },
                    ],
                };
            }

            case 'freeze_asset': {
                const parsed = z.object({ 
                    from: z.string(),
                    assetId: z.number(),
                    target: z.string(),
                    freezeState: z.boolean()
                }).parse(args);
                const result = await advancedTransactionService.freezeAsset(parsed);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Asset ${parsed.freezeState ? 'frozen' : 'unfrozen'} successfully!\nTransaction ID: ${result.txId}`,
                        },
                    ],
                };
            }

            // ARC-26 tools
            case 'generate_algorand_uri': {
                const parsed = z.object({
                    address: z.string(),
                    label: z.string().optional(),
                    amount: z.number().optional(),
                    assetId: z.number().optional(),
                    note: z.string().optional()
                }).parse(args);
                const result = arc26Service.generateAlgorandUri(
                    parsed.address,
                    parsed.label,
                    parsed.amount,
                    parsed.assetId,
                    parsed.note
                );
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Algorand URI Generated!\nType: ${result.uriType}\nURI: ${result.uri}`,
                        },
                    ],
                };
            }

            case 'generate_algorand_qrcode': {
                const parsed = z.object({
                    address: z.string(),
                    label: z.string().optional(),
                    amount: z.number().optional(),
                    assetId: z.number().optional(),
                    note: z.string().optional()
                }).parse(args);
                const result = await arc26Service.generateAlgorandQrCode(
                    parsed.address,
                    parsed.label,
                    parsed.amount,
                    parsed.assetId,
                    parsed.note
                );
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Algorand QR Code Generated!\nType: ${result.uriType}\nURI: ${result.uri}\nQR Code: ${result.qrCode}\n\nHTML Page:\n${result.html}`,
                        },
                    ],
                };
            }

            // Knowledge tools
            case 'get_knowledge_doc': {
                const parsed = z.object({
                    documents: z.array(z.string())
                }).parse(args);
                const result = await knowledgeService.getKnowledgeDoc(parsed.documents);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Knowledge Documents Retrieved:\n${result.documents.join('\n\n---\n\n')}`,
                        },
                    ],
                };
            }

            case 'list_knowledge_docs': {
                const parsed = z.object({
                    prefix: z.string().optional()
                }).parse(args);
                const result = await knowledgeService.listKnowledgeDocs(parsed.prefix);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Available Knowledge Documents:\n\nFiles:\n${result.files.map(f => `- ${f.key} (${f.size} bytes, uploaded: ${f.uploaded})`).join('\n')}\n\nCategories:\n${result.commonPrefixes.map(p => `- ${p}`).join('\n')}`,
                        },
                    ],
                };
            }

            case 'search_knowledge_docs': {
                const parsed = z.object({
                    query: z.string()
                }).parse(args);
                const result = await knowledgeService.searchKnowledgeDocs(parsed.query);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Knowledge Search Results for "${parsed.query}":\n\nFiles:\n${result.files.map(f => `- ${f.key} (${f.size} bytes, uploaded: ${f.uploaded})`).join('\n')}\n\nCategories:\n${result.commonPrefixes.map(p => `- ${p}`).join('\n')}`,
                        },
                    ],
                };
            }

            case 'get_algorand_guide': {
                const parsed = z.object({
                    section: z.string().optional()
                }).parse(args);
                const result = await knowledgeService.getAlgorandGuide(parsed.section);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Algorand Development Guide${parsed.section ? ` - ${parsed.section}` : ''}:\n\n${result.content}`,
                        },
                    ],
                };
            }

            default:
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Unknown tool: ${name}`,
                        },
                    ],
                };
        }
    } catch (error: any) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error executing tool ${name}: ${error.message}`,
                },
            ],
        };
    }
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Complete Algorand MCP Server running on stdio');
}

main().catch(console.error);