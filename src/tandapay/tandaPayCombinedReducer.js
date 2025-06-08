/* @flow strict-local */

import type { Action } from '../types';
import settingsReducer from './reducers/settingsReducer';
import tokensReducer from './reducers/tokensReducer';
import type { TandaPaySettingsState } from './reducers/settingsReducer';
import type { TokenState } from './tokens/tokenTypes';

export type TandaPayState = $ReadOnly<{|
  settings: TandaPaySettingsState,
  tokens: TokenState,
|}>;

// Re-export types for backward compatibility
export type { TandaPaySettingsState };

// eslint-disable-next-line default-param-last
export default (state: TandaPayState | void, action: Action): TandaPayState => {
  const currentState = state || {
    settings: settingsReducer(undefined, action),
    tokens: tokensReducer(undefined, action),
  };

  return {
    settings: settingsReducer(currentState.settings, action),
    tokens: tokensReducer(currentState.tokens, action),
  };
};
