# TandaPay Token Refactor Summary - PerNetworkData Structure

## Overview
This document summarizes the comprehensive refactoring of TandaPay's token state management to use a cleaner, more efficient `perNetworkData` structure. The new design provides better organization, type safety, and easier access to network-specific data.

## New State Structure

### Core Architecture
The token state now uses a `perNetworkData` object where each network contains all its relevant information:

```javascript
tandaPay: {
  settings: {
    selectedNetwork: 'sepolia' | 'mainnet' | 'arbitrum' | 'polygon' | 'custom',
    customRpcConfig: { /* RPC configuration for custom networks */ },
    contractAddresses: { /* legacy - moved to perNetworkData */ },
    networkPerformance: { /* global performance settings */ },
  },
  tokens: {
    perNetworkData: {
      mainnet: {
        contractAddress: ?string,           // TandaPay contract address for this network
        networkPerformance: ?{|             // Network-specific performance metrics
          avgBlockTime: number,
          gasPrice: number,
          lastChecked: number,
        |},
        selectedToken: string,              // Currently selected token symbol for this network
        tokens: {                           // Token map keyed by address/symbol
          'ETH': {                          // Native tokens keyed by symbol
            symbol: 'ETH',
            address: null,
            name: 'Ethereum',
            decimals: 18,
            isCustom: false,
            balance: '1.234567890123456789', // Current balance as string
            lastUpdated: 1642694400000,     // Last balance update timestamp
          },
          '0x...': {                        // ERC20 tokens keyed by address
            symbol: 'USDC',
            address: '0x...',
            name: 'USD Coin',
            decimals: 6,
            isCustom: false,
            balance: '1000.000000',
            lastUpdated: 1642694400000,
          },
        },
      },
      sepolia: { /* same structure */ },
      arbitrum: { /* same structure */ },
      polygon: { /* same structure */ },
      custom: { /* same structure */ },
    },
  },
  // Other TandaPay state (communityInfoData, memberData, etc.)
}
```

### Key Benefits
1. **Network Isolation**: Each network's data is self-contained
2. **Efficient Lookups**: Direct access to tokens by address/symbol
3. **Balance Integration**: Token metadata and balance data unified
4. **Flexible Selection**: Per-network token selection
5. **Contract Management**: Network-specific contract addresses
6. **Performance Tracking**: Per-network performance metrics

### 7. Backward Compatibility Cleanup (COMPLETED)
- **REMOVED**: All legacy state migration logic from selectors
- **REMOVED**: `migrateLegacyCustomTokens()` function that was unused
- **CLEANED UP**: Deprecated function names in tokenSelectors.js
- **SIMPLIFIED**: No more runtime checks for old state structure
- All TandaPay code now assumes only the new unified token structure

## Benefits of Unified Structure

### ✅ **Massive Simplification**
- **Single source of truth**: One array per network contains ALL tokens
- **No more combining**: No need to merge default + custom arrays
- **Cleaner selectors**: `getAvailableTokens()` is now a simple property access
- **Reduced complexity**: Eliminated most token combination logic

### ✅ **Better Performance**
- **Pre-populated tokens**: Default tokens loaded once at initialization
- **No runtime chain definition calls**: Tokens cached in Redux state
- **Faster token access**: Direct array access vs. function calls + merging

### ✅ **Enhanced User Experience**
- **Consistent token management**: All tokens treated equally in UI
- **Preserved functionality**: Can still distinguish default vs. custom via flags
- **Network isolation**: Each network maintains its complete token list

### ✅ **Developer Experience**
- **Intuitive API**: `getAvailableTokens(state)` returns everything you need
- **Type safety**: Unified structure with clear Flow types
- **Easy debugging**: All tokens visible in Redux DevTools

## Migration Impact

### Breaking Changes Fixed
1. **Token State Access**: Updated all selectors to use `tokens` instead of `customTokens`
2. **Token Operations**: Add/remove operations now work on unified arrays
3. **Initialization**: State now pre-populated with default tokens

### Backward Compatibility Maintained
- `Token` type simplified - now uses a single `isCustom` boolean flag instead of redundant `isDefault`/`isCustom` flags
- Action interfaces unchanged - same `addCustomToken()`/`removeCustomToken()` functions
- Network switching behavior preserved

## New Architecture Benefits

### 1. Unified Token Access Pattern
```javascript
// OLD: Complex combination logic
const defaultTokens = getDefaultTokensFromConfig(network);
const customTokens = state.tokens.customTokens[network];
const allTokens = [...defaultTokens, ...customTokens];

// NEW: Simple direct access
const allTokens = state.tokens.tokens[network];
```

### 2. Natural Filtering
```javascript
// Get all tokens for current network
const allTokens = getAvailableTokens(state);

// Filter by type if needed
const customOnly = allTokens.filter(t => t.isCustom);
const defaultOnly = allTokens.filter(t => !t.isCustom);
```

### 3. Pre-populated Networks
- Each network starts with its proper default tokens (ETH, USDC, DAI, USDT)
- Custom network gets basic ETH token
- No runtime loading or merging required

## Files Modified
- `/src/tandapay/tokens/tokenTypes.js` - Unified TokenState structure
- `/src/tandapay/utils/tokenMigration.js` - Pre-population logic
- `/src/tandapay/redux/selectors.js` - Updated for unified structure
- `/src/tandapay/redux/reducers/tokensReducer.js` - Simplified operations
- `/src/tandapay/tokens/tokenSelectors.js` - Dramatically simplified selectors

## Next Steps
1. ✅ **Core refactor complete** - Unified token structure implemented
2. 🔄 **Update UI components** - Use new simplified selectors
3. 🔄 **Transaction history integration** - Enable Alchemy on custom networks
4. 🔄 **Add Alchemy detection UI** - Show chips/indicators for detected endpoints
5. 🔄 **User migration** - Handle existing users with legacy token data

## Summary

This refactor transforms the token architecture from a complex "default + custom" system to a simple, unified structure where each network contains ALL its tokens in a single array. This eliminates the most complex parts of the token management system while preserving all functionality and improving performance significantly.

**Result**: Much simpler code, better performance, unified token access, and a solid foundation for the custom network Alchemy features.

## Boolean Flag Simplification

**Problem**: The `Token` type had redundant `isDefault` and `isCustom` boolean flags that were mutually exclusive, violating DRY principles.

**Solution**: Simplified to use only `isCustom` boolean flag:
- Default tokens: `isCustom: false` 
- Custom tokens: `isCustom: true`
- Check for default tokens: `!token.isCustom` instead of `token.isDefault`

**Benefits**:
- Reduces redundancy and potential inconsistency
- Cleaner type definition  
- Simpler logic for token classification
- Follows the principle that custom tokens are the "special case" that needs explicit marking
