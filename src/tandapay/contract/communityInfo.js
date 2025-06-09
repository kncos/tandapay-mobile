// @flow

import { getTandaPayReadActions } from './read';

import type {
  TandaPayStateType,
} from './types';

// Flow type for ethers BigNumber - using mixed since ethers is not Flow-typed
type BigNumber = mixed;

// Configuration type for the community info class
type CommunityInfoConfig = {
  contractAddress: string,
  provider: any, // ethers provider
  userAddress?: ?string,
  cacheExpirationMs?: number,
  rateLimitDelayMs?: number,
  retryAttempts?: number,
  useMulticall?: boolean,
};

// Comprehensive community information type
export type CommunityInfo = {
  paymentTokenAddress: string,
  currentMemberCount: BigNumber,
  currentSubgroupCount: BigNumber,
  currentClaimId: BigNumber,
  currentPeriodId: BigNumber,
  totalCoverageAmount: BigNumber,
  basePremium: BigNumber,
  communityState: TandaPayStateType,
  secretaryAddress: string,
  secretarySuccessorList: Array<string>,
  currentPeriodInfo: {
    startTimestamp: BigNumber,
    endTimestamp: BigNumber,
    coverageAmount: BigNumber,
    totalPremiumsPaid: BigNumber,
    claimIds: Array<BigNumber>,
  },
  claimIdsInCurrentPeriod: Array<BigNumber>,
  whitelistedClaimIdsInCurrentPeriod: Array<BigNumber>,
  userMemberInfo: ?{
    id: BigNumber,
    subgroupId: BigNumber,
    walletAddress: string,
    communityEscrowAmount: BigNumber,
    savingsEscrowAmount: BigNumber,
    pendingRefundAmount: BigNumber,
    availableToWithdrawAmount: BigNumber,
    isEligibleForCoverageThisPeriod: boolean,
    isPremiumPaidThisPeriod: boolean,
    queuedRefundAmountThisPeriod: BigNumber,
    memberStatus: number,
    assignmentStatus: number,
  },
  userSubgroupInfo: ?{
    id: BigNumber,
    members: Array<string>,
    isValid: boolean,
  },
  lastUpdated: number,
};

// Cache entry type
type CacheEntry = {
  data: CommunityInfo,
  timestamp: number,
};

/**
 * TandaPay Community Information Service
 *
 * This class provides a high-level interface for fetching comprehensive
 * community information from a TandaPay contract, with built-in caching,
 * rate limiting, and error handling.
 */
class TandaPayCommunityInfo {
  config: CommunityInfoConfig;
  readActions: any;
  cache: Map<string, CacheEntry>;
  multicall: any;

  constructor(config: CommunityInfoConfig) {
    this.config = {
      cacheExpirationMs: 30000, // 30 seconds default
      rateLimitDelayMs: 100, // 100ms between calls
      retryAttempts: 3,
      useMulticall: false, // Disabled to avoid Flow type issues
      ...config,
    };

    this.readActions = getTandaPayReadActions(
      this.config.provider,
      this.config.contractAddress
    );

    this.cache = new Map();
    this.multicall = null;

    // Initialize multicall if enabled
    if (this.config.useMulticall) {
      this.initializeMulticall();
    }
  }

  /**
   * Initialize multicall functionality
   */
  async initializeMulticall(): Promise<void> {
    // Disabled to avoid Flow type issues with dynamic imports
    this.multicall = null;
  }

  /**
   * Rate-limited contract call wrapper
   */
  async rateLimitedContractCall(methodName: string, args?: Array<any>): Promise<any> {
    const rateLimitDelay = this.config.rateLimitDelayMs;
    if (rateLimitDelay != null && rateLimitDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
    }

    const method = this.readActions[methodName];
    if (typeof method !== 'function') {
      throw new Error(`Method ${methodName} not found on read actions`);
    }

    let lastError: Error;
    const maxRetries = this.config.retryAttempts != null ? this.config.retryAttempts : 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (args != null) {
          return await method(...args);
        } else {
          return await method();
        }
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    throw lastError;
  }

