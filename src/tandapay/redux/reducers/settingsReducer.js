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
  // Network performance settings (extracted from CommunityInfoConfig)
  networkPerformance: {|
    cacheExpirationMs: number,
    rateLimitDelayMs: number,
    retryAttempts: number,
  |},
|}>;

const initialState: TandaPaySettingsState = {
  selectedNetwork: 'sepolia',
  customRpcConfig: null,
  networkPerformance: {
    cacheExpirationMs: 30000, // 30 seconds default
    rateLimitDelayMs: 100, // 100ms between calls
    retryAttempts: 3,
  },
};

// eslint-disable-next-line default-param-last
export default (state: TandaPaySettingsState = initialState, action: Action): TandaPaySettingsState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case TANDAPAY_SETTINGS_UPDATE: {
      // Build the complete settings object for validation by merging with current state
      const settingsToValidate = {
        selectedNetwork: action.settings.selectedNetwork != null ? action.settings.selectedNetwork : state.selectedNetwork,
        customRpcConfig: action.settings.customRpcConfig !== undefined ? action.settings.customRpcConfig : state.customRpcConfig,
        networkPerformance: action.settings.networkPerformance != null ? {
          cacheExpirationMs: action.settings.networkPerformance.cacheExpirationMs != null ? action.settings.networkPerformance.cacheExpirationMs : state.networkPerformance.cacheExpirationMs,
          rateLimitDelayMs: action.settings.networkPerformance.rateLimitDelayMs != null ? action.settings.networkPerformance.rateLimitDelayMs : state.networkPerformance.rateLimitDelayMs,
          retryAttempts: action.settings.networkPerformance.retryAttempts != null ? action.settings.networkPerformance.retryAttempts : state.networkPerformance.retryAttempts,
        } : state.networkPerformance,
      };

      // Validate the complete merged settings
      const validation = validateTandaPaySettings(settingsToValidate);

      if (!validation.isValid) {
        return state; // Return unchanged state for invalid updates
      }

      // Return the validated settings
      return settingsToValidate;
    }

    default:
      return state;
  }
};
