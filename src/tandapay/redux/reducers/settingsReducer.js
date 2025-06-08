/* @flow strict-local */

import type { Action } from '../../../types';
import {
  RESET_ACCOUNT_DATA,
  TANDAPAY_SETTINGS_UPDATE,
} from '../../../actionConstants';
import { validateTandaPaySettings } from '../../stateValidation';

// Settings-specific state
export type TandaPaySettingsState = $ReadOnly<{|
  selectedNetwork: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom',
  customRpcConfig: ?{|
    name: string,
    rpcUrl: string,
    chainId: number,
    blockExplorerUrl?: string,
  |},
|}>;

const initialState: TandaPaySettingsState = {
  selectedNetwork: 'sepolia',
  customRpcConfig: null,
};

// eslint-disable-next-line default-param-last
export default (state: TandaPaySettingsState = initialState, action: Action): TandaPaySettingsState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case TANDAPAY_SETTINGS_UPDATE: {
      // Validate the incoming settings update
      const validation = validateTandaPaySettings({
        selectedNetwork: action.settings.selectedNetwork,
        customRpcConfig: action.settings.customRpcConfig,
      });

      if (!validation.isValid) {
        return state; // Return unchanged state for invalid updates
      }

      // Only allow updating fields that exist in the settings state
      const updatedSettings: TandaPaySettingsState = {
        selectedNetwork: action.settings.selectedNetwork != null ? action.settings.selectedNetwork : state.selectedNetwork,
        customRpcConfig: action.settings.customRpcConfig !== undefined ? action.settings.customRpcConfig : state.customRpcConfig,
      };

      return updatedSettings;
    }

    default:
      return state;
  }
};
