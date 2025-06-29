/* @flow strict-local */

/**
 * Selectors for the new decoupled TandaPay data architecture
 *
 * These selectors provide access to:
 * - Community info data (basic community information)
 * - Member data (member batch information)
 * - Subgroup data (subgroup batch information)
 *
 * Each data type is managed independently with its own state,
 * caching, and invalidation logic.
 */

import { createSelector } from 'reselect';
import type { PerAccountState, Selector } from '../../../reduxTypes';
import type { CommunityInfoDataState } from '../reducers/communityInfoDataReducer';
import type { MemberDataState } from '../reducers/memberDataReducer';
import type { SubgroupDataState } from '../reducers/subgroupDataReducer';

// Base selectors for the new decoupled data
export const getCommunityInfoData = (state: PerAccountState): CommunityInfoDataState =>
  state.tandaPay.communityInfoData;

export const getMemberData = (state: PerAccountState): MemberDataState =>
  state.tandaPay.memberData;

export const getSubgroupData = (state: PerAccountState): SubgroupDataState =>
  state.tandaPay.subgroupData;

// Community info selectors
export const getCommunityInfo: Selector<mixed> = createSelector(
  [getCommunityInfoData],
  (communityInfoData) => communityInfoData.data
);

export const isCommunityInfoLoading: Selector<boolean> = createSelector(
  [getCommunityInfoData],
  (communityInfoData) => communityInfoData.loading
);

export const getCommunityInfoError: Selector<?string> = createSelector(
  [getCommunityInfoData],
  (communityInfoData) => communityInfoData.error
);

export const getCommunityInfoLastUpdated: Selector<?number> = createSelector(
  [getCommunityInfoData],
  (communityInfoData) => communityInfoData.lastUpdated
);

// Member data selectors
export const getMemberBatchInfo: Selector<mixed> = createSelector(
  [getMemberData],
  (memberData) => memberData.memberBatchInfo
);

export const isMemberDataLoading: Selector<boolean> = createSelector(
  [getMemberData],
  (memberData) => memberData.isLoading
);

export const getMemberDataError: Selector<?string> = createSelector(
  [getMemberData],
  (memberData) => memberData.error
);

export const getMemberDataLastUpdated: Selector<?string> = createSelector(
  [getMemberData],
  (memberData) => memberData.lastUpdated
);

// Subgroup data selectors
export const getSubgroupBatchInfo: Selector<mixed> = createSelector(
  [getSubgroupData],
  (subgroupData) => subgroupData.subgroupBatchInfo
);

export const isSubgroupDataLoading: Selector<boolean> = createSelector(
  [getSubgroupData],
  (subgroupData) => subgroupData.isLoading
);

export const getSubgroupDataError: Selector<?string> = createSelector(
  [getSubgroupData],
  (subgroupData) => subgroupData.error
);

export const getSubgroupDataLastUpdated: Selector<?string> = createSelector(
  [getSubgroupData],
  (subgroupData) => subgroupData.lastUpdated
);

// Combined data selectors (for backward compatibility)
export const isTandaPayDataLoading: Selector<boolean> = createSelector(
  [isCommunityInfoLoading, isMemberDataLoading, isSubgroupDataLoading],
  (communityLoading, memberLoading, subgroupLoading) =>
    communityLoading || memberLoading || subgroupLoading
);

export const hasTandaPayDataErrors: Selector<boolean> = createSelector(
  [getCommunityInfoError, getMemberDataError, getSubgroupDataError],
  (communityError, memberError, subgroupError) =>
    (communityError != null && communityError !== '')
    || (memberError != null && memberError !== '')
    || (subgroupError != null && subgroupError !== '')
);

export const getTandaPayDataErrors: Selector<Array<{| type: string, error: string |}>> = createSelector(
  [getCommunityInfoError, getMemberDataError, getSubgroupDataError],
  (communityError, memberError, subgroupError) => {
    const errors = [];
    if (communityError != null && communityError !== '') {
      errors.push({ type: 'community', error: communityError });
    }
    if (memberError != null && memberError !== '') {
      errors.push({ type: 'member', error: memberError });
    }
    if (subgroupError != null && subgroupError !== '') {
      errors.push({ type: 'subgroup', error: subgroupError });
    }
    return errors;
  }
);
