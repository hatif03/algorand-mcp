# MCP Server with Algorand Integration

This server provides blockchain transaction capabilities for the Algorand network along with general utility tools.

## Overview

This MCP server provides the following tools to AI assistants:

### General Tools
- **echo**: Echo back any message (useful for testing connectivity)
- **calculate**: Perform basic mathematical calculations
- **get_current_time**: Get the current time in any timezone

### Algorand Blockchain Tools
- **generate_algorand_account**: Generate a new Algorand account with address and mnemonic
- **get_account_info**: Get account information including balance and assets
- **send_payment**: Send Algo payment transaction
- **create_asset**: Create a new Algorand Standard Asset (ASA)
- **opt_in_to_asset**: Opt into an Algorand Standard Asset
- **transfer_asset**: Transfer an Algorand Standard Asset
- **get_asset_info**: Get information about an asset
- **get_transaction**: Get transaction details by transaction ID

## Security Features

### Mnemonic Phrase Protection
- **Encryption**: Built-in AES-256-GCM encryption for mnemonic phrases
- **Secure Storage**: Methods for encrypting/decrypting wallet credentials
- **Memory Safety**: Sensitive data is handled securely and not logged

### Network Configuration
- **Testnet Default**: Safely defaults to Algorand testnet
- **Environment-based**: Network configuration through environment variables
- **Production Ready**: Supports mainnet for production use

## Prerequisites

- Node.js 18+ 
- npm or yarn
- TypeScript

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Configure your Algorand network in `.env` (defaults to testnet)

## Development

### Building the Project

```bash
npm run build
```

### Running the Server

```bash
# Basic server
npm start

# Enhanced server with 44+ tools
npm run start:enhanced
```

### Development Mode

For development with automatic rebuilding:

```bash
# Basic server
npm run dev

# Enhanced server
npm run dev:enhanced
```

### Testing

```bash
# Test basic server
npm test

# Test enhanced server
npm run test:enhanced
```

## Configuration

### For VSCode

```json
{
  "mcpServers": {
    "algorand-mcp-server": {
      "command": "node",
      "args": ["path/to/your/project/dist/index.js"]
    }
  }
}
```

### For VS Code Debugging

The project includes a `.vscode/mcp.json` configuration file for debugging within VS Code. You can use this with the MCP extension for VS Code.

## Available Tools

### Basic Tools
- **echo**: Echo back the provided message
- **calculate**: Perform basic mathematical calculations  
- **get_current_time**: Get the current time in a specified timezone
- **fund_testnet**: Fund an Algorand testnet account using the official faucet

### Algorand Blockchain Tools
- **generate_algorand_account**: Generate a new Algorand account with address and mnemonic
- **get_account_info**: Get account information including balance and assets
- **send_payment**: Send Algo payment transaction
- **create_asset**: Create a new Algorand Standard Asset (ASA)
- **opt_in_to_asset**: Opt into an Algorand Standard Asset
- **transfer_asset**: Transfer an Algorand Standard Asset
- **get_asset_info**: Get information about an asset
- **get_transaction**: Get transaction details by transaction ID

### Enhanced Features (44+ Tools)
This server now includes advanced features from the remote MCP server:

#### Advanced Utility Tools (10 tools)
- **validate_address**: Validate Algorand addresses
- **encode_address**: Convert public key to address
- **decode_address**: Convert address to public key
- **get_application_address**: Get smart contract address
- **verify_bytes**: Verify cryptographic signatures
- **sign_bytes**: Sign data with private key
- **compile_teal**: Compile TEAL smart contract code
- **disassemble_teal**: Disassemble TEAL bytecode
- **encode_obj**: Encode objects to msgpack
- **decode_obj**: Decode msgpack to objects

#### API Integration Tools (12 tools)
- **Algod API**: Account info, transactions, assets, applications
- **Indexer API**: Advanced search and lookup capabilities
- **NFD API**: Name service integration

#### Advanced Transaction Tools (8 tools)
- **Atomic Groups**: Create, sign, and submit transaction groups
- **Smart Contracts**: Deploy, call, and manage applications
- **Key Registration**: Participation key management
- **Asset Freeze**: Freeze/unfreeze asset operations

See [ENHANCED_FEATURES.md](ENHANCED_FEATURES.md) for complete documentation.

## Project Structure

```
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript output
├── .vscode/
│   └── mcp.json         # VS Code MCP configuration
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot instructions
├── package.json          # Node.js package configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Development Guide

### Adding New Tools

1. Define the tool schema in the `TOOLS` array
2. Create a Zod schema for input validation
3. Add a case in the `CallToolRequestSchema` handler
4. Implement the tool logic with proper error handling

### Example Tool Implementation

```typescript
const MyToolArgsSchema = z.object({
  input: z.string(),
});

// Add to TOOLS array
{
  name: 'my_tool',
  description: 'Description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      input: {
        type: 'string',
        description: 'Input parameter description',
      },
    },
    required: ['input'],
  },
}

// Add to request handler
case 'my_tool': {
  const parsed = MyToolArgsSchema.parse(args);
  // Implement tool logic here
  return {
    content: [
      {
        type: 'text',
        text: `Result: ${parsed.input}`,
      },
    ],
  };
}
```

## Security Considerations

- Input validation is performed using Zod schemas
- The `calculate` tool uses `eval()` for demonstration purposes only - in production, use a safer math evaluation library
- Always validate and sanitize inputs before processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with proper tests
4. Submit a pull request

## License

ISC License - see package.json for details

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP SDK Reference](https://github.com/modelcontextprotocol/typescript-sdk)
