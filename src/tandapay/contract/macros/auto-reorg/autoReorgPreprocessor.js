// @flow strict-local

/**
 * Preprocessor for Auto-Reorganization Algorithm
 *
 * Converts MemberInfo array to autoReorg input format
 */

import { SubgroupConstants, InitializationStateConstants } from '../../constants';
import type { MemberInfo } from '../../types';
import type { AutoReorgParameters } from './autoReorgAlgorithm';

/**
 * Experimental flag: When true, removes members from invalid subgroups entirely
 * instead of keeping them in the subgroups map. This ensures only valid subgroups
 * are passed to the auto-reorg algorithm, with all invalid subgroup members in needsAssigned.
 */
const REMOVE_INVALID_SUBGROUPS = false;

/**
 * Converts BigNumber to regular number for subgroup IDs
 */
function bigNumberToNumber(bn: mixed): number {
  // $FlowFixMe[incompatible-use]
  try {
    // $FlowFixMe[incompatible-use]
    return bn.toNumber();
  } catch (error) {
    // $FlowFixMe[incompatible-use]
    throw new Error(`Subgroup ID too large to convert to number: ${bn.toString()}`);
  }
}

/**
 * Preprocesses member info array for auto-reorg algorithm
 *
 * @param members Array of member info
 * @returns AutoReorg parameters or throws error
 */
export function preprocessMembersForAutoReorg(
  members: Array<MemberInfo>
): AutoReorgParameters {
  // Step 1: Ensure minimum member count
  if (members.length < InitializationStateConstants.minCommunitySizeToExit) {
    throw new Error('Not enough members to run auto-reorg algorithm');
  }

  // Step 2: Build subgroups map and collect unassigned members
  const subgroups = new Map<number, string[]>();
  const needsAssigned: string[] = [];

  for (const member of members) {
    const walletAddress = member.walletAddress;
    const subgroupIdNumber = bigNumberToNumber(member.subgroupId);

    // Step 3: Handle unassigned members (subgroupId = 0)
    if (subgroupIdNumber === 0) {
      needsAssigned.push(walletAddress);
      continue;
    }

    // Add member to their subgroup
    if (!subgroups.has(subgroupIdNumber)) {
      subgroups.set(subgroupIdNumber, []);
    }
    const subgroupMembers = subgroups.get(subgroupIdNumber);
    if (subgroupMembers) {
      subgroupMembers.push(walletAddress);
    }
  }

  // Step 4: Handle invalid subgroups based on experimental flag
  // TODO: note, this doesn't seem to work?
  if (REMOVE_INVALID_SUBGROUPS) {
    // New behavior: Remove invalid subgroups entirely and move all members to needsAssigned
    const validSubgroups = new Map<number, string[]>();

    for (const [subgroupId, membersList] of subgroups.entries()) {
      if (membersList.length < SubgroupConstants.minSize) {
        // Invalid subgroup - move all members to needsAssigned and don't include in final map
        needsAssigned.push(...membersList);
      } else {
        // Valid subgroup - keep it
        validSubgroups.set(subgroupId, membersList);
      }
    }

    return {
      subgroups: validSubgroups,
      needsAssigned
    };
  } else {
    // Original behavior: Move members from invalid subgroups to needsAssigned but keep subgroups
    for (const [, membersList] of subgroups.entries()) {
      if (membersList.length < SubgroupConstants.minSize) {
        // Invalid subgroup - move all members to needsAssigned
        needsAssigned.push(...membersList);
        // Keep the subgroup but with the same members also in needsAssigned
        // This allows the algorithm to filter them out properly
      }
    }

    return {
      subgroups,
      needsAssigned
    };
  }
}
