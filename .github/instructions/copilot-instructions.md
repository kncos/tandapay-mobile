# General Guidelines
-   We are working in a fork of an existing mobile application (zulip mobile).
-   All of our code is in `src/tandapay`. We do not modify code outside of this
    directory except when absolutely necessary (e.g., modifying
    `AppNavigator.js` to add more screens).
-   We use `src/tandapay/errors` for our error handling utilities. When writing
    new code, ensure that you're using the error handling utilities,
    especially when calling APIs, `ethers.js` functions, or any network calls.
-   We store state using Redux; TandaPay-specific state can be found in
    `src/tandapay/redux`.
-   This is a Web3 application. We use `ethers.js v5`, and you also have
    access to `alchemy-sdk`.
-   We use `expo-secure-store` for storage/retrieval of any API keys as well
    as wallet information (e.g., the mnemonic phrase).
-   This application has a simple, built-in Ethereum wallet which lets the
    user send/receive the default token (ETH on most chains, but can be
    different such as POL on Polygon) as well as ERC20 tokens.
-   This application supports a few ERC20 tokens by default (DAI, USDC, USDT)
    and a few networks by default (mainnet, Arbitrum, Sepolia, Polygon) -- but
    the user can configure custom RPC settings and add custom tokens. Settings
    are persistent using Redux; custom tokens are per-network.
-   The primary purpose of our code is to bundle all of the functionality
    necessary to use the TandaPay smart contract. The TandaPay smart contract
    related code is mostly in `src/tandapay/contract`, with
    `src/tandapay/contract/TandaPay.js` containing the actual Solidity build
    artifact. The build artifact is exported as an object `TandaPayInfo`, and
    we access the ABI with `TandaPayInfo.abi` and the bytecode with
    `TandaPayInfo.bytecode.object`.
-   Various components are available in `src/tandapay/components`, as well as
    in the broader codebase. We frequently use components like `ZulipButton`
    and `ZulipText` because they have built-in styling consistent with the rest
    of the app.
-   Lots of our styling is stored in `src/tandapay/styles` -- here, you can get
    various colors, as well as styles for certain components. There are also
    global constants like `HALF_COLOR`, `QUARTER_COLOR`, and `BRAND_COLOR`
    which come from `src/styles/constants.js`.
-   Avoid using any mock data, hardcoded API keys, or other rigid things. The
    goal here is to make a production app. There are situations where a
    placeholder may be used, but we only keep it temporarily.
-   There are various `.md` files throughout `src/tandapay`. Many of these
    might be outdated, so you can use them to get context, but beware that they
    might not be fully up to date.
-   The TandaPay contract can be deployed directly from within the app. We don't
    hardcode the contract address because users will be part of a community, and
    each community has its own deployment. Not all users will deploy a contract,
    but all contracts will be deployed by our users, and thus they can
    configure the contract address in the `TandaPayNetworkSettingsScreen`.
-   There is NO FLOW SCRIPT. Flow has an IDE integration; you have access to see
    problems within any file you view, so any Flow errors will just be listed as
    problems. Do not run `npm run flow` or any similar commands because it will
    NOT work.
-   Always style `ZulipButton` with `style={TandaPayStyles.button}`, and wrap
    it in `<View style={TandaPayStyles.buttonRow}>` to ensure proper styling.
    Only ever have 1 or 2 `ZulipButton`s in a single row. You can find these
    styles at `src/tandapay/styles`.
-   Do not make any "example" files or ".md" files to show/explain new code
    you add unless explicitly asked to do so.

# Styling and Component Best Practices

These principles guide our approach to styling and component design, aiming for
maintainability, consistency, and reusability.

1.  **DRY Principle for Styles:** Identify and extract similar or duplicate
    styles across stylesheets to avoid redundancy.
2.  **Component Extraction:** Look for opportunities to extract reusable
    components into `src/tandapay/components`, especially when common UI
    elements (like `closeButton` or similar patterns) are replicated across
    different parts of the application. Prioritize styles that are most
    commonly used or simpler when combining similar components.
3.  **Separate Themed Styles:** When styles depend on `themeData` (e.g.,
    `themeData.color` or `themeData.dividerColor`), extract these styles out of
    their functions and wrap them in `StyleSheet.create`. Replace
    `themeData.dividerColor` with `QUARTER_COLOR` or `HALF_COLOR` where
    appropriate. For foreground colors, use array syntax to combine styles:
    `styles={[ourStyleSheet, {color: themeData.color}]}`.
