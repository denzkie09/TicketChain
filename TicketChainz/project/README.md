# TicketChain - Web3 Ticketing Platform

A decentralized ticketing platform built with React, TypeScript, and Solidity smart contracts. Features soulbound tickets (non-transferable NFTs) and post-event photo memories.

## Features

- 🎫 **NFT Tickets**: Each ticket is an ERC-721 token with unique metadata
- 🔒 **Soulbound Tickets**: Non-transferable tickets that prevent scalping
- 📸 **Photo Memories**: Post-event NFT collectibles with rarity system
- 🌐 **Web3 Integration**: MetaMask wallet connection and blockchain transactions
- 📱 **Responsive Design**: Modern UI that works on all devices
- 🎨 **Professional Design**: Glassmorphism effects and smooth animations

## Smart Contracts

### TicketChain.sol
Main contract handling:
- Event creation and management
- Ticket minting and purchasing
- Soulbound ticket functionality
- Organizer permissions

### PhotoMemories.sol
Secondary contract for:
- Post-event memory distribution
- Rarity system (Common, Rare, Legendary)
- Automatic NFT minting for attendees

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Local Development

#### Start Hardhat Node
```bash
npm run node
```

#### Deploy Contracts Locally
```bash
npm run deploy:local
```

#### Start Frontend
```bash
npm run dev
```

### 4. Testing
```bash
npm run test
```

## Deployment

### Local Network
```bash
# Terminal 1: Start local blockchain
npm run node

# Terminal 2: Deploy contracts
npm run deploy:local

# Terminal 3: Start frontend
npm run dev
```

### Testnet (Sepolia)
```bash
# Set up .env with Sepolia RPC and private key
npm run deploy:sepolia
```

### Lisk Sepolia Testnet
```bash
# Set up .env with Lisk Sepolia configuration
npm run deploy:lisk
```

### Production Networks
```bash
# Configure network in hardhat.config.js
npx hardhat run scripts/deploy.js --network <network-name>
```

## Environment Variables

Create a `.env` file with:

```env
# Deployment
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
POLYGON_RPC_URL=https://polygon-rpc.com

# Frontend
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_MEMORIES_CONTRACT_ADDRESS=deployed_memories_address
VITE_NETWORK_ID=1337
```

## Contract Addresses

After deployment, update your `.env` file with the contract addresses printed in the console.

## Architecture

### Frontend Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── hooks/         # Custom React hooks
├── types/         # TypeScript interfaces
├── utils/         # Utility functions and contract service
└── App.tsx        # Main application component
```

### Smart Contract Structure
```
contracts/
├── TicketChain.sol      # Main ticketing contract
└── PhotoMemories.sol    # Photo memories contract

scripts/
├── deploy.js           # Production deployment
└── local-deploy.js     # Local development deployment
```

## Key Features Explained

### Soulbound Tickets
- Non-transferable NFTs that prevent secondary market trading
- Permanently bound to the purchaser's wallet
- Ideal for exclusive events and community building

### Photo Memories
- Automatically distributed after events
- Three rarity tiers with different drop rates:
  - Common (70%): Standard event photos
  - Rare (25%): Special moments and backstage content
  - Legendary (5%): Ultra-exclusive VIP experiences

### Anti-Scalping Protection
- Soulbound tickets cannot be resold
- Authentic proof of attendance
- Fair access for genuine attendees

## Development Workflow

1. **Smart Contract Development**
   - Write contracts in `contracts/`
   - Test with `npm run test`
   - Deploy locally with `npm run deploy:local`

2. **Frontend Development**
   - Update contract service in `src/utils/contracts.ts`
   - Test with local blockchain
   - Build with `npm run build`

3. **Production Deployment**
   - Deploy to testnet first
   - Verify contracts on block explorer
   - Update frontend environment variables
   - Deploy to mainnet

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions and support, please open an issue on GitHub.