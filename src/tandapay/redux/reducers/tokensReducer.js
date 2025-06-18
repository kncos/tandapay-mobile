/* @flow strict-local */

import type { Action } from '../../../types';
import {
  RESET_ACCOUNT_DATA,
  TANDAPAY_TOKEN_SELECT,
  TANDAPAY_TOKEN_ADD_CUSTOM,
  TANDAPAY_TOKEN_REMOVE_CUSTOM,
  TANDAPAY_TOKEN_UPDATE_BALANCE,
  TANDAPAY_TOKEN_INVALIDATE_BALANCE,
} from '../../../actionConstants';
import type { TokenState, Token } from '../../tokens/tokenTypes';
import { validateCustomToken } from '../../tokens/tokenConfig';

// Static default tokens for consistent object references
const defaultTokens: $ReadOnlyArray<Token> = [
  {
    symbol: 'ETH',
    address: null,
    name: 'Ethereum',
    decimals: 18,
    isDefault: true,
    isCustom: false,
  },
  {
    symbol: 'USDC',
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    name: 'USD Coin',
    decimals: 6,
    isDefault: true,
    isCustom: false,
  },
  {
    symbol: 'USDT',
    address: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
    name: 'Tether USD',
    decimals: 6,
    isDefault: true,
    isCustom: false,
  },
  {
    symbol: 'DAI',
    address: '0x68194a729C2450ad26072b3D33ADaCbcef39D574',
    name: 'Dai Stablecoin',
    decimals: 18,
    isDefault: true,
    isCustom: false,
  },
];

const initialState: TokenState = {
  selectedTokenSymbol: 'ETH',
  defaultTokens,
  customTokens: [],
  balances: {},
  lastUpdated: {},
};

// eslint-disable-next-line default-param-last
export default (state: TokenState = initialState, action: Action): TokenState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      // Reset to initial state but preserve any custom tokens that were added
      return {
        ...initialState,
        customTokens: state.customTokens,
      };

    case TANDAPAY_TOKEN_SELECT: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_TOKEN_SELECT) {
        return state;
      }

      // Validate token symbol
      if (typeof action.tokenSymbol !== 'string' || action.tokenSymbol.trim() === '') {
        return state;
      }

      return {
        ...state,
        selectedTokenSymbol: action.tokenSymbol,
      };
    }

    case TANDAPAY_TOKEN_ADD_CUSTOM: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_TOKEN_ADD_CUSTOM) {
        return state;
      }

      // Validate the custom token before adding
      const validation = validateCustomToken(action.token);

      if (!validation.isValid) {
        // Return unchanged state for invalid tokens
        return state;
      }

      // Create properly typed token from the validated action
      const newToken: Token = {
        symbol: action.token.symbol,
        address: action.token.address,
        name: action.token.name,
        decimals: action.token.decimals != null ? action.token.decimals : 18,
        isDefault: false,
        isCustom: true,
      };

      // Check if token already exists (by symbol or address)
      const existingIndex = state.customTokens.findIndex(
        token => token.symbol === newToken.symbol || token.address === newToken.address
      );

      if (existingIndex >= 0) {
        // Update existing token
        const updatedTokens = [...state.customTokens];
        updatedTokens[existingIndex] = newToken;

        return {
          ...state,
          customTokens: updatedTokens,
        };
      }

      // Add new token
      return {
        ...state,
        customTokens: [...state.customTokens, newToken],
      };
    }

    case TANDAPAY_TOKEN_REMOVE_CUSTOM: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_TOKEN_REMOVE_CUSTOM) {
        return state;
      }

      const filteredTokens = state.customTokens.filter(
        token => token.symbol !== action.tokenSymbol
      );

      // If the removed token was selected, switch to ETH
      const newSelectedToken = state.selectedTokenSymbol === action.tokenSymbol
        ? 'ETH'
        : state.selectedTokenSymbol;

      return {
        ...state,
        customTokens: filteredTokens,
        selectedTokenSymbol: newSelectedToken,
      };
    }

    case TANDAPAY_TOKEN_UPDATE_BALANCE: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_TOKEN_UPDATE_BALANCE) {
        return state;
      }

      // Validate inputs
      if (typeof action.tokenSymbol !== 'string' || action.tokenSymbol.trim() === '') {
        return state;
      }

      if (typeof action.balance !== 'string') {
        return state;
      }

      return {
        ...state,
        balances: {
          ...state.balances,
          [action.tokenSymbol]: action.balance,
        },
        lastUpdated: {
          ...state.lastUpdated,
          [action.tokenSymbol]: Date.now(),
        },
      };
    }

    case TANDAPAY_TOKEN_INVALIDATE_BALANCE: {
      // Type-safe access to action properties
      if (action.type !== TANDAPAY_TOKEN_INVALIDATE_BALANCE) {
        return state;
      }

      // Validate inputs
      if (typeof action.tokenSymbol !== 'string' || action.tokenSymbol.trim() === '') {
        return state;
      }

      // Invalidate balance by setting lastUpdated to 0, which will make it stale
      return {
        ...state,
        lastUpdated: {
          ...state.lastUpdated,
          [action.tokenSymbol]: 0,
        },
      };
    }

    default:
      return state;
  }
};
