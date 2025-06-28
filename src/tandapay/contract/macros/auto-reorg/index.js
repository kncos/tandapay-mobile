// @flow strict-local

/**
 * Auto-Reorganization Macro
 *
 * This module provides a clean API for the auto-reorganization macro functionality.
 * It abstracts the complex algorithm and preprocessor logic, exposing only what's
 * needed for the UI layer.
 */

import { autoReorg } from './autoReorgAlgorithm';
import { preprocessMembersForAutoReorg } from './autoReorgPreprocessor';
import type { MemberInfo } from '../../types';
import type { AutoReorgParameters } from './autoReorgAlgorithm';

/**
 * Auto-reorg macro metadata
 */
export const AUTO_REORG_MACRO = {
  id: 'auto-reorg',
  name: 'Auto Reorganization',
  description: 'Automatically reorganize subgroups to ensure all members are assigned to valid subgroups (4-7 members each).',
  icon: 'refresh', // Using a generic refresh icon
};

/**
 * Result of running the auto-reorg macro
 */
export type AutoReorgResult = {|
  /** Whether the reorganization was successful */
  success: boolean,
  /** Error message if unsuccessful */
  error?: string,
  /** New subgroup assignments (subgroupId -> member addresses) */
  newSubgroups?: Map<number, string[]>,
  /** Number of subgroups created/modified */
  subgroupsChanged?: number,
  /** Number of members reassigned */
  membersReassigned?: number,
|};

/**
 * Execute the auto-reorganization macro
 *
 * @param memberInfoArray Array of member information objects
 * @returns Promise resolving to the reorganization result
 */
export async function executeAutoReorg(memberInfoArray: MemberInfo[]): Promise<AutoReorgResult> {
  try {
    // Step 1: Preprocess member data to extract subgroup assignments
    // $FlowFixMe[unclear-type] - preprocessor accepts MemberInfo or MemberInfoMinimal
    const preprocessorResult = preprocessMembersForAutoReorg((memberInfoArray: any));

    if (!preprocessorResult.success) {
      return {
        success: false,
        error: preprocessorResult.error || 'Failed to preprocess member data',
      };
    }

    // Step 2: Run the auto-reorg algorithm
    const autoReorgParams: AutoReorgParameters = {
      subgroups: preprocessorResult.data.subgroups,
      needsAssigned: preprocessorResult.data.needsAssigned,
    };

    const newSubgroups = autoReorg(autoReorgParams);

    // Step 3: Calculate statistics
    const originalSubgroupCount = preprocessorResult.data.subgroups.size;
    const newSubgroupCount = newSubgroups.size;
    const subgroupsChanged = Math.max(originalSubgroupCount, newSubgroupCount);

    // Count reassigned members by comparing original vs new assignments
    let membersReassigned = 0;
    const originalAssignments = new Map();

    // Build original assignment map (member -> subgroupId)
    for (const [subgroupId, members] of preprocessorResult.data.subgroups) {
      for (const member of members) {
        originalAssignments.set(member, subgroupId);
      }
    }

    // Count changes
    for (const [subgroupId, members] of newSubgroups) {
      for (const member of members) {
        const originalSubgroup = originalAssignments.get(member);
        if (originalSubgroup !== subgroupId) {
          membersReassigned++;
        }
      }
    }

    // Also count previously unassigned members
    membersReassigned += preprocessorResult.data.needsAssigned.length;

    return {
      success: true,
      newSubgroups,
      subgroupsChanged,
      membersReassigned,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred during auto-reorganization',
    };
  }
}

/**
 * Validate if auto-reorg can be performed on the given member data
 *
 * @param memberInfoArray Array of member information objects
 * @returns Object indicating if auto-reorg is possible and why/why not
 */
export function validateAutoReorg(memberInfoArray: MemberInfo[]): {|
  canExecute: boolean,
  reason?: string,
|} {
  if (!memberInfoArray || memberInfoArray.length === 0) {
    return {
      canExecute: false,
      reason: 'No member data available',
    };
  }

  // Check if we have minimum required members for at least one subgroup
  if (memberInfoArray.length < 4) {
    return {
      canExecute: false,
      reason: 'At least 4 members are required to form a subgroup',
    };
  }

  // Use preprocessor to validate data structure
  try {
    // $FlowFixMe[unclear-type] - preprocessor accepts MemberInfo or MemberInfoMinimal
    const result = preprocessMembersForAutoReorg((memberInfoArray: any));
    if (!result.success) {
      return {
        canExecute: false,
        reason: result.error || 'Invalid member data structure',
      };
    }

    return {
      canExecute: true,
    };
  } catch (error) {
    return {
      canExecute: false,
      reason: `Validation error: ${error.message}`,
    };
  }
}
