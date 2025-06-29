/* @flow strict-local */

import { useSelector } from '../../../react-redux';
import store from '../../../boot/store';
import {
  invalidateSubgroupData,
} from '../../redux/actions';

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
    const state = store.getState().tandaPay.subgroupData;
    const { forceRefresh = false, maxAge = 5 * 60 * 1000 } = options || {}; // 5 minutes default

    // Check if we have fresh data
    if (!forceRefresh && state.subgroupBatchInfo != null && state.lastUpdated != null) {
      const lastUpdated = new Date(state.lastUpdated).getTime();
      const age = Date.now() - lastUpdated;
      if (age < maxAge) {
        return state.subgroupBatchInfo;
      }
    }

    // Fetch fresh data
    return this.fetch();
  }

  /**
   * Force fetch subgroup data from contract
   */
  static async fetch(): Promise<mixed> {
    throw new Error('Legacy implementation removed - needs reimplementation');
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
    const state = store.getState().tandaPay.subgroupData;

    if (state.subgroupBatchInfo == null || state.lastUpdated == null) {
      return true;
    }

    const lastUpdated = new Date(state.lastUpdated).getTime();
    const age = Date.now() - lastUpdated;
    return age > maxAge;
  }

  /**
   * Get current cached data without triggering fetch
   */
  static getCached(): mixed {
    const state = store.getState().tandaPay.subgroupData;
    return state.subgroupBatchInfo;
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
