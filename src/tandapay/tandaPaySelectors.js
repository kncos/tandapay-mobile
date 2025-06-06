/* @flow strict-local */
import type { PerAccountState } from '../reduxTypes';
import type {
  TandaPayState,
  TandaPaySettingsState,
} from './tandaPayReducer';

// Main TandaPay state selector
export const getTandaPayState = (state: PerAccountState): TandaPayState => state.tandaPay;

// Settings selectors
export const getTandaPaySettings = (state: PerAccountState): TandaPaySettingsState =>
  getTandaPayState(state).settings;

export const getTandaPaySelectedNetwork = (state: PerAccountState): 'mainnet' | 'sepolia' =>
  getTandaPaySettings(state).selectedNetwork;
