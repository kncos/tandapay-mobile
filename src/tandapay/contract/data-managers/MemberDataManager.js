/* @flow strict-local */

import { useSelector } from '../../../react-redux';
import store from '../../../boot/store';
import {
  invalidateMemberData,
  updateMemberData,
} from '../../redux/actions';
import { getCurrentTandaPayContractAddress } from '../../redux/selectors';
import { tryGetActiveAccountState } from '../../../account/accountsSelectors';
import { getProvider } from '../../web3';
import { getTandaPayReadActions } from '../tandapay-reader/read';

/**
 * Centralized manager for member batch data
 * Handles fetching, caching, and invalidation of member information
 */
class MemberDataManager {
  /**
   * Get member data with automatic staleness checking
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

    const memberDataState = perAccountState.tandaPay.memberData;
    const { forceRefresh = false, maxAge = 5 * 60 * 1000 } = options || {}; // 5 minutes default

    // Check if we have fresh data
    if (!forceRefresh && memberDataState.memberBatchInfo != null && memberDataState.lastUpdated != null) {
      const lastUpdated = new Date(memberDataState.lastUpdated).getTime();
      const age = Date.now() - lastUpdated;
      if (age < maxAge) {
        return memberDataState.memberBatchInfo;
      }
    }

    // Fetch fresh data
    return this.fetch();
  }

  /**
   * Force fetch member data from contract
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
    store.dispatch(updateMemberData(null, true, null));

    try {
      // Get provider and create read actions
      const provider = await getProvider();
      const readActions = getTandaPayReadActions(provider, contractAddress);

      // First get member count to know how many members to fetch
      const memberCount = await readActions.getCurrentMemberCount();
      // $FlowFixMe[incompatible-use] - BigNumber conversion
      const memberCountNum = parseInt(memberCount.toString(), 10);

      if (memberCountNum === 0) {
        // No members to fetch
        const memberBatchInfo = [];
        store.dispatch(updateMemberData(memberBatchInfo, false, null));
        return memberBatchInfo;
      }

      // Batch fetch all member info
      const batchResult = await readActions.batchGetAllMemberInfo(memberCountNum);
      
      if (!batchResult.success) {
        throw new Error(batchResult.error.message || 'Failed to fetch member data');
      }

      const memberBatchInfo = batchResult.data;

      // Update Redux state
      store.dispatch(updateMemberData(memberBatchInfo, false, null));

      return memberBatchInfo;
    } catch (error) {
      const errorMessage = error?.message || 'Failed to fetch member data';
      store.dispatch(updateMemberData(null, false, errorMessage));
      throw error;
    }
  }

  /**
   * Invalidate cached member data
   */
  static invalidate(): void {
    store.dispatch(invalidateMemberData());
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

    const memberDataState = perAccountState.tandaPay.memberData;

    if (memberDataState.memberBatchInfo == null || memberDataState.lastUpdated == null) {
      return true;
    }

    const lastUpdated = new Date(memberDataState.lastUpdated).getTime();
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

    const memberDataState = perAccountState.tandaPay.memberData;
    return memberDataState.memberBatchInfo;
  }
}

/**
 * React hook for accessing member data
 */
export function useMemberData(): {|
  data: mixed,
  loading: boolean,
  error: ?string,
  lastUpdated: ?string,
  isStale: boolean,
|} {
  const memberDataState = useSelector(state => state.tandaPay.memberData);

  return {
    data: memberDataState.memberBatchInfo,
    loading: memberDataState.isLoading,
    error: memberDataState.error,
    lastUpdated: memberDataState.lastUpdated,
    isStale: MemberDataManager.isStale(),
  };
}

export default MemberDataManager;