  /**
   * Get comprehensive community information
   */
  async getCommunityInfo(forceRefresh?: boolean): Promise<CommunityInfo> {
    const shouldForceRefresh = forceRefresh || false;
    const cacheKey = `community_${this.config.contractAddress}_${this.config.userAddress || 'anonymous'}`;

    // Check cache first unless force refresh is requested
    if (!shouldForceRefresh) {
      const cached = this.cache.get(cacheKey);
      const cacheExpiration = this.config.cacheExpirationMs != null ? this.config.cacheExpirationMs : 30000;
      if (cached && (Date.now() - cached.timestamp) < cacheExpiration) {
        return cached.data;
      }
    }

    // Fetch all basic information in parallel
    const [
      paymentTokenAddress,
      currentMemberCount,
      currentSubgroupCount,
      currentClaimId,
      currentPeriodId,
      totalCoverageAmount,
      basePremium,
      communityState,
      secretaryAddress,
      secretarySuccessorList,
    ] = await Promise.all([
      this.rateLimitedContractCall('getPaymentTokenAddress'),
      this.rateLimitedContractCall('getCurrentMemberCount'),
      this.rateLimitedContractCall('getCurrentSubgroupCount'),
      this.rateLimitedContractCall('getCurrentClaimId'),
      this.rateLimitedContractCall('getCurrentPeriodId'),
      this.rateLimitedContractCall('getTotalCoverageAmount'),
      this.rateLimitedContractCall('getBasePremium'),
      this.rateLimitedContractCall('getCommunityState'),
      this.rateLimitedContractCall('getSecretaryAddress'),
      this.rateLimitedContractCall('getSecretarySuccessorList'),
    ]);

    // Fetch period-specific information
    const [periodInfo, claimIdsInPeriod, whitelistedClaimIds] = await Promise.all([
      this.rateLimitedContractCall('getPeriodInfo', [currentPeriodId]),
      this.rateLimitedContractCall('getClaimIdsInPeriod', [currentPeriodId]),
      this.rateLimitedContractCall('getWhitelistedClaimIdsInPeriod', [currentPeriodId]),
    ]);

    // Build current period info - safe null checks
    const currentPeriodInfo = {
      startTimestamp: (periodInfo != null && periodInfo.startTimestamp != null) ? periodInfo.startTimestamp : 0,
      endTimestamp: (periodInfo != null && periodInfo.endTimestamp != null) ? periodInfo.endTimestamp : 0,
      coverageAmount: (periodInfo != null && periodInfo.coverageAmount != null) ? periodInfo.coverageAmount : 0,
      totalPremiumsPaid: (periodInfo != null && periodInfo.totalPremiumsPaid != null) ? periodInfo.totalPremiumsPaid : 0,
      claimIds: (periodInfo != null && periodInfo.claimIds != null) ? periodInfo.claimIds : [],
    };

    // Initialize user info as null
    let userMemberInfo = null;
    let userSubgroupInfo = null;

    // Fetch user-specific information if user address is provided
    if (this.config.userAddress != null) {
      try {
        const memberInfo = await this.rateLimitedContractCall('getMemberInfoFromAddress', [
          this.config.userAddress,
          0 // current period
        ]);

        if (memberInfo != null && memberInfo !== false && this.config.userAddress != null) {
          userMemberInfo = {
            id: (memberInfo.id != null) ? memberInfo.id : 0,
            subgroupId: (memberInfo.subgroupId != null) ? memberInfo.subgroupId : 0,
            walletAddress: (memberInfo.walletAddress != null) ? memberInfo.walletAddress : this.config.userAddress,
            communityEscrowAmount: (memberInfo.communityEscrowAmount != null) ? memberInfo.communityEscrowAmount : 0,
            savingsEscrowAmount: (memberInfo.savingsEscrowAmount != null) ? memberInfo.savingsEscrowAmount : 0,
            pendingRefundAmount: (memberInfo.pendingRefundAmount != null) ? memberInfo.pendingRefundAmount : 0,
            availableToWithdrawAmount: (memberInfo.availableToWithdrawAmount != null) ? memberInfo.availableToWithdrawAmount : 0,
            isEligibleForCoverageThisPeriod: (memberInfo.isEligibleForCoverageThisPeriod != null) ? memberInfo.isEligibleForCoverageThisPeriod : false,
            isPremiumPaidThisPeriod: (memberInfo.isPremiumPaidThisPeriod != null) ? memberInfo.isPremiumPaidThisPeriod : false,
            queuedRefundAmountThisPeriod: (memberInfo.queuedRefundAmountThisPeriod != null) ? memberInfo.queuedRefundAmountThisPeriod : 0,
            memberStatus: (memberInfo.memberStatus != null) ? memberInfo.memberStatus : 0,
            assignmentStatus: (memberInfo.assignmentStatus != null) ? memberInfo.assignmentStatus : 0,
          };

          // Fetch subgroup information if user has a subgroup
          const subgroupIdNum = memberInfo.subgroupId;
          if (subgroupIdNum != null && subgroupIdNum !== false && subgroupIdNum > 0) {
            try {
              const subgroupInfo = await this.rateLimitedContractCall('getSubgroupInfo', [subgroupIdNum]);
              if (subgroupInfo != null && subgroupInfo !== false) {
                userSubgroupInfo = {
                  id: subgroupIdNum,
                  members: (subgroupInfo.members != null) ? subgroupInfo.members : [],
                  isValid: (subgroupInfo.isValid != null) ? subgroupInfo.isValid : false,
                };
              }
            } catch (subgroupError) {
              // Subgroup fetch failed, but continue with null subgroup info
            }
          }
        }
      } catch (memberError) {
        // Member info fetch failed, continue with null user info
      }
    }

    // Build the final community info object with safe null checks
    const communityInfo: CommunityInfo = {
      paymentTokenAddress: (paymentTokenAddress != null) ? String(paymentTokenAddress) : '',
      currentMemberCount: (currentMemberCount != null) ? currentMemberCount : 0,
      currentSubgroupCount: (currentSubgroupCount != null) ? currentSubgroupCount : 0,
      currentClaimId: (currentClaimId != null) ? currentClaimId : 0,
      currentPeriodId: (currentPeriodId != null) ? currentPeriodId : 0,
      totalCoverageAmount: (totalCoverageAmount != null) ? totalCoverageAmount : 0,
      basePremium: (basePremium != null) ? basePremium : 0,
      communityState: (communityState != null) ? communityState : 0,
      secretaryAddress: (secretaryAddress != null) ? String(secretaryAddress) : '',
      secretarySuccessorList: (secretarySuccessorList != null) ? secretarySuccessorList : [],
      currentPeriodInfo,
      claimIdsInCurrentPeriod: (claimIdsInPeriod != null) ? claimIdsInPeriod : [],
      whitelistedClaimIdsInCurrentPeriod: (whitelistedClaimIds != null) ? whitelistedClaimIds : [],
      userMemberInfo,
      userSubgroupInfo,
      lastUpdated: Date.now(),
    };

    // Cache the result
    this.cache.set(cacheKey, {
      data: communityInfo,
      timestamp: Date.now(),
    });

    return communityInfo;
  }

