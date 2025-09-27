# TicketChain Deployment & Verification Guide

This guide walks you through deploying and verifying your TicketChain smart contracts on different networks.

## Prerequisites

1. **Node.js and npm** installed
2. **MetaMask wallet** with some ETH for gas fees
3. **Private key** of your deployment wallet
4. **RPC URLs** for the networks you want to deploy to
5. **Etherscan API key** for contract verification

## Step 1: Environment Setup

### 1.1 Install Dependencies
```bash
npm install
```

### 1.2 Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Deployment Configuration
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
POLYGON_RPC_URL=https://polygon-rpc.com
LISK_SEPOLIA_RPC_URL=https://rpc.sepolia-api.lisk.com
ETHERSCAN_API_KEY=your_etherscan_api_key

# Frontend Configuration (will be updated after deployment)
VITE_CONTRACT_ADDRESS=
VITE_MEMORIES_CONTRACT_ADDRESS=
VITE_NETWORK_ID=
```

### 1.3 Get Your Private Key
1. Open MetaMask
2. Click on account menu → Account Details
3. Export Private Key (keep this secure!)

### 1.4 Get RPC URLs
- **Infura**: Sign up at [infura.io](https://infura.io) for Ethereum networks
- **Alchemy**: Alternative at [alchemy.com](https://alchemy.com)
- **Public RPCs**: Use public endpoints (less reliable)

### 1.5 Get Etherscan API Key
1. Go to [etherscan.io](https://etherscan.io)
2. Create account → API Keys → Create new key
3. For other networks:
   - Polygon: [polygonscan.com](https://polygonscan.com)
   - Lisk: [blockscout.lisk.com](https://blockscout.lisk.com)

## Step 2: Local Development Deployment

### 2.1 Start Local Hardhat Node
```bash
# Terminal 1: Start local blockchain
npm run node
```

### 2.2 Deploy to Local Network
```bash
# Terminal 2: Deploy contracts locally
npm run deploy:local
```

### 2.3 Start Frontend
```bash
# Terminal 3: Start React app
npm run dev
```

The local deployment creates sample events and test data for development.

## Step 3: Testnet Deployment

### 3.1 Get Testnet ETH
- **Sepolia**: [sepoliafaucet.com](https://sepoliafaucet.com)
- **Lisk Sepolia**: [bridge.lisk.com](https://bridge.lisk.com)

### 3.2 Deploy to Sepolia
```bash
npm run deploy:sepolia
```

### 3.3 Deploy to Lisk Sepolia
```bash
npm run deploy:lisk
```

### 3.4 Update Frontend Environment
After deployment, update your `.env` file with the contract addresses:

```env
VITE_CONTRACT_ADDRESS=0x1234...  # TicketChain address
VITE_MEMORIES_CONTRACT_ADDRESS=0x5678...  # PhotoMemories address
VITE_NETWORK_ID=11155111  # Sepolia = 11155111, Lisk Sepolia = 4202
```

## Step 4: Contract Verification

### 4.1 Automatic Verification (Recommended)
Add verification plugin to `hardhat.config.js`:

```javascript
require("@nomiclabs/hardhat-etherscan");

module.exports = {
  // ... existing config
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.ETHERSCAN_API_KEY,
      liskSepolia: process.env.ETHERSCAN_API_KEY
    },
    customChains: [
      {
        network: "liskSepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com"
        }
      }
    ]
  }
};
```

### 4.2 Verify Contracts
```bash
# Verify TicketChain contract
npx hardhat verify --network sepolia TICKETCHAIN_ADDRESS

# Verify PhotoMemories contract
npx hardhat verify --network sepolia PHOTOMEMORIES_ADDRESS "TICKETCHAIN_ADDRESS"
```

### 4.3 Manual Verification
If automatic verification fails:

1. Go to the block explorer (Etherscan, Polygonscan, etc.)
2. Find your contract address
3. Click "Contract" → "Verify and Publish"
4. Fill in:
   - **Compiler Type**: Solidity (Single file)
   - **Compiler Version**: v0.8.19+commit.7dd6d404
   - **License**: MIT
5. Copy and paste your contract source code
6. Add constructor arguments if needed

## Step 5: Mainnet Deployment

### 5.1 Final Testing
- Test all functions on testnet
- Verify contract interactions work
- Test frontend integration
- Check gas costs

### 5.2 Deploy to Mainnet
```bash
# For Ethereum Mainnet
npx hardhat run scripts/deploy.js --network mainnet

# For Polygon Mainnet
npx hardhat run scripts/deploy.js --network polygon
```

### 5.3 Verify Mainnet Contracts
```bash
npx hardhat verify --network mainnet TICKETCHAIN_ADDRESS
npx hardhat verify --network mainnet PHOTOMEMORIES_ADDRESS "TICKETCHAIN_ADDRESS"
```

## Step 6: Frontend Configuration

### 6.1 Update Production Environment
Create `.env.production`:

```env
VITE_CONTRACT_ADDRESS=0xMainnetAddress
VITE_MEMORIES_CONTRACT_ADDRESS=0xMainnetMemoriesAddress
VITE_NETWORK_ID=1  # Ethereum Mainnet
```

### 6.2 Build and Deploy Frontend
```bash
npm run build
```

Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.).

## Troubleshooting

### Common Issues

**1. "Insufficient funds for gas"**
- Solution: Add more ETH to your deployment wallet

**2. "Nonce too high"**
- Solution: Reset MetaMask account or use `--reset` flag

**3. "Contract verification failed"**
- Solution: Check compiler version matches exactly
- Ensure constructor arguments are correct

**4. "Network not supported"**
- Solution: Check network configuration in hardhat.config.js

### Gas Optimization Tips

1. **Deploy during low gas periods** (weekends, early morning UTC)
2. **Use gas price tools**: [ethgasstation.info](https://ethgasstation.info)
3. **Consider Layer 2 solutions** (Polygon, Arbitrum) for lower costs

### Security Checklist

- [ ] Private keys stored securely (never commit to git)
- [ ] Contract addresses saved and backed up
- [ ] Verification completed on block explorer
- [ ] Test all critical functions after deployment
- [ ] Frontend connects to correct network
- [ ] Organizer permissions set correctly

## Network Information

| Network | Chain ID | Block Explorer | Faucet |
|---------|----------|----------------|---------|
| Ethereum Mainnet | 1 | etherscan.io | - |
| Sepolia Testnet | 11155111 | sepolia.etherscan.io | sepoliafaucet.com |
| Polygon Mainnet | 137 | polygonscan.com | - |
| Lisk Sepolia | 4202 | sepolia-blockscout.lisk.com | bridge.lisk.com |

## Support

If you encounter issues:
1. Check the [Hardhat documentation](https://hardhat.org/docs)
2. Review error messages carefully
3. Test on local network first
4. Verify environment variables are correct

## Next Steps

After successful deployment:
1. Create your first event through the frontend
2. Test ticket purchasing flow
3. Test photo memory distribution
4. Set up monitoring and analytics
5. Plan your launch strategy

---

**⚠️ Important Security Notes:**
- Never share your private key
- Always test on testnet first
- Keep your API keys secure
- Backup your contract addresses
- Verify contracts immediately after deployment