/* @flow strict-local */

import type { Action } from '../../../types';
import {
  RESET_ACCOUNT_DATA,
  TANDAPAY_TOKEN_SELECT,
  TANDAPAY_TOKEN_ADD_CUSTOM,
  TANDAPAY_TOKEN_REMOVE_CUSTOM,
  TANDAPAY_TOKEN_UPDATE_BALANCE,
  TANDAPAY_TOKEN_INVALIDATE_BALANCE,
  TANDAPAY_SET_CONTRACT_ADDRESS,
  TANDAPAY_UPDATE_NETWORK_PERFORMANCE,
  TANDAPAY_SETTINGS_UPDATE,
} from '../../../actionConstants';
import type { TokenState, Token } from '../../tokens/tokenTypes';
import { validateCustomToken } from '../../tokens/tokenConfig';
import {
  initializePerNetworkTokenState,
  addCustomTokenToNetwork,
  removeTokenFromNetwork,
  updateTokenBalance,
  setSelectedTokenForNetwork,
  setContractAddressForNetwork,
  updateNetworkPerformance,
  updateCustomNetworkTokens,
} from '../../utils/tokenMigration';

// Use a function to lazily initialize the state to avoid circular dependency issues
const getInitialState = (): TokenState => initializePerNetworkTokenState();

// Helper function to ensure state always has perNetworkData
const ensureValidState = (state: TokenState): TokenState => {
  // If perNetworkData is missing, reinitialize the state
  if (!state.perNetworkData || Object.keys(state.perNetworkData).length === 0) {
    return initializePerNetworkTokenState();
  }
  return state;
};

