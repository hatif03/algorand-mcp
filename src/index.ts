// FundTestnet tool schema
const FundTestnetArgsSchema = z.object({
    address: z.string(),
});

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { AlgorandService } from './algorand.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define schemas for tool arguments
const EchoArgsSchema = z.object({
    message: z.string(),
});

const CalculateArgsSchema = z.object({
    expression: z.string(),
});

const GetTimeArgsSchema = z.object({
    timezone: z.string().optional(),
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

// Initialize Algorand service
const algorandService = new AlgorandService({
    network: (process.env.ALGORAND_NETWORK as 'testnet' | 'mainnet' | 'localnet') || 'testnet',
});

// Simple in-memory wallet storage (in production, use secure file storage)
const walletStorage = new Map<string, { encryptedMnemonic: string; iv: string; address: string }>();

// Define the tools
const TOOLS: Tool[] = [
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
];

// Create server instance
const server = new Server(
    {
        name: 'algorand-mcp-server',
        version: '1.0.0',
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
        tools: TOOLS,
    };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
        case 'fund_testnet': {
            const parsed = FundTestnetArgsSchema.parse(args);
            try {
                // Use node-fetch for HTTP requests
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
                            text: `Faucet request sent!\nStatus: ${result.message || 'Success'}\nCheck your account balance in a few seconds.`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Faucet funding failed: ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
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
                // Simple math evaluation (in production, use a safer math library)
                const result = eval(parsed.expression);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Result: ${parsed.expression} = ${result}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: Invalid mathematical expression - ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case 'get_current_time': {
            const parsed = GetTimeArgsSchema.parse(args);
            const timezone = parsed.timezone || 'UTC';

            try {
                const now = new Date();
                const timeString = now.toLocaleString('en-US', {
                    timeZone: timezone,
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZoneName: 'short',
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Current time in ${timezone}: ${timeString}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: Invalid timezone "${timezone}" - ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case 'generate_algorand_account': {
            GenerateAccountArgsSchema.parse(args);
            try {
                const { account, mnemonic } = algorandService.generateAccount();
                return {
                    content: [
                        {
                            type: 'text',
                            text: `New Algorand Account Generated:\nAddress: ${account.addr}\nMnemonic: ${mnemonic}\n\n⚠️ SECURITY WARNING: Store the mnemonic phrase securely and never share it. This is required to access your account.`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error generating account: ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case 'get_account_info': {
            const parsed = GetAccountInfoArgsSchema.parse(args);
            try {
                const accountInfo = await algorandService.getAccountInfo(parsed.address);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Account Information for ${parsed.address}:\n` +
                                `Balance: ${Number(accountInfo.balance) / 1000000} ALGO\n` +
                                `Minimum Balance: ${Number(accountInfo.minBalance) / 1000000} ALGO\n` +
                                `Status: ${accountInfo.status}\n` +
                                `Assets: ${accountInfo.assets.length}\n` +
                                `Created Apps: ${accountInfo.createdApps.length}\n` +
                                `Created Assets: ${accountInfo.createdAssets.length}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error getting account info: ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case 'send_payment': {
            const parsed = SendPaymentArgsSchema.parse(args);
            try {
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
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Payment failed: ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case 'create_asset': {
            const parsed = CreateAssetArgsSchema.parse(args);
            try {
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
                            text: `Asset Created Successfully!\nAsset ID: ${result.assetId}\nTransaction ID: ${result.txId}\nConfirmed in Round: ${result.confirmedRound}\nAsset Name: ${parsed.assetName}\nTotal Supply: ${parsed.totalSupply}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Asset creation failed: ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case 'opt_in_to_asset': {
            const parsed = OptInToAssetArgsSchema.parse(args);
            try {
                const result = await algorandService.optInToAsset(
                    parsed.accountMnemonic,
                    parsed.assetId
                );
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Asset Opt-in Successful!\nAsset ID: ${parsed.assetId}\nTransaction ID: ${result.txId}\nConfirmed in Round: ${result.confirmedRound}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Asset opt-in failed: ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case 'transfer_asset': {
            const parsed = TransferAssetArgsSchema.parse(args);
            try {
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
                            text: `Asset Transfer Successful!\nAsset ID: ${parsed.assetId}\nAmount: ${parsed.amount}\nTransaction ID: ${result.txId}\nConfirmed in Round: ${result.confirmedRound}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Asset transfer failed: ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case 'get_asset_info': {
            const parsed = GetAssetInfoArgsSchema.parse(args);
            try {
                const assetInfo = await algorandService.getAssetInfo(parsed.assetId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Asset Information:\n${JSON.stringify(assetInfo, null, 2)}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error getting asset info: ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case 'get_transaction': {
            const parsed = GetTransactionArgsSchema.parse(args);
            try {
                const txInfo = await algorandService.getTransaction(parsed.txId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Transaction Information:\n${JSON.stringify(txInfo, null, 2)}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error getting transaction: ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case 'store_wallet': {
            const parsed = StoreWalletArgsSchema.parse(args);
            try {
                // Import account to get address
                const account = algorandService.importAccountFromMnemonic(parsed.mnemonic);

                // Encrypt mnemonic
                const { encryptedMnemonic, iv } = algorandService.encryptMnemonic(parsed.mnemonic, parsed.password);

                // Store wallet
                walletStorage.set(parsed.name, {
                    encryptedMnemonic,
                    iv,
                    address: account.addr.toString()
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Wallet "${parsed.name}" stored securely!\nAddress: ${account.addr}\n\n⚠️ Remember your password - it's required to access the wallet.`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error storing wallet: ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        case 'load_wallet': {
            const parsed = LoadWalletArgsSchema.parse(args);
            try {
                const wallet = walletStorage.get(parsed.name);
                if (!wallet) {
                    throw new Error(`Wallet "${parsed.name}" not found`);
                }

                // Decrypt mnemonic
                const mnemonic = algorandService.decryptMnemonic(
                    wallet.encryptedMnemonic,
                    wallet.iv,
                    parsed.password
                );

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Wallet "${parsed.name}" loaded successfully!\nAddress: ${wallet.address}\nMnemonic: ${mnemonic}\n\n⚠️ Keep this mnemonic secure and private.`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error loading wallet: ${error}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
