# TandaPay Mobile Integration

This document provides a comprehensive overview of the TandaPay mobile wallet integration, including architecture, components, styling system, and implementation status.

## Overview

TandaPay Mobile is a decentralized insurance wallet built on Ethereum, providing users with token management, network configuration, and smart contract interaction capabilities. The integration follows Redux patterns with a modular component architecture and centralized styling system.

## Architecture

### Directory Structure

```
src/tandapay/
├── components/           # Reusable UI components
├── contract/            # Smart contract interaction
├── providers/           # Network and RPC providers  
├── reducers/            # Redux state management
├── styles/              # Centralized styling system
├── tokens/              # Token abstraction system
├── wallet/              # Wallet functionality
└── redux/               # Redux actions and types
```

### Key Features

- **Persistent Token Selection**: Selected tokens persist across app sessions
- **Multi-Network Support**: Mainnet, Sepolia, and custom RPC networks
- **Card-Based UI**: Unified Card component for consistent styling
- **QR Code Integration**: Camera-based address scanning
- **Gas Estimation**: Automatic gas cost calculation for transactions
- **Balance Caching**: 60-second cache for token balances
- **Custom Token Support**: Add/remove custom ERC20 tokens

## Component System

### Core Components

#### Card Component
A unified card component that replaces all card-like views throughout the TandaPay codebase.

**Features:**
- Consistent theming with ThemeContext integration
- Configurable padding, borderRadius, and backgroundColor
- Default values: padding=16, borderRadius=8, cardColor background
- Flow type safety with ViewStyleProp

**Usage:**
```javascript
import Card from '../components/Card';

<Card style={{ marginTop: 12 }}>
  <ZulipText>Card Content</ZulipText>
</Card>

// Custom styling
<Card 
  borderRadius={18} 
  backgroundColor={customColor}
  style={{ borderWidth: 2 }}
>
  <TokenPicker />
</Card>
```

**Replaced Components:**
- NetworkInfo card containers
- CustomRpcForm cards  
- NetworkPerformanceSettings form sections
- NetworkSelector network options
- WalletSettingsScreen API key cards
- WalletBalanceCard (special case with borderRadius: 18)
- TransactionEstimateAndSend gas estimate cards

#### AddressInput
Ethereum address input with QR code scanning functionality.

**Features:**
- Real-time Ethereum address validation using ethers.js
- Built-in QR code scanner with camera access
- Ethereum URI format support (`ethereum:0x...`)
- Configurable label, placeholder, and styling
- Accessibility support with disabled states

**Props:**
```javascript
type Props = {
  value: string,
  onChangeText: (address: string) => void,
  placeholder?: string,
  label?: string,
  style?: ?{},
  disabled?: boolean,
  showQRButton?: boolean,
}
```

#### AmountInput
Token amount input with dynamic decimal validation.

**Features:**
- Token-aware decimal validation (18 for ETH, 6 for USDC, etc.)
- Real-time input filtering and validation
- Dynamic placeholder generation
- Error display for invalid amounts
- Numeric keyboard optimization

**Props:**
```javascript
type Props = {
  value: string,
  onChangeText: (amount: string) => void,
  tokenSymbol: string,
  tokenDecimals: number,
  label?: string,
  placeholder?: string,
  style?: ?{},
  disabled?: boolean,
}
```

#### NetworkSelector
Network selection component with card-based styling.

**Features:**
- Support for mainnet, sepolia, arbitrum, polygon, and custom networks
- Visual selection indicators using TandaPayComponents
- Loading states for network switching
- Custom RPC network configuration
- TouchableOpacity integration with Card components

#### TransactionEstimateAndSend
Comprehensive transaction handling component.

**Features:**
- Gas estimation with cost breakdown
- Transaction simulation before execution
- Confirmation dialogs with customizable messaging
- Loading states and progress indicators
- Error handling and success callbacks

### Supporting Components

- **CustomRpcForm**: Custom RPC network configuration
- **NetworkInfo**: Current network information display
- **WalletNetworkInfo**: Network info for wallet screens
- **NetworkPerformanceSettings**: Performance tuning for network calls

## Styling System

### Architecture
The styling system eliminates StyleSheet.create usage in components and centralizes all styles in the `/src/tandapay/styles/` directory.

#### Core Style Modules

**colors.js**
- Centralized color palette with semantic naming
- Replaces hardcoded colors like `#4CAF50`, `#cccccc`, `#f44336`
- Integrates with base colors from `../../styles/constants.js`
- Theme-aware colors for light/dark mode support

**typography.js**
- Standardized text styles eliminating repetition
- Consistent hierarchy (sectionTitle, subsectionTitle, body, etc.)
- Replaces patterns like `fontSize: 18, fontWeight: 'bold', marginBottom: 12`

**layout.js**
- Common layout patterns and card containers
- Standardized spacing and elevation
- Screen, section, and container layouts

**components.js**
- Component-specific reusable styles
- Input validation states, button patterns
- Selection indicators and chip styles

#### Usage Patterns