// eslint-disable-next-line default-param-last
export default (state: TokenState = getInitialState(), action: Action): TokenState => {
  // Ensure state is valid before processing any action
  const currentState = ensureValidState(state);

  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      // Reset to initial state but preserve network structure
      return getInitialState();    case TANDAPAY_TOKEN_SELECT: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_TOKEN_SELECT) {
        return currentState;
      }

      // Validate token symbol
      if (typeof action.tokenSymbol !== 'string' || action.tokenSymbol.trim() === '') {
        return currentState;
      }

      // Get the current network from action
      const network = action.network;
      const currentNetworkData = currentState.perNetworkData && currentState.perNetworkData[network];

      // If network data doesn't exist, return unchanged state
      if (!currentNetworkData) {
        return currentState;
      }

      return {
        ...currentState,
        perNetworkData: {
          ...currentState.perNetworkData,
          // $FlowFixMe[invalid-computed-prop] - NetworkIdentifier union is safe for computed properties
          [network]: setSelectedTokenForNetwork(currentNetworkData, action.tokenSymbol),
        },
      };
    }

    case TANDAPAY_TOKEN_ADD_CUSTOM: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_TOKEN_ADD_CUSTOM) {
        return currentState;
      }

      // Validate the custom token before adding
      const validation = validateCustomToken(action.token, action.network);

      if (!validation.isValid) {
        // Return unchanged state for invalid tokens
        return currentState;
      }

      // Create properly typed token from the validated action
      const newToken: Token = {
        symbol: action.token.symbol,
        address: action.token.address,
        name: action.token.name,
        decimals: action.token.decimals != null ? action.token.decimals : 18,
        isCustom: true,
      };

      const { network } = action;
      const currentNetworkData = currentState.perNetworkData && currentState.perNetworkData[network];

      // If network data doesn't exist, return unchanged state
      if (!currentNetworkData) {
        return currentState;
      }

      return {
        ...currentState,
        perNetworkData: {
          ...currentState.perNetworkData,
          // $FlowFixMe[invalid-computed-prop] - NetworkIdentifier union is safe for computed properties
          [network]: addCustomTokenToNetwork(currentNetworkData, newToken),
        },
      };
    }

    case TANDAPAY_TOKEN_REMOVE_CUSTOM: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_TOKEN_REMOVE_CUSTOM) {
        return currentState;
      }

      const { network, tokenSymbol } = action;
      const currentNetworkData = currentState.perNetworkData && currentState.perNetworkData[network];

      // If network data doesn't exist, return unchanged state
      if (!currentNetworkData) {
        return currentState;
      }

      // Find the token key by symbol
      let tokenKey = null;
      const tokenKeys = Object.keys(currentNetworkData.tokens);
      for (const key of tokenKeys) {
        if (currentNetworkData.tokens[key].symbol === tokenSymbol) {
          tokenKey = key;
          break;
        }
      }

      if (tokenKey == null) {
        return currentState;
      }

      const updatedNetworkData = removeTokenFromNetwork(currentNetworkData, tokenKey);

      // If the removed token was selected, switch to the first available token
      let finalNetworkData = updatedNetworkData;
      if (currentNetworkData.selectedToken === tokenSymbol) {
        const remainingTokens = Object.keys(updatedNetworkData.tokens);
        if (remainingTokens.length > 0) {
          const firstTokenKey = remainingTokens[0];
          const fallbackToken = updatedNetworkData.tokens[firstTokenKey];
          finalNetworkData = setSelectedTokenForNetwork(updatedNetworkData, fallbackToken.symbol);
        }
      }

      return {
        ...currentState,
        perNetworkData: {
          ...currentState.perNetworkData,
          // $FlowFixMe[invalid-computed-prop] - NetworkIdentifier union is safe for computed properties
          [network]: finalNetworkData,
        },
      };
    }

    case TANDAPAY_TOKEN_UPDATE_BALANCE: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_TOKEN_UPDATE_BALANCE) {
        return currentState;
      }

      // Validate inputs
      if (typeof action.tokenSymbol !== 'string' || action.tokenSymbol.trim() === '') {
        return currentState;
      }

      if (typeof action.balance !== 'string') {
        return currentState;
      }

      // Get the current network from action
      const network = action.network;
      const currentNetworkData = currentState.perNetworkData && currentState.perNetworkData[network];

      // If network data doesn't exist, return unchanged state
      if (!currentNetworkData) {
        return currentState;
      }

      // Find the token key by symbol
      let tokenKey = null;
      const tokenKeys = Object.keys(currentNetworkData.tokens);
      for (const key of tokenKeys) {
        if (currentNetworkData.tokens[key].symbol === action.tokenSymbol) {
          tokenKey = key;
          break;
        }
      }

      if (tokenKey == null) {
        return currentState;
      }

      return {
        ...currentState,
        perNetworkData: {
          ...currentState.perNetworkData,
          // $FlowFixMe[invalid-computed-prop] - NetworkIdentifier union is safe for computed properties
          [network]: updateTokenBalance(currentNetworkData, tokenKey, action.balance),
        },
      };
    }

    case TANDAPAY_TOKEN_INVALIDATE_BALANCE: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_TOKEN_INVALIDATE_BALANCE) {
        return currentState;
      }

      // Validate inputs
      if (typeof action.tokenSymbol !== 'string' || action.tokenSymbol.trim() === '') {
        return currentState;
      }

      // Get the current network from action
      const network = action.network;
      const currentNetworkData = currentState.perNetworkData && currentState.perNetworkData[network];

      // If network data doesn't exist, return unchanged state
      if (!currentNetworkData) {
        return currentState;
      }

      // Find the token key by symbol
      let tokenKey = null;
      const tokenKeys = Object.keys(currentNetworkData.tokens);
      for (const key of tokenKeys) {
        if (currentNetworkData.tokens[key].symbol === action.tokenSymbol) {
          tokenKey = key;
          break;
        }
      }

      if (tokenKey == null) {
        return currentState;
      }

      // Invalidate balance by setting lastUpdated to 0, which will make it stale
      const token = currentNetworkData.tokens[tokenKey];
      return {
        ...currentState,
        perNetworkData: {
          ...currentState.perNetworkData,
          // $FlowFixMe[invalid-computed-prop] - NetworkIdentifier union is safe for computed properties
          [network]: {
            ...currentNetworkData,
            tokens: {
              ...currentNetworkData.tokens,
              [tokenKey]: {
                ...token,
                lastUpdated: 0,
              },
            },
          },
        },
      };
    }

    case TANDAPAY_SET_CONTRACT_ADDRESS: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_SET_CONTRACT_ADDRESS) {
        return currentState;
      }

      const { network, contractAddress } = action;
      const currentNetworkData = currentState.perNetworkData && currentState.perNetworkData[network];

      // If network data doesn't exist, return unchanged state
      if (!currentNetworkData) {
        return currentState;
      }

      return {
        ...currentState,
        perNetworkData: {
          ...currentState.perNetworkData,
          // $FlowFixMe[invalid-computed-prop] - NetworkIdentifier union is safe for computed properties
          [network]: setContractAddressForNetwork(currentNetworkData, contractAddress),
        },
      };
    }

    case TANDAPAY_UPDATE_NETWORK_PERFORMANCE: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_UPDATE_NETWORK_PERFORMANCE) {
        return currentState;
      }

      const { network, performance } = action;
      const currentNetworkData = currentState.perNetworkData && currentState.perNetworkData[network];

      // If network data doesn't exist, return unchanged state
      if (!currentNetworkData) {
        return currentState;
      }

      return {
        ...currentState,
        perNetworkData: {
          ...currentState.perNetworkData,
          // $FlowFixMe[invalid-computed-prop] - NetworkIdentifier union is safe for computed properties
          [network]: updateNetworkPerformance(currentNetworkData, performance),
        },
      };
    }

    case TANDAPAY_SETTINGS_UPDATE: {
      // Update custom network tokens when customRpcConfig changes
      if (action.type !== TANDAPAY_SETTINGS_UPDATE) {
        return currentState;
      }

      // Check if customRpcConfig is being updated
      if (action.settings.customRpcConfig !== undefined) {
        const customNetworkData = currentState.perNetworkData.custom;
        if (!customNetworkData) {
          return currentState;
        }

        const updatedCustomNetworkData = updateCustomNetworkTokens(
          customNetworkData,
          action.settings.customRpcConfig?.nativeToken
        );

        return {
          ...currentState,
          perNetworkData: {
            ...currentState.perNetworkData,
            custom: updatedCustomNetworkData,
          },
        };
      }

      return currentState;
    }

    default:
      return currentState;
  }
};
