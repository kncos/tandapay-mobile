/* @flow strict-local */
import type { PerAccountState } from '../../reduxTypes';
import type {
  TandaPayState,
} from './reducer';
import type { TandaPaySettingsState } from './reducers/settingsReducer';

// Main TandaPay state selector
export const getTandaPayState = (state: PerAccountState): TandaPayState => {
  if (!state.tandaPay) {
    // Return default state if not initialized
    return {
      settings: {
        selectedNetwork: 'sepolia',
        customRpcConfig: null,
        networkPerformance: {
          cacheExpirationMs: 30000,
          rateLimitDelayMs: 100,
          retryAttempts: 3,
        },
      },
      tokens: {
        selectedTokenSymbol: 'ETH',
        defaultTokens: [],
        customTokens: [],
        balances: {},
        lastUpdated: {},
      },
    };
  }
  return state.tandaPay;
};

// Settings selectors
export const getTandaPaySettings = (state: PerAccountState): TandaPaySettingsState => {
  const tandaPayState = getTandaPayState(state);
  if (!tandaPayState || !tandaPayState.settings) {
    // Return default settings if state is not initialized
    return {
      selectedNetwork: 'sepolia',
      customRpcConfig: null,
      networkPerformance: {
        cacheExpirationMs: 30000,
        rateLimitDelayMs: 100,
        retryAttempts: 3,
      },
    };
  }
  return tandaPayState.settings;
};

export const getTandaPaySelectedNetwork = (state: PerAccountState): 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom' => {
  try {
    return getTandaPaySettings(state).selectedNetwork || 'sepolia';
  } catch (error) {
    // Return default if state is not initialized
    return 'sepolia';
  }
};

export const getTandaPayCustomRpcConfig = (state: PerAccountState): ?{|
  name: string,
  rpcUrl: string,
  chainId: number,
  blockExplorerUrl?: string,
|} => {
  try {
    return getTandaPaySettings(state).customRpcConfig;
  } catch (error) {
    return null;
  }
};

// Network performance selectors
export const getTandaPayNetworkPerformance = (state: PerAccountState): {|
  cacheExpirationMs: number,
  rateLimitDelayMs: number,
  retryAttempts: number,
|} => {
  try {
    const settings = getTandaPaySettings(state);
    return settings.networkPerformance || {
      cacheExpirationMs: 30000,
      rateLimitDelayMs: 100,
      retryAttempts: 3,
    };
  } catch (error) {
    return {
      cacheExpirationMs: 30000,
      rateLimitDelayMs: 100,
      retryAttempts: 3,
    };
  }
};

export const getTandaPayCacheExpiration = (state: PerAccountState): number => {
  try {
    return getTandaPayNetworkPerformance(state).cacheExpirationMs;
  } catch (error) {
    return 30000;
  }
};

export const getTandaPayRateLimitDelay = (state: PerAccountState): number => {
  try {
    return getTandaPayNetworkPerformance(state).rateLimitDelayMs;
  } catch (error) {
    return 100;
  }
};

export const getTandaPayRetryAttempts = (state: PerAccountState): number => {
  try {
    return getTandaPayNetworkPerformance(state).retryAttempts;
  } catch (error) {
    return 3;
  }
};

// Token selectors
export const getTandaPaySelectedTokenSymbol = (state: PerAccountState): string => {
  try {
    const tandaPayState = getTandaPayState(state);
    return tandaPayState.tokens.selectedTokenSymbol || 'ETH';
  } catch (error) {
    return 'ETH';
  }
};
