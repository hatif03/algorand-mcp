import { z } from 'zod';

/**
 * Knowledge tools for Algorand documentation access
 * Provides access to Algorand documentation and guides
 */

export const KnowledgeTools = [
    {
        name: 'get_knowledge_doc',
        description: 'Get markdown content for specified knowledge documents',
        inputSchema: {
            type: 'object' as const,
            properties: {
                documents: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    description: 'Array of document keys (e.g. ["ARCs:specs:arc-0020.md"])'
                }
            },
            required: ['documents']
        }
    },
    {
        name: 'list_knowledge_docs',
        description: 'List available knowledge documents by category',
        inputSchema: {
            type: 'object' as const,
            properties: {
                prefix: {
                    type: 'string',
                    description: 'Optional prefix to filter documents',
                    default: ''
                }
            }
        }
    },
    {
        name: 'search_knowledge_docs',
        description: 'Search available knowledge documents by category prefix',
        inputSchema: {
            type: 'object' as const,
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query string'
                }
            },
            required: ['query']
        }
    },
    {
        name: 'get_algorand_guide',
        description: 'Get comprehensive Algorand development guide',
        inputSchema: {
            type: 'object' as const,
            properties: {
                section: {
                    type: 'string',
                    description: 'Optional section to focus on (e.g., "getting-started", "smart-contracts", "assets")',
                    optional: true
                }
            }
        }
    }
];

// Schema definitions
export const GetKnowledgeDocSchema = z.object({
    documents: z.array(z.string())
});

export const ListKnowledgeDocsSchema = z.object({
    prefix: z.string().optional()
});

export const SearchKnowledgeDocsSchema = z.object({
    query: z.string()
});

export const GetAlgorandGuideSchema = z.object({
    section: z.string().optional()
});

// Knowledge Service class
export class KnowledgeService {
    private knowledgeBase: Map<string, string> = new Map();

    constructor() {
        this.initializeKnowledgeBase();
    }

    /**
     * Initialize the knowledge base with Algorand documentation
     */
    private initializeKnowledgeBase(): void {
        // Basic Algorand knowledge base
        this.knowledgeBase.set('getting-started', this.getGettingStartedGuide());
        this.knowledgeBase.set('smart-contracts', this.getSmartContractsGuide());
        this.knowledgeBase.set('assets', this.getAssetsGuide());
        this.knowledgeBase.set('transactions', this.getTransactionsGuide());
        this.knowledgeBase.set('api', this.getApiGuide());
        this.knowledgeBase.set('security', this.getSecurityGuide());
    }

    /**
     * Get knowledge document content
     */
    async getKnowledgeDoc(documents: string[]): Promise<{ documents: string[] }> {
        const results = documents.map(docKey => {
            // For now, return a placeholder since we don't have R2 storage
            // In a real implementation, this would fetch from R2 or similar storage
            return `Document: ${docKey}\n\nThis is a placeholder for the knowledge document. In a production environment, this would fetch the actual content from a storage service like Cloudflare R2.\n\nTo implement this feature, you would need to:\n1. Set up a storage service (R2, S3, etc.)\n2. Upload Algorand documentation\n3. Configure the storage binding in your environment\n4. Update this method to fetch from storage`;
        });

        return { documents: results };
    }

    /**
     * List available knowledge documents
     */
    async listKnowledgeDocs(prefix: string = ''): Promise<{
        files: Array<{ key: string; size: number; uploaded: string }>;
        commonPrefixes: string[];
    }> {
        // Return a mock list of available documents
        const mockFiles = [
            { key: 'ARCs:specs:arc-0001.md', size: 1024, uploaded: '2024-01-01T00:00:00Z' },
            { key: 'ARCs:specs:arc-0020.md', size: 2048, uploaded: '2024-01-02T00:00:00Z' },
            { key: 'ARCs:specs:arc-0026.md', size: 1536, uploaded: '2024-01-03T00:00:00Z' },
            { key: 'SDKs:javascript:algosdk.md', size: 4096, uploaded: '2024-01-04T00:00:00Z' },
            { key: 'SDKs:python:py-algorand-sdk.md', size: 3072, uploaded: '2024-01-05T00:00:00Z' },
            { key: 'AlgoKit:getting-started.md', size: 2560, uploaded: '2024-01-06T00:00:00Z' },
            { key: 'AlgoKit:utils:algokit-utils.md', size: 1792, uploaded: '2024-01-07T00:00:00Z' },
            { key: 'TEALScript:overview.md', size: 1280, uploaded: '2024-01-08T00:00:00Z' },
            { key: 'Puya:getting-started.md', size: 1536, uploaded: '2024-01-09T00:00:00Z' },
            { key: 'LiquidAuth:overview.md', size: 1024, uploaded: '2024-01-10T00:00:00Z' }
        ];

        const filteredFiles = prefix 
            ? mockFiles.filter(file => file.key.startsWith(prefix))
            : mockFiles;

        const commonPrefixes = [
            'ARCs:specs:',
            'SDKs:javascript:',
            'SDKs:python:',
            'AlgoKit:',
            'TEALScript:',
            'Puya:',
            'LiquidAuth:'
        ].filter(prefix => !prefix || prefix.startsWith(prefix));

        return {
            files: filteredFiles,
            commonPrefixes
        };
    }

    /**
     * Search knowledge documents
     */
    async searchKnowledgeDocs(query: string): Promise<{
        files: Array<{ key: string; size: number; uploaded: string }>;
        commonPrefixes: string[];
    }> {
        // Simple search implementation
        return this.listKnowledgeDocs(query);
    }

