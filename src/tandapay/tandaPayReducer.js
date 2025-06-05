/* @flow strict-local */
import type { Action } from '../types';
import {
  RESET_ACCOUNT_DATA,
  TANDAPAY_SETTINGS_UPDATE,
  TANDAPAY_TOKEN_SELECT,
  TANDAPAY_TOKEN_ADD_CUSTOM,
  TANDAPAY_TOKEN_REMOVE_CUSTOM,
  TANDAPAY_TOKEN_UPDATE_BALANCE,
} from '../actionConstants';
import type { TokenState } from './tokens/tokenTypes';
import { getDefaultTokens, validateCustomToken } from './tokens/tokenConfig';

// Simplified settings state - only keep what's actually used for token functionality
export type TandaPaySettingsState = $ReadOnly<{|
  defaultNetwork: string,
  // Token selection persistence
  selectedTokenSymbol: string,
|}>;

export type TandaPayState = $ReadOnly<{|
  settings: TandaPaySettingsState,
  tokens: TokenState,
|}>;

const initialSettingsState: TandaPaySettingsState = {
  defaultNetwork: 'sepolia', // Changed to sepolia for testing
  selectedTokenSymbol: 'ETH', // Default to ETH
};

const initialTokenState: TokenState = {
  selectedTokenSymbol: 'ETH',
  defaultTokens: getDefaultTokens('sepolia'),
  customTokens: [],
  balances: {},
  lastUpdated: {},
};

const initialState: TandaPayState = {
  settings: initialSettingsState,
  tokens: initialTokenState,
};

// eslint-disable-next-line default-param-last
export default (state: TandaPayState = initialState, action: Action): TandaPayState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      // Reset to initial state but preserve any custom tokens that were added
      return {
        ...initialState,
        tokens: {
          ...initialState.tokens,
          customTokens: state.tokens.customTokens,
        },
      };

    case TANDAPAY_SETTINGS_UPDATE: {
      // Only allow updating fields that exist in the simplified settings state
      const updatedSettings: TandaPaySettingsState = {
        defaultNetwork: action.settings.defaultNetwork != null ? action.settings.defaultNetwork : state.settings.defaultNetwork,
        selectedTokenSymbol: action.settings.selectedTokenSymbol != null ? action.settings.selectedTokenSymbol : state.settings.selectedTokenSymbol,
      };

      // If selectedTokenSymbol is being updated, also update the tokens state
      let updatedTokens = state.tokens;
      if (action.settings.selectedTokenSymbol != null) {
        updatedTokens = {
          ...state.tokens,
          selectedTokenSymbol: action.settings.selectedTokenSymbol,
        };
      }

      return {
        ...state,
        settings: updatedSettings,
        tokens: updatedTokens,
      };
    }

    case TANDAPAY_TOKEN_SELECT:
      return {
        ...state,
        tokens: {
          ...state.tokens,
          selectedTokenSymbol: action.tokenSymbol,
        },
        settings: {
          ...state.settings,
          selectedTokenSymbol: action.tokenSymbol,
        },
      };

    case TANDAPAY_TOKEN_ADD_CUSTOM: {
      const validation = validateCustomToken(action.token);
      if (!validation.isValid) {
        // In a real app, you might want to handle this error differently
        // For now, just return the unchanged state
        return state;
      }

      const newToken = {
        symbol: action.token.symbol,
        address: action.token.address,
        name: action.token.name,
        decimals: action.token.decimals != null ? action.token.decimals : 18,
        isDefault: false,
        isCustom: true,
      };

      // Check if token already exists
      const existingCustomToken = state.tokens.customTokens.find(
        t => t.symbol.toLowerCase() === newToken.symbol.toLowerCase()
      );

      if (existingCustomToken) {
        return state; // Token already exists
      }

      return {
        ...state,
        tokens: {
          ...state.tokens,
          customTokens: [...state.tokens.customTokens, newToken],
        },
      };
    }

    case TANDAPAY_TOKEN_REMOVE_CUSTOM:
      return {
        ...state,
        tokens: {
          ...state.tokens,
          customTokens: state.tokens.customTokens.filter(
            t => t.symbol !== action.tokenSymbol
          ),
          // Clear balance if it exists
          balances: Object.keys(state.tokens.balances).reduce((acc, symbol) => {
            if (symbol !== action.tokenSymbol) {
              acc[symbol] = state.tokens.balances[symbol];
            }
            return acc;
          }, {}),
          lastUpdated: Object.keys(state.tokens.lastUpdated).reduce((acc, symbol) => {
            if (symbol !== action.tokenSymbol) {
              acc[symbol] = state.tokens.lastUpdated[symbol];
            }
            return acc;
          }, {}),
        },
      };

    case TANDAPAY_TOKEN_UPDATE_BALANCE:
      return {
        ...state,
        tokens: {
          ...state.tokens,
          balances: {
            ...state.tokens.balances,
            [action.tokenSymbol]: action.balance,
          },
          lastUpdated: {
            ...state.tokens.lastUpdated,
            [action.tokenSymbol]: Date.now(),
          },
        },
      };

    default:
      return state;
  }
};
