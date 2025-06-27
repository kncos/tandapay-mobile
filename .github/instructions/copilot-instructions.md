# General Guidelines

-   All TandaPay-specific code is in `src/tandapay`. Only modify files outside this directory if absolutely necessary (e.g., `AppNavigator.js`).
-   Use `src/tandapay/errors` for all error handling, especially for API, `ethers.js`, and network calls.
-   Redux manages TandaPay-specific state in `src/tandapay/redux`.
-   This Web3 application uses `ethers.js v5` and `alchemy-sdk`.
-   Sensitive data (API keys, mnemonic) is stored/retrieved using `expo-secure-store`.
-   The app includes a basic Ethereum wallet for sending/receiving native and ERC20 tokens.
-   Default support for ERC20 tokens (DAI, USDC, USDT) and networks (mainnet, Arbitrum, Sepolia, Polygon) is provided; users can configure custom RPC settings and add custom tokens (per-network).
-   TandaPay smart contract code is in `src/tandapay/contract`. `TandaPayInfo` (from `src/tandapay/contract/TandaPay.js`) provides `abi` and `bytecode.object`.
-   Utilize components from `src/tandapay/components` and the broader codebase (e.g., `ZulipButton`, `ZulipText`) for consistent styling.
-   Styling is primarily in `src/tandapay/styles`, including `HALF_COLOR`, `QUARTER_COLOR`, and `BRAND_COLOR` from `src/styles/constants.js`.
-   Avoid mock data, hardcoded API keys, or rigid values.
-   Beware that `.md` files in `src/tandapay` may be outdated.
-   TandaPay contract addresses are user-configured in `TandaPayNetworkSettingsScreen`, not hardcoded.
-   Flow type checking is IDE-integrated; do not run `npm run flow`.
-   Always style `ZulipButton` with `style={TandaPayStyles.button}` and wrap it in `<View style={TandaPayStyles.buttonRow}>`. Limit to 1-2 buttons per row.

# Styling and Component Best Practices

1.  **DRY Styles:** Extract redundant styles into shared stylesheets.
2.  **Component Extraction:** Move reusable UI elements to `src/tandapay/components`. Prioritize simpler, commonly used styles when combining components.
3.  **Themed Styles:** Extract `themeData`-dependent styles into `StyleSheet.create`. Replace `themeData.dividerColor` with `QUARTER_COLOR` or `HALF_COLOR`. Combine foreground colors using array syntax: `styles={[ourStyleSheet, {color: themeData.color}]}`.
4.  **Centralize Global Styles:** Move shareable styles to `src/tandapay/styles`. Keep component-specific styles within the component file.
5.  **`StyleSheet.create`:** Wrap all stylesheets in `StyleSheet.create` for performance.
6.  **Array Syntax for Merging:** Use array syntax for merging styles: `styles={[someStyleSheet, {someProp}]}`. Avoid spread operators for inline styles.
7.  **Granular Stylesheets:** Separate general reusable styles (move to `src/tandapay/styles`) from component-specific styles. Combine with array syntax.
8.  **Consolidate Similar Components:** Combine similar components into a single, generic component in `src/tandapay/components` to reduce duplication.
9.  **Prefer Stylesheet:** Define styles in stylesheets instead of inline, except for truly dynamic, state-dependent styles (use array syntax).
10. **No Hardcoded Colors:** Use colors from `src/tandapay/styles/colors.js`, global constants, or `themeData`.

# Architecture and Code Organization

**Directory Structure:**
- `src/tandapay/components`: Reusable UI
- `src/tandapay/contract`: Smart contract interactions
- `src/tandapay/wallet`: Wallet functionality
- `src/tandapay/styles`: Centralized styling
- `src/tandapay/redux`: State management
- `src/tandapay/errors`: Error handling
- `src/tandapay/providers`: Network provider management
- `src/tandapay/tokens`: Token configuration

**Key Entry Points:**
- `TandaPayMenuScreen.js`: Main navigation
- `TandaPaySettingsScreen.js`: Configuration
- `WalletScreen.js`: Wallet dashboard
- `TandaPayInfoScreen.js`: Community information
- `TandaPayNetworkSettingsScreen.js`: Network/contract configuration
- `TandaPayActionsScreen.js`: Community actions interface

