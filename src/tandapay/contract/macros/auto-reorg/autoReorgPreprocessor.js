// @flow strict-local

/**
 * Preprocessor for Auto-Reorganization Algorithm
 *
 * Converts MemberInfo array to autoReorg input format
 */

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';
import type { MemberInfo } from '../../types';
import type { AutoReorgParameters } from './autoReorgAlgorithm';

// BigNumber-like type for Flow compatibility
type BigNumberLike = {
  toNumber(): number,
  toString(): string,
};

// Minimum required properties for the preprocessor
export type MemberInfoMinimal = {
  +subgroupId: BigNumberLike,
  +walletAddress: string,
  // Allow additional properties for compatibility with full MemberInfo
};

export type PreprocessorResult =
  | {| success: true, data: AutoReorgParameters |}
  | {| success: false, error: string |};

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
 * @param members Array of member info (full or minimal)
 * @returns AutoReorg parameters or error
 */
export function preprocessMembersForAutoReorg(
  members: Array<MemberInfo | MemberInfoMinimal>
): PreprocessorResult {
  // Step 1: Ensure minimum member count
  if (members.length < 12) {
    return {
      success: false,
      error: `Insufficient members for auto-reorg. Need at least 12 members, got ${members.length}.`
    };
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

  // Step 4: Move members from invalid subgroups to needsAssigned
  for (const [, membersList] of subgroups.entries()) {
    if (membersList.length < 4) {
      // Invalid subgroup - move all members to needsAssigned
      needsAssigned.push(...membersList);
      // Keep the subgroup but with the same members also in needsAssigned
      // This allows the algorithm to filter them out properly
    }
  }

  return {
    success: true,
    data: {
      subgroups,
      needsAssigned,
    }
  };
}

/**
 * Helper function to create mock member data for testing
 */
export function createMockMember(
  walletAddress: string,
  subgroupId: number
): MemberInfoMinimal {
  return {
    subgroupId: ethers.BigNumber.from(subgroupId),
    walletAddress,
  };
}
