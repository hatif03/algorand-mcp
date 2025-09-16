# MCP Server Testing Guide

## Testing the Algorand Workflow

Your MCP server now supports the complete workflow you described. Here's how to test it:

### 1. Start the MCP Server

```bash
npm run dev
```

### 2. Example Workflow Commands

#### Step 1: Generate a new Algorand account
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "generate_algorand_account",
    "arguments": {}
  }
}
```

#### Step 2: Store the wallet securely
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "store_wallet",
    "arguments": {
      "name": "my_wallet",
      "mnemonic": "your 25 word mnemonic phrase here",
      "password": "your_secure_password"
    }
  }
}
```

#### Step 3: Load wallet and get mnemonic
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "load_wallet",
    "arguments": {
      "name": "my_wallet",
      "password": "your_secure_password"
    }
  }
}
```

#### Step 4: Send payment to a specific address
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "send_payment",
    "arguments": {
      "mnemonic": "your 25 word mnemonic phrase here",
      "toAddress": "RECIPIENT_ADDRESS_HERE",
      "amount": 1000000,
      "note": "Test payment from MCP server"
    }
  }
}
```

### 3. Integration Options

#### VS Code MCP Extension
1. Install the MCP extension for VS Code
2. Use the existing `.vscode/mcp.json` configuration
```json
{
    "servers": {
        "algorand-mcp-server": {
            "type": "stdio",
            "command": "node",
            "args": [
                "dist/index.js"
            ]
        }
    }
}
```

### 4. Security Notes

- **Testnet Default**: Server defaults to Algorand testnet for safety
- **Encrypted Storage**: Mnemonics are encrypted with AES-256-GCM
- **No Logging**: Sensitive data is never logged
- **Password Required**: Wallet access requires password authentication

### 5. Example Natural Language Commands 

Once connected to MCP Client, you can use natural language:

1. "Generate a new Algorand account for me"
2. "Store this wallet with name 'main_wallet' using password 'mypassword123'"
3. "Load my wallet called 'main_wallet' with password 'mypassword123'"
4. "Send 0.1 ALGO to address XYZ123... from my stored wallet"
5. "Check the balance of address ABC456..."

### 6. Getting Testnet ALGO

For testing, you'll need testnet ALGO:
- Visit: https://bank.testnet.algorand.network/
- Enter your testnet address
- Request free testnet ALGO for testing

## Important Security Reminders

⚠️ **NEVER use real mainnet mnemonics during testing**
⚠️ **Always test on testnet first**
⚠️ **Store production mnemonics securely outside of code**
⚠️ **Use strong passwords for wallet encryption**
