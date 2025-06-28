/* eslint-disable jest/expect-expect */
/* eslint-disable no-console */
// @flow strict-local

import { autoReorg } from './autoReorgAlgorithm';
import type { AutoReorgParameters } from './autoReorgAlgorithm';

describe('Auto Reorg Algorithm - Invalid Subgroup Size Tests', () => {
  test('handling invalid subgroup size 3 - keep subgroup vs remove subgroup', () => {
    console.log('\n=== Testing invalid subgroup size 3 behavior ===');

    // Scenario: We have 15 total members
    // - Subgroup 1: 4 members (valid)
    // - Subgroup 2: 3 members (INVALID - too small)
    // - 8 unassigned members

    // Test Case A: Keep the size-3 subgroup AND put its members in needsAssigned
    console.log('\n--- Test A: Keep invalid subgroup + put members in needsAssigned ---');
    const subgroupsA = new Map();
    subgroupsA.set(1, ['member1', 'member2', 'member3', 'member4']); // Valid size 4
    subgroupsA.set(2, ['member5', 'member6', 'member7']); // Invalid size 3 - kept in subgroups

    const paramsA: AutoReorgParameters = {
      subgroups: subgroupsA,
      needsAssigned: [
        'member5', 'member6', 'member7', // Same members from invalid subgroup 2
        'member8', 'member9', 'member10', 'member11', 'member12', 'member13', 'member14', 'member15'
      ], // 11 total in needsAssigned
    };

    console.log('Input A:');
    console.log('  Subgroup 1:', paramsA.subgroups.get(1));
    console.log('  Subgroup 2:', paramsA.subgroups.get(2));
    console.log('  NeedsAssigned count:', paramsA.needsAssigned.length);

    try {
      const resultA = autoReorg(paramsA);
      console.log('Result A:');
      for (const [id, members] of resultA.entries()) {
        console.log(`  Subgroup ${id}: [${members.join(', ')}] (size: ${members.length})`);
      }
    } catch (error) {
      console.log('Error A:', error.message);
    }

    // Test Case B: Remove the invalid subgroup entirely, put members only in needsAssigned
    console.log('\n--- Test B: Remove invalid subgroup, members only in needsAssigned ---');
    const subgroupsB = new Map();
    subgroupsB.set(1, ['member1', 'member2', 'member3', 'member4']); // Valid size 4
    // subgroup 2 is NOT included at all

    const paramsB: AutoReorgParameters = {
      subgroups: subgroupsB,
      needsAssigned: [
        'member5', 'member6', 'member7', // Members from invalid subgroup 2
        'member8', 'member9', 'member10', 'member11', 'member12', 'member13', 'member14', 'member15'
      ], // 11 total in needsAssigned
    };

    console.log('Input B:');
    console.log('  Subgroup 1:', paramsB.subgroups.get(1));
    console.log('  Subgroup 2: (not included)');
    console.log('  NeedsAssigned count:', paramsB.needsAssigned.length);

    try {
      const resultB = autoReorg(paramsB);
      console.log('Result B:');
      for (const [id, members] of resultB.entries()) {
        console.log(`  Subgroup ${id}: [${members.join(', ')}] (size: ${members.length})`);
      }
    } catch (error) {
      console.log('Error B:', error.message);
    }

    // Test Case C: Keep invalid subgroup but DON'T put members in needsAssigned
    console.log('\n--- Test C: Keep invalid subgroup, members NOT in needsAssigned ---');
    const subgroupsC = new Map();
    subgroupsC.set(1, ['member1', 'member2', 'member3', 'member4']); // Valid size 4
    subgroupsC.set(2, ['member5', 'member6', 'member7']); // Invalid size 3 - kept in subgroups

    const paramsC: AutoReorgParameters = {
      subgroups: subgroupsC,
      needsAssigned: [
        'member8', 'member9', 'member10', 'member11', 'member12', 'member13', 'member14', 'member15'
      ], // 8 total in needsAssigned (members 5,6,7 NOT included)
    };

    console.log('Input C:');
    console.log('  Subgroup 1:', paramsC.subgroups.get(1));
    console.log('  Subgroup 2:', paramsC.subgroups.get(2));
    console.log('  NeedsAssigned count:', paramsC.needsAssigned.length);

    try {
      const resultC = autoReorg(paramsC);
      console.log('Result C:');
      for (const [id, members] of resultC.entries()) {
        console.log(`  Subgroup ${id}: [${members.join(', ')}] (size: ${members.length})`);
      }
    } catch (error) {
      console.log('Error C:', error.message);
    }

    console.log('\n=== Test completed ===');
  });
});
