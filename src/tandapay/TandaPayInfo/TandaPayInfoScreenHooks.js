/* @flow strict-local */

import React from 'react';
import CommunityInfoManager from '../contract/data-managers/CommunityInfoManager';
import MemberDataManager from '../contract/data-managers/MemberDataManager';
import SubgroupDataManager from '../contract/data-managers/SubgroupDataManager';

/**
 * Custom hooks for TandaPayInfoScreen
 * Provides additional derived data and functionality
 */
export function useTandaPayInfoScreenHooks(): {|
  userMemberInfo: mixed,
  userSubgroupInfo: mixed,
  currentPeriodInfo: mixed,
  isDataStale: boolean,
  refreshAll: () => Promise<void>,
|} {
  const [userMemberInfo] = React.useState(null);
  const [userSubgroupInfo] = React.useState(null);
  const [currentPeriodInfo] = React.useState(null);

  // Check if any data is stale
  const isDataStale = React.useMemo(() => (
    CommunityInfoManager.isStale()
    || MemberDataManager.isStale()
    || SubgroupDataManager.isStale()
  ), []);

  // Refresh all data
  const refreshAll = React.useCallback(async () => {
    try {
      // For now, just invalidate the data
      // The actual fetch implementations will be added later
      CommunityInfoManager.invalidate();
      MemberDataManager.invalidate();
      SubgroupDataManager.invalidate();
    } catch (error) {
      // Silently handle errors for now
    }
  }, []);

  return {
    userMemberInfo,
    userSubgroupInfo,
    currentPeriodInfo,
    isDataStale,
    refreshAll,
  };
}
