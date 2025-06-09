// @flow strict-local
/* eslint-disable no-unused-vars */

/**
 * Example usage of TandaPayCommunityInfo
 *
 * This file demonstrates how to use the community information object
 * to efficiently fetch and cache TandaPay community state.
 */

import { createCommunityInfo } from './communityInfo';
import type { CommunityInfo } from './communityInfo';

/**
 * Example: Basic usage of community info fetching
 */
export async function exampleBasicUsage(provider: mixed, contractAddress: string): Promise<void> {
  // Create community info instance
  const communityInfo = createCommunityInfo({
    contractAddress,
    userAddress: '0x1234567890123456789012345678901234567890', // Optional: include user's wallet address
  });

  // Fetch community information (uses cache if available and fresh)
  // Network performance settings (cache expiration, rate limits, retry attempts)
  // are now automatically loaded from Redux state
  const info: CommunityInfo = await communityInfo.getCommunityInfo();

  // Access community-level data
  // $FlowFixMe[unused-local] - example code
  const communityState = info.communityState;
  // $FlowFixMe[unused-local] - example code
  const memberCount = info.currentMemberCount;
  // $FlowFixMe[unused-local] - example code
  const basePremium = info.basePremium;
  // $FlowFixMe[unused-local] - example code
  const secretaryAddress = info.secretaryAddress;
  // $FlowFixMe[unused-local] - example code
  const currentPeriodId = info.currentPeriodId;

  // Access current period information
  // $FlowFixMe[unused-local] - example code
  const periodCoverage = info.currentPeriodInfo.coverageAmount;
  // $FlowFixMe[unused-local] - example code
  const claimsInPeriod = info.claimIdsInCurrentPeriod.length;

  // Access user-specific data (if user address was provided)
  if (info.userMemberInfo) {
    // $FlowFixMe[unused-local] - example code
    const userMemberId = info.userMemberInfo.id;
    // $FlowFixMe[unused-local] - example code
    const hasCoverage = info.userMemberInfo.isEligibleForCoverageThisPeriod;
    // $FlowFixMe[unused-local] - example code
    const paidPremium = info.userMemberInfo.isPremiumPaidThisPeriod;
  }

  if (info.userSubgroupInfo) {
    // $FlowFixMe[unused-local] - example code
    const userSubgroupId = info.userSubgroupInfo.id;
    // $FlowFixMe[unused-local] - example code
    const subgroupIsValid = info.userSubgroupInfo.isValid;
    // $FlowFixMe[unused-local] - example code
    const subgroupMembers = info.userSubgroupInfo.members.length;
  }
}

/**
 * Example: Using cache management features
 */
export async function exampleCacheManagement(provider: mixed, contractAddress: string): Promise<void> {
  const communityInfo = createCommunityInfo({
    contractAddress,
  });

  // Check if we have cached data
  const cachedInfo = communityInfo.getCachedCommunityInfo();
  if (cachedInfo) {
    // $FlowFixMe[unused-local] - example code
    const lastUpdated = cachedInfo.lastUpdated;
    // Use cached data
  }

  // Force refresh (bypass cache)
  const freshInfo = await communityInfo.getCommunityInfo(true);
  // $FlowFixMe[unused-local] - example code
  const freshLastUpdated = freshInfo.lastUpdated;

  // Clear cache when needed
  communityInfo.clearCache();
}

/**
 * Example: Updating configuration
 */
export async function exampleConfigUpdate(provider: mixed, contractAddress: string): Promise<void> {
  const communityInfo = createCommunityInfo({
    contractAddress,
  });

  // Update configuration - only contract address and user address can be updated now
  // Network performance settings are managed through Redux state
  communityInfo.updateConfig({
    userAddress: '0x9876543210987654321098765432109876543210',
  });

  const info = await communityInfo.getCommunityInfo();
  // $FlowFixMe[unused-local] - example code
  const userInfoAvailable = info.userMemberInfo != null;
}

/**
 * Example: Rate limiting in action
 * Rate limiting is now configured through Redux network performance settings
 */
export async function exampleRateLimiting(provider: mixed, contractAddress: string): Promise<void> {
  const communityInfo = createCommunityInfo({
    contractAddress,
  });

  // Multiple calls will be automatically rate limited based on Redux settings
  // Rate limit delay is retrieved from Redux state (default: 100ms)
  const promises = [
    communityInfo.getCommunityInfo(),
    communityInfo.getCommunityInfo(),
    communityInfo.getCommunityInfo(),
  ];

  const results = await Promise.all(promises);
  // $FlowFixMe[unused-local] - example code
  const completedCalls = results.length;
}

/**
 * Example: Error handling and retries
 * Retry attempts are now configured through Redux network performance settings
 */
export async function exampleErrorHandling(provider: mixed, contractAddress: string): Promise<void> {
  const communityInfo = createCommunityInfo({
    contractAddress,
  });

  try {
    // Retry attempts are retrieved from Redux state (default: 3 attempts)
    const info = await communityInfo.getCommunityInfo();
    // $FlowFixMe[unused-local] - example code
    const success = info != null;
    // Success - use the info
  } catch (error) {
    // All retry attempts failed
    throw new Error('Failed to fetch community info after retries');
  }
}

/**
 * Example: React component integration
 */
export function exampleReactIntegration(): () => void {
  // This would be inside a React component or custom hook
  return () => {
    // Component cleanup logic would go here
  };
}

/**
 * Example: Redux integration
 */
export function exampleReduxIntegration(): mixed {
  // This would return redux actions or state
  return null;
}
