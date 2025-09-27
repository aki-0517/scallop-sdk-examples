# CLAUDE.md

## Project Overview

This is a Sui Scallop SDK Example repository containing a React TypeScript frontend application that demonstrates Scallop DeFi protocol integration on the Sui blockchain. The main application is located in `sui-scallop-mvp/`.

**CRITICAL: NO MOCK DATA - Always use real Scallop SDK data. This project exclusively integrates with live Scallop protocol data through the SDK. Never create, suggest, or use mock/dummy data. All data must come from actual Scallop SDK calls.**

## Development Commands

```bash
# Navigate to main application
cd sui-scallop-mvp

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Core Architecture Pattern
- **ScallopService**: Singleton service managing SDK initialization and connection
- **useScallop Hook**: React hook providing SDK operations and data fetching
- **Zustand Stores**: State management for wallet and Scallop data
- **Component Architecture**: Feature-based organization (lending/, spool/, wallet/, ui/)

### Data Flow
1. Wallet connects via WalletProvider (@mysten/dapp-kit)
2. ScallopService initializes SDK with wallet address  
3. useScallop hook loads real protocol data (markets, obligations, stake accounts)
4. Components consume data through Zustand stores
5. All transactions execute through ScallopService SDK methods

### Key Files
- `src/services/scallopService.ts`: SDK initialization and management
- `src/hooks/useScallop.ts`: Main data fetching and SDK operations
- `src/stores/scallopStore.ts`: Protocol data state management
- `src/stores/walletStore.ts`: Wallet connection state

## Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Blockchain**: Sui Network via @scallop-io/sui-scallop-sdk (v2.2.9)
- **Wallet**: @mysten/dapp-kit, @mysten/wallet-kit
- **State**: Zustand stores
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Notifications**: react-hot-toast

## Scallop SDK Integration

### Initialization Pattern
```typescript
// Always initialize SDK with real network configuration
const scallop = new Scallop({
  addressId: process.env.VITE_SCALLOP_ADDRESS_ID,
  networkType: process.env.VITE_NETWORK_TYPE || 'mainnet'
});
```

### Data Loading Pattern
- Market data: `scallopClient.queryMarket()`
- User obligations: `scallopClient.getObligations(address)`
- Stake accounts: `scallopClient.getAllStakeAccounts(address)`
- User deposits: `scallopClient.query.getSCoinAmount()`

### Environment Variables
- `VITE_SCALLOP_ADDRESS_ID`: Scallop protocol address ID
- `VITE_NETWORK_TYPE`: Network type (mainnet/testnet)

## Component Patterns

### Feature Components
- `lending/`: Deposit/withdraw, borrow/repay, market overview, obligation management
- `spool/`: Staking operations and rewards
- `wallet/`: Connection and provider management
- `ui/`: Shared components (Card, Layout, LoadingSpinner)

### Data Dependencies
All components must use real Scallop data:
- Market rates and APY from SDK market queries
- User balances from actual wallet/protocol state
- Transaction history from blockchain data
- No hardcoded or mock values allowed

## Development Guidelines

### When Adding Features
1. Always integrate with real Scallop SDK methods
2. Follow existing patterns in ScallopService and useScallop
3. Use proper error handling for network/SDK failures
4. Update relevant Zustand stores for state management
5. Test with actual wallet connections and transactions

### Testing Approach
- Test against actual Scallop testnet/mainnet
- Verify wallet integration with real transactions
- Validate data fetching from live protocol endpoints
- No unit tests with mock data - integration tests only

### Code Conventions
- TypeScript strict mode enabled
- ESLint configuration in eslint.config.js
- Tailwind CSS for all styling
- React hooks pattern for state and effects
- Error boundaries for SDK connection failures