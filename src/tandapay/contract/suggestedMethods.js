// @flow strict-local

import type { WriteTransaction } from './writeTransactionObjects';
import { getAllWriteTransactions } from './writeTransactionObjects';
import { TandaPayState, TandaPayRole } from './types';
import type { TandaPayStateType, TandaPayRoleType } from './types';
import type { CommunityInfo } from './communityInfo';
import { getCommunityInfo } from '../redux/selectors';
import { tryGetActiveAccountState } from '../../selectors';
import store from '../../boot/store';

// Constants for time calculations (in seconds)
const SECONDS_PER_DAY = 86400;
const daysToSeconds = (days: number): number => days * SECONDS_PER_DAY;

// Custom filter procedures return type
type CustomFilterReturnType = {|
  result: boolean,
  reason?: string,
|};

// Parameters for custom filter procedures
type CustomFilterParameters = {|
  communityInfo: CommunityInfo,
  currentTimestamp: number,
  userAddress: string,
  userRole: TandaPayRoleType,
|};

// Method filter configuration
type MethodFilter = {|
  /** Assumed all states allowed if undefined */
  allowableStates?: TandaPayStateType[],
  /** Assumed all roles allowed if undefined */
  allowableRoles?: TandaPayRoleType[],
  /** Assumed any time if undefined */
  allowableTimeInPeriod?: {|
    startSecond?: number,
    endSecond?: number,
  |},
  allowedByCustomProcedure?: (params: CustomFilterParameters) => CustomFilterReturnType,
|};

// Custom filter procedures
const canAdvancePeriod = (params: CustomFilterParameters): CustomFilterReturnType => {
  const { communityInfo, currentTimestamp } = params;

  // Check if the period can be advanced (30 days have passed)
  // $FlowFixMe[incompatible-use] - BigNumber conversion
  const periodStartTime = parseInt(communityInfo.currentPeriodInfo.startTimestamp.toString(), 10);
  const periodEndTime = periodStartTime + (30 * SECONDS_PER_DAY);

  if (currentTimestamp >= periodEndTime) {
    return { result: true };
  }

  return {
    result: false,
    reason: 'Period cannot be advanced yet - 30 days have not passed'
  };
};

const canApproveNewSubgroupMember = (params: CustomFilterParameters): CustomFilterReturnType => {
  const { communityInfo } = params;

  // Check if user is in a subgroup and the subgroup has pending members
  if (!communityInfo.userSubgroupInfo) {
    return {
      result: false,
      reason: 'User is not in a subgroup'
    };
  }

  // This would need more detailed subgroup member data to properly check
  // For now, assume if user is in a subgroup, they can potentially approve
  return { result: true };
};

const canApproveSugroupAssignment = (params: CustomFilterParameters): CustomFilterReturnType => {
  const { communityInfo } = params;

  // Check if user has a pending subgroup assignment
  if (!communityInfo.userMemberInfo) {
    return {
      result: false,
      reason: 'User is not a member'
    };
  }

  // This would need assignment status checking
  // For now, return true if user is a member
  return { result: true };
};

const canDefectFromCommunity = (params: CustomFilterParameters): CustomFilterReturnType => {
  const { communityInfo } = params;

  // Check if user is a member who can defect
  if (!communityInfo.userMemberInfo) {
    return {
      result: false,
      reason: 'User is not a member of the community'
    };
  }

  return { result: true };
};

const canRequestEmergencySecretaryHandoff = (params: CustomFilterParameters): CustomFilterReturnType => {
  const { userRole } = params;

  // Only members can request emergency handoff, and only if secretary is inactive
  if (userRole !== TandaPayRole.Member) {
    return {
      result: false,
      reason: 'Only community members can request emergency secretary handoff'
    };
  }

  // This would need to check secretary activity/inactivity
  // For now, allow members to potentially request this
  return { result: true };
};

const canJoinCommunity = (params: CustomFilterParameters): CustomFilterReturnType => {
  const { communityInfo, userRole } = params;

  // User must not already be a member and community must be in default state
  if (userRole !== TandaPayRole.None) {
    return {
      result: false,
      reason: 'User is already a member of the community'
    };
  }

  if (communityInfo.communityState !== TandaPayState.Default) {
    return {
      result: false,
      reason: 'Community is not accepting new members at this time'
    };
  }

  return { result: true };
};

