/* @flow strict-local */
import type { PerAccountAction } from '../../types';
import type {
  TandaPaySettingsState,
} from './reducers/settingsReducer';
import type {
  TandaPaySettingsUpdateAction,
} from '../../actionTypes';
import type { NetworkIdentifier, SupportedNetwork } from '../definitions/types';
import { serializeBigNumbers } from '../utils/bigNumberUtils';
import {
  TANDAPAY_SETTINGS_UPDATE,
  TANDAPAY_TOKEN_SELECT,
  TANDAPAY_TOKEN_ADD_CUSTOM,
  TANDAPAY_TOKEN_REMOVE_CUSTOM,
  TANDAPAY_TOKEN_UPDATE_BALANCE,
  TANDAPAY_TOKEN_INVALIDATE_BALANCE,
  TANDAPAY_COMMUNITY_INFO_UPDATE,
  TANDAPAY_COMMUNITY_INFO_LOADING,
  TANDAPAY_COMMUNITY_INFO_ERROR,
  TANDAPAY_COMMUNITY_INFO_CLEAR,
  TANDAPAY_BATCH_MEMBERS_UPDATE,
  TANDAPAY_BATCH_SUBGROUPS_UPDATE,
  TANDAPAY_BATCH_DATA_INVALIDATE,
} from '../../actionConstants';

// =============================================================================
// SETTINGS ACTIONS
// =============================================================================

export const updateTandaPaySettings = (settings: $Shape<TandaPaySettingsState>): TandaPaySettingsUpdateAction => ({
  type: TANDAPAY_SETTINGS_UPDATE,
  settings,
});

// =============================================================================
// TOKEN ACTIONS
// =============================================================================

/**
 * Action to select a different token in the wallet
 */
export function selectToken(tokenSymbol: string): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_SELECT,
    tokenSymbol,
  };
}

/**
 * Action to add a custom token to the user's wallet
 */
export function addCustomToken(token: {|
  symbol: string,
  address: string,
  name: string,
  decimals?: number,
|}): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_ADD_CUSTOM,
    token,
  };
}

/**
 * Action to remove a custom token from the user's wallet
 */
export function removeCustomToken(tokenSymbol: string): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_REMOVE_CUSTOM,
    tokenSymbol,
  };
}

/**
 * Action to update the cached balance for a token
 */
export function updateTokenBalance(tokenSymbol: string, balance: string): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_UPDATE_BALANCE,
    tokenSymbol,
    balance,
  };
}

/**
 * Action to invalidate the cached balance for a token, forcing a refresh
 */
export function invalidateTokenBalance(tokenSymbol: string): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_INVALIDATE_BALANCE,
    tokenSymbol,
  };
}

/**
 * Helper function to invalidate all token balances (useful after transactions)
 * Returns an array of actions to dispatch
 */
export function invalidateAllTokenBalances(tokenSymbols: $ReadOnlyArray<string>): $ReadOnlyArray<PerAccountAction> {
  return tokenSymbols.map(symbol => invalidateTokenBalance(symbol));
}

// =============================================================================
// NETWORK ACTIONS
// =============================================================================

/**
 * Action creator for switching networks
 */
export function switchNetwork(network: NetworkIdentifier): TandaPaySettingsUpdateAction {
  return {
    type: TANDAPAY_SETTINGS_UPDATE,
    settings: {
      selectedNetwork: network,
    },
  };
}

/**
 * Action creator for setting custom RPC configuration
 */
export function setCustomRpc(config: {|
  name: string,
  rpcUrl: string,
  chainId: number,
  blockExplorerUrl?: string,
|}): TandaPaySettingsUpdateAction {
  return {
    type: TANDAPAY_SETTINGS_UPDATE,
    settings: {
      selectedNetwork: 'custom',
      customRpcConfig: config,
    },
  };
}

/**
 * Action creator for clearing custom RPC (switch back to built-in network)
 */