  /**
   * Get cached community information if available
   */
  getCachedCommunityInfo(): ?CommunityInfo {
    const cacheKey = `community_${this.config.contractAddress}_${this.config.userAddress || 'anonymous'}`;
    const cached = this.cache.get(cacheKey);
    const cacheExpiration = this.config.cacheExpirationMs != null ? this.config.cacheExpirationMs : 30000;

    if (cached && (Date.now() - cached.timestamp) < cacheExpiration) {
      return cached.data;
    }

    return null;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: $Shape<CommunityInfoConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // If contract address or provider changed, recreate read actions
    if (newConfig.contractAddress != null || newConfig.provider != null) {
      this.readActions = getTandaPayReadActions(
        this.config.provider,
        this.config.contractAddress
      );
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): CommunityInfoConfig {
    return { ...this.config };
  }

  /**
   * Perform a batch of contract calls efficiently
   */
  async batchCalls(calls: Array<{method: string, args?: Array<any>}>): Promise<Array<any>> {
    const results = [];

    for (const call of calls) {
      try {
        const result = await this.rateLimitedContractCall(call.method, call.args);
        results.push(result);
      } catch (error) {
        results.push(null);
      }
    }

    return results;
  }
}

/**
 * Factory function to create a new TandaPay Community Info instance
 */
export function createCommunityInfo(config: CommunityInfoConfig): TandaPayCommunityInfo {
  return new TandaPayCommunityInfo(config);
}

/**
 * Convenience function to quickly fetch community info with minimal configuration
 */
export async function fetchCommunityInfo(
  contractAddress: string,
  provider: any,
  userAddress?: ?string
): Promise<CommunityInfo> {
  const communityInfo = createCommunityInfo({
    contractAddress,
    provider,
    userAddress,
  });

  return communityInfo.getCommunityInfo();
}