const canAcceptSecretaryRole = (params: CustomFilterParameters): CustomFilterReturnType => {
  const { communityInfo, userAddress } = params;

  // Check if user is in the secretary successor list
  const isInSuccessorList = communityInfo.secretarySuccessorList.some(
    address => address.toLowerCase() === userAddress.toLowerCase()
  );

  if (!isInSuccessorList) {
    return {
      result: false,
      reason: 'User is not in the secretary successor list'
    };
  }

  return { result: true };
};

const canSubmitClaim = (params: CustomFilterParameters): CustomFilterReturnType => {
  const { communityInfo } = params;

  // Check if user is a member with active coverage
  if (!communityInfo.userMemberInfo) {
    return {
      result: false,
      reason: 'User is not a member of the community'
    };
  }

  // This would need to check member status for active coverage
  // For now, allow members to potentially submit claims
  return { result: true };
};

// Write method filters mapping
const TandaPayWriteMethodFilters: {[string]: MethodFilter} = {
  advancePeriod: {
    allowableStates: [TandaPayState.Default, TandaPayState.Fractured],
    allowableRoles: [TandaPayRole.Secretary],
    allowedByCustomProcedure: canAdvancePeriod,
  },
  extendPeriodByOneDay: {
    allowableStates: [TandaPayState.Default, TandaPayState.Fractured],
    allowableRoles: [TandaPayRole.Secretary],
  },
  addMemberToCommunity: {
    allowableStates: [TandaPayState.Initialization, TandaPayState.Default],
    allowableRoles: [TandaPayRole.Secretary],
  },
  approveNewSubgroupMember: {
    allowableStates: [
      TandaPayState.Initialization,
      TandaPayState.Default,
      TandaPayState.Fractured,
    ],
    allowableRoles: [TandaPayRole.Member, TandaPayRole.Secretary],
    allowedByCustomProcedure: canApproveNewSubgroupMember,
  },
  approveSubgroupAssignment: {
    allowableStates: [
      TandaPayState.Initialization,
      TandaPayState.Default,
      TandaPayState.Fractured,
    ],
    allowableRoles: [TandaPayRole.Member, TandaPayRole.Secretary],
    allowedByCustomProcedure: canApproveSugroupAssignment,
  },
  assignMemberToSubgroup: {
    allowableStates: [
      TandaPayState.Initialization,
      TandaPayState.Default,
      TandaPayState.Fractured,
    ],
    allowableRoles: [TandaPayRole.Secretary],
  },
  createSubgroup: {
    allowableStates: [
      TandaPayState.Initialization,
      TandaPayState.Default,
      TandaPayState.Fractured,
    ],
    allowableRoles: [TandaPayRole.Secretary],
  },
  defectFromCommunity: {
    allowableRoles: [TandaPayRole.Member, TandaPayRole.Secretary],
    allowedByCustomProcedure: canDefectFromCommunity,
  },
  defineSecretarySuccessorList: {
    allowableRoles: [TandaPayRole.Secretary],
  },
  divideShortfall: {
    allowableRoles: [TandaPayRole.Secretary],
    allowableTimeInPeriod: {
      endSecond: daysToSeconds(3),
    },
  },
  emergencySecretaryHandoff: {
    allowableRoles: [TandaPayRole.Member],
    allowedByCustomProcedure: canRequestEmergencySecretaryHandoff,
  },
  handoverSecretaryRoleToSuccessor: {
    allowableRoles: [TandaPayRole.Secretary],
  },
  initiateDefaultState: {
    allowableStates: [TandaPayState.Initialization],
    allowableRoles: [TandaPayRole.Secretary],
  },
  injectFunds: {
    allowableRoles: [TandaPayRole.Secretary],
    allowableTimeInPeriod: {
      endSecond: daysToSeconds(3),
    },
  },
  issueRefund: {
    allowableTimeInPeriod: {
      startSecond: daysToSeconds(3),
      endSecond: daysToSeconds(4),
    },
  },
  joinCommunity: {
    allowableStates: [TandaPayState.Default],
    allowedByCustomProcedure: canJoinCommunity,
  },
  leaveSubgroup: {
    allowableRoles: [TandaPayRole.Member, TandaPayRole.Secretary],
  },
  payPremium: {
    allowableRoles: [TandaPayRole.Member, TandaPayRole.Secretary],
    allowableTimeInPeriod: {
      startSecond: daysToSeconds(27),
    },
  },
  acceptSecretaryRole: {
    allowableRoles: [TandaPayRole.Member],
    allowedByCustomProcedure: canAcceptSecretaryRole,
  },
  submitClaim: {
    allowableRoles: [TandaPayRole.Member, TandaPayRole.Secretary],
    allowableTimeInPeriod: {
      endSecond: daysToSeconds(14),
    },
    allowedByCustomProcedure: canSubmitClaim,
  },
  updateCoverageAmount: {
    allowableRoles: [TandaPayRole.Secretary],
    allowableStates: [TandaPayState.Initialization, TandaPayState.Default],
  },
  whitelistClaim: {
    allowableRoles: [TandaPayRole.Secretary],
    allowableTimeInPeriod: {
      endSecond: daysToSeconds(15),
    },
  },
  withdrawClaimFund: {
    allowableRoles: [TandaPayRole.Member, TandaPayRole.Secretary],
  },
  withdrawRefund: {
    allowableRoles: [TandaPayRole.Member, TandaPayRole.Secretary],
  },
};

