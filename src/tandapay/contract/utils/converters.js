/* @flow strict-local */

/**
 * Conversion helpers for transforming raw contract return data to app types
 * These helpers ensure consistent data shape across all contract interactions
 */

import type { MemberInfo, SubgroupInfo, PeriodInfo, ClaimInfo } from '../types';

/**
 * Converts raw contract member info data to MemberInfo type
 * Used by read methods and data managers to ensure consistent member data shape
 * @param rawMemberInfo Raw data returned by contract getMemberInfoFromAddress/getMemberInfoFromId
 * @returns Formatted MemberInfo object
 */
export function convertRawMemberInfo(rawMemberInfo: mixed): MemberInfo {
  // $FlowFixMe[unclear-type] - Raw contract data is untyped but structure is known
  const raw = (rawMemberInfo: any);
  return {
    id: raw.memberId,
    subgroupId: raw.associatedGroupId,
    walletAddress: raw.member,
    communityEscrowAmount: raw.cEscrowAmount,
    savingsEscrowAmount: raw.ISEscorwAmount,
    pendingRefundAmount: raw.pendingRefundAmount,
    availableToWithdrawAmount: raw.availableToWithdraw,
    isEligibleForCoverageThisPeriod: raw.eligibleForCoverageInPeriod,
    isPremiumPaidThisPeriod: raw.isPremiumPaid,
    queuedRefundAmountThisPeriod: raw.idToQuedRefundAmount,
    memberStatus: raw.status,
    assignmentStatus: raw.assignment,
  };
}

/**
 * Converts raw contract subgroup info data to SubgroupInfo type
 * Used by read methods and data managers to ensure consistent subgroup data shape
 * @param rawSubgroupInfo Raw data returned by contract getSubgroupInfo
 * @returns Formatted SubgroupInfo object
 */
export function convertRawSubgroupInfo(rawSubgroupInfo: mixed): SubgroupInfo {
  // $FlowFixMe[unclear-type] - Raw contract data is untyped but structure is known
  const raw = (rawSubgroupInfo: any);
  return {
    id: raw.id,
    members: raw.members,
    isValid: raw.isValid,
  };
}

/**
 * Converts raw contract period info data to PeriodInfo type
 * Used by read methods and data managers to ensure consistent period data shape
 * @param rawPeriodInfo Raw data returned by contract getPeriodIdToPeriodInfo
 * @returns Formatted PeriodInfo object
 */
export function convertRawPeriodInfo(rawPeriodInfo: mixed): PeriodInfo {
  // $FlowFixMe[unclear-type] - Raw contract data is untyped but structure is known
  const raw = (rawPeriodInfo: any);
  return {
    startTimestamp: raw.startedAt,
    endTimestamp: raw.willEndAt,
    coverageAmount: raw.coverage,
    totalPremiumsPaid: raw.totalPaid,
    claimIds: raw.claimIds,
  };
}

/**
 * Converts raw contract claim info data to ClaimInfo type
 * Used by read methods and data managers to ensure consistent claim data shape
 * @param rawClaimInfo Raw data returned by contract getClaimInfo
 * @param periodId The period ID this claim occurred in
 * @returns Formatted ClaimInfo object
 */
export function convertRawClaimInfo(rawClaimInfo: mixed, periodId: mixed): ClaimInfo {
  // $FlowFixMe[unclear-type] - Raw contract data is untyped but structure is known
  const raw = (rawClaimInfo: any);
  return {
    id: raw.id,
    periodId,
    amount: raw.claimAmount,
    isWhitelisted: raw.isWhitelistd,
    claimantWalletAddress: raw.claimant,
    claimantSubgroupId: raw.SGId,
    hasClaimantClaimedFunds: raw.isClaimed,
  };
}
