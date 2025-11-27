import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { pathToFileURL } from 'node:url';
import { createAlgorandServer } from './serverCore.js';

/**
 * Starts the Algorand MCP server over stdio transport (local development default).
 */
export async function startStdioServer() {
    const server = createAlgorandServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Complete Algorand MCP Server running on stdio');
}

// Only auto-start when executed directly (not when imported by other entrypoints).
const entryPointUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : undefined;
if (entryPointUrl && import.meta.url === entryPointUrl) {
    startStdioServer().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