/**
 * Determine the user's role in the TandaPay community
 */
function getUserRole(communityInfo: CommunityInfo, userAddress: string): TandaPayRoleType {
  // Check if user is secretary
  if (communityInfo.secretaryAddress.toLowerCase() === userAddress.toLowerCase()) {
    return TandaPayRole.Secretary;
  }

  // Check if user is a member
  if (communityInfo.userMemberInfo) {
    return TandaPayRole.Member;
  }

  return TandaPayRole.None;
}

/**
 * Get suggested TandaPay write methods based on current community state and user context
 * This provides heuristic suggestions and doesn't necessarily cover all edge cases
 */
export function getSuggestedMethods(): WriteTransaction[] {
  try {
    // Get current state from Redux
    const globalState = store.getState();
    const perAccountState = tryGetActiveAccountState(globalState);

    if (!perAccountState) {
      return [];
    }

    // Get community info from Redux
    const communityInfo = getCommunityInfo(perAccountState);
    if (!communityInfo) {
      return [];
    }

    // Get user address from member info if available
    const userAddress = communityInfo.userMemberInfo?.walletAddress;
    if (userAddress == null || userAddress.trim() === '') {
      return [];
    }

    const userRole = getUserRole(communityInfo, userAddress);
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds

    // Get all available write transactions
    const allWriteTransactions = getAllWriteTransactions();
    const suggestedTransactions: WriteTransaction[] = [];

    // Filter transactions based on method filters
    for (const transaction of allWriteTransactions) {
      const filter = TandaPayWriteMethodFilters[transaction.functionName];

      if (!filter) {
        // If no filter exists, skip (don't suggest)
        continue;
      }

      // Check allowable roles
      if (filter.allowableRoles && !filter.allowableRoles.includes(userRole)) {
        continue;
      }

      // Check allowable states
      if (filter.allowableStates && !filter.allowableStates.includes(communityInfo.communityState)) {
        continue;
      }

      // Check allowable time in period
      if (filter.allowableTimeInPeriod) {
        const { startSecond, endSecond } = filter.allowableTimeInPeriod;
        // $FlowFixMe[incompatible-use] - BigNumber conversion
        const periodStartTime = parseInt(communityInfo.currentPeriodInfo.startTimestamp.toString(), 10);

        if (startSecond !== undefined) {
          const startTime = periodStartTime + startSecond;
          if (currentTimestamp < startTime) {
            continue;
          }
        }

        if (endSecond !== undefined) {
          const endTime = periodStartTime + endSecond;
          if (currentTimestamp > endTime) {
            continue;
          }
        }
      }

      // Check custom procedure if defined
      if (filter.allowedByCustomProcedure) {
        const customResult = filter.allowedByCustomProcedure({
          communityInfo,
          currentTimestamp,
          userAddress,
          userRole,
        });

        if (!customResult.result) {
          continue;
        }
      }

      // If we made it here, the transaction is suggested
      suggestedTransactions.push(transaction);
    }

    return suggestedTransactions;
  } catch (error) {
    // Log error but don't crash - return empty array as fallback
    // eslint-disable-next-line no-console
    console.warn('Failed to get suggested methods:', error);
    return [];
  }
}
