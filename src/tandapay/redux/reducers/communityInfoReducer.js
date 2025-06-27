/* @flow strict-local */

import {
  RESET_ACCOUNT_DATA,
  TANDAPAY_COMMUNITY_INFO_UPDATE,
  TANDAPAY_COMMUNITY_INFO_LOADING,
  TANDAPAY_COMMUNITY_INFO_ERROR,
  TANDAPAY_COMMUNITY_INFO_CLEAR,
  TANDAPAY_BATCH_MEMBERS_UPDATE,
  TANDAPAY_BATCH_SUBGROUPS_UPDATE,
  TANDAPAY_BATCH_DATA_INVALIDATE,
} from '../../../actionConstants';
import type { Action } from '../../../types';
import type { CommunityInfo } from '../../contract/communityInfo';
import type { MemberInfo, SubgroupInfo } from '../../contract/types';

// Community info reducer state
export type CommunityInfoState = $ReadOnly<{|
  // The current community info data
  communityInfo: ?CommunityInfo,
  // Loading state
  loading: boolean,
  // Error message if fetch failed
  error: ?string,
  // Timestamp of last successful fetch
  lastUpdated: ?number,
  // Contract address for which this data is valid
  contractAddress: ?string,
  // User address for which this data is valid
  userAddress: ?string,
  // Cached batch members data (stored separately from communityInfo)
  cachedBatchMembers: ?Array<MemberInfo>,
  // Cached batch subgroups data (stored separately from communityInfo)
  cachedBatchSubgroups: ?Array<SubgroupInfo>,
  // Timestamp of last batch members fetch
  batchMembersLastUpdated: ?number,
  // Timestamp of last batch subgroups fetch
  batchSubgroupsLastUpdated: ?number,
|}>;

const initialState: CommunityInfoState = {
  communityInfo: null,
  loading: false,
  error: null,
  lastUpdated: null,
  contractAddress: null,
  userAddress: null,
  cachedBatchMembers: null,
  cachedBatchSubgroups: null,
  batchMembersLastUpdated: null,
  batchSubgroupsLastUpdated: null,
};

// eslint-disable-next-line default-param-last
export default (state: CommunityInfoState = initialState, action: Action): CommunityInfoState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case TANDAPAY_COMMUNITY_INFO_LOADING: {
      // $FlowFixMe[prop-missing] - Flow doesn't understand discriminated unions well
      const loading: boolean = action.loading;

      return {
        ...state,
        loading,
        error: loading ? null : state.error, // Clear error when starting to load
      };
    }

    case TANDAPAY_COMMUNITY_INFO_UPDATE: {
      // $FlowFixMe[prop-missing] - Action discriminated union handling
      return {
        ...state,
        communityInfo: action.communityInfo,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
        contractAddress: action.contractAddress,
        userAddress: action.userAddress,
      };
    }

    case TANDAPAY_COMMUNITY_INFO_ERROR: {
      // $FlowFixMe[prop-missing] - Action discriminated union handling
      return {
        ...state,
        loading: false,
        error: action.error,
        communityInfo: null, // Clear stale data on error
      };
    }

    case TANDAPAY_COMMUNITY_INFO_CLEAR: {
      return {
        ...initialState,
      };
    }

    case TANDAPAY_BATCH_MEMBERS_UPDATE: {
      // $FlowFixMe[prop-missing] - Action discriminated union handling
      const { allMembersInfo, contractAddress, userAddress, timestamp } = action;

      return {
        ...state,
        // Store batch data in separate fields so it persists independently of communityInfo
        cachedBatchMembers: allMembersInfo,
        batchMembersLastUpdated: timestamp,
        // Also update communityInfo if it exists
        communityInfo: state.communityInfo ? {
          ...state.communityInfo,
          allMembersInfo,
        } : state.communityInfo,
        contractAddress: contractAddress != null ? contractAddress : state.contractAddress,
        userAddress: userAddress != null ? userAddress : state.userAddress,
      };
    }

    case TANDAPAY_BATCH_SUBGROUPS_UPDATE: {
      // $FlowFixMe[prop-missing] - Action discriminated union handling
      const { allSubgroupsInfo, contractAddress, userAddress, timestamp } = action;

      return {
        ...state,
        // Store batch data in separate fields so it persists independently of communityInfo
        cachedBatchSubgroups: allSubgroupsInfo,
        batchSubgroupsLastUpdated: timestamp,
        // Also update communityInfo if it exists
        communityInfo: state.communityInfo ? {
          ...state.communityInfo,
          allSubgroupsInfo,
        } : state.communityInfo,
        contractAddress: contractAddress != null ? contractAddress : state.contractAddress,
        userAddress: userAddress != null ? userAddress : state.userAddress,
      };
    }

    case TANDAPAY_BATCH_DATA_INVALIDATE: {
      return {
        ...state,
        // Clear the separate batch data fields
        cachedBatchMembers: null,
        cachedBatchSubgroups: null,
        batchMembersLastUpdated: null,
        batchSubgroupsLastUpdated: null,
        // Also clear from communityInfo if it exists
        communityInfo: state.communityInfo ? {
          ...state.communityInfo,
          allMembersInfo: null,
          allSubgroupsInfo: null,
        } : state.communityInfo,
      };
    }

    default:
      return state;
  }
};
