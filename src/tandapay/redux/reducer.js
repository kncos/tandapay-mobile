/* @flow strict-local */

import type { Action } from '../../types';
import settingsReducer from './reducers/settingsReducer';
import tokensReducer from './reducers/tokensReducer';
import communityInfoDataReducer from './reducers/communityInfoDataReducer';
import memberDataReducer from './reducers/memberDataReducer';
import subgroupDataReducer from './reducers/subgroupDataReducer';
import type { TandaPaySettingsState } from './reducers/settingsReducer';
import type { TokenState } from '../tokens/tokenTypes';
import type { CommunityInfoDataState } from './reducers/communityInfoDataReducer';
import type { MemberDataState } from './reducers/memberDataReducer';
import type { SubgroupDataState } from './reducers/subgroupDataReducer';

export type TandaPayState = $ReadOnly<{|
  settings: TandaPaySettingsState,
  tokens: TokenState,
  // New decoupled data structures
  communityInfoData: CommunityInfoDataState,
  memberData: MemberDataState,
  subgroupData: SubgroupDataState,
|}>;

// Re-export types for backward compatibility
export type { TandaPaySettingsState };
export type { CommunityInfoDataState };
export type { MemberDataState };
export type { SubgroupDataState };

// Combined TandaPay reducer
// eslint-disable-next-line default-param-last
export default (state: TandaPayState | void, action: Action): TandaPayState => {
  const currentState = state || {
    settings: settingsReducer(undefined, action),
    tokens: tokensReducer(undefined, action),
    communityInfoData: communityInfoDataReducer(undefined, action),
    memberData: memberDataReducer(undefined, action),
    subgroupData: subgroupDataReducer(undefined, action),
  };

  const newSettings = settingsReducer(currentState.settings, action);
  const newTokens = tokensReducer(currentState.tokens, action);
  const newCommunityInfoData = communityInfoDataReducer(currentState.communityInfoData, action);
  const newMemberData = memberDataReducer(currentState.memberData, action);
  const newSubgroupData = subgroupDataReducer(currentState.subgroupData, action);

  // Only return a new object if at least one sub-reducer changed
  if (newSettings === currentState.settings
      && newTokens === currentState.tokens
      && newCommunityInfoData === currentState.communityInfoData
      && newMemberData === currentState.memberData
      && newSubgroupData === currentState.subgroupData) {
    return currentState;
  }

  return {
    settings: newSettings,
    tokens: newTokens,
    communityInfoData: newCommunityInfoData,
    memberData: newMemberData,
    subgroupData: newSubgroupData,
  };
};
