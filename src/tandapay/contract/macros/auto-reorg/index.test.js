// @flow strict-local

/**
 * Test for auto-reorg index.js API
 */

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';
import { executeAutoReorg, validateAutoReorg, AUTO_REORG_MACRO } from './index';
import type { MemberInfo } from '../../types';

// Mock MemberInfo data for testing
function createMockMemberInfo(
  walletAddress: string,
  subgroupId: number,
): MemberInfo {
  return {
    id: ethers.BigNumber.from(1),
    walletAddress,
    subgroupId: ethers.BigNumber.from(subgroupId),
    assignmentStatus: 5, // AssignmentSuccessful
    memberStatus: 1, // Valid
    isEligibleForCoverageThisPeriod: true,
    isPremiumPaidThisPeriod: true,
    availableToWithdrawAmount: ethers.BigNumber.from(0),
    communityEscrowAmount: ethers.BigNumber.from(0),
    savingsEscrowAmount: ethers.BigNumber.from(0),
    pendingRefundAmount: ethers.BigNumber.from(0),
    queuedRefundAmountThisPeriod: ethers.BigNumber.from(0),
  };
}

// Test the API
describe('Auto-reorg Index API', () => {
  test('AUTO_REORG_MACRO metadata is properly defined', () => {
    expect(AUTO_REORG_MACRO.id).toBe('auto-reorg');
    expect(AUTO_REORG_MACRO.name).toBe('Auto Reorganization');
    expect(typeof AUTO_REORG_MACRO.description).toBe('string');
    expect(AUTO_REORG_MACRO.description.length).toBeGreaterThan(0);
  });

  test('validateAutoReorg correctly validates member data', () => {
    // Test with insufficient members
    const fewMembers = [
      createMockMemberInfo('0x1', 1),
      createMockMemberInfo('0x2', 1),
    ];

    const result1 = validateAutoReorg(fewMembers);
    expect(result1.canExecute).toBe(false);
    expect(result1.reason).toContain('4 members');

    // Test with sufficient members
    const manyMembers = [];
    for (let i = 1; i <= 15; i++) {
      manyMembers.push(createMockMemberInfo(`0x${i}`, i <= 4 ? 1 : i <= 8 ? 2 : 0));
    }

    const result2 = validateAutoReorg(manyMembers);
    expect(result2.canExecute).toBe(true);
    expect(result2.reason).toBeUndefined();
  });

  test('executeAutoReorg processes member data correctly', async () => {
    // Create test data - 15 members with mixed subgroup assignments
    const members = [];
    for (let i = 1; i <= 15; i++) {
      const subgroupId = i <= 4 ? 1 : i <= 7 ? 2 : i <= 12 ? 3 : 0; // Mixed valid/invalid subgroups
      members.push(createMockMemberInfo(`0x${i.toString().padStart(40, '0')}`, subgroupId));
    }

    const result = await executeAutoReorg(members);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.newSubgroups).toBeDefined();
    expect(result.subgroupsChanged).toBeGreaterThan(0);
    expect(result.membersReassigned).toBeGreaterThan(0);

    // Verify that all members are assigned to valid subgroups
    expect(result.newSubgroups).toBeDefined();

    const newSubgroups = result.newSubgroups || new Map();
    let allMembersValid = true;
    for (const [, membersList] of newSubgroups) {
      if (membersList.length < 4 || membersList.length > 7) {
        allMembersValid = false;
        break;
      }
    }
    expect(allMembersValid).toBe(true);
  });

  test('executeAutoReorg handles insufficient members gracefully', async () => {
    const fewMembers = [
      createMockMemberInfo('0x1', 1),
      createMockMemberInfo('0x2', 1),
    ];

    const result = await executeAutoReorg(fewMembers);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Insufficient members');
  });
});
