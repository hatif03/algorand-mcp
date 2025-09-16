# Algorand MCP Server Test Queries

This document provides test queries for each tool in the Algorand MCP Server v1.0.0.

## Basic Tools

### Echo
```
Test the echo functionality by sending a simple message
```

### Calculate
```
Calculate 2 + 2 * 3
```

### Get Current Time
```
What time is it in UTC?
```

### Fund Testnet
```
Fund this testnet address: [YOUR_TESTNET_ADDRESS]
```

## Core Algorand Tools

### Generate Account
```
Generate a new Algorand account for me
```

### Get Account Info
```
Get account information for address: [ALGORAND_ADDRESS]
```

### Send Payment
```
Send 1000000 microAlgos from [MNEMONIC] to [RECIPIENT_ADDRESS]
```

### Create Asset
```
Create a new asset called "TestToken" with symbol "TEST" and total supply 1000000 using mnemonic [CREATOR_MNEMONIC]
```

### Opt In to Asset
```
Opt in to asset ID 12345 using mnemonic [ACCOUNT_MNEMONIC]
```

### Transfer Asset
```
Transfer 100 units of asset ID 12345 from [SENDER_MNEMONIC] to [RECIPIENT_ADDRESS]
```

### Get Asset Info
```
Get information about asset ID 12345
```

### Get Transaction
```
Get details for transaction ID: [TRANSACTION_ID]
```

## Wallet Management

### Store Wallet
```
Store a wallet named "test-wallet" with mnemonic [MNEMONIC] and password "test123"
```

### Load Wallet
```
Load the wallet named "test-wallet" with password "test123"
```

## Utility Tools

### Validate Address
```
Validate this Algorand address: [ALGORAND_ADDRESS]
```

### Encode Address
```
Encode this public key to an Algorand address: [PUBLIC_KEY_HEX]
```

### Decode Address
```
Decode this Algorand address to public key: [ALGORAND_ADDRESS]
```

### Get Application Address
```
Get the address for application ID 123
```

### Verify Bytes
```
Verify signature [SIGNATURE_BASE64] for bytes [BYTES_HEX] with address [ALGORAND_ADDRESS]
```

### Sign Bytes
```
Sign bytes [BYTES_HEX] with secret key [SECRET_KEY_HEX]
```

### Compile TEAL
```
Compile this TEAL code: [TEAL_SOURCE_CODE]
```

### Disassemble TEAL
```
Disassemble this TEAL bytecode: [TEAL_BYTECODE_BASE64]
```

### Encode Object
```
Encode this object to msgpack: {"name": "test", "value": 123}
```

### Decode Object
```
Decode this msgpack object: [MSGPACK_BYTES_BASE64]
```

## API Integration Tools

### Algod API

#### Get Account Info
```
Get account info from algod for address: [ALGORAND_ADDRESS]
```

#### Get Transaction Info
```
Get transaction info from algod for transaction ID: [TRANSACTION_ID]
```

#### Get Asset Info
```
Get asset info from algod for asset ID: 12345
```

#### Get Application Info
```
Get application info from algod for application ID: 123
```

#### Get Pending Transactions
```
Get pending transactions from algod mempool (max 10)
```

### Indexer API

#### Lookup Account
```
Look up account by ID in indexer: [ALGORAND_ADDRESS]
```

#### Lookup Asset
```
Look up asset by ID in indexer: 12345
```

#### Lookup Transaction
```
Look up transaction by ID in indexer: [TRANSACTION_ID]
```

#### Search Accounts
```
Search for accounts in indexer with limit 10
```

#### Search Transactions
```
Search for transactions in indexer with limit 10
```

### NFD API

#### Get NFD
```
Get NFD information for domain: example.algo
```

#### Get NFDs for Address
```
Get all NFDs owned by address: [ALGORAND_ADDRESS]
```

#### Search NFDs
```
Search for NFD domains containing "test"
```

## Advanced Transaction Tools

### Create Atomic Group
```
Create an atomic group with these transactions: [TRANSACTION_ARRAY]
```

### Sign Atomic Group
```
Sign this atomic group with mnemonic: [MNEMONIC]
```

### Submit Atomic Group
```
Submit this signed atomic group: [SIGNED_TRANSACTIONS]
```

### Create Application
```
Create a new application with approval program [TEAL_CODE] and clear program [TEAL_CODE]
```

### Call Application
```
Call application ID 123 with arguments ["arg1", "arg2"]
```

### Opt In Application
```
Opt in to application ID 123
```

### Close Out Application
```
Close out from application ID 123
```

### Create Key Registration Transaction
```
Create key registration transaction with vote key [VOTE_KEY] and selection key [SELECTION_KEY]
```

### Freeze Asset
```
Freeze asset ID 12345 for address [TARGET_ADDRESS]
```

## ARC-26 Tools

### Generate Algorand URI
```
Generate an Algorand URI for address [ALGORAND_ADDRESS] with amount 1000000
```

### Generate Algorand QR Code
```
Generate a QR code for Algorand address [ALGORAND_ADDRESS] with label "Test Payment"
```

## Knowledge Tools

### Search Algorand Docs
```
Search Algorand documentation for "smart contracts"
```

## Sample Test Data

### Testnet Address
```
7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64CJFD6YPX5D3LO5A
```

### Test Mnemonic (TESTNET ONLY)
```
abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art
```

### Sample Transaction ID
```
SAMPLE_TRANSACTION_ID_HERE
```

### Sample Asset ID
```
12345
```

## Testing Tips

1. Start with basic tools (echo, calculate, get_current_time)
2. Use testnet addresses and assets only
3. Generate test accounts first
4. Fund accounts with testnet faucet
5. Test tools in logical order
6. Check server logs for errors
7. Verify results with Algorand Explorer

## Error Testing

### Invalid Inputs
- Invalid address format
- Non-existent transaction ID
- Invalid mnemonic phrase
- Negative amounts
- Non-existent asset ID

### Network Errors
- Invalid API endpoints
- Expired API tokens
- Rate limiting
- Network timeouts

---

**Note**: Replace placeholder values like [ALGORAND_ADDRESS], [MNEMONIC], etc. with actual test data before running these queries.