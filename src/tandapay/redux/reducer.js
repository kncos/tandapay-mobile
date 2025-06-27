/* @flow strict-local */

import type { Action } from '../../types';
import settingsReducer from './reducers/settingsReducer';
import tokensReducer from './reducers/tokensReducer';
import communityInfoReducer from './reducers/communityInfoReducer';
import type { TandaPaySettingsState } from './reducers/settingsReducer';
import type { TokenState } from '../tokens/tokenTypes';
import type { CommunityInfoState } from './reducers/communityInfoReducer';

export type TandaPayState = $ReadOnly<{|
  settings: TandaPaySettingsState,
  tokens: TokenState,
  communityInfo: CommunityInfoState,
|}>;

// Re-export types for backward compatibility
export type { TandaPaySettingsState };
export type { CommunityInfoState };

// Combined TandaPay reducer
// eslint-disable-next-line default-param-last
export default (state: TandaPayState | void, action: Action): TandaPayState => {
  const currentState = state || {
    settings: settingsReducer(undefined, action),
    tokens: tokensReducer(undefined, action),
    communityInfo: communityInfoReducer(undefined, action),
  };

  const newSettings = settingsReducer(currentState.settings, action);
  const newTokens = tokensReducer(currentState.tokens, action);
  const newCommunityInfo = communityInfoReducer(currentState.communityInfo, action);

  // Only return a new object if at least one sub-reducer changed
  if (newSettings === currentState.settings && newTokens === currentState.tokens && newCommunityInfo === currentState.communityInfo) {
    return currentState;
  }

  return {
    settings: newSettings,
    tokens: newTokens,
    communityInfo: newCommunityInfo,
  };
};
