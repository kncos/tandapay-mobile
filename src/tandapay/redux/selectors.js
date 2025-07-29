/* @flow strict-local */
import type { PerAccountState } from '../../reduxTypes';
import type {
  TandaPayState,
  WalletState,
} from './reducer';
import type { TandaPaySettingsState } from './reducers/settingsReducer';
import type { CommunityInfoDataState } from './reducers/communityInfoDataReducer';
import type { NetworkIdentifier } from '../definitions/types';
import type { CommunityInfo } from '../contract/types/index';
import { deserializeBigNumbers } from '../utils/bigNumberUtils';
import { initializePerNetworkTokenState } from '../utils/tokenMigration';

// Main TandaPay state selector
export const getTandaPayState = (state: PerAccountState): TandaPayState => {
  if (!state.tandaPay) {
    // Return default state if not initialized - use proper token initialization
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
      tokens: initializePerNetworkTokenState(),
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
      wallet: {
        hasWallet: false,
        walletAddress: null,
        alchemyApiKey: null,
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
  isAlchemyUrl?: boolean,
  multicall3Address: string,
  nativeToken?: ?{|
    name: string,
    symbol: string,
    decimals: number,
  |},
|} => {
  try {
    const settings = getTandaPaySettings(state);
    return settings.customRpcConfig;
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

// Token selectors - Updated for new perNetworkData structure
export const getTandaPaySelectedTokenSymbol = (state: PerAccountState): string => {
  try {
    const tandaPayState = getTandaPayState(state);
    const selectedNetwork = getTandaPaySelectedNetwork(state);

    // Check if perNetworkData exists and has the selected network
    if (tandaPayState.tokens
        && tandaPayState.tokens.perNetworkData
        && tandaPayState.tokens.perNetworkData[selectedNetwork]) {
      return tandaPayState.tokens.perNetworkData[selectedNetwork].selectedToken || 'ETH';
    }

    return 'ETH';
  } catch (error) {
    return 'ETH';
  }
};

export const getTandaPayTokensForAllNetworks = (state: PerAccountState): $ReadOnly<{|
  mainnet: $ReadOnly<{ [string]: mixed }>,
  sepolia: $ReadOnly<{ [string]: mixed }>,
  arbitrum: $ReadOnly<{ [string]: mixed }>,
  polygon: $ReadOnly<{ [string]: mixed }>,
  custom: $ReadOnly<{ [string]: mixed }>,
|}> => {
  try {
    const tandaPayState = getTandaPayState(state);

    // Check if perNetworkData exists
    if (tandaPayState.tokens && tandaPayState.tokens.perNetworkData) {
      const perNetworkData = tandaPayState.tokens.perNetworkData;
      return {
        mainnet: (perNetworkData.mainnet && perNetworkData.mainnet.tokens) || {},
        sepolia: (perNetworkData.sepolia && perNetworkData.sepolia.tokens) || {},
        arbitrum: (perNetworkData.arbitrum && perNetworkData.arbitrum.tokens) || {},
        polygon: (perNetworkData.polygon && perNetworkData.polygon.tokens) || {},
        custom: (perNetworkData.custom && perNetworkData.custom.tokens) || {},
      };
    }

    return {
      mainnet: {},
      sepolia: {},
      arbitrum: {},
      polygon: {},
      custom: {},
    };
  } catch (error) {
    return {
      mainnet: {},
      sepolia: {},
      arbitrum: {},
      polygon: {},
      custom: {},
    };
  }
};

// Network-specific token selectors
export const getTokensForNetwork = (
  state: PerAccountState,
  network: NetworkIdentifier
): $ReadOnly<{ [string]: mixed }> => {
  try {
    const tandaPayState = getTandaPayState(state);

    // Check if perNetworkData exists and has the specific network
    if (tandaPayState.tokens
        && tandaPayState.tokens.perNetworkData
        && tandaPayState.tokens.perNetworkData[network]) {
      return tandaPayState.tokens.perNetworkData[network].tokens || {};
    }

    return {};
  } catch (error) {
    return {};
  }
};

export const getTokensForCurrentNetwork = (state: PerAccountState): $ReadOnly<{ [string]: mixed }> => {
  try {
    const selectedNetwork = getTandaPaySelectedNetwork(state);
    return getTokensForNetwork(state, selectedNetwork);
  } catch (error) {
    return {};
  }
};

// Community info selectors - using new decoupled data structure
export const getCommunityInfoDataState = (state: PerAccountState): CommunityInfoDataState => {
  const tandaPayState = getTandaPayState(state);
  return tandaPayState.communityInfoData;
};

export const getCommunityInfo = (state: PerAccountState): ?CommunityInfo => {
  try {
    const communityInfoData = getCommunityInfoDataState(state).data;
    // $FlowFixMe[incompatible-return] - deserializeBigNumbers returns the correct type structure
    return communityInfoData ? deserializeBigNumbers(communityInfoData) : null;
  } catch (error) {
    return null;
  }
};

export const getCommunityInfoLoading = (state: PerAccountState): boolean => {
  try {
    return getCommunityInfoDataState(state).loading;
  } catch (error) {
    return false;
  }
};

export const getCommunityInfoError = (state: PerAccountState): ?string => {
  try {
    return getCommunityInfoDataState(state).error;
  } catch (error) {
    return null;
  }
};

export const getCommunityInfoLastUpdated = (state: PerAccountState): ?number => {
  try {
    return getCommunityInfoDataState(state).lastUpdated;
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

// Alchemy URL detection for custom networks
export const isCustomNetworkAlchemyEnabled = (state: PerAccountState): boolean => {
  try {
    const customRpcConfig = getTandaPayCustomRpcConfig(state);
    if (!customRpcConfig) {
      return false;
    }

    // Check if the RPC URL contains Alchemy domain patterns
    const { rpcUrl } = customRpcConfig;
    return rpcUrl.includes('alchemy.com') || rpcUrl.includes('g.alchemy.com');
  } catch (error) {
    return false;
  }
};

export const getCustomNetworkAlchemyUrl = (state: PerAccountState): ?string => {
  try {
    const customRpcConfig = getTandaPayCustomRpcConfig(state);
    if (!customRpcConfig || !isCustomNetworkAlchemyEnabled(state)) {
      return null;
    }
    return customRpcConfig.rpcUrl;
  } catch (error) {
    return null;
  }
};

// =============================================================================
// WALLET SELECTORS
// =============================================================================

/**
 * Get wallet state
 */
export const getWalletState = (state: PerAccountState): WalletState => getTandaPayState(state).wallet;

/**
 * Check if user has a wallet
 */
export const getHasWallet = (state: PerAccountState): boolean => getWalletState(state).hasWallet;

/**
 * Get wallet address
 */
export const getWalletAddress = (state: PerAccountState): ?string => getWalletState(state).walletAddress;
