/* @flow */

// $FlowFixMe[untyped-import] - ethereum-multicall is a third-party library
import { Multicall } from 'ethereum-multicall';
import type { BigNumber, PeriodInfo, MemberInfo, SubgroupInfo, TandaPayStateType } from './types';
import { getProvider } from '../web3';
import { getTandaPayReadActions } from './read';
import { TandaPayInfo } from './TandaPay';
import { getTandaPayNetworkPerformance } from '../redux/selectors';
import { tryGetActiveAccountState } from '../../selectors';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import type { TandaPayResult } from '../errors/types';
import store from '../../boot/store';

// Configuration type for the community info class
type CommunityInfoConfig = {
  contractAddress: string,
  userAddress?: ?string,
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
  currentPeriodInfo: PeriodInfo,
  claimIdsInCurrentPeriod: Array<BigNumber>,
  whitelistedClaimIdsInCurrentPeriod: Array<BigNumber>,
  userMemberInfo: ?MemberInfo,
  userSubgroupInfo: ?SubgroupInfo,
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
    this.config = config;

    this.readActions = getTandaPayReadActions(
      getProvider(),
      this.config.contractAddress
    );

    this.cache = new Map();
    this.multicall = new Multicall({ web3Instance: getProvider(), tryAggregate: true });
  }

  /**
   * Get network performance settings from Redux state
   */
  getNetworkPerformanceSettings(): {| cacheExpirationMs: number, rateLimitDelayMs: number, retryAttempts: number |} {
    try {
      const globalState = store.getState();
      const perAccountState = tryGetActiveAccountState(globalState);
      if (perAccountState) {
        return getTandaPayNetworkPerformance(perAccountState);
      }
    } catch (error) {
      // Fallback to defaults if Redux state is not accessible
    }

    // Default fallback values
    return {
      cacheExpirationMs: 30000,
      rateLimitDelayMs: 100,
      retryAttempts: 3,
    };
  }

  /**
   * Rate-limited contract call wrapper
   */
  async rateLimitedContractCall(methodName: string, args?: Array<any>): Promise<any> {
    const performanceSettings = this.getNetworkPerformanceSettings();
    const rateLimitDelay = performanceSettings.rateLimitDelayMs;
    if (rateLimitDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
    }

    const method = this.readActions[methodName];
    if (typeof method !== 'function') {
      throw TandaPayErrorHandler.createContractError(
        `Method ${methodName} not found on read actions`,
        'Contract method not available. Please check the contract configuration.'
      );
    }

    let lastError: Error;
    const maxRetries = performanceSettings.retryAttempts;
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
   * Get comprehensive community information using multicall for efficiency
   */
  async getCommunityInfo(forceRefresh?: boolean): Promise<CommunityInfo> {
    const shouldForceRefresh = forceRefresh || false;
    const cacheKey = `community_${this.config.contractAddress}_${this.config.userAddress ?? 'anonymous'}`;

    // Check cache first unless force refresh is requested
    if (!shouldForceRefresh) {
      const cached = this.cache.get(cacheKey);
      const performanceSettings = this.getNetworkPerformanceSettings();
      const cacheExpiration = performanceSettings.cacheExpirationMs;
      if (cached && (Date.now() - cached.timestamp) < cacheExpiration) {
        return cached.data;
      }
    }

    // Use multicall to batch basic information calls
    const basicCalls = [
      { reference: 'paymentTokenAddress', methodName: 'getPaymentTokenAddress', methodParameters: [] },
      { reference: 'currentMemberCount', methodName: 'getCurrentMemberCount', methodParameters: [] },
      { reference: 'currentSubgroupCount', methodName: 'getCurrentSubgroupCount', methodParameters: [] },
      { reference: 'currentClaimId', methodName: 'getCurrentClaimId', methodParameters: [] },
      { reference: 'currentPeriodId', methodName: 'getCurrentPeriodId', methodParameters: [] },
      { reference: 'totalCoverageAmount', methodName: 'getTotalCoverageAmount', methodParameters: [] },
      { reference: 'basePremium', methodName: 'getBasePremium', methodParameters: [] },
      { reference: 'communityState', methodName: 'getCommunityState', methodParameters: [] },
      { reference: 'secretaryAddress', methodName: 'getSecretaryAddress', methodParameters: [] },
      { reference: 'secretarySuccessorList', methodName: 'getSecretarySuccessorList', methodParameters: [] },
    ];

    const basicContractCallContext = {
      reference: 'tandaPayContract',
      contractAddress: this.config.contractAddress,
      abi: TandaPayInfo.abi,
      calls: basicCalls,
    };

    const basicResults = await this.multicall.call([basicContractCallContext]);
    const basicData = basicResults.results.tandaPayContract.callsReturnContext;

    // Extract basic results
    const currentPeriodId = basicData.find(call => call.reference === 'currentPeriodId')?.returnValues[0];

    // Fetch period-specific information using multicall
    const periodCalls = [
      { reference: 'periodInfo', methodName: 'getPeriodInfo', methodParameters: [currentPeriodId] },
      { reference: 'claimIdsInPeriod', methodName: 'getClaimIdsInPeriod', methodParameters: [currentPeriodId] },
      { reference: 'whitelistedClaimIds', methodName: 'getWhitelistedClaimIdsInPeriod', methodParameters: [currentPeriodId] },
    ];

    const periodContractCallContext = {
      reference: 'tandaPayContract',
      contractAddress: this.config.contractAddress,
      abi: TandaPayInfo.abi,
      calls: periodCalls,
    };

    const periodResults = await this.multicall.call([periodContractCallContext]);
    const periodData = periodResults.results.tandaPayContract.callsReturnContext;

    // Extract period results
    const periodInfo = periodData.find(call => call.reference === 'periodInfo')?.returnValues[0];
    const claimIdsInPeriod = periodData.find(call => call.reference === 'claimIdsInPeriod')?.returnValues;
    const whitelistedClaimIds = periodData.find(call => call.reference === 'whitelistedClaimIds')?.returnValues;

    // Extract basic data values from multicall results
    const paymentTokenAddress = basicData.find(call => call.reference === 'paymentTokenAddress')?.returnValues[0];
    const currentMemberCount = basicData.find(call => call.reference === 'currentMemberCount')?.returnValues[0];
    const currentSubgroupCount = basicData.find(call => call.reference === 'currentSubgroupCount')?.returnValues[0];
    const currentClaimId = basicData.find(call => call.reference === 'currentClaimId')?.returnValues[0];
    const totalCoverageAmount = basicData.find(call => call.reference === 'totalCoverageAmount')?.returnValues[0];
    const basePremium = basicData.find(call => call.reference === 'basePremium')?.returnValues[0];
    const communityState = basicData.find(call => call.reference === 'communityState')?.returnValues[0];
    const secretaryAddress = basicData.find(call => call.reference === 'secretaryAddress')?.returnValues[0];
    const secretarySuccessorList = basicData.find(call => call.reference === 'secretarySuccessorList')?.returnValues;

    // Build current period info - safe null checks
    const currentPeriodInfo = {
      startTimestamp: periodInfo?.startTimestamp ?? 0,
      endTimestamp: periodInfo?.endTimestamp ?? 0,
      coverageAmount: periodInfo?.coverageAmount ?? 0,
      totalPremiumsPaid: periodInfo?.totalPremiumsPaid ?? 0,
      claimIds: periodInfo?.claimIds ?? [],
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
            id: memberInfo.id ?? 0,
            subgroupId: memberInfo.subgroupId ?? 0,
            walletAddress: memberInfo.walletAddress ?? this.config.userAddress,
            communityEscrowAmount: memberInfo.communityEscrowAmount ?? 0,
            savingsEscrowAmount: memberInfo.savingsEscrowAmount ?? 0,
            pendingRefundAmount: memberInfo.pendingRefundAmount ?? 0,
            availableToWithdrawAmount: memberInfo.availableToWithdrawAmount ?? 0,
            isEligibleForCoverageThisPeriod: memberInfo.isEligibleForCoverageThisPeriod ?? false,
            isPremiumPaidThisPeriod: memberInfo.isPremiumPaidThisPeriod ?? false,
            queuedRefundAmountThisPeriod: memberInfo.queuedRefundAmountThisPeriod ?? 0,
            memberStatus: memberInfo.memberStatus ?? 0,
            assignmentStatus: memberInfo.assignmentStatus ?? 0,
          };

          // Fetch subgroup information if user has a subgroup
          const subgroupIdNum = memberInfo.subgroupId;
          if (subgroupIdNum != null && subgroupIdNum !== false && subgroupIdNum > 0) {
            try {
              const subgroupInfo = await this.rateLimitedContractCall('getSubgroupInfo', [subgroupIdNum]);
              if (subgroupInfo != null && subgroupInfo !== false) {
                userSubgroupInfo = {
                  id: subgroupIdNum,
                  members: subgroupInfo.members ?? [],
                  isValid: subgroupInfo.isValid ?? false,
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
      paymentTokenAddress: String(paymentTokenAddress ?? ''),
      currentMemberCount: currentMemberCount ?? 0,
      currentSubgroupCount: currentSubgroupCount ?? 0,
      currentClaimId: currentClaimId ?? 0,
      currentPeriodId: currentPeriodId ?? 0,
      totalCoverageAmount: totalCoverageAmount ?? 0,
      basePremium: basePremium ?? 0,
      communityState: communityState ?? 0,
      secretaryAddress: String(secretaryAddress ?? ''),
      secretarySuccessorList: secretarySuccessorList ?? [],
      currentPeriodInfo,
      claimIdsInCurrentPeriod: claimIdsInPeriod ?? [],
      whitelistedClaimIdsInCurrentPeriod: whitelistedClaimIds ?? [],
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
    const cacheKey = `community_${this.config.contractAddress}_${this.config.userAddress ?? 'anonymous'}`;
    const cached = this.cache.get(cacheKey);
    const performanceSettings = this.getNetworkPerformanceSettings();
    const cacheExpiration = performanceSettings.cacheExpirationMs;

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

    // If contract address changed, recreate read actions
    if (newConfig.contractAddress != null) {
      this.readActions = getTandaPayReadActions(
        getProvider(),
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
  userAddress?: ?string
): Promise<CommunityInfo> {
  const communityInfo = createCommunityInfo({
    contractAddress,
    userAddress,
  });

  return communityInfo.getCommunityInfo();
}
