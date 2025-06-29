/* @flow strict-local */

import { useSelector } from '../../../react-redux';
import store from '../../../boot/store';
import {
  invalidateSubgroupData,
  updateSubgroupData,
} from '../../redux/actions';
import { getCurrentTandaPayContractAddress } from '../../redux/selectors';
import { tryGetActiveAccountState } from '../../../account/accountsSelectors';
import { getProvider } from '../../web3';
import { getTandaPayReadActions } from '../tandapay-reader/read';

/**
 * Centralized manager for subgroup batch data
 * Handles fetching, caching, and invalidation of subgroup information
 */
class SubgroupDataManager {
  /**
   * Get subgroup data with automatic staleness checking
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

    const subgroupDataState = perAccountState.tandaPay.subgroupData;
    const { forceRefresh = false, maxAge = 5 * 60 * 1000 } = options || {}; // 5 minutes default

    // Check if we have fresh data
    if (!forceRefresh && subgroupDataState.subgroupBatchInfo != null && subgroupDataState.lastUpdated != null) {
      const lastUpdated = new Date(subgroupDataState.lastUpdated).getTime();
      const age = Date.now() - lastUpdated;
      if (age < maxAge) {
        return subgroupDataState.subgroupBatchInfo;
      }
    }

    // Fetch fresh data
    return this.fetch();
  }

  /**
   * Force fetch subgroup data from contract
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
    store.dispatch(updateSubgroupData(null, true, null));

    try {
      // Get provider and create read actions
      const provider = await getProvider();
      const readActions = getTandaPayReadActions(provider, contractAddress);

      // First get subgroup count to know how many subgroups to fetch
      const subgroupCount = await readActions.getCurrentSubgroupCount();
      // $FlowFixMe[incompatible-use] - BigNumber conversion
      const subgroupCountNum = parseInt(subgroupCount.toString(), 10);

      if (subgroupCountNum === 0) {
        // No subgroups to fetch
        const subgroupBatchInfo = [];
        store.dispatch(updateSubgroupData(subgroupBatchInfo, false, null));
        return subgroupBatchInfo;
      }

      // Batch fetch all subgroup info
      const batchResult = await readActions.batchGetAllSubgroupInfo(subgroupCountNum);
      
      if (!batchResult.success) {
        throw new Error(batchResult.error.message || 'Failed to fetch subgroup data');
      }

      const subgroupBatchInfo = batchResult.data;

      // Update Redux state
      store.dispatch(updateSubgroupData(subgroupBatchInfo, false, null));

      return subgroupBatchInfo;
    } catch (error) {
      const errorMessage = error?.message || 'Failed to fetch subgroup data';
      store.dispatch(updateSubgroupData(null, false, errorMessage));
      throw error;
    }
  }

  /**
   * Invalidate cached subgroup data
   */
  static invalidate(): void {
    store.dispatch(invalidateSubgroupData());
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

    const subgroupDataState = perAccountState.tandaPay.subgroupData;

    if (subgroupDataState.subgroupBatchInfo == null || subgroupDataState.lastUpdated == null) {
      return true;
    }

    const lastUpdated = new Date(subgroupDataState.lastUpdated).getTime();
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

    const subgroupDataState = perAccountState.tandaPay.subgroupData;
    return subgroupDataState.subgroupBatchInfo;
  }
}

/**
 * React hook for accessing subgroup data
 */
export function useSubgroupData(): {|
  data: mixed,
  loading: boolean,
  error: ?string,
  lastUpdated: ?string,
  isStale: boolean,
|} {
  const subgroupDataState = useSelector(state => state.tandaPay.subgroupData);

  return {
    data: subgroupDataState.subgroupBatchInfo,
    loading: subgroupDataState.isLoading,
    error: subgroupDataState.error,
    lastUpdated: subgroupDataState.lastUpdated,
    isStale: SubgroupDataManager.isStale(),
  };
}

export default SubgroupDataManager;
