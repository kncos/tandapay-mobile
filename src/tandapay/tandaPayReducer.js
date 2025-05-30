/* @flow strict-local */
import type { Action } from '../types';
import {
  RESET_ACCOUNT_DATA,
  TANDAPAY_WALLET_SET,
  TANDAPAY_SETTINGS_UPDATE,
  TANDAPAY_TRANSACTION_ADD,
  TANDAPAY_POOL_DATA_UPDATE,
  TANDAPAY_TOKEN_SELECT,
  TANDAPAY_TOKEN_ADD_CUSTOM,
  TANDAPAY_TOKEN_REMOVE_CUSTOM,
  TANDAPAY_TOKEN_UPDATE_BALANCE,
} from '../actionConstants';
import type { TokenState } from './tokens/tokenTypes';
import { getDefaultTokens, validateCustomToken } from './tokens/tokenConfig';

export type TandaPayWalletState = $ReadOnly<{|
  address: string | null,
  privateKey: string | null, // This should be encrypted in production
  publicKey: string | null,
  mnemonic: string | null, // This should be encrypted in production
  isImported: boolean,
  createdAt: number | null,
|}>;

export type TandaPaySettingsState = $ReadOnly<{|
  defaultNetwork: string,
  notificationsEnabled: boolean,
  biometricAuthEnabled: boolean,
  autoBackupEnabled: boolean,
  currency: string,
  // Token selection persistence
  selectedTokenSymbol: string,
|}>;

export type TandaPayTransactionState = $ReadOnly<{|
  id: string,
  type: 'contribution' | 'claim' | 'withdrawal',
  amount: string,
  txHash: string | null,
  status: 'pending' | 'confirmed' | 'failed',
  timestamp: number,
  poolId: string | null,
|}>;

export type TandaPayPoolState = $ReadOnly<{|
  id: string,
  name: string,
  memberCount: number,
  totalPool: string,
  userContribution: string | null,
  status: 'active' | 'paused' | 'closed',
  lastUpdated: number,
|}>;

export type TandaPayState = $ReadOnly<{|
  wallet: TandaPayWalletState,
  settings: TandaPaySettingsState,
  transactions: $ReadOnlyArray<TandaPayTransactionState>,
  pools: $ReadOnlyArray<TandaPayPoolState>,
  tokens: TokenState,
|}>;

const initialWalletState: TandaPayWalletState = {
  address: null,
  privateKey: null,
  publicKey: null,
  mnemonic: null,
  isImported: false,
  createdAt: null,
};

const initialSettingsState: TandaPaySettingsState = {
  defaultNetwork: 'sepolia', // Changed to sepolia for testing
  notificationsEnabled: true,
  biometricAuthEnabled: false,
  autoBackupEnabled: true,
  currency: 'USD',
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
  wallet: initialWalletState,
  settings: initialSettingsState,
  transactions: [],
  pools: [],
  tokens: initialTokenState,
};

// eslint-disable-next-line default-param-last
export default (state: TandaPayState = initialState, action: Action): TandaPayState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      // Reset only transaction and pool data, keep wallet, settings, and tokens
      return {
        ...state,
        transactions: [],
        pools: [],
      };

    case TANDAPAY_WALLET_SET:
      return {
        ...state,
        wallet: {
          ...state.wallet,
          ...action.walletData,
          createdAt: action.walletData.createdAt != null ? action.walletData.createdAt : Date.now(),
        },
      };

    case TANDAPAY_SETTINGS_UPDATE: {
      const updatedSettings = {
        ...state.settings,
        ...action.settings,
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

    case TANDAPAY_TRANSACTION_ADD:
      return {
        ...state,
        transactions: [action.transaction, ...state.transactions],
      };

    case TANDAPAY_POOL_DATA_UPDATE:
      return {
        ...state,
        pools: state.pools.map(pool =>
          pool.id === action.poolData.id
            ? { ...pool, ...action.poolData, lastUpdated: Date.now() }
            : pool
        ),
      };

    default:
      return state;
  }
};
