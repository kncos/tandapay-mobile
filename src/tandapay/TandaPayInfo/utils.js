// @flow strict-local

import { TandaPayState, MemberStatus, AssignmentStatus } from '../contract/types';
import type { MemberInfo, SubgroupInfo } from '../contract/types';

// Helper function to convert BigNumber to number safely
export function bigNumberToNumber(value: mixed): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return parseInt(value, 10);
  }
  if (value != null && typeof value === 'object') {
    try {
      // Try different methods that BigNumber might have
      // $FlowFixMe[unclear-type] - BigNumber type is mixed, need to check methods
      if (typeof (value: any).toNumber === 'function') {
        // $FlowFixMe[unclear-type] - BigNumber has toNumber method
        return (value: any).toNumber();
      }
      // $FlowFixMe[unclear-type] - BigNumber type is mixed, need to check methods
      if (typeof (value: any).toString === 'function') {
        // $FlowFixMe[unclear-type] - BigNumber has toString method
        return parseInt((value: any).toString(), 10);
      }
    } catch (error) {
      return 0;
    }
  }
  return 0;
}

// Helper function to format BigNumber values
export function formatBigNumber(value: mixed): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (value != null && typeof value === 'object' && typeof value.toString === 'function') {
    return value.toString();
  }
  return '0';
}

// Helper function to format time duration
export function formatTimeDuration(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const remainingSeconds = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// Helper function to get community state display name
export function getCommunityStateDisplayName(state: number): string {
  switch (state) {
    case TandaPayState.Initialization:
      return 'Initialization';
    case TandaPayState.Default:
      return 'Default';
    case TandaPayState.Fractured:
      return 'Fractured';
    case TandaPayState.Collapsed:
      return 'Collapsed';
    default:
      return 'Unknown';
  }
}

// Helper function to get member status display name
export function getMemberStatusDisplayName(status: number): string {
  switch (status) {
    case MemberStatus.None:
      return 'Not a Member';
    case MemberStatus.Added:
      return 'Added by Secretary';
    case MemberStatus.New:
      return 'New Member';
    case MemberStatus.Valid:
      return 'Valid (Covered)';
    case MemberStatus.PaidInvalid:
      return 'Paid but Invalid';
    case MemberStatus.UnpaidInvalid:
      return 'Unpaid and Invalid';
    case MemberStatus.Reorged:
      return 'Reorganized';
    case MemberStatus.UserLeft:
      return 'Left Community';
    case MemberStatus.Defected:
      return 'Defected';
    case MemberStatus.UserQuit:
      return 'Quit';
    default:
      return 'Unknown Status';
  }
}

// Helper function to get assignment status display name
export function getAssignmentStatusDisplayName(status: number): string {
  switch (status) {
    case AssignmentStatus.Unassigned:
      return 'Unassigned';
    case AssignmentStatus.AddedBySecretary:
      return 'Added by Secretary';
    case AssignmentStatus.AssignedToGroup:
      return 'Assigned to Group';
    case AssignmentStatus.ApprovedByMember:
      return 'Approved by Member';
    case AssignmentStatus.ApprovedByGroupMember:
      return 'Approved by Group Member';
    case AssignmentStatus.AssignmentSuccessful:
      return 'Assignment Successful';
    case AssignmentStatus.CancelledByMember:
      return 'Cancelled by Member';
    case AssignmentStatus.CancelledByGroupMember:
      return 'Cancelled by Group Member';
    default:
      return 'Unknown Assignment Status';
  }
}

// Helper function to format token amounts
export function formatTokenAmount(amount: string | number, decimals: number = 18): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === 0) {
    return '0';
  }
  if (num < 0.0001) {
    return '<0.0001';
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(4).replace(/\.?0+$/, '');
}

// Helper function to group members by subgroup ID
export function groupMembersBySubgroup(members: Array<MemberInfo>): Map<number, Array<MemberInfo>> {
  const grouped = new Map();

  members.forEach(member => {
    const subgroupId = bigNumberToNumber(member.subgroupId) || 0;
    if (!grouped.has(subgroupId)) {
      grouped.set(subgroupId, []);
    }
    grouped.get(subgroupId)?.push(member);
  });

  return grouped;
}

// Helper function to sort subgroups by ID
export function sortSubgroupsById(subgroups: Array<SubgroupInfo>): Array<SubgroupInfo> {
  return [...subgroups].sort((a, b) => {
    const idA = bigNumberToNumber(a.id) || 0;
    const idB = bigNumberToNumber(b.id) || 0;
    return idA - idB;
  });
}
