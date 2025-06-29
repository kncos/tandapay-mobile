// @flow strict-local

/**
 * TandaPay Smart Contract Constants
 *
 * This file contains all the constants used throughout the TandaPay smart contract system.
 * These values should match the constants defined in the smart contract code.
 */

export const SubgroupConstants = {
  minSize: 4,
  maxSize: 7,
  noSubgroupIdPlaceholder: 0,
};

export const InitializationStateConstants = {
  minCommunitySizeToExit: 12,
  minSubgroupCountToExit: 3,
};

export const ExpectedSuccessorCounts = {
  communitySmallerThan35: 2,
  communityLargerThan35: 6,
  getExpectedSuccessorCount: (communitySize: number): number =>
    communitySize >= 35 ? 6 : 2,
};

/**
 * Community state constants
 */
export const CommunityStates = {
  initialization: 'initialization',
  operational: 'operational',
  dissolved: 'dissolved',
};

/**
 * Member status constants
 */
export const MemberStatuses = {
  active: 'active',
  inactive: 'inactive',
  expelled: 'expelled',
};

/**
 * Assignment status constants
 */
export const AssignmentStatuses = {
  assigned: 'assigned',
  unassigned: 'unassigned',
  reassigning: 'reassigning',
};
