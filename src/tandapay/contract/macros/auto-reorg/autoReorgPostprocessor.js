/* @flow strict-local */

/**
 * Auto-Reorg Postprocessor
 *
 * Compares the original member assignments with the auto-reorg results
 * to determine which members need to be reassigned to new subgroups.
 */

import type { MemberInfo, SubgroupInfo } from '../../types';

/**
 * Result of postprocessing auto-reorg output
 */
export type PostprocessorResult = {|
  /** Members that need to be reassigned (moved to different subgroups) */
  +membersToReassign: Array<{|
    +walletAddress: string,
    +fromSubgroupId: number,
    +toSubgroupId: number,
  |}>,
  /** Total number of members processed */
  +totalMembers: number,
  /** Number of members that stayed in their original subgroups */
  +membersUnchanged: number,
|};

/**
 * Postprocess auto-reorg results to determine what transactions need to be executed
 *
 * @param originalMemberData Raw member data from contract
 * @param originalSubgroupData Raw subgroup data from contract
 * @param newSubgroups Auto-reorg algorithm output
 * @returns Information about which members need reassignment
 */
export function postprocessAutoReorgResults(
  originalMemberData: $ReadOnlyArray<MemberInfo>,
  originalSubgroupData: $ReadOnlyArray<SubgroupInfo>,
  newSubgroups: Map<number, Array<string>>
): PostprocessorResult {
  // Create mapping of member address -> original subgroup ID
  const originalAssignments = new Map<string, number>();
  
  for (const member of originalMemberData) {
    // $FlowFixMe[incompatible-use] - BigNumber has toString method
    const originalSubgroupId = parseInt(member.subgroupId.toString(), 10);
    originalAssignments.set(member.walletAddress, originalSubgroupId);
  }

  // Create mapping of member address -> new subgroup ID
  const newAssignments = new Map<string, number>();
  
  for (const [subgroupId, members] of newSubgroups) {
    for (const memberAddress of members) {
      newAssignments.set(memberAddress, subgroupId);
    }
  }

  // Compare assignments to find members that need reassignment
  const membersToReassign = [];
  let membersUnchanged = 0;

  for (const member of originalMemberData) {
    const walletAddress = member.walletAddress;
    const originalSubgroupId = originalAssignments.get(walletAddress);
    const newSubgroupId = newAssignments.get(walletAddress);

    // Skip if we can't determine assignments
    if (originalSubgroupId == null || newSubgroupId == null) {
      continue;
    }

    // Check if member was moved to a different subgroup
    if (originalSubgroupId !== newSubgroupId) {
      membersToReassign.push({
        walletAddress,
        fromSubgroupId: originalSubgroupId,
        toSubgroupId: newSubgroupId,
      });
    } else {
      membersUnchanged++;
    }
  }

  return {
    membersToReassign,
    totalMembers: originalMemberData.length,
    membersUnchanged,
  };
}
