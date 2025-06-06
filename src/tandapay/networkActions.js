/* @flow strict-local */

import type { TandaPaySettingsUpdateAction } from '../actionTypes';
import { TANDAPAY_SETTINGS_UPDATE } from '../actionConstants';

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
