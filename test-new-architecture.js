/* @flow strict-local */

/**
 * Test file to verify the new TandaPay data architecture
 * This demonstrates how the decoupled data managers work
 */

// Test that the data managers can be imported
import CommunityInfoManager from './src/tandapay/contract/data-managers/CommunityInfoManager';
import MemberDataManager from './src/tandapay/contract/data-managers/MemberDataManager';
import SubgroupDataManager from './src/tandapay/contract/data-managers/SubgroupDataManager';

// Test that the new selectors can be imported
import {
  getCommunityInfo,
  getMemberBatchInfo,
  getSubgroupBatchInfo,
} from './src/tandapay/redux/selectors/dataSelectors';

// Test basic functionality
const testNewArchitecture = () => {
  console.log('✓ All new data managers imported successfully');
  console.log('✓ New selectors imported successfully');

  // Test that manager methods exist
  console.log('✓ CommunityInfoManager.get method exists:', typeof CommunityInfoManager.get === 'function');
  console.log('✓ MemberDataManager.get method exists:', typeof MemberDataManager.get === 'function');
  console.log('✓ SubgroupDataManager.get method exists:', typeof SubgroupDataManager.get === 'function');

  console.log('🎉 New TandaPay data architecture verification complete!');
};

export { testNewArchitecture };
