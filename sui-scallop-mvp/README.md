# Scallop SDK MVP Frontend

A comprehensive MVP frontend built with Vite + React + TypeScript to test all features of the sui-scallop-sdk. This application serves as a testing playground and demonstration of the Scallop lending protocol on the Sui blockchain.

## Features

### Core Lending Features
- **Market Overview**: View all available assets with APY rates, prices, and market statistics
- **Deposit/Withdraw**: Supply assets to earn interest or withdraw supplied assets
- **Borrow/Repay**: Borrow assets against collateral or repay existing loans
- **Obligation Management**: Create obligation accounts, manage collateral positions

### Spool Staking Features
- **Stake Management**: Stake sCoin tokens (sSUI, sWUSDC, sWUSDT) for additional rewards
- **Reward Claiming**: Claim accumulated staking rewards
- **Account Creation**: Create stake accounts for different pools
- **Pool Overview**: View staking statistics and APY for each pool

### Portfolio Management
- **Portfolio Overview**: Comprehensive view of your positions and net worth
- **Asset Breakdown**: Detailed breakdown of supplied, borrowed, and wallet balances
- **Health Factor Monitoring**: Real-time health factor tracking with liquidation warnings

## Technology Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Blockchain Integration**: @scallop-io/sui-scallop-sdk
- **Notifications**: react-hot-toast

## Getting Started

### Prerequisites
- Node.js >= 18.15.0
- npm package manager

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173

### Environment Variables

```env
VITE_SCALLOP_ADDRESS_ID=67c44a103fe1b8c454eb9699
VITE_NETWORK_TYPE=mainnet
```

## Usage

1. **Connect Wallet**: Click "Connect Wallet" (currently mock wallet for demo)
2. **Explore Features**: Use the Dashboard tabs to test different SDK functions
3. **Monitor Portfolio**: Check the Portfolio page for position overview

## Project Structure

```
src/
├── components/        # UI components
├── hooks/            # Custom React hooks  
├── pages/            # Page components
├── services/         # SDK integration
├── stores/           # State management
└── types/            # TypeScript definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features Status

✅ **Completed**
- Core infrastructure setup
- Wallet integration (mock)
- SDK integration  
- Market overview
- Lending operations
- Staking operations
- Portfolio management
- Responsive design

## License

MIT License
