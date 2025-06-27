/* @flow */

import type { BigNumber, PeriodInfo, MemberInfo, SubgroupInfo, TandaPayStateType, ClaimInfo } from './types';
import { getProvider } from '../web3';
import { getTandaPayReadActions } from './read';
import { TandaPayInfo } from './TandaPay';
import { executeTandaPayMulticall } from './multicall';
import { getTandaPayNetworkPerformance, getCurrentTandaPayContractAddress, getCachedBatchMembers, getCachedBatchSubgroups, isBatchMembersStale, isBatchSubgroupsStale } from '../redux/selectors';
import { updateCommunityInfo, updateBatchMembers, updateBatchSubgroups, invalidateBatchData } from '../redux/actions';
import { tryGetActiveAccountState } from '../../selectors';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import type { TandaPayResult } from '../errors/types';
import store from '../../boot/store';

// Configuration type for the community info class
type CommunityInfoConfig = {
  contractAddress?: ?string, // Made optional since we can get it from Redux
  userAddress?: ?string,
  forceContractAddress?: ?string, // Override for testing/specific cases
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
  whitelistedClaimsFromPreviousPeriod: ?Array<ClaimInfo>,
  userMemberInfo: ?MemberInfo,
  userSubgroupInfo: ?SubgroupInfo,
  // Cached batch data - only populated when explicitly requested
  allMembersInfo: ?Array<MemberInfo>,
  allSubgroupsInfo: ?Array<SubgroupInfo>,
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
 * community information from a TandaPay contract. It uses efficient multicall
 * batching to minimize network requests and provides built-in caching,
 * rate limiting, and error handling.
 *
 * The service automatically handles:
 * - Contract address resolution from Redux store
 * - Efficient multicall batching for blockchain reads
 * - Intelligent caching with configurable expiration
 * - Robust error handling and retry mechanisms
 * - User-specific data fetching when userAddress is provided
 */
class TandaPayCommunityInfo {
  config: CommunityInfoConfig;
  readActions: any;
  cache: Map<string, CacheEntry>;
  _contractAddress: ?string;
  _initialized: boolean;

  constructor(config: CommunityInfoConfig) {
    this.config = config;
    this.cache = new Map();
    this._initialized = false;

    // Get contract address from config or Redux store
    this._contractAddress = this._resolveContractAddress();

    if (!this._contractAddress) {
      throw TandaPayErrorHandler.createValidationError(
        'No TandaPay contract address configured',
        'Please configure a TandaPay contract address in settings before accessing community information.'
      );
    }
  }

  /**
   * Initialize the provider and contract instances asynchronously
   */
  async _initialize(): Promise<void> {
    if (this._initialized) {
      return;
    }

    try {
      const provider = await getProvider();
      const contractAddress: string = this._contractAddress || '';
      this.readActions = getTandaPayReadActions(provider, contractAddress);
      this._initialized = true;
    } catch (error) {
      throw TandaPayErrorHandler.createNetworkError(
        `Failed to initialize TandaPay community info: ${error.message}`,
        'Unable to connect to the TandaPay network. Please check your connection and try again.'
      );
    }
  }

  /**
   * Resolve the contract address from config or Redux store
   */
  _resolveContractAddress(): ?string {
    // Check force override first
    if (this.config.forceContractAddress) {
      return this.config.forceContractAddress;
    }

    // Check config parameter
    if (this.config.contractAddress) {
      return this.config.contractAddress;
    }

    // Try to get from Redux store
    try {
      const globalState = store.getState();
      const perAccountState = tryGetActiveAccountState(globalState);
      if (perAccountState) {
        const contractAddress = getCurrentTandaPayContractAddress(perAccountState);
        if (contractAddress) {
          return contractAddress;
        }
      }
    } catch (error) {
      // Log the error for debugging but continue with fallback
      // This is not critical - we can still function without Redux state
      TandaPayErrorHandler.createError(
        'API_ERROR',
        `Failed to resolve contract address from Redux store: ${error?.message || 'Unknown error'}`,
        {
          details: error
        }
      );
      // Continue to check other sources
    }

    return null;
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
      // Log error but fallback to defaults - this is not critical
      TandaPayErrorHandler.createError(
        'API_ERROR',
        `Failed to get network performance settings from Redux store: ${error?.message || 'Unknown error'}`,
        {
          details: error
        }
      );
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
    // Initialize provider and contracts if not already done
    await this._initialize();

    const shouldForceRefresh = forceRefresh || false;
    const cacheKey = `community_${this._contractAddress || 'unknown'}_${this.config.userAddress ?? 'anonymous'}`;

    // Check cache first unless force refresh is requested
    if (!shouldForceRefresh) {
      const cached = this.cache.get(cacheKey);
      const performanceSettings = this.getNetworkPerformanceSettings();
      const cacheExpiration = performanceSettings.cacheExpirationMs;
      if (cached && (Date.now() - cached.timestamp) < cacheExpiration) {
        return cached.data;
      }
    }

    // Fetch basic community data
    const basicData = await this._fetchBasicCommunityData();

    // Fetch period-specific data
    const periodData = await this._fetchPeriodData(basicData.currentPeriodId);

    // Fetch user-specific data if applicable
    const userData = await this._fetchUserData();

    // Fetch previous period's whitelisted claims
    const previousPeriodClaims = await this._fetchPreviousPeriodWhitelistedClaims(basicData.currentPeriodId);

    // Build the final community info object
    const communityInfo: CommunityInfo = {
      ...basicData,
      currentPeriodInfo: periodData.periodInfo,
      claimIdsInCurrentPeriod: periodData.claimIdsInPeriod,
      whitelistedClaimIdsInCurrentPeriod: periodData.whitelistedClaimIds,
      whitelistedClaimsFromPreviousPeriod: previousPeriodClaims,
      userMemberInfo: userData.userMemberInfo,
      userSubgroupInfo: userData.userSubgroupInfo,
      // Cached batch data starts as null - populated on demand
      allMembersInfo: null,
      allSubgroupsInfo: null,
      lastUpdated: Date.now(),
    };

    // Cache the result
    this.cache.set(cacheKey, {
      data: communityInfo,
      timestamp: Date.now(),
    });

    // Update Redux store with the new community info
    try {
      if (store && store.dispatch) {
        store.dispatch(updateCommunityInfo(
          communityInfo,
          this._contractAddress,
          this.config.userAddress
        ));
      }
    } catch (error) {
      // Log Redux dispatch error but don't fail the main operation
      TandaPayErrorHandler.createError(
        'API_ERROR',
        `Failed to update Redux store with community info: ${error?.message || 'Unknown error'}`,
        {
          details: error
        }
      );
      // This ensures the core functionality still works even if Redux integration fails
    }

    return communityInfo;
  }

  /**
   * Fetch basic community data using multicall for efficiency
   * @private
   */
  async _fetchBasicCommunityData(): Promise<{
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
  }> {
    const basicCalls = [
      { functionName: 'getPaymentTokenAddress' },
      { functionName: 'getCurrentMemberCount' },
      { functionName: 'getCurrentSubgroupCount' },
      { functionName: 'getCurrentClaimId' },
      { functionName: 'getCurrentPeriodId' },
      { functionName: 'getTotalCoverageAmount' },
      { functionName: 'getBasePremium' },
      { functionName: 'getCommunityState' },
      { functionName: 'getSecretaryAddress' },
      { functionName: 'getSecretarySuccessorList' },
    ];

    const basicResult = await executeTandaPayMulticall(
      this._contractAddress || '',
      TandaPayInfo.abi,
      basicCalls
    );

    if (!basicResult.success) {
      throw basicResult.error;
    }

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
      secretarySuccessorList
    ] = basicResult.data;

    return {
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
    };
  }

  /**
   * Fetch period-specific data using multicall for efficiency
   * @private
   */
  async _fetchPeriodData(currentPeriodId: BigNumber): Promise<{
    periodInfo: PeriodInfo,
    claimIdsInPeriod: Array<BigNumber>,
    whitelistedClaimIds: Array<BigNumber>,
  }> {
    const periodCalls = [
      { functionName: 'getPeriodIdToPeriodInfo', args: [currentPeriodId] },
      { functionName: 'getClaimIdsInPeriod', args: [currentPeriodId] },
      { functionName: 'getWhitelistedClaimIdsInPeriod', args: [currentPeriodId] },
    ];

    const periodResult = await executeTandaPayMulticall(
      this._contractAddress || '',
      TandaPayInfo.abi,
      periodCalls
    );

    if (!periodResult.success) {
      throw periodResult.error;
    }

    const [
      periodInfo,
      claimIdsInPeriod,
      whitelistedClaimIds
    ] = periodResult.data;

    return {
      periodInfo: {
        startTimestamp: periodInfo?.startedAt ?? 0,
        endTimestamp: periodInfo?.willEndAt ?? 0,
        coverageAmount: periodInfo?.coverage ?? 0,
        totalPremiumsPaid: periodInfo?.totalPaid ?? 0,
        claimIds: periodInfo?.claimIds ?? [],
      },
      claimIdsInPeriod: claimIdsInPeriod ?? [],
      whitelistedClaimIds: whitelistedClaimIds ?? [],
    };
  }

  /**
   * Fetch user-specific data (member and subgroup info) with proper logic
   * Logic: 1. fetch member info from address
   *        2. if memberId = 0, then memberInfo and subgroupInfo are null
   *        3. if subgroupId = 0, then subgroupInfo is null even though we are a member
   *        4. finally, memberId != 0 and subgroupId != 0 so we have both member and subgroup info
   * @private
   */
  async _fetchUserData(): Promise<{
    userMemberInfo: ?MemberInfo,
    userSubgroupInfo: ?SubgroupInfo,
  }> {
    if (this.config.userAddress == null) {
      return { userMemberInfo: null, userSubgroupInfo: null };
    }

    let userMemberInfo = null;
    let userSubgroupInfo = null;

    try {
      const memberInfo = await this.rateLimitedContractCall('getMemberInfoFromAddress', [
        this.config.userAddress,
        0 // current period
      ]);

      // Check if we got valid member info and member ID is non-zero
      if (memberInfo != null && memberInfo !== false && this.config.userAddress != null) {
        const memberId = memberInfo.id;
        const subgroupId = memberInfo.subgroupId;

        // Step 2: If memberId = 0, then memberInfo and subgroupInfo are null
        if (memberId == null || memberId === false || memberId === 0) {
          return { userMemberInfo: null, userSubgroupInfo: null };
        }

        // Member ID is non-zero, so we are a member - create member info
        userMemberInfo = {
          id: memberId,
          subgroupId: subgroupId ?? 0,
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

        // Step 3: If subgroupId = 0, then subgroupInfo is null even though we are a member
        if (subgroupId != null && subgroupId !== false && subgroupId > 0) {
          // Step 4: memberId != 0 and subgroupId != 0, fetch subgroup info
          try {
            const subgroupInfo = await this.rateLimitedContractCall('getSubgroupInfo', [subgroupId]);
            if (subgroupInfo != null && subgroupInfo !== false) {
              userSubgroupInfo = {
                id: subgroupId,
                members: subgroupInfo.members ?? [],
                isValid: subgroupInfo.isValid ?? false,
              };
            }
          } catch (subgroupError) {
            // Log subgroup fetch error but continue with null subgroup info
            // This can happen if subgroup doesn't exist or network issues occur
            TandaPayErrorHandler.createError(
              'CONTRACT_ERROR',
              `Failed to fetch subgroup info for subgroup ID ${subgroupId}: ${subgroupError?.message || 'Unknown error'}`,
              {
                userMessage: 'Unable to load subgroup information',
                details: { subgroupId, error: subgroupError }
              }
            );
          }
        }
        // If subgroupId is 0, userSubgroupInfo remains null (step 3)
      }
    } catch (memberError) {
      // Log member info fetch error but continue with null user info
      // This can happen if user is not a member or network issues occur
      TandaPayErrorHandler.createError(
        'CONTRACT_ERROR',
        `Failed to fetch member info for address ${this.config.userAddress || 'unknown'}: ${memberError?.message || 'Unknown error'}`,
        {
          userMessage: 'Unable to load member information',
          details: { userAddress: this.config.userAddress, error: memberError }
        }
      );
    }

    return { userMemberInfo, userSubgroupInfo };
  }

  /**
   * Fetch whitelisted claims from the previous period
   * @private
   */
  async _fetchPreviousPeriodWhitelistedClaims(currentPeriodId: BigNumber): Promise<?Array<ClaimInfo>> {
    // Only fetch if we're in period 2 or later (period 0 is invalid, period 1 is first valid period)
    // $FlowFixMe[incompatible-use] - BigNumber comparison
    if (currentPeriodId.lte(1)) {
      return null;
    }

    try {
      // $FlowFixMe[incompatible-use] - BigNumber arithmetic
      const previousPeriodId = currentPeriodId.sub(1);

      // First, get whitelisted claim IDs from the previous period
      const whitelistedClaimIds = await this.rateLimitedContractCall(
        'getWhitelistedClaimIdsInPeriod',
        [previousPeriodId]
      );

      if (!whitelistedClaimIds || whitelistedClaimIds.length === 0) {
        return null;
      }

      // Prepare multicall to get claim info for all whitelisted claims
      const claimInfoCalls = whitelistedClaimIds.map(claimId => ({
        functionName: 'getClaimInfo',
        args: [claimId, previousPeriodId]
      }));

      const claimInfoResult = await executeTandaPayMulticall(
        this._contractAddress || '',
        TandaPayInfo.abi,
        claimInfoCalls
      );

      if (!claimInfoResult.success) {
        TandaPayErrorHandler.createError(
          'CONTRACT_ERROR',
          `Failed to fetch previous period claim info: ${claimInfoResult.error.message || 'Unknown error'}`,
          {
            userMessage: 'Unable to load previous period claim information',
            details: { previousPeriodId: previousPeriodId.toString(), error: claimInfoResult.error }
          }
        );
        return null;
      }

      // Transform the raw claim data into ClaimInfo objects
      const claimInfos: Array<ClaimInfo> = claimInfoResult.data
        .filter(claimData => claimData != null)
        .map((claimData, index) => ({
          id: whitelistedClaimIds[index],
          periodId: previousPeriodId,
          amount: claimData.amount || 0,
          isWhitelisted: claimData.isWhitelisted || false,
          claimantWalletAddress: claimData.claimant || '',
          claimantSubgroupId: claimData.subgroupId || 0,
          hasClaimantClaimedFunds: claimData.hasClaimantClaimedFunds || false,
        }));

      return claimInfos.length > 0 ? claimInfos : null;
    } catch (error) {
      TandaPayErrorHandler.createError(
        'CONTRACT_ERROR',
        `Failed to fetch previous period whitelisted claims: ${error?.message || 'Unknown error'}`,
        {
          userMessage: 'Unable to load previous period claim information',
          // $FlowFixMe[incompatible-use] - BigNumber toString
          details: { currentPeriodId: currentPeriodId.toString(), error }
        }
      );
      return null;
    }
  }

  /**
   * Get cached community information if available
   */
  getCachedCommunityInfo(): ?CommunityInfo {
    const cacheKey = `community_${this._contractAddress || 'unknown'}_${this.config.userAddress ?? 'anonymous'}`;
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

    // Re-resolve contract address with new config
    const newContractAddress = this._resolveContractAddress();

    // If contract address changed, recreate read actions
    if (newContractAddress && newContractAddress !== this._contractAddress) {
      this._contractAddress = newContractAddress;
      this.readActions = getTandaPayReadActions(
        getProvider(),
        newContractAddress
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
        // Log the specific contract call error
        TandaPayErrorHandler.createError(
          'CONTRACT_ERROR',
          `Failed to execute contract call ${call.method}: ${error?.message || 'Unknown error'}`,
          {
            userMessage: `Unable to fetch ${call.method} data`,
            details: { method: call.method, args: call.args, error }
          }
        );
        results.push(null);
      }
    }

    return results;
  }

  /**
   * Fetch and cache all members information
   * This will update the cached community info in Redux with the batch data
   * Only fetches if data is stale (older than 5 minutes) or not cached
   */
  async fetchAndCacheAllMembers(): Promise<TandaPayResult<Array<MemberInfo>>> {
    try {
      // Check if we have fresh cached data in Redux
      if (store && store.getState) {
        const globalState = store.getState();
        const accountState = tryGetActiveAccountState(globalState);
        if (accountState) {
          const cachedMembers = getCachedBatchMembers(accountState);
          const isStale = isBatchMembersStale(accountState, 300000); // 5 minutes

          if (cachedMembers && !isStale) {
            // Return cached data if it's fresh
            return { success: true, data: cachedMembers };
          }
        }
      }

      // First get current community info to get member count
      const currentInfo: CommunityInfo = await this.getCommunityInfo();

      // $FlowFixMe[incompatible-use] - BigNumber conversion
      const memberCount = parseInt(currentInfo.currentMemberCount.toString(), 10);

      if (memberCount === 0) {
        // Update Redux with empty data
        if (store && store.dispatch) {
          store.dispatch(updateBatchMembers([], this._contractAddress, this.config.userAddress));
        }
        return { success: true, data: [] };
      }

      // Import the batch function here to avoid circular dependencies
      const { batchGetAllMemberInfo } = await import('./read');

      const result = await batchGetAllMemberInfo(this._contractAddress || '', memberCount);

      if (!result.success) {
        return result;
      }

      // Update Redux with the fresh batch data
      if (store && store.dispatch) {
        store.dispatch(updateBatchMembers(result.data, this._contractAddress, this.config.userAddress));
      }

      return { success: true, data: result.data };
    } catch (error) {
      const tandaPayError = TandaPayErrorHandler.createError(
        'CONTRACT_ERROR',
        `Failed to fetch and cache all members: ${error?.message || 'Unknown error'}`,
        {
          userMessage: 'Unable to load member information. Please try again.',
          details: { error }
        }
      );
      return { success: false, error: tandaPayError };
    }
  }

  /**
   * Fetch and cache all subgroups information
   * This will update the cached community info in Redux with the batch data
   * Only fetches if data is stale (older than 5 minutes) or not cached
   */
  async fetchAndCacheAllSubgroups(): Promise<TandaPayResult<Array<SubgroupInfo>>> {
    try {
      // Check if we have fresh cached data in Redux
      if (store && store.getState) {
        const globalState = store.getState();
        const accountState = tryGetActiveAccountState(globalState);
        if (accountState) {
          const cachedSubgroups = getCachedBatchSubgroups(accountState);
          const isStale = isBatchSubgroupsStale(accountState, 300000); // 5 minutes

          if (cachedSubgroups && !isStale) {
            // Return cached data if it's fresh
            return { success: true, data: cachedSubgroups };
          }
        }
      }

      // First get current community info to get subgroup count
      const currentInfo: CommunityInfo = await this.getCommunityInfo();

      // $FlowFixMe[incompatible-use] - BigNumber conversion
      const subgroupCount = parseInt(currentInfo.currentSubgroupCount.toString(), 10);

      if (subgroupCount === 0) {
        // Update Redux with empty data
        if (store && store.dispatch) {
          store.dispatch(updateBatchSubgroups([], this._contractAddress, this.config.userAddress));
        }
        return { success: true, data: [] };
      }

      // Import the batch function here to avoid circular dependencies
      const { batchGetAllSubgroupInfo } = await import('./read');

      const result = await batchGetAllSubgroupInfo(this._contractAddress || '', subgroupCount);

      if (!result.success) {
        return result;
      }

      // Update Redux with the fresh batch data
      if (store && store.dispatch) {
        store.dispatch(updateBatchSubgroups(result.data, this._contractAddress, this.config.userAddress));
      }

      return { success: true, data: result.data };
    } catch (error) {
      const tandaPayError = TandaPayErrorHandler.createError(
        'CONTRACT_ERROR',
        `Failed to fetch and cache all subgroups: ${error?.message || 'Unknown error'}`,
        {
          userMessage: 'Unable to load subgroup information. Please try again.',
          details: { error }
        }
      );
      return { success: false, error: tandaPayError };
    }
  }

  /**
   * Invalidate cached batch data (members and subgroups)
   * This forces a fresh fetch the next time batch data is requested
   */
  invalidateBatchData(): void {
    if (store && store.dispatch) {
      store.dispatch(invalidateBatchData());
    }
  }

  /**
   * Update cached community info with batch data
   * @private
   */
  async _updateCachedCommunityInfoWithBatchData(batchData: {
    allMembersInfo?: Array<MemberInfo>,
    allSubgroupsInfo?: Array<SubgroupInfo>,
  }): Promise<void> {
    try {
      // Get current cached community info
      const cacheKey = `community_${this._contractAddress || 'unknown'}_${this.config.userAddress ?? 'anonymous'}`;
      const cached = this.cache.get(cacheKey);

      if (!cached) {
        // No cached data to update
        return;
      }

      // Update the cached data with batch info
      const updatedCommunityInfo: CommunityInfo = {
        ...cached.data,
        ...batchData,
        lastUpdated: Date.now(),
      };

      // Update cache
      this.cache.set(cacheKey, {
        data: updatedCommunityInfo,
        timestamp: Date.now(),
      });

      // Update Redux store with the updated community info
      if (store && store.dispatch) {
        store.dispatch(updateCommunityInfo(
          updatedCommunityInfo,
          this._contractAddress,
          this.config.userAddress
        ));
      }
    } catch (error) {
      // Log error but don't fail the main operation
      TandaPayErrorHandler.createError(
        'API_ERROR',
        `Failed to update cached community info with batch data: ${error?.message || 'Unknown error'}`,
        {
          details: error
        }
      );
    }
  }
}

/**
 * Factory function to create a new TandaPay Community Info instance
 * Will automatically get contract address from Redux store if not provided
 */
export function createCommunityInfo(config?: CommunityInfoConfig): TandaPayCommunityInfo {
  const defaultConfig: CommunityInfoConfig = {
    contractAddress: null,
    userAddress: null,
    forceContractAddress: null,
  };
  return new TandaPayCommunityInfo(config || defaultConfig);
}

/**
 * Convenience function to quickly fetch community info with minimal configuration
 * Automatically uses contract address from Redux store if not provided
 */
export async function fetchCommunityInfo(
  contractAddress?: ?string,
  userAddress?: ?string
): Promise<TandaPayResult<CommunityInfo>> {
  try {
    const communityInfo = createCommunityInfo({
      contractAddress,
      userAddress,
    });

    const result = await communityInfo.getCommunityInfo();
    return { success: true, data: result };
  } catch (error) {
    if (error?.type) {
      return { success: false, error };
    }

    const tandaPayError = TandaPayErrorHandler.createError(
      'CONTRACT_ERROR',
      'Failed to fetch community information',
      {
        userMessage: 'Unable to fetch community information. Please check your network connection and contract settings.',
        details: error
      }
    );
    return { success: false, error: tandaPayError };
  }
}

/**
 * Convenience function to fetch and cache all members information
 * This will update the community info cache with the batch data
 */
export async function fetchAndCacheAllMembers(
  contractAddress?: ?string,
  userAddress?: ?string
): Promise<TandaPayResult<Array<MemberInfo>>> {
  try {
    const communityInfo = createCommunityInfo({
      contractAddress,
      userAddress,
    });

    return await communityInfo.fetchAndCacheAllMembers();
  } catch (error) {
    if (error?.type) {
      return { success: false, error };
    }

    const tandaPayError = TandaPayErrorHandler.createError(
      'CONTRACT_ERROR',
      'Failed to fetch and cache all members',
      {
        userMessage: 'Unable to fetch member information. Please check your network connection and contract settings.',
        details: error
      }
    );
    return { success: false, error: tandaPayError };
  }
}

/**
 * Convenience function to fetch and cache all subgroups information
 * This will update the community info cache with the batch data
 */
export async function fetchAndCacheAllSubgroups(
  contractAddress?: ?string,
  userAddress?: ?string
): Promise<TandaPayResult<Array<SubgroupInfo>>> {
  try {
    const communityInfo = createCommunityInfo({
      contractAddress,
      userAddress,
    });

    return await communityInfo.fetchAndCacheAllSubgroups();
  } catch (error) {
    if (error?.type) {
      return { success: false, error };
    }

    const tandaPayError = TandaPayErrorHandler.createError(
      'CONTRACT_ERROR',
      'Failed to fetch and cache all subgroups',
      {
        userMessage: 'Unable to fetch subgroup information. Please check your network connection and contract settings.',
        details: error
      }
    );
    return { success: false, error: tandaPayError };
  }
}

/**
 * Convenience function to invalidate cached batch data
 * This forces a fresh fetch the next time batch data is requested
 */
export function invalidateCachedBatchData(): void {
  if (store && store.dispatch) {
    store.dispatch(invalidateBatchData());
  }
}