**✅ Recommended:**
```javascript
import { TandaPayColors, TandaPayTypography, TandaPayLayout } from '../styles';

// Direct style usage
<View style={TandaPayLayout.section}>
  <ZulipText style={TandaPayTypography.sectionTitle}>Title</ZulipText>
</View>

// Combine with custom styles
<ZulipText style={[TandaPayTypography.error, { color: TandaPayColors.error }]}>
  Error message
</ZulipText>

// Custom styles as plain objects
const customStyles = {
  specialButton: {
    backgroundColor: TandaPayColors.primary,
    borderRadius: 20,
  },
};
```

**❌ Avoid:**
- `StyleSheet.create()` in components
- Hardcoded colors like `#4CAF50`, `#fff`
- Repeated patterns for common UI elements

### Refactored Components
All major TandaPay components have been refactored to use the centralized styling system:

- **Card System**: All card-like views now use the unified Card component
- **Network Components**: NetworkSelector, CustomRpcForm, NetworkInfo
- **Wallet Components**: WalletBalanceCard, WalletSettingsScreen, WalletSendScreen
- **Input Components**: AddressInput, AmountInput with consistent styling
- **Transaction Components**: TransactionEstimateAndSend with card-based gas estimates

## Token System

### Architecture
The token system provides a Redux-based abstraction for token management with persistence and caching.

#### Core Components

**Redux Integration:**
- State: `tandaPay.tokens` with selectedTokenSymbol and balances
- Actions: `selectToken`, `addCustomToken`, `removeCustomToken`, `updateBalance`
- Selectors: `getSelectedToken`, `getAvailableTokens`, `getTokenBalance`

**Default Tokens:**
- ETH (native), USDC, USDT, DAI with network-specific addresses
- Mainnet and Sepolia configurations
- 18 decimals for ETH, 6 for stablecoins

**Custom Token Support:**
- User-defined ERC20 tokens
- Contract validation and metadata fetching
- Persistent storage in Redux state

#### Key Features

**Balance Caching:**
- 60-second cache with staleness detection
- Automatic refresh on token selection
- Performance optimization for frequent balance checks

**Token Selection:**
- Persistent across app sessions
- Integration with WalletBalanceCard picker
- Redux action dispatch for state updates

**ERC20 Integration:**
- Full transfer functionality using ethers.js
- Gas estimation for token transfers
- Multi-network support (mainnet/sepolia)

#### Usage Examples

```javascript
// Token Selection
import { useDispatch } from 'react-redux';
import { selectToken } from '../tokens/tokenActions';

const dispatch = useDispatch();
dispatch(selectToken('USDC'));

// Getting Tokens
import { useSelector } from 'react-redux';
import { getAvailableTokens, getSelectedToken } from '../tokens/tokenSelectors';

const availableTokens = useSelector(getAvailableTokens);
const selectedToken = useSelector(getSelectedToken);

// Custom Token Management
import { addCustomToken, removeCustomToken } from '../tokens/tokenActions';

dispatch(addCustomToken({
  symbol: 'CUSTOM',
  name: 'Custom Token',
  address: '0x...',
  decimals: 18,
  isCustom: true,
}));
```

### Token Management UI
Ready-to-integrate components for token management:

**TokenManagementScreen:**
- Add custom tokens by contract address
- Remove existing custom tokens
- Token validation and metadata fetching
- Integration with Redux token state

## Contract Integration

### Transaction System
The contract system provides integrated transaction objects with simulation capabilities.

#### Key Components

**writeTransactionObjects.js:**
- Unified transaction definitions with metadata
- Integrated simulation functions using `callStatic`
- Rich metadata: displayName, description, role requirements
- Custom icons for each transaction type

**write.js:**
- Writer factory that creates methods with metadata access
- Built-in simulation capabilities for every write method
- Type-safe transaction execution

#### Features

**Transaction Metadata:**
- Display names and descriptions for UI generation
- Role-based access (member/secretary/public)
- Custom icons for visual representation
- Parameter requirements and validation

**Simulation Integration:**
- Pre-execution testing via `callStatic`
- Gas estimation before actual transaction
- Error detection and user feedback
- Recommended workflow: simulate → execute

#### Usage Examples

```javascript
import getTandaPayWriter from './write';

const writer = getTandaPayWriter(contractAddress, signer);
const joinMethod = writer.member.joinCommunity;

// Simulate first (recommended)
const simResult = await joinMethod.simulate();
if (simResult.success) {
  console.log(`Gas estimate: ${simResult.gasEstimate}`);
  const tx = await joinMethod();
  await tx.wait();
} else {
  console.log(`Simulation failed: ${simResult.error}`);
}

// UI Generation
import { getAllWriteTransactions } from './writeTransactionObjects';

const transactions = getAllWriteTransactions();
transactions.forEach(transaction => {
  console.log(`${transaction.displayName}: ${transaction.description}`);
});
```

## Redux State Management

