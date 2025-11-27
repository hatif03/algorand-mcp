# MCP Server with Algorand Integration - Complete Instructions

This guide provides step-by-step instructions for using your MCP (Model Context Protocol) server with Algorand blockchain capabilities.

## 🚀 Quick Start Overview

Your MCP server provides these key features:
- ✅ **Generate Algorand Address**: Create new blockchain accounts
- ✅ **Secure Mnemonic Storage**: Encrypted wallet storage 
- ✅ **Send ALGO**: Transfer cryptocurrency payments
- ✅ **Natural Language Interface**: Use plain English commands

## 🔧 Initial Setup (Do Once)

### 1. Configure Environment
```bash
# Ensure you're in the project directory
# Create environment file (if not exists)
echo "ALGORAND_NETWORK=testnet" > .env
```

### 2. Build and Start Server
```bash
# Build the project
npm run build

# Start the MCP server (keep this running)
npm run dev
```
*You should see: "MCP Server running on stdio"*

## 🎯 Integration Methods

### Method A: VS Code Testing (Immediate)

**For quick testing and development:**

1. **Install MCP Extension:**
   - Open VS Code Extensions (Ctrl+Shift+X)
   - Search for "MCP" or "Model Context Protocol"
   - Install the extension

2. **Connect to Server:**
   - Your `.vscode/mcp.json` is already configured
   - The extension will detect your running server automatically

3. **Test Tools:**
   - Use the MCP extension interface to call tools directly
   - Great for debugging and development


#### Configure in VS Code
2. **Create/Edit the .vscode/mcp.json:**
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


### Generate Algorand Address ✅
**Natural Language:**
```
"Generate a new Algorand account for me"
```

**Direct Tool Call:**
- Tool: `generate_algorand_account`
- Parameters: `{}` (none required)

**Expected Output:**
```
New Algorand Account Generated:
Address: [58-character Algorand address]
Mnemonic: [25 secret words]

⚠️ SECURITY WARNING: Store the mnemonic phrase securely and never share it.
```

**Important:** Copy both the address and mnemonic - you'll need them!

### Secure Mnemonic Storage ✅

**Natural Language:**
```
"Store this wallet with name 'my_main_wallet' using password 'mySecurePassword123' and the mnemonic: [paste your 25 words here]"
```

**Direct Tool Call:**
- Tool: `store_wallet`
- Parameters:
  ```json
  {
    "name": "my_main_wallet",
    "mnemonic": "your 25 word mnemonic phrase from step 1",
    "password": "mySecurePassword123"
  }
  ```

**Expected Output:**
```
Wallet "my_main_wallet" stored securely!
Address: [your address]

⚠️ Remember your password - it's required to access the wallet.
```

### Fund Your Account (Testnet Only) 💰

**Before sending transactions, you need testnet ALGO:**

1. **Visit the Algorand Testnet Faucet:**
   - Go to: https://bank.testnet.algorand.network/
   
2. **Request Funds:**
   - Enter your address from Step 1
   - Click "Dispense" 
   - Wait 30-60 seconds for confirmation

3. **Verify Balance:**
   ```
   "Check the balance of address [your address]"
   ```

### Send ALGO Payment ✅

**Natural Language:**
```
"Send 0.1 ALGO to address [recipient address] using the mnemonic from my stored wallet 'my_main_wallet'"
```

**Direct Tool Call:**
- Tool: `send_payment`
- Parameters:
  ```json
  {
    "mnemonic": "your 25 word mnemonic phrase",
    "toAddress": "RECIPIENT_ADDRESS_HERE",
    "amount": 100000,
    "note": "Test payment from MCP server"
  }
  ```
  *Note: 100000 microAlgos = 0.1 ALGO*

**Expected Output:**
```
Payment Successful!
Transaction ID: [transaction hash]
Confirmed in Round: [block number]
Amount: 0.1 ALGO
```

## 🧪 Quick Test Sequence

Here's a complete test you can run immediately:

### 1. Start Your Server
```bash
npm run dev
```

