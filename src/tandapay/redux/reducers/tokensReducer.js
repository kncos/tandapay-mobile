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
} from '../../utils/tokenMigration';

const initialState: TokenState = initializePerNetworkTokenState();

// Helper function to ensure state always has perNetworkData
const ensureValidState = (state: TokenState): TokenState => {
  // If perNetworkData is missing, reinitialize the state
  if (!state.perNetworkData || Object.keys(state.perNetworkData).length === 0) {
    return initializePerNetworkTokenState();
  }
  return state;
};

// eslint-disable-next-line default-param-last
export default (state: TokenState = initialState, action: Action): TokenState => {
  // Ensure state is valid before processing any action
  const currentState = ensureValidState(state);

  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      // Reset to initial state but preserve network structure
      return initialState;

    case TANDAPAY_TOKEN_SELECT: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_TOKEN_SELECT) {
        return currentState;
      }

      console.log('tokensReducer: TANDAPAY_TOKEN_SELECT action received:', {
        tokenSymbol: action.tokenSymbol,
        network: action.network,
        currentState: currentState.perNetworkData
      });

      // Validate token symbol
      if (typeof action.tokenSymbol !== 'string' || action.tokenSymbol.trim() === '') {
        console.log('tokensReducer: Invalid token symbol, returning unchanged state');
        return currentState;
      }

      // Get the current network from action
      const network = action.network;
      const currentNetworkData = currentState.perNetworkData && currentState.perNetworkData[network];

      // If network data doesn't exist, return unchanged state
      if (!currentNetworkData) {
        console.log('tokensReducer: No network data for network:', network, 'returning unchanged state');
        return currentState;
      }

      const newState = {
        ...currentState,
        perNetworkData: {
          ...currentState.perNetworkData,
          // $FlowFixMe[invalid-computed-prop] - NetworkIdentifier union is safe for computed properties
          [network]: setSelectedTokenForNetwork(currentNetworkData, action.tokenSymbol),
        },
      };

      console.log('tokensReducer: Updated state:', {
        oldSelectedToken: currentNetworkData.selectedToken,
        newSelectedToken: action.tokenSymbol,
        newNetworkData: newState.perNetworkData[network]
      });

      return newState;
    }

    case TANDAPAY_TOKEN_ADD_CUSTOM: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_TOKEN_ADD_CUSTOM) {
        return currentState;
      }

      // Validate the custom token before adding
      const validation = validateCustomToken(action.token);

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

    default:
      return currentState;
  }
};
