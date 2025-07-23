/* @flow strict-local */
import type { NetworkIdentifier } from '../../definitions/types';

import type { Action } from '../../../types';
import {
  RESET_ACCOUNT_DATA,
  TANDAPAY_SETTINGS_UPDATE,
} from '../../../actionConstants';
import { validateTandaPaySettings } from '../../stateValidation';
import { detectAlchemyConfig } from '../../providers/AlchemyDetection';

// Settings-specific state
export type TandaPaySettingsState = $ReadOnly<{|
  selectedNetwork: NetworkIdentifier,
  customRpcConfig: ?{|
    name: string,
    rpcUrl: string,
    chainId: number,
    blockExplorerUrl?: string,
    isAlchemyUrl?: boolean,
  |},
  // Per-network contract addresses configured by users
  contractAddresses: {|
    mainnet: ?string,
    sepolia: ?string,
    arbitrum: ?string,
    polygon: ?string,
    custom: ?string,
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
  contractAddresses: {
    mainnet: null,
    sepolia: null,
    arbitrum: null,
    polygon: null,
    custom: null,
  },
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
      // Auto-detect Alchemy configuration if customRpcConfig is being updated
      let processedCustomRpcConfig = action.settings.customRpcConfig !== undefined
        ? action.settings.customRpcConfig
        : state.customRpcConfig;

      if (processedCustomRpcConfig != null && action.settings.customRpcConfig !== undefined) {
        const alchemyDetection = detectAlchemyConfig(processedCustomRpcConfig.rpcUrl);
        processedCustomRpcConfig = {
          ...processedCustomRpcConfig,
          isAlchemyUrl: alchemyDetection.isAlchemy,
        };
      }

      // Build the complete settings object for validation by merging with current state
      const settingsToValidate = {
        selectedNetwork: action.settings.selectedNetwork != null ? action.settings.selectedNetwork : state.selectedNetwork,
        customRpcConfig: processedCustomRpcConfig,
        contractAddresses: action.settings.contractAddresses != null ? {
          mainnet: action.settings.contractAddresses.mainnet !== undefined ? action.settings.contractAddresses.mainnet : state.contractAddresses.mainnet,
          sepolia: action.settings.contractAddresses.sepolia !== undefined ? action.settings.contractAddresses.sepolia : state.contractAddresses.sepolia,
          arbitrum: action.settings.contractAddresses.arbitrum !== undefined ? action.settings.contractAddresses.arbitrum : state.contractAddresses.arbitrum,
          polygon: action.settings.contractAddresses.polygon !== undefined ? action.settings.contractAddresses.polygon : state.contractAddresses.polygon,
          custom: action.settings.contractAddresses.custom !== undefined ? action.settings.contractAddresses.custom : state.contractAddresses.custom,
        } : state.contractAddresses,
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
