/* @flow strict-local */

import {
  RESET_ACCOUNT_DATA,
  TANDAPAY_COMMUNITY_INFO_UPDATE,
  TANDAPAY_COMMUNITY_INFO_LOADING,
  TANDAPAY_COMMUNITY_INFO_ERROR,
  TANDAPAY_COMMUNITY_INFO_CLEAR,
} from '../../../actionConstants';
import type { Action } from '../../../types';
import type { CommunityInfo } from '../../contract/communityInfo';

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
|}>;

const initialState: CommunityInfoState = {
  communityInfo: null,
  loading: false,
  error: null,
  lastUpdated: null,
  contractAddress: null,
  userAddress: null,
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

    default:
      return state;
  }
};
