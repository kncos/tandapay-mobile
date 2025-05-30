# TandaPay Token Abstraction System

This document describes the improved token abstraction system for the TandaPay wallet, replacing the hardcoded token array with a Redux-based system that supports persistent token selection and custom token management.

## Overview

The token system consists of several key components:

1. **Token Types** (`tokenTypes.js`) - Flow type definitions
2. **Token Configuration** (`tokenConfig.js`) - Default tokens and validation
3. **Token Actions** (`tokenActions.js`) - Redux action creators
4. **Token Selectors** (`tokenSelectors.js`) - Redux state selectors
5. **Enhanced Web3** (`web3Enhanced.js`) - ERC20 transfer and balance functionality

## Features

### ✅ Completed Features

- **Persistent Token Selection**: Selected token is saved in Redux and persists across app sessions
- **Default Token Support**: Pre-configured tokens (ETH, USDC, USDT, DAI) with network-specific addresses
- **Custom Token Management**: Users can add/remove custom ERC20 tokens
- **Balance Caching**: Token balances are cached with staleness detection (60-second TTL)
- **Multi-Network Support**: Mainnet and Sepolia network configurations
- **ERC20 Transfers**: Full transfer functionality with gas estimation
- **Token Validation**: Custom token validation for address format and required fields

### 🔄 Token State Management

The token state is managed in Redux under `tandaPay.tokens`:

```javascript
type TokenState = {
  selectedTokenSymbol: string,
  customTokens: Array<Token>,
  balances: { [symbol: string]: TokenBalance },
};
```

### 🎯 Usage Examples

#### Selecting a Token
```javascript
import { useDispatch } from 'react-redux';
import { selectToken } from '../tokens/tokenActions';

const dispatch = useDispatch();
dispatch(selectToken('USDC'));
```

#### Getting Available Tokens
```javascript
import { useSelector } from 'react-redux';
import { getAvailableTokens, getSelectedToken } from '../tokens/tokenSelectors';

const availableTokens = useSelector(getAvailableTokens);
const selectedToken = useSelector(getSelectedToken);
```

#### Adding Custom Token
```javascript
import { addCustomToken } from '../tokens/tokenActions';

const customToken = {
  symbol: 'CUSTOM',
  address: '0x...',
  name: 'Custom Token',
  decimals: 18,
  isDefault: false,
  isCustom: true,
};

dispatch(addCustomToken(customToken));
```

#### Transferring Tokens
```javascript
import { transferToken } from '../web3Enhanced';

const result = await transferToken({
  token: selectedToken,
  fromAddress: '0x...',
  toAddress: '0x...',
  amount: '1.0',
  privateKey: '0x...',
  network: 'sepolia'
});
```

## Component Integration

### WalletBalanceCard (Refactored)

The `WalletBalanceCard` component has been refactored to use the new token system:

**Before:**
- Hardcoded `TOKENS` array
- Local state for token selection
- Direct web3 calls

**After:**
- Redux-connected token selection
- Persistent token selection
- Cached balance management
- Enhanced error handling

### Key Changes Made

1. **Replaced hardcoded TOKENS array** with Redux selectors
2. **Added persistent token selection** via Redux state
3. **Implemented balance caching** with automatic staleness detection
4. **Enhanced error handling** for failed balance fetches
5. **Improved loading states** with better UX

## File Structure

```
src/tandapay/tokens/
├── tokenTypes.js          # Flow type definitions
├── tokenConfig.js         # Default tokens and validation
├── tokenActions.js        # Redux action creators
├── tokenSelectors.js      # Redux state selectors
└── __tests__/
    └── tokenIntegration-test.js  # Integration tests
```

## Architecture Benefits

### 🏗️ Scalability
- Easy to add new default tokens
- Extensible custom token system
- Network-agnostic design

### 🔄 State Management
- Centralized token state in Redux
- Persistent user preferences
- Cache management for performance

### 🧪 Testability
- Comprehensive unit tests
- Integration test coverage
- Mock-friendly architecture

### 🔧 Maintainability
- Separation of concerns
- Type-safe with Flow
- Well-documented APIs

## Migration Guide

### For Existing Components

1. **Replace hardcoded token arrays** with Redux selectors:
   ```javascript
   // Old
   const TOKENS = [{ symbol: 'ETH', ... }];
   
   // New
   const tokens = useSelector(getAvailableTokens);
   ```

2. **Use Redux actions for token selection**:
   ```javascript
   // Old
   setSelectedToken(token);
   
   // New
   dispatch(selectToken(token.symbol));
   ```

3. **Leverage cached balances**:
   ```javascript
   // Old
   fetchBalance(token, address).then(setBalance);
   
   // New
   const cachedBalance = useSelector(state => getTokenBalance(state, token.symbol));
   // Auto-refresh logic handles stale data
   ```

## Future Enhancements

### 🎯 Planned Features

1. **Token Management UI**: Dedicated screens for adding/removing custom tokens
2. **Balance Auto-refresh**: Background balance updates with configurable intervals
3. **Token Search**: Search and discovery of popular ERC20 tokens
4. **Price Integration**: Real-time token price data
5. **Transaction History**: Token transfer history with filtering
6. **Gas Optimization**: Dynamic gas price optimization for transfers

### 🔮 Technical Improvements

1. **Token Metadata**: Automatic token metadata fetching (name, symbol, decimals)
2. **Error Recovery**: Retry logic for failed network requests
3. **Offline Support**: Cached data availability when offline
4. **Multi-Wallet**: Support for multiple wallet addresses
5. **Token Icons**: Dynamic token icon loading and caching

## Testing

Run the token integration tests:

```bash
npm test tokenIntegration-test.js
```

The test suite covers:
- Default token configuration
- Custom token validation
- Redux action creators
- State selectors
- Integration scenarios

## Contributing

When adding new features to the token system:

1. **Update type definitions** in `tokenTypes.js`
2. **Add new actions** in `tokenActions.js`
3. **Update selectors** in `tokenSelectors.js`
4. **Add test coverage** for new functionality
5. **Update this documentation**

## Security Considerations

- **Private key handling**: Never store private keys in Redux state
- **Address validation**: Always validate addresses before transactions
- **Custom token verification**: Warn users about unverified custom tokens
- **Network security**: Use secure RPC endpoints with proper authentication