### State Structure
```javascript
type TandaPayState = {
  settings: {
    selectedNetwork: 'mainnet' | 'sepolia' | 'custom',
    customRpcConfig: ?CustomRpcConfig,
    etherscanApiKey: ?string,
    cacheExpirationMs: number,
    rateLimitDelayMs: number,
    retryAttempts: number,
  },
  tokens: {
    selectedTokenSymbol: string,
    customTokens: Token[],
    balances: { [symbol: string]: TokenBalance },
  },
};
```

### Key Actions
- **Settings**: `TANDAPAY_SETTINGS_UPDATE`
- **Network**: `TANDAPAY_NETWORK_SELECT`, `TANDAPAY_CUSTOM_RPC_SET`
- **Tokens**: `TANDAPAY_TOKEN_SELECT`, `TANDAPAY_TOKEN_ADD_CUSTOM`, `TANDAPAY_TOKEN_REMOVE_CUSTOM`
- **Balances**: `TANDAPAY_TOKEN_UPDATE_BALANCE`

### Reducer Architecture
- **Combined Reducer**: `tandaPayCombinedReducer` manages all TandaPay state
- **Modular Design**: Separate reducers for settings and tokens
- **Persistence**: All state persisted via Redux store configuration

## Network Management

### Supported Networks
- **Mainnet**: Ethereum mainnet with production contracts
- **Sepolia**: Ethereum testnet for development
- **Custom RPC**: User-defined networks with custom configuration

### RPC Configuration
- Network name, RPC URL, Chain ID, Block explorer URL
- Performance settings: cache expiration, rate limiting, retry attempts
- Persistent storage of custom network configurations

### Provider System
- Automatic provider creation based on network selection
- Error handling and fallback mechanisms
- Integration with ethers.js for blockchain interaction

## Wallet Integration

### Core Wallet Features
- **Address Management**: Ethereum address validation and display
- **Balance Display**: Real-time token balance with caching
- **Transaction History**: Integration with Etherscan API
- **Send/Receive**: Full transaction flow with gas estimation

### Key Components

**WalletBalanceCard:**
- Unified card design with borderRadius: 18
- Token picker with persistent selection
- Real-time balance updates with loading states
- Refresh functionality with animated icons

**WalletSendScreen:**
- AddressInput for recipient validation
- AmountInput with token-specific decimal validation
- TransactionEstimateAndSend for gas estimation
- Network info display with current configuration

**WalletReceiveScreen:**
- QR code generation for address sharing
- Copy-to-clipboard functionality
- Share integration for address distribution

## Testing

### Component Testing
- Flow type coverage for all TandaPay components
- Integration tests for token system functionality
- Redux state management testing

### Integration Testing
- End-to-end token selection and balance caching
- Network switching and RPC configuration
- Transaction simulation and execution

## Migration and Deployment

### Card Component Migration
All card-like views have been successfully migrated to use the unified Card component:

✅ **Completed Migrations:**
- NetworkInfo: Replaced inline card styling with Card component
- CustomRpcForm: Migrated card container to Card with custom margins
- NetworkPerformanceSettings: Form sections and status displays
- NetworkSelector: Network option cards with TouchableOpacity integration
- WalletSettingsScreen: API key cards and input forms
- WalletBalanceCard: Main balance card (special borderRadius: 18)
- TransactionEstimateAndSend: Gas estimate display cards

### Style System Migration
All components have been migrated from StyleSheet.create to centralized styles:

✅ **Completed Refactoring:**
- Eliminated 19+ StyleSheet.create instances
- Replaced hardcoded colors with semantic TandaPayColors
- Standardized typography with TandaPayTypography
- Unified layout patterns with TandaPayLayout
- Consistent component styling with TandaPayComponents

### Benefits Achieved
- **Consistency**: Unified visual design across all TandaPay components
- **Maintainability**: Centralized styling and card management
- **Performance**: Reduced bundle size from style deduplication
- **Developer Experience**: Faster component development with reusable patterns
- **Theme Support**: Better integration with app-wide theming system

## Development Guidelines

### Component Development
1. Use centralized styles: `import { TandaPayColors, TandaPayLayout } from '../styles'`
2. Prefer Card component over custom card styling
3. Create custom styles as plain objects, not StyleSheet.create
4. Leverage existing components (AddressInput, AmountInput) for common patterns

### Redux Integration
1. Define actions in appropriate domain modules (settings, tokens)
2. Use selectors for state access rather than direct state reading
3. Implement proper Flow types for all actions and state
4. Consider cache invalidation for time-sensitive data

### Testing Strategy
1. Unit tests for individual components and utilities
2. Integration tests for Redux state management
3. E2E tests for critical user flows (token selection, transactions)
4. Performance testing for balance caching and network calls

## Conclusion

The TandaPay mobile integration provides a comprehensive foundation for decentralized wallet functionality with:

- **Unified Card System**: Consistent UI patterns across all components
- **Centralized Styling**: Maintainable and themeable design system
- **Token Abstraction**: Flexible token management with persistence
- **Network Flexibility**: Support for multiple Ethereum networks
- **Transaction Safety**: Simulation and estimation before execution
- **Redux Architecture**: Scalable state management with persistence

The system is production-ready and provides a solid foundation for advanced DeFi functionality within the broader app ecosystem.
