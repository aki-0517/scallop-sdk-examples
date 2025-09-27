# Scallop SDK MVP Usage Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173`

## Troubleshooting Node.js Polyfills

If you encounter `process is not defined` or similar errors, the application includes comprehensive polyfills for Node.js globals. The fixes include:

### Automatic Polyfills
- ✅ `vite-plugin-node-polyfills` for comprehensive Node.js compatibility
- ✅ Global variables (`process`, `global`, `Buffer`) polyfilled in HTML
- ✅ Vite configuration optimized for blockchain libraries
- ✅ TypeScript configuration supports Node.js types

### Manual Fixes (if needed)
If you still encounter issues, try:

1. **Clear cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Features Overview

### 🔗 Wallet Connection
- Click "Connect Wallet" in the header
- Currently uses mock wallet for demonstration
- Shows wallet address and balance

### 📊 Market Overview
- Real-time asset data with prices and APY rates
- Total supply/borrow amounts
- Collateral factors and availability

### 💰 Lending Operations

#### Deposit/Withdraw
1. Select "Deposit/Withdraw" tab
2. Choose operation type (Deposit/Withdraw)
3. Select asset from dropdown
4. Enter amount
5. Review transaction details
6. Submit transaction

#### Borrow/Repay
1. Select "Borrow/Repay" tab
2. Choose operation type (Borrow/Repay)
3. Select obligation account (required)
4. Select asset to borrow/repay
5. Enter amount
6. Review health factor impact
7. Submit transaction

#### Obligation Management
1. Select "Obligations" tab
2. **Create Obligation:** Click "Create New Obligation"
3. **Deposit Collateral:** Select asset and amount
4. **Withdraw Collateral:** Select obligation, asset, and amount
5. Monitor health factors and liquidation risks

### 🎯 Staking Operations
1. Select "Staking" tab
2. **Create Stake Account:** Click "Create Account" for desired pool
3. **Stake Tokens:** Enter amount and submit
4. **Unstake Tokens:** Enter amount and submit
5. **Claim Rewards:** Click "Claim Rewards" when available

### 📈 Portfolio Monitoring
1. Click "Portfolio" in navigation
2. View net worth and position summary
3. Monitor asset breakdown by type
4. Check health factors and risk levels
5. Review position performance

## SDK Feature Testing

### Core Client Methods
- `client.queryMarket()` - Market data
- `client.openObligation()` - Create obligation
- `client.deposit()` - Supply assets
- `client.withdraw()` - Withdraw assets
- `client.depositCollateral()` - Add collateral
- `client.withdrawCollateral()` - Remove collateral
- `client.borrow()` - Borrow assets
- `client.repay()` - Repay loans

### Spool Methods
- `client.createStakeAccount()` - Create staking account
- `client.stake()` - Stake tokens
- `client.unstake()` - Unstake tokens
- `client.claim()` - Claim rewards
- `client.getStakePool()` - Pool information
- `client.getAllStakeAccounts()` - User accounts

### Query Methods
- `query.getObligations()` - User obligations
- `query.getMarketData()` - Market statistics
- `query.getStakeData()` - Staking information

## Development Notes

### Mock Data
When SDK initialization fails, the application gracefully falls back to mock data for demonstration purposes. This ensures the UI remains functional even without proper blockchain connectivity.

### Error Handling
- Toast notifications for all operations
- Comprehensive error messages
- Graceful fallbacks for network issues
- Loading states for all async operations

### State Management
- Zustand stores for wallet and Scallop data
- Automatic data refresh on wallet connection
- Persistent connection state

## Production Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   ```

3. **Deploy `dist` folder** to your hosting provider

## Environment Variables

```env
# Required
VITE_SCALLOP_ADDRESS_ID=67c44a103fe1b8c454eb9699
VITE_NETWORK_TYPE=mainnet

# Optional
VITE_NODE_ENV=development
```

## Common Issues & Solutions

### Build Errors
- Ensure all dependencies are installed
- Check Node.js version (>= 18.15.0)
- Clear Vite cache if needed

### Runtime Errors
- Check browser console for specific errors
- Verify environment variables are set
- Ensure wallet is properly connected

### SDK Errors
- Check network connectivity
- Verify address ID is correct
- Monitor SDK initialization logs

## Browser Compatibility

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Next Steps

1. **Real Wallet Integration:** Replace mock wallet with actual Sui wallet adapters
2. **Enhanced Error Handling:** Add retry mechanisms and better error recovery
3. **Advanced Features:** Add transaction history, advanced analytics
4. **Mobile Optimization:** Improve mobile responsiveness
5. **Testing:** Add comprehensive unit and integration tests