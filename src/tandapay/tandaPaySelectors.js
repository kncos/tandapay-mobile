/* @flow strict-local */
import type { PerAccountState } from '../reduxTypes';
import type {
  TandaPayState,
  TandaPaySettingsState,
} from './tandaPayReducer';

// Main TandaPay state selector
export const getTandaPayState = (state: PerAccountState): TandaPayState => {
  if (!state.tandaPay) {
    // Return default state if not initialized
    return {
      settings: {
        selectedNetwork: 'sepolia',
        selectedTokenSymbol: 'ETH',
        customRpcConfig: null,
      },
      tokens: {
        selectedTokenSymbol: 'ETH',
        defaultTokens: [],
        customTokens: [],
        balances: {},
        lastUpdated: {},
      },
    };
  }
  return state.tandaPay;
};

// Settings selectors
export const getTandaPaySettings = (state: PerAccountState): TandaPaySettingsState => {
  const tandaPayState = getTandaPayState(state);
  if (!tandaPayState || !tandaPayState.settings) {
    // Return default settings if state is not initialized
    return {
      selectedNetwork: 'sepolia',
      selectedTokenSymbol: 'ETH',
      customRpcConfig: null,
    };
  }
  return tandaPayState.settings;
};

export const getTandaPaySelectedNetwork = (state: PerAccountState): 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom' => {
  try {
    return getTandaPaySettings(state).selectedNetwork || 'sepolia';
  } catch (error) {
    // Return default if state is not initialized
    return 'sepolia';
  }
};

export const getTandaPayCustomRpcConfig = (state: PerAccountState): ?{|
  name: string,
  rpcUrl: string,
  chainId: number,
  blockExplorerUrl?: string,
|} => {
  try {
    return getTandaPaySettings(state).customRpcConfig;
  } catch (error) {
    return null;
  }
};
