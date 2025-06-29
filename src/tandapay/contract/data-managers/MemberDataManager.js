/* @flow strict-local */

import { useSelector } from '../../../react-redux';
import store from '../../../boot/store';
import {
  invalidateMemberData,
} from '../../redux/actions';

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
    const state = store.getState().tandaPay.memberData;
    const { forceRefresh = false, maxAge = 5 * 60 * 1000 } = options || {}; // 5 minutes default

    // Check if we have fresh data
    if (!forceRefresh && state.memberBatchInfo != null && state.lastUpdated != null) {
      const lastUpdated = new Date(state.lastUpdated).getTime();
      const age = Date.now() - lastUpdated;
      if (age < maxAge) {
        return state.memberBatchInfo;
      }
    }

    // Fetch fresh data
    return this.fetch();
  }

  /**
   * Force fetch member data from contract
   */
  static async fetch(): Promise<mixed> {
    throw new Error('Legacy implementation removed - needs reimplementation');
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
    const state = store.getState().tandaPay.memberData;

    if (state.memberBatchInfo == null || state.lastUpdated == null) {
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
    const state = store.getState().tandaPay.memberData;
    return state.memberBatchInfo;
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
