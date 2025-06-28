/* @flow strict-local */

/**
 * Batch Data Manager
 *
 * A utility for fetching batch member and subgroup information with caching and error handling.
 * This module provides a clean interface to the existing batch fetching functions from communityInfo.js
 * while adding proper serialization for React state management and consistent error handling.
 *
 * Use cases:
 * - Modal components that need to display member/subgroup lists
 * - Screens that show community overview data
 * - Any component that needs batch member or subgroup information
 *
 * Features:
 * - Automatic Redux cache checking before network requests
 * - Proper BigNumber serialization for React state
 * - Consistent error handling and user messages
 * - Loading state optimization (distinguishes cache vs network requests)
 */

import { fetchAndCacheAllMembers, fetchAndCacheAllSubgroups, invalidateCachedBatchData } from './communityInfoManager';
import type { CommunityInfo } from './communityInfoManager';
import { getCachedBatchMembers, getCachedBatchSubgroups } from '../../redux/selectors';
import { tryGetActiveAccountState } from '../../../selectors';
import { serializeBigNumbers, deserializeBigNumbers } from '../../utils/bigNumberUtils';
import TandaPayErrorHandler from '../../errors/ErrorHandler';
import type { MemberInfo, SubgroupInfo } from '../types';
import { bigNumberToNumber } from '../../TandaPayInfo';
import store from '../../../boot/store';

// Result types for batch data operations
export type BatchDataResult<T> =
  | {| success: true, data: T, fromCache: boolean |}
  | {| success: false, error: string |};

export type SerializedMemberInfo = mixed; // Serialized version of MemberInfo for React state
export type SerializedSubgroupInfo = mixed; // Serialized version of SubgroupInfo for React state

/**
 * Batch Data Manager Class
 * Provides methods for fetching member and subgroup data with caching and error handling
 */
class BatchDataManager {
  contractAddress: ?string;
  userWalletAddress: ?string;

  constructor(contractAddress: ?string, userWalletAddress: ?string) {
    this.contractAddress = contractAddress;
    this.userWalletAddress = userWalletAddress;
  }

  /**
   * Validates that required parameters are available
   */
  _validateParams(): boolean {
    return (
      this.contractAddress != null
      && this.contractAddress.trim() !== ''
      && this.userWalletAddress != null
    );
  }

  /**
   * Attempts to get cached members data from Redux
   */
  _getCachedMembersFromRedux(): ?Array<MemberInfo> {
    try {
      if (store && store.getState) {
        const reduxState = store.getState();
        const accountState = tryGetActiveAccountState(reduxState);
        if (accountState) {
          return getCachedBatchMembers(accountState);
        }
      }
      return null;
    } catch (error) {
      // Log but don't fail - we'll fetch fresh data
      return null;
    }
  }

  /**
   * Attempts to get cached subgroups data from Redux
   */
  _getCachedSubgroupsFromRedux(): ?Array<SubgroupInfo> {
    try {
      if (store && store.getState) {
        const reduxState = store.getState();
        const accountState = tryGetActiveAccountState(reduxState);
        if (accountState) {
          return getCachedBatchSubgroups(accountState);
        }
      }
      return null;
    } catch (error) {
      // Log but don't fail - we'll fetch fresh data
      return null;
    }
  }

