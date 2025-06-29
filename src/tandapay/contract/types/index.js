/* @flow strict-local */

import type { BigNumber, TandaPayStateType } from '../types';

/**
 * Community information data structure
 * Note: Using mixed for some fields to maintain compatibility during refactoring
 */
export type CommunityInfo = $ReadOnly<{|
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
  // Legacy compatibility fields - to be refined/removed during refactoring
  currentPeriodInfo?: mixed,
  userSubgroupInfo?: mixed,
  userMemberInfo?: mixed,
  // Allow for additional dynamic properties during transition
  [string]: mixed,
|}>;

/**
 * Member batch information data structure
 */
export type MemberBatchInfo = $ReadOnly<{|
  members: Array<mixed>, // Using mixed for now, can be refined later
  totalCount: number,
  lastUpdated: number,
|}>;

/**
 * Subgroup batch information data structure
 */
export type SubgroupBatchInfo = $ReadOnly<{|
  subgroups: Array<mixed>, // Using mixed for now, can be refined later
  totalCount: number,
  lastUpdated: number,
|}>;