### 2. Test with Server

```
Hi! I want to test the Algorand blockchain functionality. Please help me:

1. Generate a new Algorand account
2. Store it securely with name 'test_wallet' and password 'test123'
3. Check the account balance
4. If it has funds, send 0.001 ALGO to this test address: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

### 3. Expected Flow
1. **Account Generation** → Address + mnemonic returned
2. **Wallet Storage** → Confirmation of encrypted storage
3. **Balance Check** → Shows 0 ALGO (new account)
4. **Fund Account** → Use testnet faucet
5. **Send Payment** → Successful transaction

## 🔐 Security Features

### Built-in Security
- ✅ **Testnet Default**: Server safely defaults to Algorand testnet
- ✅ **AES-256-GCM Encryption**: Mnemonics encrypted with military-grade security
- ✅ **No Logging**: Sensitive data never written to logs
- ✅ **Password Protection**: Wallet access requires password authentication

### Security Best Practices
- ⚠️ **Never use real mainnet mnemonics during testing**
- ⚠️ **Always test on testnet first**
- ⚠️ **Store production passwords in secure password managers**
- ⚠️ **Use environment variables for production configuration**

## 🛠 Advanced Features

### Available Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| `generate_algorand_account` | Create new account | Getting started |
| `store_wallet` | Encrypt & store mnemonic | Secure storage |
| `load_wallet` | Decrypt stored wallet | Retrieve credentials |
| `get_account_info` | Check balance & status | Account monitoring |
| `send_payment` | Transfer ALGO | Payments |
| `create_asset` | Create ASA tokens | Token creation |
| `opt_in_to_asset` | Opt into ASA | Receive tokens |
| `transfer_asset` | Send ASA tokens | Token transfers |
| `get_asset_info` | Query token details | Token research |
| `get_transaction` | Transaction details | Transaction tracking |

### Example Advanced Commands

**Create a Custom Token:**
```
"Create a new asset called 'MyToken' with symbol 'MTK', total supply of 1000000, and 2 decimal places using my stored wallet"
```

**Transfer Custom Tokens:**
```
"Transfer 100 units of asset ID 12345 to address [recipient] using my wallet"
```

## 🔧 Troubleshooting

### Common Issues

**Server Won't Start:**
```bash
# Check if TypeScript compiled correctly
npm run build

# Check for port conflicts
# Kill any running node processes if needed
```

**Transaction Fails:**
1. Verify you have sufficient balance (check with faucet)
2. Ensure you're using testnet addresses
3. Check the recipient address is valid
4. Verify network connectivity

**Wallet Storage Issues:**
- Remember: wallets are stored in memory only
- Restart server = lose stored wallets
- For production, implement persistent storage

### Getting Help

**Check Server Status:**
```bash
# View server logs
npm run dev

# Test individual tools via VS Code MCP extension
```

**Network Status:**
- Testnet Explorer: https://lora.algokit.io/testnet/
- Mainnet Explorer: https://algoexplorer.io/

## 🚀 Production Deployment

### Environment Configuration
```bash
# For production, create .env file:
ALGORAND_NETWORK=mainnet  # Use mainnet for production
```

### Security Checklist
- [ ] Use environment variables for sensitive config
- [ ] Implement persistent secure wallet storage
- [ ] Set up proper logging (without sensitive data)
- [ ] Use hardware security modules for production keys
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerts

## 📚 Next Steps

1. **Master the Basics**: Practice with testnet transactions
2. **Explore Advanced Features**: Try asset creation and transfers
3. **Build Applications**: Integrate with your own projects
4. **Scale to Production**: Implement additional security measures

## 🎯 Example Use Cases

- **Payment Processing**: Accept ALGO payments
- **Token Management**: Create and manage custom tokens
- **DeFi Integration**: Build decentralized finance applications
- **NFT Operations**: Create and transfer NFTs
- **Smart Contract Interaction**: Call application contracts

Your MCP server is now ready for blockchain operations! Start with testnet and gradually explore the full Algorand ecosystem.
