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
import { isAlchemyUrl } from '../providers/AlchemyDetection';
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
  TANDAPAY_COMMUNITY_INFO_INVALIDATE,
  TANDAPAY_MEMBER_DATA_UPDATE,
  TANDAPAY_MEMBER_DATA_INVALIDATE,
  TANDAPAY_SUBGROUP_DATA_UPDATE,
  TANDAPAY_SUBGROUP_DATA_INVALIDATE,
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
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return (dispatch, getState) => {
    const state = getState();
    const selectedNetwork = state.tandaPay?.settings?.selectedNetwork || 'sepolia';

    dispatch({
      type: TANDAPAY_TOKEN_SELECT,
      tokenSymbol,
      network: selectedNetwork,
    });
  };
}

/**
 * Action to add a custom token to the user's wallet
 */
export function addCustomToken(
  token: {|
    symbol: string,
    address: string,
    name: string,
    decimals?: number,
  |},
  network: NetworkIdentifier
): PerAccountAction {
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return {
    type: TANDAPAY_TOKEN_ADD_CUSTOM,
    token,
    network,
  };
}

/**
 * Action to remove a custom token from the user's wallet
 */
export function removeCustomToken(tokenSymbol: string, network: NetworkIdentifier): PerAccountAction {
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return {
    type: TANDAPAY_TOKEN_REMOVE_CUSTOM,
    tokenSymbol,
    network,
  };
}

/**
 * Action to update the cached balance for a token
 */
export function updateTokenBalance(tokenSymbol: string, balance: string): PerAccountAction {
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return (dispatch, getState) => {
    const state = getState();
    const selectedNetwork = state.tandaPay?.settings?.selectedNetwork || 'sepolia';

    dispatch({
      type: TANDAPAY_TOKEN_UPDATE_BALANCE,
      tokenSymbol,
      balance,
      network: selectedNetwork,
    });
  };
}

/**
 * Action to invalidate the cached balance for a token, forcing a refresh
 */
export function invalidateTokenBalance(tokenSymbol: string): PerAccountAction {
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return (dispatch, getState) => {
    const state = getState();
    const selectedNetwork = state.tandaPay?.settings?.selectedNetwork || 'sepolia';

    dispatch({
      type: TANDAPAY_TOKEN_INVALIDATE_BALANCE,
      tokenSymbol,
      network: selectedNetwork,
    });
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
      customRpcConfig: {
        ...config,
        isAlchemyUrl: isAlchemyUrl(config.rpcUrl),
      },
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
  // $FlowFixMe[incompatible-return] - New action type not yet in union
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
): PerAccountAction {
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return {
    type: TANDAPAY_COMMUNITY_INFO_UPDATE,
    communityInfo: serializeBigNumbers(communityInfo),
  };
}

/**
 * Action creator for community info error
 */
export function setCommunityInfoError(error: string): PerAccountAction {
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return {
    type: TANDAPAY_COMMUNITY_INFO_ERROR,
    error,
  };
}

// Legacy actions removed - use new decoupled data actions instead

// =============================================================================
// MEMBER DATA ACTIONS
// =============================================================================

/**
 * Action creator for updating member data
 */
export function updateMemberData(
  memberBatchInfo: $FlowFixMe,
  isLoading: boolean = false,
  error: ?string = null,
): PerAccountAction {
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return {
    type: TANDAPAY_MEMBER_DATA_UPDATE,
    memberBatchInfo: serializeBigNumbers(memberBatchInfo),
    isLoading,
    error,
  };
}

/**
 * Action creator for invalidating member data
 */
export function invalidateMemberData(): PerAccountAction {
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return {
    type: TANDAPAY_MEMBER_DATA_INVALIDATE,
  };
}

// =============================================================================
// SUBGROUP DATA ACTIONS
// =============================================================================

/**
 * Action creator for updating subgroup data
 */
export function updateSubgroupData(
  subgroupBatchInfo: $FlowFixMe,
  isLoading: boolean = false,
  error: ?string = null,
): PerAccountAction {
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return {
    type: TANDAPAY_SUBGROUP_DATA_UPDATE,
    subgroupBatchInfo: serializeBigNumbers(subgroupBatchInfo),
    isLoading,
    error,
  };
}

/**
 * Action creator for invalidating subgroup data
 */
export function invalidateSubgroupData(): PerAccountAction {
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return {
    type: TANDAPAY_SUBGROUP_DATA_INVALIDATE,
  };
}

/**
 * Action creator for invalidating community info
 */
export function invalidateCommunityInfo(): PerAccountAction {
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return {
    type: TANDAPAY_COMMUNITY_INFO_INVALIDATE,
  };
}

/**
 * Action creator for invalidating community info data
 */
export function invalidateCommunityInfoData(): PerAccountAction {
  // $FlowFixMe[incompatible-return] - New action type not yet in union
  return {
    type: TANDAPAY_COMMUNITY_INFO_INVALIDATE,
  };
}
