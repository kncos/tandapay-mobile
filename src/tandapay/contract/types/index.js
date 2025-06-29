/* @flow strict-local */

import type { BigNumber, TandaPayStateType } from '../types';

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
  currentPeriodInfo?: mixed,
  // userSubgroupInfo: Information about the user's specific subgroup only
  userSubgroupInfo?: mixed,
  // userMemberInfo: Information about the user's membership status and details
  userMemberInfo?: mixed,
|}>;

/**
 * Member batch information data structure
 * Contains data about all members (not just the user's data)
 */
export type MemberBatchInfo = $ReadOnly<{|
  members: Array<mixed>, // Using mixed for now, can be refined later
  totalCount: number,
  lastUpdated: number,
|}>;

/**
 * Subgroup batch information data structure
 * Contains data about all subgroups (not just the user's subgroup)
 */
export type SubgroupBatchInfo = $ReadOnly<{|
  subgroups: Array<mixed>, // Using mixed for now, can be refined later
  totalCount: number,
  lastUpdated: number,
|}>;
