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
import {
  validateTandaPaySettings
} from './stateValidation';

// Enhanced settings state with network customization support (removed duplicate selectedTokenSymbol)
export type TandaPaySettingsState = $ReadOnly<{|
  selectedNetwork: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom',
  // Custom RPC configuration
  customRpcConfig: ?{|
    name: string,
    rpcUrl: string,
    chainId: number,
    blockExplorerUrl?: string,
  |},
|}>;

export type TandaPayState = $ReadOnly<{|
  settings: TandaPaySettingsState,
  tokens: TokenState,
|}>;

const initialSettingsState: TandaPaySettingsState = {
  selectedNetwork: 'sepolia', // Changed to sepolia for testing
  customRpcConfig: null, // No custom RPC by default
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
      // Validate the incoming settings update
      const validation = validateTandaPaySettings({
        selectedNetwork: action.settings.selectedNetwork,
        customRpcConfig: action.settings.customRpcConfig,
      });

      if (!validation.isValid) {
        return state; // Return unchanged state for invalid updates
      }

      // Only allow updating fields that exist in the settings state
      const updatedSettings: TandaPaySettingsState = {
        selectedNetwork: action.settings.selectedNetwork != null ? action.settings.selectedNetwork : state.settings.selectedNetwork,
        customRpcConfig: action.settings.customRpcConfig !== undefined ? action.settings.customRpcConfig : state.settings.customRpcConfig,
      };

      return {
        ...state,
        settings: updatedSettings,
      };
    }

    case TANDAPAY_TOKEN_SELECT: {
      // Validate token symbol
      if (typeof action.tokenSymbol !== 'string' || action.tokenSymbol.trim() === '') {
        return state;
      }

      return {
        ...state,
        tokens: {
          ...state.tokens,
          selectedTokenSymbol: action.tokenSymbol,
        },
      };
    }

    case TANDAPAY_TOKEN_ADD_CUSTOM: {
      const validation = validateCustomToken(action.token);
      if (!validation.isValid) {
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
        return state;
      }

      return {
        ...state,
        tokens: {
          ...state.tokens,
          customTokens: [...state.tokens.customTokens, newToken],
        },
      };
    }

    case TANDAPAY_TOKEN_REMOVE_CUSTOM: {
      // Validate token symbol
      if (typeof action.tokenSymbol !== 'string' || action.tokenSymbol.trim() === '') {
        return state;
      }

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
    }

    case TANDAPAY_TOKEN_UPDATE_BALANCE: {
      // Validate inputs
      if (typeof action.tokenSymbol !== 'string' || action.tokenSymbol.trim() === '') {
        return state;
      }

      if (typeof action.balance !== 'string') {
        return state;
      }

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
    }

    default:
      return state;
  }
};
