/* @flow strict-local */

import { useSelector } from '../../../react-redux';
import store from '../../../boot/store';
import {
  invalidateCommunityInfoData,
  updateCommunityInfo,
  setCommunityInfoLoading,
  setCommunityInfoError,
} from '../../redux/actions';
import { getCurrentTandaPayContractAddress } from '../../redux/selectors';
import { tryGetActiveAccountState } from '../../../account/accountsSelectors';
import { getProvider } from '../../web3';
import { getTandaPayReadActions } from '../tandapay-reader/read';

/**
 * Centralized manager for community info data
 * Handles fetching, caching, and invalidation of basic community information
 */
class CommunityInfoManager {
  /**
   * Get community info data with automatic staleness checking
   */
  static async get(options?: {|
    forceRefresh?: boolean,
    maxAge?: number, // milliseconds
  |}): Promise<mixed> {
    const state = store.getState();
    const perAccountState = tryGetActiveAccountState(state);
    
    if (!perAccountState) {
      throw new Error('No active account state available');
    }

    const communityInfoState = perAccountState.tandaPay.communityInfoData;
    const { forceRefresh = false, maxAge = 5 * 60 * 1000 } = options || {}; // 5 minutes default

    // Check if we have fresh data
    if (!forceRefresh && communityInfoState.data && communityInfoState.lastUpdated != null) {
      const lastUpdated = communityInfoState.lastUpdated;
      const age = Date.now() - lastUpdated;
      if (age < maxAge) {
        return communityInfoState.data;
      }
    }

    // Fetch fresh data
    return this.fetch();
  }

  /**
   * Force fetch community info from contract
   */
  static async fetch(): Promise<mixed> {
    const globalState = store.getState();
    const perAccountState = tryGetActiveAccountState(globalState);
    
    if (!perAccountState) {
      throw new Error('No active account state available');
    }

    const contractAddress = getCurrentTandaPayContractAddress(perAccountState);
    
    if (contractAddress == null || contractAddress.trim() === '') {
      throw new Error('Contract address not configured');
    }

    // Set loading state
    store.dispatch(setCommunityInfoLoading(true));
    store.dispatch(setCommunityInfoError(''));

    try {
      // Get provider and create read actions
      const provider = await getProvider();
      const readActions = getTandaPayReadActions(provider, contractAddress);

      // Fetch basic community info
      const [
        paymentTokenAddress,
        memberCount,
        subgroupCount,
        claimId,
        periodId,
        totalCoverageAmount,
        basePremium,
        communityState,
        secretaryAddress,
      ] = await Promise.all([
        readActions.getPaymentTokenAddress(),
        readActions.getCurrentMemberCount(),
        readActions.getCurrentSubgroupCount(),
        readActions.getCurrentClaimId(),
        readActions.getCurrentPeriodId(),
        readActions.getTotalCoverageAmount(),
        readActions.getBasePremium(),
        readActions.getCommunityState(),
        readActions.getSecretaryAddress(),
      ]);

      const communityInfo = {
        paymentTokenAddress,
        memberCount,
        subgroupCount,
        claimId,
        periodId,
        totalCoverageAmount,
        basePremium,
        communityState,
        secretaryAddress,
        lastUpdated: Date.now(),
      };

      // Update Redux state (don't store contract address in community info)
      store.dispatch(updateCommunityInfo(communityInfo));
      store.dispatch(setCommunityInfoLoading(false));

      return communityInfo;
    } catch (error) {
      const errorMessage = error?.message || 'Failed to fetch community info';
      store.dispatch(setCommunityInfoError(errorMessage));
      store.dispatch(setCommunityInfoLoading(false));
      throw error;
    }
  }

  /**
   * Invalidate cached community info
   */
  static invalidate(): void {
    store.dispatch(invalidateCommunityInfoData());
  }

  /**
   * Check if current data is stale
   */
  static isStale(maxAge: number = 5 * 60 * 1000): boolean {
    const state = store.getState();
    const perAccountState = tryGetActiveAccountState(state);

    if (!perAccountState) {
      return true;
    }

    const communityInfoState = perAccountState.tandaPay.communityInfoData;

    if (!communityInfoState.data || communityInfoState.lastUpdated == null) {
      return true;
    }

    const lastUpdated = communityInfoState.lastUpdated;
    const age = Date.now() - lastUpdated;
    return age > maxAge;
  }

  /**
   * Get current cached data without triggering fetch
   */
  static getCached(): mixed {
    const state = store.getState();
    const perAccountState = tryGetActiveAccountState(state);

    if (!perAccountState) {
      return null;
    }

    const communityInfoState = perAccountState.tandaPay.communityInfoData;
    return communityInfoState.data;
  }
}

/**
 * React hook for accessing community info data
 */
export function useCommunityInfo(): {|
  data: mixed,
  loading: boolean,
  error: ?string,
  lastUpdated: ?number,
  isStale: boolean,
|} {
  const communityInfoState = useSelector(state => state.tandaPay.communityInfoData);

  return {
    data: communityInfoState.data,
    loading: communityInfoState.loading,
    error: communityInfoState.error,
    lastUpdated: communityInfoState.lastUpdated,
    isStale: CommunityInfoManager.isStale(),
  };
}

export default CommunityInfoManager;
