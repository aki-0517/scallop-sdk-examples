# Scallop SDK Example

This repository contains examples and documentation for the Scallop SDK, demonstrating how to build applications on the Sui blockchain using Scallop's DeFi protocols.

## Overview

The Scallop SDK Example provides a comprehensive showcase of:

- **Lending Protocol Integration**: Deposit, withdraw, borrow, and repay operations
- **Spool Staking**: Staking mechanisms for yield generation
- **Portfolio Management**: Real-time portfolio tracking and management
- **Wallet Integration**: Seamless wallet connection and transaction handling

## Project Structure

```
sdk-example/
├── docs/                           # Documentation and analysis
│   ├── sui-scallop-sdk-analysis.md # SDK analysis and architecture
│   └── sui-scallop-sdk-mvp-frontend-todo.md # Development roadmap
└── sui-scallop-mvp/               # React frontend application
    ├── src/
    │   ├── components/             # React components
    │   │   ├── lending/           # Lending protocol components
    │   │   ├── spool/             # Spool staking components
    │   │   ├── wallet/            # Wallet integration
    │   │   └── ui/                # Shared UI components
    │   ├── hooks/                 # Custom React hooks
    │   ├── services/              # Scallop service integration
    │   ├── stores/                # State management
    │   └── types/                 # TypeScript type definitions
    └── [configuration files]
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Sui wallet (Sui Wallet, Martian, etc.)

### Installation

1. Navigate to the application directory:
   ```bash
   cd sui-scallop-mvp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

## Features

### Lending Protocol
- **Deposit/Withdraw**: Supply assets to earn yield
- **Borrow/Repay**: Borrow against collateral
- **Market Overview**: Real-time market data and rates
- **Obligation Management**: Track and manage lending positions

### Spool Staking
- **Stake Assets**: Participate in Scallop's staking rewards
- **Unstake**: Withdraw staked assets
- **Rewards Tracking**: Monitor staking rewards and performance

### Portfolio Dashboard
- **Asset Overview**: Complete portfolio summary
- **Transaction History**: Track all protocol interactions
- **Performance Metrics**: Analyze yields and returns

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Custom stores with React hooks
- **Blockchain**: Sui Network
- **SDK**: Scallop Protocol SDK

## Documentation

Detailed documentation and analysis can be found in the `docs/` directory:

- [SDK Analysis](docs/sui-scallop-sdk-analysis.md) - Technical architecture and implementation details
- [Development TODO](docs/sui-scallop-sdk-mvp-frontend-todo.md) - Current development roadmap

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add appropriate license information]

## Support

For questions and support:
- Check the documentation in the `docs/` folder
- Review the example implementations in `src/`
- Refer to the official Scallop documentation