4.  **Centralize Global Styles:** Styles that can be shared across multiple
    components should be moved to `src/tandapay/styles`. Styles that are
    tightly coupled to an individual component can remain within that component's
    file.
5.  **`StyleSheet.create` Usage:** All stylesheets should be wrapped in
    `StyleSheet.create` for performance optimization and improved error
    handling.
6.  **Array Syntax for Style Merging:** Replace spread operators for inline
    styles (e.g., `styles={{...someStyleSheet, someProp}}`) with array syntax
    (e.g., `styles={[someStyleSheet, {someProp}]}`). This is more performant,
    especially with cached stylesheets.
7.  **Granular Stylesheets:** If a component has both general, reusable styling
    and specific, component-only styling, separate them into two distinct
    stylesheets. Move the general styles to `src/tandapay/styles` and keep
    the specific styles with the component. Use array syntax to combine them
    when applying.
8.  **Consolidate Similar Components:** When two similar components are used in
    different places, consider extracting them into a single, generic component
    in `src/tandapay/components` to reduce duplication and simplify maintenance.
9.  **Prefer Stylesheet Over Inline Styles:** Replace inline styles in
    components with styles defined in stylesheets to maintain consistency and
    ease future style modifications. The only exception is when an inline style
    is truly dynamic and depends on a state value like `themeData`, in which case
    array syntax should be used.
10. **Do not use hardcoded colors:** Always use colors defined in
    `src/tandapay/styles/colors.js`, the constants file, or themeData. This ensures consistency
    across the application and allows for easier theming.

## Architecture and Code Organization

**Directory Structure:**
- `src/tandapay/components` - Reusable UI components (inputs, cards, modals, buttons)
- `src/tandapay/contract` - Smart contract interactions and blockchain logic
- `src/tandapay/wallet` - Wallet functionality and transaction handling
- `src/tandapay/styles` - Centralized styling modules
- `src/tandapay/redux` - State management (actions, reducers, selectors)
- `src/tandapay/errors` - Error handling infrastructure
- `src/tandapay/providers` - Network provider management
- `src/tandapay/tokens` - Token configuration and management

**Key Entry Points:**
- `TandaPayMenuScreen.js` - Main navigation hub for TandaPay features
- `TandaPaySettingsScreen.js` - Configuration and settings
- `WalletScreen.js` - Main wallet dashboard and balance display
- `TandaPayInfoScreen.js` - Community information display
- `TandaPayNetworkSettingsScreen.js` - Network and contract configuration
- `TandaPayActionsScreen.js` - Community actions interface

## Common Patterns and Best Practices

**Redux Integration:**
```javascript
// Always use these selectors for common data:
import { 
  getTandaPaySelectedNetwork,
  getCurrentTandaPayContractAddress,
  getTandaPayCustomRpcConfig,
  getSelectedToken 
} from '../redux/selectors';

// Use typed dispatch actions:
import { updateTandaPaySettings } from '../redux/actions';
```

**Error Handling Pattern:**
```javascript
// Wrap all async operations with error handling:
import { TandaPayErrorHandler } from '../errors';

const result = await TandaPayErrorHandler.withErrorHandling(
  async () => {
    // Your async code here
  },
  'OPERATION_TYPE' // e.g., 'CONTRACT_ERROR', 'WALLET_ERROR'
);

if (!result.success) {
  // Handle error - result.error has typed error information
}
```

**Contract Interaction Pattern:**
```javascript
// Use the multicall pattern for efficient blockchain reads:
import { executeTandaPayMulticall } from '../contract/multicall';

// For single calls, use the read actions:
import { getTandaPayReadActions } from '../contract/read';
```

**Component Structure:**
```javascript
// Standard component template:
/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

type Props = $ReadOnly<{|
  // Define all props with exact Flow types
|}>;

const styles = StyleSheet.create({
  // Define all static styles here
});

export default function ComponentName(props: Props): Node {
  // Component logic
}
```

## Styling Guidelines

**Use Existing Style Modules:**
```javascript
import TandaPayStyles, { 
  TandaPayColors, 
  TandaPayLayout, 
  TandaPayComponents,
  TandaPayTypography 
} from '../styles';

// For shared form styles:
import { FormStyles } from '../styles/forms';
import { ModalStyles } from '../styles/modals';
```