# Common Patterns and Best Practices

**Redux Integration:**
```javascript
import {
  getTandaPaySelectedNetwork,
  getCurrentTandaPayContractAddress,
  getTandaPayCustomRpcConfig,
  getSelectedToken
} from '../redux/selectors';
import { updateTandaPaySettings } from '../redux/actions';
```

**Error Handling:**
```javascript
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

**Contract Interaction:**
```javascript
import { executeTandaPayMulticall } from '../contract/multicall';
import { getTandaPayReadActions } from '../contract/read';
```

**Component Structure:**
```javascript
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

# Styling Guidelines

**Use Existing Style Modules:**
```javascript
import TandaPayStyles, {
  TandaPayColors,
  TandaPayLayout,
  TandaPayComponents,
  TandaPayTypography
} from '../styles';
import { FormStyles } from '../styles/forms';
import { ModalStyles } from '../styles/modals';
```

**Common UI Components (from `src/tandapay/components`):**
- `<Card>`
- `<CloseButton>`
- `<ErrorText>`
- `<AddressInput>`
- `<AmountInput>`
- `<BooleanToggle>`
- `<NetworkSelector>`
- `<TokenPicker>`
- `<TransactionEstimateAndSend>`

**Button Styling:**
```javascript
<View style={TandaPayStyles.buttonRow}>
  <ZulipButton
    style={TandaPayStyles.button}
    text="Button Text"
    onPress={handlePress}
  />
</View>
```

# Navigation and Screen Props

**Screen Component Props:**
```javascript
type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'screen-name'>,
  route: RouteProp<'screen-name', void>,
|}>;
```

**Screen Navigation:**
```javascript
navigation.navigate('screen-name', { paramName: value });
navigation.goBack();
navigation.canGoBack();
```

# Web3 and Blockchain Integration

**Provider Management:**
```javascript
import { getProvider } from '../web3'; // For current network
import { createProvider } from '../providers/ProviderManager'; // For specific network
const provider = await getProvider();
const result = await createProvider(network);
```

**Wallet Operations:**
```javascript
import { getWalletInstance } from '../wallet/WalletManager';
const walletResult = await getWalletInstance();
```

**Token Handling:**
```javascript
import { getAvailableTokens } from '../tokens/tokenSelectors'; // Predefined and custom
```

# State Management

**TandaPay Redux State Structure Example:**
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

# Common Utilities

**Address Validation:**
```javascript
import { validateEthereumAddress } from '../components/AddressInput';
```

**Amount Formatting:**
```javascript
import { ethers } from 'ethers';
ethers.utils.formatUnits(value, decimals);
ethers.utils.parseUnits(value, decimals);
```

**BigNumber Handling:**
```javascript
import { ethers } from 'ethers';
if (value && value._hex) {
  // It's a BigNumber
  const formatted = ethers.utils.formatEther(value);
}
```

# Flow Type Checking

**Common Flow Patterns:**
```javascript
// $FlowFixMe[incompatible-use]
const value = someBigNumberValue.toString();

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';
```

**Flow Error Handling:**
- Check IDE Problems tab for errors.
- Use `$FlowFixMe` sparingly.
- Add proper type annotations for props and return types.
- Do not run `npm run flow`.

# Important Context

1.  **Multi-Network Support:** Always use the selected network from Redux.
2.  **Contract Address Management:** Never hardcode TandaPay contract addresses; they are per-network and user-configured.
3.  **Secure Storage:** Wallet mnemonics and API keys use `expo-secure-store`; do not store sensitive data in Redux.
4.  **Community Context:** UI should reflect TandaPay's community-based operations (periods, claims, member management).
5.  **Existing Components:** Before creating new components, check `src/common` and `src/tandapay/components`.
6.  **StyleSheet Usage:** All static styles must use `StyleSheet.create()`. Dynamic styles use array syntax: `style={[styles.base, { color: themeData.color }]}`.
7.  **Running Tests:** To run specific tests, use `npx jest [path/to/test.js]`. Avoid `npm test` as it runs unrelated integration tests.