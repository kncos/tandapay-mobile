/* @flow strict-local */
import type { PerAccountAction } from '../types';
import type {
  TandaPaySettingsState,
} from './reducers/settingsReducer';
import {
  TANDAPAY_SETTINGS_UPDATE,
  TANDAPAY_TOKEN_SELECT,
  TANDAPAY_TOKEN_ADD_CUSTOM,
  TANDAPAY_TOKEN_REMOVE_CUSTOM,
  TANDAPAY_TOKEN_UPDATE_BALANCE,
} from '../actionConstants';

// =============================================================================
// SETTINGS ACTIONS
// =============================================================================

export type TandaPaySettingsUpdateAction = {|
  type: typeof TANDAPAY_SETTINGS_UPDATE,
  settings: $Shape<TandaPaySettingsState>,
|};

export const updateTandaPaySettings = (settings: $Shape<TandaPaySettingsState>): TandaPaySettingsUpdateAction => ({
  type: TANDAPAY_SETTINGS_UPDATE,
  settings,
});

// =============================================================================
// TOKEN ACTIONS
// =============================================================================

/**
 * Action to select a different token in the wallet
 */
export function selectToken(tokenSymbol: string): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_SELECT,
    tokenSymbol,
  };
}

/**
 * Action to add a custom token to the user's wallet
 */
export function addCustomToken(token: {|
  symbol: string,
  address: string,
  name: string,
  decimals?: number,
|}): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_ADD_CUSTOM,
    token,
  };
}

/**
 * Action to remove a custom token from the user's wallet
 */
export function removeCustomToken(tokenSymbol: string): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_REMOVE_CUSTOM,
    tokenSymbol,
  };
}

/**
 * Action to update the cached balance for a token
 */
export function updateTokenBalance(tokenSymbol: string, balance: string): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_UPDATE_BALANCE,
    tokenSymbol,
    balance,
  };
}

// =============================================================================
// NETWORK ACTIONS
// =============================================================================

/**
 * Action creator for switching networks
 */
export function switchNetwork(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom'): TandaPaySettingsUpdateAction {
  return {
    type: TANDAPAY_SETTINGS_UPDATE,
    settings: {
      selectedNetwork: network,
    },
  };
}

/**
 * Action creator for setting custom RPC configuration
 */
export function setCustomRpc(config: {|
  name: string,
  rpcUrl: string,
  chainId: number,
  blockExplorerUrl?: string,
|}): TandaPaySettingsUpdateAction {
  return {
    type: TANDAPAY_SETTINGS_UPDATE,
    settings: {
      selectedNetwork: 'custom',
      customRpcConfig: config,
    },
  };
}

/**
 * Action creator for clearing custom RPC (switch back to built-in network)
 */
export function clearCustomRpc(fallbackNetwork: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' = 'mainnet'): TandaPaySettingsUpdateAction {
  return {
    type: TANDAPAY_SETTINGS_UPDATE,
    settings: {
      selectedNetwork: fallbackNetwork,
      customRpcConfig: null,
    },
  };
}