**Common UI Components (Available in `src/tandapay/components`):**
- `<Card>` - Consistent container styling
- `<CloseButton>` - Modal close buttons
- `<ErrorText>` - Error message display
- `<AddressInput>` - Address inputs with QR scanner support
- `<AmountInput>` - Amount inputs with token validation
- `<BooleanToggle>` - Toggle switches
- `<NetworkSelector>` - Network selection dropdown
- `<TokenPicker>` - Token selection interface
- `<TransactionEstimateAndSend>` - Transaction gas estimation and sending

**Button Styling Pattern:**
```javascript
// Always wrap ZulipButton properly:
<View style={TandaPayStyles.buttonRow}>
  <ZulipButton
    style={TandaPayStyles.button}
    text="Button Text"
    onPress={handlePress}
  />
</View>
```

## Navigation and Screen Props

**Screen Component Props:**
```javascript
type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'screen-name'>,
  route: RouteProp<'screen-name', void>,
|}>;
```

**Screen Navigation:**
```javascript
// Navigate to another screen:
navigation.navigate('screen-name', { paramName: value });

// Go back:
navigation.goBack();

// Check if can go back:
navigation.canGoBack()
```

## Web3 and Blockchain Integration

**Provider Management:**
```javascript
// Get provider for current network:
import { getProvider } from '../web3';
const provider = await getProvider();

// Create provider for specific network:
import { createProvider } from '../providers/ProviderManager';
const result = await createProvider(network);
```

**Wallet Operations:**
```javascript
// Get wallet instance:
import { getWalletInstance } from '../wallet/WalletManager';
const walletResult = await getWalletInstance();
```

**Token Handling:**
```javascript
// Get available tokens for current network:
import { getAvailableTokens } from '../tokens/tokenSelectors';

// Token types include predefined (DAI, USDC, USDT) and custom tokens
```

## State Management

**TandaPay Redux State Structure:**
```javascript
{
  selectedNetwork: 'sepolia' | 'mainnet' | 'arbitrum' | 'polygon' | 'custom',
  customRpcConfig: { /* network config */ },
  contractAddresses: {
    mainnet: '0x...',
    sepolia: '0x...',
    // etc.
  },
  networkPerformance: { /* performance settings */ },
  // other settings
}
```

## Common Utilities

**Address Validation:**
```javascript
import { validateEthereumAddress } from '../components/AddressInput';
```

**Amount Formatting:**
```javascript
// Use ethers for formatting:
import { ethers } from 'ethers';
ethers.utils.formatUnits(value, decimals);
ethers.utils.parseUnits(value, decimals);
```

**BigNumber Handling:**
```javascript
// Always check if value is BigNumber before operations:
if (value && value._hex) {
  // It's a BigNumber
  const formatted = ethers.utils.formatEther(value);
}
```

## Flow Type Checking

**Common Flow Patterns:**
```javascript
// For mixed types that could be BigNumber:
// $FlowFixMe[incompatible-use]
const value = someBigNumberValue.toString();

// For third-party imports:
// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';
```

**Flow Error Handling:**
- Check the Problems tab in your IDE for Flow errors
- Use `$FlowFixMe` sparingly and only when necessary
- Always add proper type annotations for props and return types
- Never run `npm run flow` - Flow integration is IDE-based only

## Important Context

1. **Multi-Network Support**: The app supports multiple networks simultaneously. Always use the selected network from Redux state.

2. **Contract Address Management**: Each network can have its own TandaPay contract address. Never hardcode addresses.

3. **Secure Storage**: Wallet mnemonics and API keys use `expo-secure-store`. Never store sensitive data in Redux.

4. **Community Context**: TandaPay is a community-based insurance protocol. UI should reflect community operations like periods, claims, and member management.

5. **Existing Components**: Before creating new components, check if similar functionality exists in:
   - `src/common` (ZulipButton, ZulipText, Screen, etc.)
   - `src/tandapay/components` (AddressInput, AmountInput, Card, etc.)

6. **StyleSheet Usage**: All static styles must use `StyleSheet.create()`. Dynamic styles (theme-dependent) should use array syntax: `style={[styles.base, { color: themeData.color }]}`