import { z } from 'zod';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import dotenv from 'dotenv';
/**
 * Knowledge tools for Algorand documentation access
 * Provides access to Algorand documentation and guides
 */

export const KnowledgeTools = [
    // {
    //     name: 'get_knowledge_doc',
    //     description: 'Get markdown content for specified knowledge documents',
    //     inputSchema: {
    //         type: 'object' as const,
    //         properties: {
    //             documents: {
    //                 type: 'array',
    //                 items: {
    //                     type: 'string'
    //                 },
    //                 description: 'Array of document keys (e.g. ["ARCs:specs:arc-0020.md"])'
    //             }
    //         },
    //         required: ['documents']
    //     }
    // },
    // {
    //     name: 'list_knowledge_docs',
    //     description: 'List available knowledge documents by category',
    //     inputSchema: {
    //         type: 'object' as const,
    //         properties: {
    //             prefix: {
    //                 type: 'string',
    //                 description: 'Optional prefix to filter documents',
    //                 default: ''
    //             }
    //         }
    //     }
    // },
    // {
    //     name: 'search_knowledge_docs',
    //     description: 'Search available knowledge documents by category prefix',
    //     inputSchema: {
    //         type: 'object' as const,
    //         properties: {
    //             query: {
    //                 type: 'string',
    //                 description: 'Search query string'
    //             }
    //         },
    //         required: ['query']
    //     }
    // },
    // {
    //     name: 'get_algorand_guide',
    //     description: 'Get comprehensive Algorand development guide',
    //     inputSchema: {
    //         type: 'object' as const,
    //         properties: {
    //             section: {
    //                 type: 'string',
    //                 description: 'Optional section to focus on (e.g., "getting-started", "smart-contracts", "assets")',
    //                 optional: true
    //             }
    //         }
    //     }
    // },
    {
        name: 'search_algorand_docs',
        description: 'Semantic search through Algorand documentation using AI embeddings',
        inputSchema: {
            type: 'object' as const,
            properties: {
                query: {
                    type: 'string',
                    description: 'Natural language search query to find relevant documentation'
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of results to return (default: 5)',
                    optional: true
                },
                category: {
                    type: 'string',
                    description: 'Optional category filter (e.g., "Smart Contracts", "Getting Started", "AlgoKit")',
                    optional: true
                }
            },
            required: ['query']
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

export const SearchAlgorandDocsSchema = z.object({
    query: z.string(),
    limit: z.number().optional(),
    category: z.string().optional()
});

// Knowledge Service class
export class KnowledgeService {
    private knowledgeBase: Map<string, string> = new Map();
    private qdrantClient: QdrantClient | null = null;
    private openaiClient: OpenAI | null = null;
    private collectionName = 'algorand';

    constructor() {
        this.initializeKnowledgeBase();
        this.initializeClients();
    }

    /**
     * Initialize Qdrant and OpenAI clients
     */
    private initializeClients(): void {
        try {
            const qdrantUrl = process.env.QDRANT_URL;
            const qdrantApiKey = process.env.QDRANT_API_KEY;
            const openaiApiKey = process.env.OPENAI_API_KEY;

            if (qdrantUrl && qdrantApiKey) {
                this.qdrantClient = new QdrantClient({
                    url: qdrantUrl,
                    apiKey: qdrantApiKey,
                });
                console.log('Qdrant client initialized successfully');
            } else {
                console.warn('Qdrant client not initialized: Missing QDRANT_URL or QDRANT_API_KEY environment variables');
            }

            if (openaiApiKey) {
                this.openaiClient = new OpenAI({
                    apiKey: openaiApiKey,
                });
                console.log('OpenAI client initialized successfully');
            } else {
                console.warn('OpenAI client not initialized: Missing OPENAI_API_KEY environment variable');
            }

            if (!this.qdrantClient || !this.openaiClient) {
                console.info('Semantic search will use fallback local knowledge base search');
            }
        } catch (error) {
            console.error('Failed to initialize semantic search clients:', error);
            console.info('Will use fallback local knowledge base search');
        }
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

    /**
     * Semantic search through Algorand documentation
     */
    async searchAlgorandDocs(
        query: string, 
        limit: number = 5, 
        category?: string
    ): Promise<{
        results: Array<{
            content: string;
            metadata: {
                filename: string;
                title: string;
                category: string;
                chunk_index: number;
                total_chunks: number;
                file_path: string;
            };
            score: number;
        }>;
        total_found: number;
        query_used: string;
    }> {
        if (!this.qdrantClient || !this.openaiClient) {
            // Fallback to local knowledge base search if clients not available
            console.warn('Semantic search not available, falling back to local knowledge base search');
            return this.fallbackSearch(query, limit, category);
        }

        try {
            // Generate embedding for the query
            const embeddingResponse = await this.openaiClient.embeddings.create({
                input: query,
                model: 'text-embedding-3-small'
            });

            const queryEmbedding = embeddingResponse.data[0]?.embedding;
            if (!queryEmbedding) {
                throw new Error('Failed to generate embedding for query');
            }

            // Prepare search filter
            let filter: any = undefined;
            if (category) {
                filter = {
                    must: [
                        {
                            key: 'category',
                            match: {
                                value: category
                            }
                        }
                    ]
                };
            }

            // Search in Qdrant
            const searchResult = await this.qdrantClient.search(this.collectionName, {
                vector: queryEmbedding,
                limit: limit,
                filter: filter,
                with_payload: true,
                with_vector: false
            });

            // Format results
            const results = searchResult.map(point => ({
                content: point.payload?.content as string || '',
                metadata: {
                    filename: point.payload?.filename as string || '',
                    title: point.payload?.title as string || '',
                    category: point.payload?.category as string || '',
                    chunk_index: point.payload?.chunk_index as number || 0,
                    total_chunks: point.payload?.total_chunks as number || 1,
                    file_path: point.payload?.file_path as string || ''
                },
                score: point.score || 0
            }));

            return {
                results,
                total_found: results.length,
                query_used: query
            };

        } catch (error) {
            console.error('Error in semantic search:', error);
            console.warn('Falling back to local knowledge base search due to semantic search error');
            return this.fallbackSearch(query, limit, category);
        }
    }

    /**
     * Fallback search using local knowledge base
     */
    private fallbackSearch(
        query: string, 
        limit: number = 5, 
        category?: string
    ): {
        results: Array<{
            content: string;
            metadata: {
                filename: string;
                title: string;
                category: string;
                chunk_index: number;
                total_chunks: number;
                file_path: string;
            };
            score: number;
        }>;
        total_found: number;
        query_used: string;
    } {
        const queryLower = query.toLowerCase();
        const results: Array<{
            content: string;
            metadata: {
                filename: string;
                title: string;
                category: string;
                chunk_index: number;
                total_chunks: number;
                file_path: string;
            };
            score: number;
        }> = [];

        // Search through local knowledge base
        for (const [key, content] of this.knowledgeBase.entries()) {
            // Skip if category filter doesn't match
            if (category && !key.toLowerCase().includes(category.toLowerCase())) {
                continue;
            }

            // Simple text matching for relevance scoring
            const contentLower = content.toLowerCase();
            let score = 0;
            
            // Check for exact phrase matches
            if (contentLower.includes(queryLower)) {
                score += 0.8;
            }
            
            // Check for individual word matches
            const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
            const matchedWords = queryWords.filter(word => contentLower.includes(word));
            score += (matchedWords.length / queryWords.length) * 0.6;
            
            // Check for title/key matches
            if (key.toLowerCase().includes(queryLower)) {
                score += 0.4;
            }

            if (score > 0) {
                results.push({
                    content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
                    metadata: {
                        filename: `${key}.md`,
                        title: this.getTitleFromKey(key),
                        category: this.getCategoryFromKey(key),
                        chunk_index: 0,
                        total_chunks: 1,
                        file_path: `docs/${key}.md`
                    },
                    score: Math.min(score, 1.0)
                });
            }
        }

        // Sort by score and limit results
        results.sort((a, b) => b.score - a.score);
        const limitedResults = results.slice(0, limit);

        return {
            results: limitedResults,
            total_found: limitedResults.length,
            query_used: query
        };
    }

    /**
     * Get a human-readable title from a knowledge base key
     */
    private getTitleFromKey(key: string): string {
        const titleMap: Record<string, string> = {
            'getting-started': 'Getting Started with Algorand',
            'smart-contracts': 'Smart Contracts on Algorand',
            'assets': 'Algorand Standard Assets (ASAs)',
            'transactions': 'Algorand Transactions',
            'api': 'Algorand API Reference',
            'security': 'Security Best Practices'
        };
        return titleMap[key] || key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Get a category from a knowledge base key
     */
    private getCategoryFromKey(key: string): string {
        const categoryMap: Record<string, string> = {
            'getting-started': 'Getting Started',
            'smart-contracts': 'Smart Contracts',
            'assets': 'Assets',
            'transactions': 'Transactions',
            'api': 'API Reference',
            'security': 'Security'
        };
        return categoryMap[key] || 'General';
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