// @flow strict-local

import {
  TANDAPAY_MEMBER_DATA_UPDATE,
  TANDAPAY_MEMBER_DATA_INVALIDATE,
} from '../../../actionConstants';

import type { Action } from '../../../types';

export type MemberDataState = $ReadOnly<{|
  memberBatchInfo: mixed,
  lastUpdated: string | null,
  isLoading: boolean,
  error: string | null,
|}>;

const initialState: MemberDataState = {
  memberBatchInfo: null,
  lastUpdated: null,
  isLoading: false,
  error: null,
};

export default function memberDataReducer(
  state: MemberDataState | void,
  action: Action,
): MemberDataState {
  const currentState = state || initialState;

  switch (action.type) {
    case TANDAPAY_MEMBER_DATA_UPDATE: {
      // $FlowFixMe[prop-missing] - Action discriminated union handling
      const { memberBatchInfo, isLoading, error } = action;

      return {
        ...currentState,
        memberBatchInfo,
        lastUpdated: new Date().toISOString(),
        isLoading: isLoading || false,
        error: error || null,
      };
    }

    case TANDAPAY_MEMBER_DATA_INVALIDATE: {
      return {
        ...currentState,
        memberBatchInfo: null,
        lastUpdated: null,
        isLoading: false,
        error: null,
      };
    }

    default:
      return currentState;
  }
}
