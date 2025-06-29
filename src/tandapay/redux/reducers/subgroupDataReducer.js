// @flow strict-local

import {
  TANDAPAY_SUBGROUP_DATA_UPDATE,
  TANDAPAY_SUBGROUP_DATA_INVALIDATE,
} from '../../../actionConstants';

import type { Action } from '../../../types';

export type SubgroupDataState = $ReadOnly<{|
  subgroupBatchInfo: mixed,
  lastUpdated: string | null,
  isLoading: boolean,
  error: string | null,
|}>;

const initialState: SubgroupDataState = {
  subgroupBatchInfo: null,
  lastUpdated: null,
  isLoading: false,
  error: null,
};

export default function subgroupDataReducer(
  state: SubgroupDataState | void,
  action: Action,
): SubgroupDataState {
  const currentState = state || initialState;

  switch (action.type) {
    case TANDAPAY_SUBGROUP_DATA_UPDATE: {
      // $FlowFixMe[prop-missing] - Action discriminated union handling
      const { subgroupBatchInfo, isLoading, error } = action;

      return {
        ...currentState,
        subgroupBatchInfo,
        lastUpdated: new Date().toISOString(),
        isLoading: isLoading || false,
        error: error || null,
      };
    }

    case TANDAPAY_SUBGROUP_DATA_INVALIDATE: {
      return {
        ...currentState,
        subgroupBatchInfo: null,
        lastUpdated: null,
        isLoading: false,
        error: null,
      };
    }

    default:
      return currentState;
  }
}