    /**
     * Get Algorand development guide
     */
    async getAlgorandGuide(section?: string): Promise<{ content: string }> {
        if (section && this.knowledgeBase.has(section)) {
            return { content: this.knowledgeBase.get(section)! };
        }

        // Return the full guide if no section specified
        const fullGuide = `
# Algorand Development Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Smart Contracts](#smart-contracts)
3. [Assets](#assets)
4. [Transactions](#transactions)
5. [API Reference](#api-reference)
6. [Security Best Practices](#security-best-practices)

${this.knowledgeBase.get('getting-started')}

${this.knowledgeBase.get('smart-contracts')}

${this.knowledgeBase.get('assets')}

${this.knowledgeBase.get('transactions')}

${this.knowledgeBase.get('api')}

${this.knowledgeBase.get('security')}
        `.trim();

        return { content: fullGuide };
    }

    private getGettingStartedGuide(): string {
        return `
## Getting Started

### Prerequisites
- Node.js 16+ or Python 3.8+
- Basic understanding of blockchain concepts
- Algorand testnet account

### Quick Start
1. Install the Algorand SDK
2. Connect to testnet
3. Create your first transaction
4. Deploy a smart contract

### Resources
- [Algorand Developer Portal](https://developer.algorand.org/)
- [Algorand Discord](https://discord.gg/algorand)
- [Algorand Forum](https://forum.algorand.org/)
        `.trim();
    }

    private getSmartContractsGuide(): string {
        return `
## Smart Contracts

### TEAL (Transaction Execution Approval Language)
TEAL is Algorand's smart contract language that runs on the Algorand Virtual Machine (AVM).

### Development Tools
- **AlgoKit**: Modern development toolkit
- **TEALScript**: TypeScript-like language for TEAL
- **Puya**: Python-like language for TEAL
- **Algorand Studio**: Visual development environment

### Contract Types
- **Stateful Contracts**: Can maintain state between calls
- **Stateless Contracts**: Logic signatures for transaction approval

### Best Practices
- Keep contracts simple and efficient
- Use proper error handling
- Optimize for gas costs
- Test thoroughly on testnet
        `.trim();
    }

    private getAssetsGuide(): string {
        return `
## Algorand Standard Assets (ASAs)

### Creating Assets
- Use the Asset Creation transaction
- Set proper metadata and parameters
- Configure asset properties (freeze, clawback, etc.)

### Asset Management
- Opt-in to receive assets
- Transfer assets between accounts
- Freeze/unfreeze assets (if authorized)
- Clawback assets (if authorized)

### Asset Types
- **Fungible Tokens**: Like cryptocurrencies
- **Non-Fungible Tokens (NFTs)**: Unique digital assets
- **Utility Tokens**: For specific applications

### Metadata Standards
- ARC-19: NFT metadata standard
- ARC-69: NFT metadata standard with on-chain data
        `.trim();
    }

    private getTransactionsGuide(): string {
        return `
## Transactions

### Transaction Types
- **Payment**: Transfer ALGO between accounts
- **Asset Transfer**: Transfer ASAs between accounts
- **Asset Configuration**: Create, modify, or destroy assets
- **Application Call**: Interact with smart contracts
- **Key Registration**: Register for consensus participation

### Transaction Groups
- Atomic transactions that execute together
- All transactions must succeed or all fail
- Useful for complex operations

### Transaction Parameters
- **Fee**: Transaction fee in microAlgos
- **First Valid**: First round when transaction is valid
- **Last Valid**: Last round when transaction is valid
- **Note**: Optional data attached to transaction

### Best Practices
- Set appropriate fees
- Use proper validity windows
- Include meaningful notes
- Sign transactions securely
        `.trim();
    }

    private getApiGuide(): string {
        return `
## API Reference

### Algod API
- **Account Information**: Get account details, balances, assets
- **Transaction Information**: Get transaction details and status
- **Asset Information**: Get asset details and parameters
- **Application Information**: Get smart contract details
- **Block Information**: Get block details and transactions

### Indexer API
- **Search Accounts**: Find accounts by various criteria
- **Search Transactions**: Find transactions by various criteria
- **Search Assets**: Find assets by various criteria
- **Search Applications**: Find smart contracts by various criteria

### SDKs
- **JavaScript/TypeScript**: algosdk
- **Python**: py-algorand-sdk
- **Go**: go-algorand-sdk
- **Java**: algorand-sdk-java

### Rate Limits
- Algod: 10 requests per second
- Indexer: 10 requests per second
- Use proper rate limiting in your applications
        `.trim();
    }

    private getSecurityGuide(): string {
        return `
## Security Best Practices

### Private Key Management
- Never store private keys in plain text
- Use hardware wallets for production
- Implement proper key rotation
- Use secure random number generation

### Transaction Security
- Always verify transaction details before signing
- Use proper validity windows
- Implement transaction limits
- Monitor for suspicious activity

### Smart Contract Security
- Audit all smart contracts
- Use formal verification tools
- Implement proper access controls
- Test edge cases thoroughly

### Network Security
- Use HTTPS for all API calls
- Implement proper authentication
- Monitor for unusual activity
- Keep software updated

### Common Vulnerabilities
- Reentrancy attacks
- Integer overflow/underflow
- Access control issues
- Input validation problems
        `.trim();
    }
}