export function clearCustomRpc(fallbackNetwork: SupportedNetwork = 'mainnet'): TandaPaySettingsUpdateAction {
  return {
    type: TANDAPAY_SETTINGS_UPDATE,
    settings: {
      selectedNetwork: fallbackNetwork,
      customRpcConfig: null,
    },
  };
}

/**
 * Action creator for updating network performance settings
 */
export function updateNetworkPerformance(performance: {|
  cacheExpirationMs?: number,
  rateLimitDelayMs?: number,
  retryAttempts?: number,
|}): TandaPaySettingsUpdateAction {
  return {
    type: TANDAPAY_SETTINGS_UPDATE,
    settings: {
      networkPerformance: performance,
    },
  };
}

/**
 * Action creator for updating cache expiration time
 */
export function updateCacheExpiration(cacheExpirationMs: number): TandaPaySettingsUpdateAction {
  return {
    type: TANDAPAY_SETTINGS_UPDATE,
    settings: {
      networkPerformance: {
        cacheExpirationMs,
      },
    },
  };
}

/**
 * Action creator for updating rate limit delay
 */
export function updateRateLimitDelay(rateLimitDelayMs: number): TandaPaySettingsUpdateAction {
  return {
    type: TANDAPAY_SETTINGS_UPDATE,
    settings: {
      networkPerformance: {
        rateLimitDelayMs,
      },
    },
  };
}

/**
 * Action creator for updating retry attempts
 */
export function updateRetryAttempts(retryAttempts: number): TandaPaySettingsUpdateAction {
  return {
    type: TANDAPAY_SETTINGS_UPDATE,
    settings: {
      networkPerformance: {
        retryAttempts,
      },
    },
  };
}

// =============================================================================
// COMMUNITY INFO ACTIONS
// =============================================================================

/**
 * Action creator for updating community info loading state
 */
export function setCommunityInfoLoading(loading: boolean): PerAccountAction {
  return {
    type: TANDAPAY_COMMUNITY_INFO_LOADING,
    loading,
  };
}

/**
 * Action creator for updating community info data
 */
export function updateCommunityInfo(
  communityInfo: $FlowFixMe, // CommunityInfo type
  contractAddress: ?string,
  userAddress: ?string,
): PerAccountAction {
  return {
    type: TANDAPAY_COMMUNITY_INFO_UPDATE,
    communityInfo: serializeBigNumbers(communityInfo),
    contractAddress,
    userAddress,
  };
}

/**
 * Action creator for community info error
 */
export function setCommunityInfoError(error: string): PerAccountAction {
  return {
    type: TANDAPAY_COMMUNITY_INFO_ERROR,
    error,
  };
}

/**
 * Action creator for clearing community info
 */
export function clearCommunityInfo(): PerAccountAction {
  return {
    type: TANDAPAY_COMMUNITY_INFO_CLEAR,
  };
}

/**
 * Action creator for updating batch members data in community info
 */
export function updateBatchMembers(
  allMembersInfo: $FlowFixMe, // Array<MemberInfo>
  contractAddress: ?string,
  userAddress: ?string,
): PerAccountAction {
  return {
    type: TANDAPAY_BATCH_MEMBERS_UPDATE,
    allMembersInfo: serializeBigNumbers(allMembersInfo),
    contractAddress,
    userAddress,
    timestamp: Date.now(),
  };
}

/**
 * Action creator for updating batch subgroups data in community info
 */
export function updateBatchSubgroups(
  allSubgroupsInfo: $FlowFixMe, // Array<SubgroupInfo>
  contractAddress: ?string,
  userAddress: ?string,
): PerAccountAction {
  return {
    type: TANDAPAY_BATCH_SUBGROUPS_UPDATE,
    allSubgroupsInfo: serializeBigNumbers(allSubgroupsInfo),
    contractAddress,
    userAddress,
    timestamp: Date.now(),
  };
}

/**
 * Action creator for invalidating batch data (members and subgroups)
 * This will force a refresh the next time the data is requested
 */
export function invalidateBatchData(): PerAccountAction {
  return {
    type: TANDAPAY_BATCH_DATA_INVALIDATE,
  };
}
