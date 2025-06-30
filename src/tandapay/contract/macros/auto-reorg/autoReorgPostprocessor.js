/* @flow strict-local */

/**
 * Auto-Reorg Postprocessor
 *
 * Compares the original member assignments with the auto-reorg results
 * to determine which members need to be reassigned to new subgroups.
 */

import { MemberStatus } from '../../types';
import type { MemberInfo, SubgroupInfo } from '../../types';

/**
 * Experimental flag: When true, compacts subgroup IDs to remove gaps and ensure consecutive numbering
 */
const USE_SUBGROUP_ID_COMPACTION = true;

/**
 * Result of postprocessing auto-reorg output
 */
export type PostprocessorResult = {|
  /** Transaction data for members that need to be reassigned */
  +transactions: Array<{|
    +memberWalletAddress: string,
    +subgroupId: number,
    +isReorging: boolean,
  |}>,
  /** Total number of members processed */
  +totalMembers: number,
  /** Number of members that stayed in their original subgroups */
  +membersUnchanged: number,
|};

/**
 * Deprecated: Use PostprocessorResult instead
 * @deprecated
 */
export type AutoReorgTransactionData = {|
  +membersToReassign: Array<{|
    +walletAddress: string,
    +toSubgroupId: number,
  |}>,
  +totalMembers: number,
  +membersUnchanged: number,
|};

/**
 * Compact subgroup IDs to remove gaps and ensure consecutive numbering
 *
 * @param newSubgroups Map of subgroup ID to member addresses
 * @returns Map with compacted subgroup IDs (starting from 1, consecutive)
 */
function compactSubgroupIds(
  newSubgroups: Map<number, Array<string>>
): Map<number, Array<string>> {
  const compactedSubgroups = new Map<number, Array<string>>();

  // Get all subgroup IDs and sort them
  const subgroupIds = Array.from(newSubgroups.keys()).sort((a, b) => a - b);

  // Reassign consecutive IDs starting from 1 (TandaPay subgroups are 1-based)
  subgroupIds.forEach((originalId, index) => {
    const members = newSubgroups.get(originalId);
    if (members && members.length > 0) {
      compactedSubgroups.set(index + 1, members);
    }
  });

  return compactedSubgroups;
}

/**
 * Postprocess auto-reorg results to determine what transactions need to be executed
 *
 * @param originalMemberData Raw member data from contract
 * @param originalSubgroupData Raw subgroup data from contract
 * @param newSubgroups Auto-reorg algorithm output
 * @returns Information about which members need reassignment
 */
export function postprocessAutoReorgResults(
  originalMemberData: Array<MemberInfo>,
  originalSubgroupData: Array<SubgroupInfo>,
  newSubgroups: Map<number, Array<string>>
): PostprocessorResult {
  // Conditionally compact subgroup IDs based on experimental flag
  const processedSubgroups = USE_SUBGROUP_ID_COMPACTION
    ? compactSubgroupIds(newSubgroups)
    : newSubgroups;

  // Create mapping of member address -> original subgroup ID
  const originalAssignments = new Map<string, number>();

  for (const member of originalMemberData) {
    // $FlowFixMe[incompatible-use] - BigNumber has toString method
    const originalSubgroupId = parseInt(member.subgroupId.toString(), 10);
    originalAssignments.set(member.walletAddress, originalSubgroupId);
  }

  // Create mapping of member address -> new subgroup ID (using processed IDs)
  const newAssignments = new Map<string, number>();

  for (const [subgroupId, members] of processedSubgroups) {
    for (const memberAddress of members) {
      newAssignments.set(memberAddress, subgroupId);
    }
  }

  // Compare assignments to find members that need reassignment
  const transactions = [];
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
      // Determine if this is a reorg transaction based on member status
      // isReorging should be true only if the member has PaidInvalid status
      const isReorging = member.memberStatus === MemberStatus.PaidInvalid;

      transactions.push({
        memberWalletAddress: walletAddress,
        subgroupId: newSubgroupId,
        isReorging,
      });
    } else {
      membersUnchanged++;
    }
  }

  return {
    transactions,
    totalMembers: originalMemberData.length,
    membersUnchanged,
  };
}
