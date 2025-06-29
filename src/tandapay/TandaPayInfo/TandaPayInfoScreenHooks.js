/* @flow strict-local */

import React from 'react';
import { useCommunityInfo } from '../contract/data-managers/CommunityInfoManager';
import { useMemberData } from '../contract/data-managers/MemberDataManager';
import { useSubgroupData } from '../contract/data-managers/SubgroupDataManager';

/**
 * Custom hooks for TandaPayInfoScreen
 * Provides additional derived data and functionality based on the decoupled data architecture
 */
export function useTandaPayInfoScreenHooks(): {|
  userMemberInfo: mixed,
  userSubgroupInfo: mixed,
  currentPeriodInfo: mixed,
  isDataStale: boolean,
  refreshAll: () => Promise<void>,
|} {
  const { data: communityInfo, isStale: communityStale } = useCommunityInfo();
  const { isStale: memberStale } = useMemberData();
  const { isStale: subgroupStale } = useSubgroupData();

  // Extract user-specific information from community data
  const userMemberInfo = React.useMemo(() => {
    if (communityInfo != null && typeof communityInfo === 'object') {
      // $FlowFixMe[prop-missing] - communityInfo is mixed type, accessing userMemberInfo safely
      const userInfo = communityInfo.userMemberInfo;
      return userInfo != null ? userInfo : null;
    }
    return null;
  }, [communityInfo]);

  const userSubgroupInfo = React.useMemo(() => {
    if (communityInfo != null && typeof communityInfo === 'object') {
      // $FlowFixMe[prop-missing] - communityInfo is mixed type, accessing userSubgroupInfo safely
      const subgroupInfo = communityInfo.userSubgroupInfo;
      return subgroupInfo != null ? subgroupInfo : null;
    }
    return null;
  }, [communityInfo]);

  const currentPeriodInfo = React.useMemo(() => {
    if (communityInfo != null && typeof communityInfo === 'object') {
      // $FlowFixMe[prop-missing] - communityInfo is mixed type, accessing currentPeriodInfo safely
      const periodInfo = communityInfo.currentPeriodInfo;
      return periodInfo != null ? periodInfo : null;
    }
    return null;
  }, [communityInfo]);

  // Check if any data is stale
  const isDataStale = React.useMemo(() => (
    communityStale || memberStale || subgroupStale
  ), [communityStale, memberStale, subgroupStale]);

  // Refresh all data
  const refreshAll = React.useCallback(async () => {
    // For now, this is a placeholder - the actual implementation would
    // trigger refresh actions for all three data managers
    // In a real implementation, this would dispatch actions to refresh data

    // Future implementation would be something like:
    // await Promise.all([
    //   CommunityInfoManager.refresh(),
    //   MemberDataManager.refresh(),
    //   SubgroupDataManager.refresh(),
    // ]);
  }, []);

  return {
    userMemberInfo,
    userSubgroupInfo,
    currentPeriodInfo,
    isDataStale,
    refreshAll,
  };
}
