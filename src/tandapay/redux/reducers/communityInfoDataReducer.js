/* @flow strict-local */

import {
  RESET_ACCOUNT_DATA,
  TANDAPAY_COMMUNITY_INFO_UPDATE,
  TANDAPAY_COMMUNITY_INFO_LOADING,
  TANDAPAY_COMMUNITY_INFO_ERROR,
  TANDAPAY_COMMUNITY_INFO_INVALIDATE,
} from '../../../actionConstants';
import type { Action } from '../../../types';
import type { CommunityInfo } from '../../contract/types/index';

// Community info specific state
export type CommunityInfoDataState = $ReadOnly<{|
  data: ?CommunityInfo,
  loading: boolean,
  error: ?string,
  lastUpdated: ?number,
  contractAddress: ?string,
  userAddress: ?string,
|}>;

const initialState: CommunityInfoDataState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
  contractAddress: null,
  userAddress: null,
};

// eslint-disable-next-line default-param-last
export default (state: CommunityInfoDataState = initialState, action: Action): CommunityInfoDataState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case TANDAPAY_COMMUNITY_INFO_LOADING: {
      // $FlowFixMe[prop-missing] - Action discriminated union handling
      const loading: boolean = action.loading;

      return {
        ...state,
        loading,
        error: loading ? null : state.error,
      };
    }

    case TANDAPAY_COMMUNITY_INFO_UPDATE: {
      // $FlowFixMe[prop-missing] - Action discriminated union handling
      return {
        ...state,
        data: action.communityInfo,
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
        data: null, // Clear stale data on error
      };
    }

    case TANDAPAY_COMMUNITY_INFO_INVALIDATE: {
      return {
        ...state,
        data: null,
        lastUpdated: null,
        error: null,
      };
    }

    default:
      return state;
  }
};
