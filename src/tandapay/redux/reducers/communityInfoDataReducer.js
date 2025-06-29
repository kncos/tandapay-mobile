/* @flow strict-local */

/**
 * Redux reducer for community information data
 *
 * This reducer manages the core TandaPay community state including:
 * - Contract configuration and metadata
 * - Current period and claim information
 * - User-specific derived data (member status, subgroup info, etc.)
 *
 * This is separate from batch data (all members/subgroups) which are managed
 * by their respective data managers and reducers.
 */

import {
  RESET_ACCOUNT_DATA,
  TANDAPAY_COMMUNITY_INFO_UPDATE,
  TANDAPAY_COMMUNITY_INFO_LOADING,
  TANDAPAY_COMMUNITY_INFO_ERROR,
  TANDAPAY_COMMUNITY_INFO_INVALIDATE,
} from '../../../actionConstants';
import type { Action } from '../../../types';
import type { CommunityInfo } from '../../contract/types/index';

/**
 * Community info specific state
 */
export type CommunityInfoDataState = $ReadOnly<{|
  /** The current community info data from the contract */
  data: ?CommunityInfo,
  /** Whether a fetch operation is currently in progress */
  loading: boolean,
  /** Error message if the last fetch failed */
  error: ?string,
  /** Timestamp of when data was last successfully updated */
  lastUpdated: ?number,
  /** Contract address for which this data is valid */
  contractAddress: ?string,
  /** User address for which this data is valid */
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
