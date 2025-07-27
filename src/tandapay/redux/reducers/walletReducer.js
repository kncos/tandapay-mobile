/* @flow strict-local */

import type { Action } from '../../../types';
import {
  TANDAPAY_WALLET_SET,
  TANDAPAY_WALLET_CLEAR,
  TANDAPAY_WALLET_UPDATE_ADDRESS,
  TANDAPAY_ALCHEMY_API_KEY_SET,
  TANDAPAY_ALCHEMY_API_KEY_CLEAR,
} from '../../../actionConstants';

export type WalletState = $ReadOnly<{|
  hasWallet: boolean,
  walletAddress: ?string,
  alchemyApiKey: ?string,
  // Note: mnemonic is NOT stored here - it remains in SecureStore
|}>;

const initialState: WalletState = {
  hasWallet: false,
  walletAddress: null,
  alchemyApiKey: null,
};

// eslint-disable-next-line default-param-last
export default function walletReducer(state: WalletState = initialState, action: Action): WalletState {
  switch (action.type) {
    case TANDAPAY_WALLET_SET:
      // eslint-disable-next-line no-console
      console.log('[WalletReducer] Setting wallet address:', action.walletAddress);
      return {
        ...state,
        hasWallet: true,
        // $FlowFixMe[prop-missing] - action will have walletAddress property
        walletAddress: action.walletAddress,
      };

    case TANDAPAY_WALLET_CLEAR:
      // eslint-disable-next-line no-console
      console.log('[WalletReducer] Clearing wallet state');
      return {
        ...state,
        hasWallet: false,
        walletAddress: null,
      };

    case TANDAPAY_WALLET_UPDATE_ADDRESS: {
      // eslint-disable-next-line no-console
      console.log('[WalletReducer] Updating wallet address:', action.walletAddress);
      return {
        ...state,
        // $FlowFixMe[prop-missing] - action will have walletAddress property
        walletAddress: action.walletAddress,
      };
    }

    case TANDAPAY_ALCHEMY_API_KEY_SET: {
      // eslint-disable-next-line no-console
      console.log('[WalletReducer] Setting Alchemy API key');
      return {
        ...state,
        // $FlowFixMe[prop-missing] - action will have apiKey property
        alchemyApiKey: action.apiKey,
      };
    }

    case TANDAPAY_ALCHEMY_API_KEY_CLEAR: {
      // eslint-disable-next-line no-console
      console.log('[WalletReducer] Clearing Alchemy API key');
      return {
        ...state,
        alchemyApiKey: null,
      };
    }

    default:
      return state;
  }
}