  /**
   * Fetches members data with caching support
   * First checks Redux cache, then fetches fresh data if needed
   */
  async fetchMembersData(
    communityInfo: ?CommunityInfo
  ): Promise<BatchDataResult<SerializedMemberInfo>> {
    if (!this._validateParams()) {
      return {
        success: false,
        error: 'Missing required parameters (contract address or user wallet address)'
      };
    }

    if (!communityInfo) {
      return {
        success: false,
        error: 'Community information not available'
      };
    }

    try {
      // First try to get cached data from Redux
      const cachedMembers = this._getCachedMembersFromRedux();
      if (cachedMembers) {
        // $FlowFixMe[incompatible-call] - serializeBigNumbers handles the type conversion
        return {
          success: true,
          data: serializeBigNumbers(cachedMembers),
          fromCache: true
        };
      }

      // No cached data available, fetch fresh data
      const memberCount = bigNumberToNumber(communityInfo.currentMemberCount);

      if (memberCount === 0) {
        return {
          success: true,
          data: serializeBigNumbers([]),
          fromCache: false
        };
      }

      // Fetch and cache members data
      const result = await fetchAndCacheAllMembers(this.contractAddress, this.userWalletAddress);

      if (result.success) {
        // $FlowFixMe[incompatible-call] - serializeBigNumbers handles the type conversion
        return {
          success: true,
          data: serializeBigNumbers(result.data),
          fromCache: false
        };
      } else {
        const errorMessage = (result.error.userMessage != null && result.error.userMessage.trim() !== '')
          ? result.error.userMessage
          : 'Failed to fetch members';
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (err) {
      // Create structured error for member data fetch failure
      const errorMessage = err?.message || 'Failed to fetch members';

      TandaPayErrorHandler.createError(
        'CONTRACT_ERROR',
        `Failed to fetch member data: ${errorMessage}`,
        {
          userMessage: 'Unable to load member information. Please try again.',
          details: {
            contractAddress: this.contractAddress,
            memberCount: communityInfo ? bigNumberToNumber(communityInfo.currentMemberCount) : 'unknown',
            error: err
          }
        }
      );

      return {
        success: false,
        error: 'Unable to load member information. Please try again.'
      };
    }
  }

  /**
   * Fetches subgroups data with caching support
   * First checks Redux cache, then fetches fresh data if needed
   */
  async fetchSubgroupsData(
    communityInfo: ?CommunityInfo
  ): Promise<BatchDataResult<SerializedSubgroupInfo>> {
    if (!this._validateParams()) {
      return {
        success: false,
        error: 'Missing required parameters (contract address or user wallet address)'
      };
    }

    if (!communityInfo) {
      return {
        success: false,
        error: 'Community information not available'
      };
    }

    try {
      // First try to get cached data from Redux
      const cachedSubgroups = this._getCachedSubgroupsFromRedux();
      if (cachedSubgroups) {
        // $FlowFixMe[incompatible-call] - serializeBigNumbers handles the type conversion
        return {
          success: true,
          data: serializeBigNumbers(cachedSubgroups),
          fromCache: true
        };
      }

      // No cached data available, fetch fresh data
      const subgroupCount = bigNumberToNumber(communityInfo.currentSubgroupCount);

      if (subgroupCount === 0) {
        return {
          success: true,
          data: serializeBigNumbers([]),
          fromCache: false
        };
      }

      // Fetch and cache subgroups data
      const result = await fetchAndCacheAllSubgroups(this.contractAddress, this.userWalletAddress);

      if (result.success) {
        // $FlowFixMe[incompatible-call] - serializeBigNumbers handles the type conversion
        return {
          success: true,
          data: serializeBigNumbers(result.data),
          fromCache: false
        };
      } else {
        const errorMessage = (result.error.userMessage != null && result.error.userMessage.trim() !== '')
          ? result.error.userMessage
          : 'Failed to fetch subgroups';
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (err) {
      // Create structured error for subgroup data fetch failure
      const errorMessage = err?.message || 'Failed to fetch subgroups';

      TandaPayErrorHandler.createError(
        'CONTRACT_ERROR',
        `Failed to fetch subgroup data: ${errorMessage}`,
        {
          userMessage: 'Unable to load subgroup information. Please try again.',
          details: {
            contractAddress: this.contractAddress,
            subgroupCount: communityInfo ? bigNumberToNumber(communityInfo.currentSubgroupCount) : 'unknown',
            error: err
          }
        }
      );

      return {
        success: false,
        error: 'Unable to load subgroup information. Please try again.'
      };
    }
  }

  /**
   * Invalidates all cached batch data to force fresh fetch
   */
  invalidateCache(): void {
    invalidateCachedBatchData();
  }
}

/**
 * Creates a new BatchDataManager instance
 */
export function createBatchDataManager(
  contractAddress: ?string,
  userWalletAddress: ?string
): BatchDataManager {
  return new BatchDataManager(contractAddress, userWalletAddress);
}

/**
 * Deserializes member data from React state back to proper MemberInfo objects
 *
 * Use this when you need to work with member data that was fetched using fetchBatchMembersData.
 * The serialized data cannot be used directly - it must be deserialized first.
 *
 * @param serializedData - Serialized member data from React state
 * @returns Properly typed MemberInfo array or null
 */
export function deserializeMembersData(serializedData: ?SerializedMemberInfo): ?Array<MemberInfo> {
  if (serializedData == null) {
    return null;
  }
  // $FlowFixMe[incompatible-cast] - deserializeBigNumbers handles the type conversion
  return (deserializeBigNumbers(serializedData): Array<MemberInfo>);
}

/**
 * Deserializes subgroup data from React state back to proper SubgroupInfo objects
 *
 * Use this when you need to work with subgroup data that was fetched using fetchBatchSubgroupsData.
 * The serialized data cannot be used directly - it must be deserialized first.
 *
 * @param serializedData - Serialized subgroup data from React state
 * @returns Properly typed SubgroupInfo array or null
 */
export function deserializeSubgroupsData(serializedData: ?SerializedSubgroupInfo): ?Array<SubgroupInfo> {
  if (serializedData == null) {
    return null;
  }
  // $FlowFixMe[incompatible-cast] - deserializeBigNumbers handles the type conversion
  return (deserializeBigNumbers(serializedData): Array<SubgroupInfo>);
}

/**
 * Convenience function to fetch member data using batch data manager
 *
 * This is the primary interface for getting member information across the app.
 * Automatically handles caching, serialization, and error handling.
 *
 * @param contractAddress - TandaPay contract address
 * @param userWalletAddress - Current user's wallet address
 * @param communityInfo - Current community information (for member count)
 * @returns Promise with serialized member data or error
 */
export async function fetchBatchMembersData(
  contractAddress: ?string,
  userWalletAddress: ?string,
  communityInfo: ?CommunityInfo
): Promise<BatchDataResult<SerializedMemberInfo>> {
  const manager = createBatchDataManager(contractAddress, userWalletAddress);
  return manager.fetchMembersData(communityInfo);
}

/**
 * Convenience function to fetch subgroup data using batch data manager
 *
 * This is the primary interface for getting subgroup information across the app.
 * Automatically handles caching, serialization, and error handling.
 *
 * @param contractAddress - TandaPay contract address
 * @param userWalletAddress - Current user's wallet address
 * @param communityInfo - Current community information (for subgroup count)
 * @returns Promise with serialized subgroup data or error
 */
export async function fetchBatchSubgroupsData(
  contractAddress: ?string,
  userWalletAddress: ?string,
  communityInfo: ?CommunityInfo
): Promise<BatchDataResult<SerializedSubgroupInfo>> {
  const manager = createBatchDataManager(contractAddress, userWalletAddress);
  return manager.fetchSubgroupsData(communityInfo);
}
