# Algorand MCP Server Setup Guide

## Overview
Your Algorand MCP (Model Context Protocol) server is now set up and ready to use! This server provides comprehensive tools for interacting with the Algorand blockchain through AI assistants.

## What's Been Configured

### 1. Project Build
- ✅ TypeScript project compiled to `dist/` directory
- ✅ All dependencies installed and ready

### 2. Environment Configuration
- ✅ `.env` file created with default testnet settings
- ✅ Environment variables configured for:
  - Algorand network (testnet)
  - API endpoints (Algonode)
  - NFD API
  - Qdrant for knowledge tools

### 3. MCP Configuration
- ✅ Added to your Cursor MCP configuration (`mcp.json`)
- ✅ Configured to run from: `D:\projects\algorand-mcp\dist\index.js`
- ✅ Environment variables passed through MCP config

## Available Tools

Your MCP server provides **50+ tools** across these categories:

### Basic Tools
- `echo` - Echo back messages
- `calculate` - Mathematical calculations
- `get_current_time` - Get current time in any timezone
- `fund_testnet` - Fund testnet accounts

### Core Algorand Tools
- `generate_algorand_account` - Create new accounts
- `get_account_info` - Get account details and balance
- `send_payment` - Send ALGO payments
- `create_asset` - Create Algorand Standard Assets (ASAs)
- `opt_in_to_asset` - Opt into assets
- `transfer_asset` - Transfer assets
- `get_asset_info` - Get asset information
- `get_transaction` - Get transaction details
- `store_wallet` / `load_wallet` - Secure wallet management

### Utility Tools
- `validate_address` - Validate Algorand addresses
- `encode_address` / `decode_address` - Address encoding/decoding
- `get_application_address` - Get app addresses
- `verify_bytes` / `sign_bytes` - Cryptographic operations
- `compile_teal` / `disassemble_teal` - TEAL compilation
- `encode_obj` / `decode_obj` - MessagePack encoding

### API Tools
- **Algod API**: Account info, transactions, assets, applications
- **Indexer API**: Advanced search and lookup capabilities
- **NFD API**: Name service integration

### Advanced Transaction Tools
- `create_atomic_group` - Atomic transactions
- `create_application` - Smart contract deployment
- `call_application` - Smart contract interaction
- `optin_application` / `closeout_application` - App management
- `create_key_registration_transaction` - Participation setup
- `freeze_asset` - Asset management

### ARC-26 Tools
- `generate_algorand_uri` - Generate payment URIs
- `generate_algorand_qrcode` - Generate QR codes

### Knowledge Tools
- `get_knowledge_doc` - Access Algorand documentation
- `list_knowledge_docs` - Browse available docs
- `search_knowledge_docs` - Search documentation
- `get_algorand_guide` - Comprehensive development guide
- `search_algorand_docs` - AI-powered semantic search

## Usage

### In Cursor
1. Restart Cursor to load the new MCP configuration
2. The Algorand MCP server will be available as `algorand-mcp`
3. Use any of the 50+ tools through natural language

### Example Commands
- "Generate a new Algorand account"
- "Get the balance for address ABC123..."
- "Create an asset called MyToken with symbol MTK"
- "Search for smart contract documentation"
- "Fund my testnet account"

## Configuration

### Environment Variables
Edit `.env` to customize:
```env
ALGORAND_NETWORK=testnet  # or mainnet, localnet
ALGORAND_TOKEN=           # Your API token (optional for testnet)
ALGORAND_ALGOD=https://testnet-api.algonode.cloud
ALGORAND_INDEXER=https://testnet-idx.algonode.cloud
NFD_API_URL=https://api.nf.domains
QDRANT_URL=http://localhost:6333  # For knowledge tools
```

### Switching Networks
To use mainnet:
1. Update `ALGORAND_NETWORK=mainnet` in `.env`
2. Update API endpoints in `mcp.json`
3. Add your API token for mainnet access

## Security Notes

⚠️ **Important Security Considerations:**
- Never share your mnemonic phrases
- Use testnet for development and testing
- The `store_wallet` tool encrypts mnemonics but stores them in memory
- For production use, implement proper wallet management

## Troubleshooting

### Server Not Starting
1. Check that `dist/index.js` exists
2. Verify Node.js is installed
3. Check the path in `mcp.json`

### API Errors
1. Verify network connectivity
2. Check API endpoints in configuration
3. Ensure API tokens are valid (if using mainnet)

### Knowledge Tools Not Working
1. Start Qdrant server: `docker run -p 6333:6333 qdrant/qdrant`
2. Or update `QDRANT_URL` in configuration

## Next Steps

1. **Test the setup**: Try generating an account and checking its balance
2. **Explore tools**: Use the knowledge tools to learn about Algorand
3. **Build something**: Create assets, deploy smart contracts, or build applications
4. **Customize**: Modify the configuration for your specific needs

## Support

- Check the `README.md` for detailed tool documentation
- Review `ENHANCED_FEATURES.md` for advanced capabilities
- See `TESTING.md` for testing procedures

Your Algorand MCP server is now ready to use! 🚀
