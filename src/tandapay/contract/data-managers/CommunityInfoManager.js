/* @flow strict-local */

import { useSelector } from '../../../react-redux';
import store from '../../../boot/store';
import {
  invalidateCommunityInfoData,
} from '../../redux/actions';

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
    const state = store.getState().tandaPay.communityInfoData;
    const { forceRefresh = false, maxAge = 5 * 60 * 1000 } = options || {}; // 5 minutes default

    // Check if we have fresh data
    if (!forceRefresh && state.data && state.lastUpdated != null) {
      const lastUpdated = state.lastUpdated;
      const age = Date.now() - lastUpdated;
      if (age < maxAge) {
        return state.data;
      }
    }

    // Fetch fresh data
    return this.fetch();
  }

  /**
   * Force fetch community info from contract
   */
  static async fetch(): Promise<mixed> {
    throw new Error('Legacy implementation removed - needs reimplementation');
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
    const state = store.getState().tandaPay.communityInfoData;

    if (!state.data || state.lastUpdated == null) {
      return true;
    }

    const lastUpdated = state.lastUpdated;
    const age = Date.now() - lastUpdated;
    return age > maxAge;
  }

  /**
   * Get current cached data without triggering fetch
   */
  static getCached(): mixed {
    const state = store.getState().tandaPay.communityInfoData;
    return state.data;
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
