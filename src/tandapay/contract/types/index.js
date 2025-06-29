/* @flow strict-local */

import type { BigNumber, TandaPayStateType, MemberInfo, SubgroupInfo, PeriodInfo, ClaimInfo } from '../types';

/**
 * Community information data structure
 * Contains core TandaPay contract state and user-specific derived data
 */
export type CommunityInfo = $ReadOnly<{|
  // Core contract state
  totalCoverageAmount: BigNumber,
  basePremium: BigNumber,
  currentMemberCount: BigNumber,
  currentSubgroupCount: BigNumber,
  currentPeriodId: BigNumber,
  currentClaimId: BigNumber,
  communityState: TandaPayStateType,
  paymentTokenAddress: string,
  secretaryAddress: string,
  isVoluntaryHandoverInProgress: boolean,
  voluntaryHandoverNominee: string,
  emergencyHandoverNominees: Array<string>,
  secretarySuccessorList: Array<string>,

  // User-specific derived data
  // currentPeriodInfo: Information about the current period (deadline, state, etc.)
  currentPeriodInfo?: ?PeriodInfo,
  // userSubgroupInfo: Information about the user's specific subgroup only
  userSubgroupInfo?: ?SubgroupInfo,
  // userMemberInfo: Information about the user's membership status and details
  userMemberInfo?: ?MemberInfo,
  // whitelistedClaimsFromPreviousPeriod: Claims that were whitelisted in the previous period (only populated if currentPeriodId >= 2)
  whitelistedClaimsFromPreviousPeriod?: ?Array<ClaimInfo>,

  // Metadata
  lastUpdated?: number,
|}>;

/**
 * Member batch information data structure
 * Contains data about all members (not just the user's data)
 */
export type MemberBatchInfo = $ReadOnly<{|
  members: Array<MemberInfo>,
  totalCount: number,
  lastUpdated: number,
|}>;

/**
 * Subgroup batch information data structure
 * Contains data about all subgroups (not just the user's subgroup)
 */
export type SubgroupBatchInfo = $ReadOnly<{|
  subgroups: Array<SubgroupInfo>,
  totalCount: number,
  lastUpdated: number,
|}>;
