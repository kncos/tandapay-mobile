/* @flow strict-local */
import type { PerAccountState } from '../../reduxTypes';
import type {
  TandaPayState,
} from './reducer';
import type { TandaPaySettingsState } from './reducers/settingsReducer';
import type { CommunityInfoState } from './reducers/communityInfoReducer';
import type { NetworkIdentifier } from '../definitions/types';
import type { CommunityInfo } from '../contract/types/index';
import { deserializeBigNumbers } from '../utils/bigNumberUtils';

// Main TandaPay state selector
export const getTandaPayState = (state: PerAccountState): TandaPayState => {
  if (!state.tandaPay) {
    // Return default state if not initialized
    return {
      settings: {
        selectedNetwork: 'sepolia',
        customRpcConfig: null,
        contractAddresses: {
          mainnet: null,
          sepolia: null,
          arbitrum: null,
          polygon: null,
          custom: null,
        },
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
      communityInfo: {
        communityInfo: null,
        loading: false,
        error: null,
        lastUpdated: null,
        contractAddress: null,
        userAddress: null,
      },
      // New decoupled data structures
      communityInfoData: {
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
        contractAddress: null,
        userAddress: null,
      },
      memberData: {
        memberBatchInfo: null,
        isLoading: false,
        error: null,
        lastUpdated: null,
      },
      subgroupData: {
        subgroupBatchInfo: null,
        isLoading: false,
        error: null,
        lastUpdated: null,
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
      contractAddresses: {
        mainnet: null,
        sepolia: null,
        arbitrum: null,
        polygon: null,
        custom: null,
      },
      networkPerformance: {
        cacheExpirationMs: 30000,
        rateLimitDelayMs: 100,
        retryAttempts: 3,
      },
    };
  }
  return tandaPayState.settings;
};

export const getTandaPaySelectedNetwork = (state: PerAccountState): NetworkIdentifier => {
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

// Contract address selectors
export const getTandaPayContractAddresses = (state: PerAccountState): {|
  mainnet: ?string,
  sepolia: ?string,
  arbitrum: ?string,
  polygon: ?string,
  custom: ?string,
|} => {
  try {
    const settings = getTandaPaySettings(state);
    return settings.contractAddresses || {
      mainnet: null,
      sepolia: null,
      arbitrum: null,
      polygon: null,
      custom: null,
    };
  } catch (error) {
    return {
      mainnet: null,
      sepolia: null,
      arbitrum: null,
      polygon: null,
      custom: null,
    };
  }
};

export const getTandaPayContractAddressForNetwork = (
  state: PerAccountState,
  network: NetworkIdentifier
): ?string => {
  try {
    const contractAddresses = getTandaPayContractAddresses(state);
    return contractAddresses[network];
  } catch (error) {
    return null;
  }
};

export const getCurrentTandaPayContractAddress = (state: PerAccountState): ?string => {
  try {
    const selectedNetwork = getTandaPaySelectedNetwork(state);
    return getTandaPayContractAddressForNetwork(state, selectedNetwork);
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

export const getTandaPayDefaultTokens = (state: PerAccountState): $ReadOnlyArray<mixed> => {
  try {
    const tandaPayState = getTandaPayState(state);
    return tandaPayState.tokens.defaultTokens || [];
  } catch (error) {
    return [];
  }
};

export const getTandaPayCustomTokens = (state: PerAccountState): $ReadOnlyArray<mixed> => {
  try {
    const tandaPayState = getTandaPayState(state);
    return tandaPayState.tokens.customTokens || [];
  } catch (error) {
    return [];
  }
};

// Community info selectors
export const getCommunityInfoState = (state: PerAccountState): CommunityInfoState => {
  const tandaPayState = getTandaPayState(state);
  return tandaPayState.communityInfo;
};

export const getCommunityInfo = (state: PerAccountState): ?CommunityInfo => {
  try {
    const communityInfo = getCommunityInfoState(state).communityInfo;
    // $FlowFixMe[incompatible-return] - deserializeBigNumbers returns the correct type structure
    return communityInfo ? deserializeBigNumbers(communityInfo) : null;
  } catch (error) {
    return null;
  }
};

export const getCommunityInfoLoading = (state: PerAccountState): boolean => {
  try {
    return getCommunityInfoState(state).loading;
  } catch (error) {
    return false;
  }
};

export const getCommunityInfoError = (state: PerAccountState): ?string => {
  try {
    return getCommunityInfoState(state).error;
  } catch (error) {
    return null;
  }
};

export const getCommunityInfoLastUpdated = (state: PerAccountState): ?number => {
  try {
    return getCommunityInfoState(state).lastUpdated;
  } catch (error) {
    return null;
  }
};

export const isCommunityInfoStale = (state: PerAccountState, maxAgeMs: number = 30000): boolean => {
  try {
    const lastUpdated = getCommunityInfoLastUpdated(state);
    if (lastUpdated == null) {
      return true;
    }
    return Date.now() - lastUpdated > maxAgeMs;
  } catch (error) {
    return true;
  }
};
