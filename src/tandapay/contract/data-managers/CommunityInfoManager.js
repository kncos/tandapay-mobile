/* @flow strict-local */

import { useSelector } from '../../../react-redux';
import store from '../../../boot/store';
import {
  invalidateCommunityInfoData,
  updateCommunityInfo,
  setCommunityInfoLoading,
  setCommunityInfoError,
} from '../../redux/actions';
import { getCurrentTandaPayContractAddress } from '../../redux/selectors';
import { tryGetActiveAccountState } from '../../../account/accountsSelectors';
import { getWalletAddress } from '../../wallet/WalletManager';
import {
  convertRawMemberInfo,
  convertRawSubgroupInfo,
  convertRawPeriodInfo,
  convertRawClaimInfo,
} from '../utils/converters';

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
    const state = store.getState();
    const perAccountState = tryGetActiveAccountState(state);

    if (!perAccountState) {
      throw new Error('No active account state available');
    }

    const communityInfoState = perAccountState.tandaPay.communityInfoData;
    const { forceRefresh = false, maxAge = 5 * 60 * 1000 } = options || {}; // 5 minutes default

    // Check if we have fresh data
    if (!forceRefresh && communityInfoState.data && communityInfoState.lastUpdated != null) {
      const lastUpdated = communityInfoState.lastUpdated;
      const age = Date.now() - lastUpdated;
      if (age < maxAge) {
        return communityInfoState.data;
      }
    }

    // Fetch fresh data
    return this.fetch();
  }

  /**
   * Force fetch community info from contract
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
    store.dispatch(setCommunityInfoLoading(true));
    store.dispatch(setCommunityInfoError(''));

    try {
      // Get wallet address for user-specific data
      const walletResult = await getWalletAddress();
      const userWalletAddress = walletResult.success ? walletResult.data : null;

      // Import TandaPay ABI for multicall
      // $FlowFixMe[untyped-import] - TandaPay utils are untyped but safe to use
      const { TandaPayInfo } = await import('../utils/TandaPay');
      // $FlowFixMe[untyped-import] - multicall utils are untyped but safe to use
      const { executeTandaPayMulticall } = await import('../utils/multicall');

      // Prepare basic contract calls for multicall
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
        { functionName: 'getIsHandingOver' },
        { functionName: 'getUpcomingSecretary' },
        { functionName: 'getEmergencySecretaries' },
        { functionName: 'getSecretarySuccessorList' },
      ];

      // Execute basic multicall
      const basicResult = await executeTandaPayMulticall(contractAddress, TandaPayInfo.abi, basicCalls);

      if (!basicResult.success) {
        throw new Error(`Failed to fetch basic community info: ${basicResult.error ? basicResult.error.message : 'Unknown error'}`);
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
        isVoluntaryHandoverInProgress,
        voluntaryHandoverNominee,
        emergencyHandoverNominees,
        secretarySuccessorList,
      ] = basicResult.data;

      // Get current period info - need to pass the current period ID
      // $FlowFixMe[incompatible-use] - BigNumber conversion
      const currentPeriodIdForQuery = parseInt(currentPeriodId.toString(), 10);
      const currentPeriodInfoResult = await executeTandaPayMulticall(contractAddress, TandaPayInfo.abi, [
        { functionName: 'getPeriodIdToPeriodInfo', args: [currentPeriodIdForQuery] }
      ]);

      if (!currentPeriodInfoResult.success) {
        throw new Error(`Failed to fetch current period info: ${currentPeriodInfoResult.error ? currentPeriodInfoResult.error.message : 'Unknown error'}`);
      }

      // Transform the raw period info to match the expected format using converter
      const rawPeriodInfo = currentPeriodInfoResult.data[0];
      const currentPeriodInfo = rawPeriodInfo ? convertRawPeriodInfo(rawPeriodInfo) : null;

      // Get user-specific data and whitelisted claims if applicable
      let userMemberInfo = null;
      let userSubgroupInfo = null;
      let whitelistedClaimsFromPreviousPeriod = null;

      // Check if we should fetch whitelisted claims from previous period (only if currentPeriodId >= 2)
      // $FlowFixMe[incompatible-use] - BigNumber conversion
      const currentPeriodIdNum = parseInt(currentPeriodId.toString(), 10);
      if (currentPeriodIdNum >= 2) {
        const previousPeriodId = currentPeriodIdNum - 1;

        try {
          // Get whitelisted claim IDs from previous period
          const whitelistedClaimIdsResult = await executeTandaPayMulticall(contractAddress, TandaPayInfo.abi, [
            { functionName: 'getWhitelistedClaimIdsInPeriod', args: [previousPeriodId] }
          ]);

          if (whitelistedClaimIdsResult.success && whitelistedClaimIdsResult.data[0] != null) {
            const whitelistedClaimIds = whitelistedClaimIdsResult.data[0];

            if (Array.isArray(whitelistedClaimIds) && whitelistedClaimIds.length > 0) {
              // Fetch detailed claim info for each whitelisted claim
              const claimInfoCalls = whitelistedClaimIds.map(claimId => ({
                functionName: 'getClaimInfo',
                args: [previousPeriodId, claimId]
              }));

              const claimInfoResult = await executeTandaPayMulticall(contractAddress, TandaPayInfo.abi, claimInfoCalls);

              if (claimInfoResult.success) {
                whitelistedClaimsFromPreviousPeriod = claimInfoResult.data
                  .filter(claim => claim != null)
                  .map(claim => convertRawClaimInfo(claim, previousPeriodId));
              }
            }
          }
        } catch (err) {
          // Don't fail the entire fetch if whitelisted claims fetch fails
          // This is supplementary data
        }
      }

      // Get user-specific data if wallet address is available
      if (userWalletAddress != null && userWalletAddress.trim() !== '') {
        try {
          // Get user's member info - need to pass current period ID
          // $FlowFixMe[incompatible-use] - BigNumber conversion
          const currentPeriodIdForMember = parseInt(currentPeriodId.toString(), 10);
          const memberInfoResult = await executeTandaPayMulticall(contractAddress, TandaPayInfo.abi, [
            { functionName: 'getMemberInfoFromAddress', args: [userWalletAddress, currentPeriodIdForMember] }
          ]);

          if (memberInfoResult.success && memberInfoResult.data[0] != null) {
            const rawMemberInfo = memberInfoResult.data[0];

            // Check if user is actually a member (memberId > 0)
            // The contract returns 'memberId' field, not 'id'
            // $FlowFixMe[incompatible-use] - BigNumber conversion
            const memberId = parseInt(rawMemberInfo.memberId.toString(), 10);

            if (memberId > 0) {
              // Transform the raw contract data using converter helper
              const memberInfo = convertRawMemberInfo(rawMemberInfo);

              userMemberInfo = memberInfo;

              // If user is a member, get their subgroup info
              if (memberInfo.subgroupId != null) {
                // $FlowFixMe[incompatible-use] - BigNumber conversion
                const subgroupId = parseInt(memberInfo.subgroupId.toString(), 10);
                if (subgroupId > 0) {
                  const subgroupInfoResult = await executeTandaPayMulticall(contractAddress, TandaPayInfo.abi, [
                    { functionName: 'getSubgroupInfo', args: [subgroupId] }
                  ]);

                  if (subgroupInfoResult.success && subgroupInfoResult.data[0] != null) {
                    userSubgroupInfo = convertRawSubgroupInfo(subgroupInfoResult.data[0]);
                  }
                }
              }
            }
          }
        } catch (err) {
          // User might not be a member or there might be a contract error
          // This is not necessarily an error for the overall fetch
          userMemberInfo = null;
          userSubgroupInfo = null;
        }
      }

      const communityInfo = {
        // Core contract state
        paymentTokenAddress,
        currentMemberCount,
        currentSubgroupCount,
        currentClaimId,
        currentPeriodId,
        totalCoverageAmount,
        basePremium,
        communityState,
        secretaryAddress,
        isVoluntaryHandoverInProgress,
        voluntaryHandoverNominee,
        emergencyHandoverNominees,
        secretarySuccessorList,

        // Period and user-specific data
        currentPeriodInfo,
        userMemberInfo,
        userSubgroupInfo,
        whitelistedClaimsFromPreviousPeriod,

        // Metadata
        lastUpdated: Date.now(),
      };

      // Update Redux state (don't store contract address in community info)
      store.dispatch(updateCommunityInfo(communityInfo));
      store.dispatch(setCommunityInfoLoading(false));

      return communityInfo;
    } catch (error) {
      const errorMessage = error?.message || 'Failed to fetch community info';
      store.dispatch(setCommunityInfoError(errorMessage));
      store.dispatch(setCommunityInfoLoading(false));
      throw error;
    }
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
    const state = store.getState();
    const perAccountState = tryGetActiveAccountState(state);

    if (!perAccountState) {
      return true;
    }

    const communityInfoState = perAccountState.tandaPay.communityInfoData;

    if (!communityInfoState.data || communityInfoState.lastUpdated == null) {
      return true;
    }

    const lastUpdated = communityInfoState.lastUpdated;
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

    const communityInfoState = perAccountState.tandaPay.communityInfoData;
    return communityInfoState.data;
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
