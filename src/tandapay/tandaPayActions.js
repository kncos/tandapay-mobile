/* @flow strict-local */
import type {
  TandaPaySettingsState,
} from './tandaPayReducer';
import {
  TANDAPAY_SETTINGS_UPDATE,
} from '../actionConstants';

export type TandaPaySettingsUpdateAction = {|
  type: typeof TANDAPAY_SETTINGS_UPDATE,
  settings: $Shape<TandaPaySettingsState>,
|};

export const updateTandaPaySettings = (settings: $Shape<TandaPaySettingsState>): TandaPaySettingsUpdateAction => ({
  type: TANDAPAY_SETTINGS_UPDATE,
  settings,
});
