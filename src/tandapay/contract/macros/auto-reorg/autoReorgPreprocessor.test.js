/* eslint-disable jest/no-commented-out-tests */
// /* eslint-disable jest/expect-expect */
// /* eslint-disable no-console */
// // @flow strict-local
//
// import { autoReorg } from './autoReorgAlgorithm';
// import { preprocessMembersForAutoReorg, createMockMember } from './autoReorgPreprocessor';
//
// describe('Auto Reorg with Preprocessor Tests', () => {
//   test('preprocessor with various member scenarios', () => {
//     console.log('\n=== Testing Auto Reorg with Preprocessor ===');
//
//     // Test 1: Mixed valid subgroups and unassigned members (15 total members)
//     console.log('\n--- Test 1: Mixed subgroups with preprocessor ---');
//     const members1 = [
//       // Subgroup 1: Valid size 4
//       createMockMember('0x1111111111111111111111111111111111111111', 1),
//       createMockMember('0x2222222222222222222222222222222222222222', 1),
//       createMockMember('0x3333333333333333333333333333333333333333', 1),
//       createMockMember('0x4444444444444444444444444444444444444444', 1),
//
//       // Subgroup 2: Invalid size 3 (should be moved to needsAssigned)
//       createMockMember('0x5555555555555555555555555555555555555555', 2),
//       createMockMember('0x6666666666666666666666666666666666666666', 2),
//       createMockMember('0x7777777777777777777777777777777777777777', 2),
//
//       // Subgroup 3: Valid size 5
//       createMockMember('0x8888888888888888888888888888888888888888', 3),
//       createMockMember('0x9999999999999999999999999999999999999999', 3),
//       createMockMember('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 3),
//       createMockMember('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 3),
//       createMockMember('0xcccccccccccccccccccccccccccccccccccccccc', 3),
//
//       // Unassigned members (subgroupId = 0)
//       createMockMember('0xdddddddddddddddddddddddddddddddddddddddd', 0),
//       createMockMember('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 0),
//       createMockMember('0xffffffffffffffffffffffffffffffffffffffff', 0),
//     ];
//
//     console.log(`Input: ${members1.length} members`);
//     console.log('  Subgroup 1: 4 members (valid)');
//     console.log('  Subgroup 2: 3 members (invalid - should be moved to needsAssigned)');
//     console.log('  Subgroup 3: 5 members (valid)');
//     console.log('  Unassigned: 3 members');
//
//     const preprocessResult1 = preprocessMembersForAutoReorg(members1);
//     if (!preprocessResult1.success) {
//       console.log('Preprocessor Error:', preprocessResult1.error);
//       return;
//     }
//
//     console.log('After preprocessing:');
//     console.log('  Subgroups:');
//     for (const [id, membersList] of preprocessResult1.data.subgroups.entries()) {
//       console.log(`    Subgroup ${id}: ${membersList.length} members`);
//     }
//     console.log(`  NeedsAssigned: ${preprocessResult1.data.needsAssigned.length} members`);
//
//     const result1 = autoReorg(preprocessResult1.data);
//     console.log('Final Result:');
//     for (const [id, membersList] of result1.entries()) {
//       console.log(`  Subgroup ${id}: ${membersList.length} members`);
//     }
//
//     // Test 2: Insufficient members (should fail)
//     console.log('\n--- Test 2: Insufficient members (should fail) ---');
//     const members2 = [
//       createMockMember('0x1111111111111111111111111111111111111111', 1),
//       createMockMember('0x2222222222222222222222222222222222222222', 1),
//       createMockMember('0x3333333333333333333333333333333333333333', 1),
//       createMockMember('0x4444444444444444444444444444444444444444', 0),
//       createMockMember('0x5555555555555555555555555555555555555555', 0),
//       // Only 5 members total - should fail
//     ];
//
//     const preprocessResult2 = preprocessMembersForAutoReorg(members2);
//     if (!preprocessResult2.success) {
//       console.log('Expected Error:', preprocessResult2.error);
//     } else {
//       console.log('Unexpected success - should have failed!');
//     }
//
//     // Test 3: All members in small invalid subgroups (12 total members)
//     console.log('\n--- Test 3: All members in small invalid subgroups ---');
//     const members3 = [
//       // Subgroup 1: 3 members (invalid)
//       createMockMember('0x1111111111111111111111111111111111111111', 1),
//       createMockMember('0x2222222222222222222222222222222222222222', 1),
//       createMockMember('0x3333333333333333333333333333333333333333', 1),
//
//       // Subgroup 2: 3 members (invalid)
//       createMockMember('0x4444444444444444444444444444444444444444', 2),
//       createMockMember('0x5555555555555555555555555555555555555555', 2),
//       createMockMember('0x6666666666666666666666666666666666666666', 2),
//
//       // Subgroup 3: 3 members (invalid)
//       createMockMember('0x7777777777777777777777777777777777777777', 3),
//       createMockMember('0x8888888888888888888888888888888888888888', 3),
//       createMockMember('0x9999999999999999999999999999999999999999', 3),
//
//       // Subgroup 4: 3 members (invalid)
//       createMockMember('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 4),
//       createMockMember('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 4),
//       createMockMember('0xcccccccccccccccccccccccccccccccccccccccc', 4),
//     ];
//
//     console.log(`Input: ${members3.length} members`);
//     console.log('  All in subgroups of size 3 (all invalid)');
//
//     const preprocessResult3 = preprocessMembersForAutoReorg(members3);
//     if (!preprocessResult3.success) {
//       console.log('Preprocessor Error:', preprocessResult3.error);
//       return;
//     }
//
//     console.log('After preprocessing:');
//     console.log(`  NeedsAssigned: ${preprocessResult3.data.needsAssigned.length} members (should be 12)`);
//
//     const result3 = autoReorg(preprocessResult3.data);
//     console.log('Final Result:');
//     for (const [id, membersList] of result3.entries()) {
//       console.log(`  Subgroup ${id}: ${membersList.length} members`);
//     }
//
//     console.log('\n=== All preprocessor tests completed ===');
//   });
// });
//
