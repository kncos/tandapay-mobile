/* @flow strict-local */

import type { TandaPayResult } from '../errors/types';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import { setWallet, clearWallet } from '../redux/actions';

/**
 * Wallet Redux Integration Helper
 *
 * This module provides helper functions to integrate wallet state with Redux.
 * It's designed to be used by WalletManager to sync wallet state between
 * SecureStore (for sensitive data) and Redux (for non-sensitive data).
 */

/**
 * Sync wallet state to Redux after successful wallet creation/import
 */
export async function syncWalletToRedux(
  walletAddress: string,
  dispatch: (action: mixed) => void
): Promise<TandaPayResult<void>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // eslint-disable-next-line no-console
      console.log('[WalletReduxHelper] Dispatching setWallet for:', walletAddress);
      const action = setWallet(walletAddress);
      // eslint-disable-next-line no-console
      console.log('[WalletReduxHelper] Action to dispatch:', action);
      dispatch(action);
      // eslint-disable-next-line no-console
      console.log('[WalletReduxHelper] setWallet dispatched successfully');
    },
    'STORAGE_ERROR',
    'Failed to sync wallet state to Redux.',
    'WALLET_REDUX_SYNC'
  );
}

/**
 * Clear wallet state from Redux when wallet is deleted
 */
export async function clearWalletFromRedux(
  dispatch: (action: mixed) => void
): Promise<TandaPayResult<void>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      dispatch(clearWallet());
      // eslint-disable-next-line no-console
      console.log('[WalletReduxHelper] Wallet state cleared from Redux');
    },
    'STORAGE_ERROR',
    'Failed to clear wallet state from Redux.',
    'WALLET_REDUX_CLEAR'
  );
}

/**
 * Get wallet state from Redux
 */
export function getWalletStateFromRedux(getState: () => mixed): { hasWallet: boolean, walletAddress: ?string } {
  try {
    const state = getState();
    // $FlowFixMe[prop-missing] - accessing nested Redux state structure
    const result = {
      // $FlowFixMe[prop-missing] - accessing nested Redux state structure
      hasWallet: state.tandaPay?.wallet?.hasWallet || false,
      // $FlowFixMe[prop-missing] - accessing nested Redux state structure
      walletAddress: state.tandaPay?.wallet?.walletAddress || null,
    };
    // eslint-disable-next-line no-console
    console.log('[WalletReduxHelper] Wallet state:', result);
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[WalletReduxHelper] Failed to get wallet state from Redux:', error);
    return {
      hasWallet: false,
      walletAddress: null,
    };
  }
}

/**
 * Get Alchemy API key from Redux
 */
export function getAlchemyApiKeyFromRedux(getState: () => mixed): ?string {
  try {
    const state = getState();
    // $FlowFixMe[prop-missing] - accessing nested Redux state structure
    return state.tandaPay?.wallet?.alchemyApiKey || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[WalletReduxHelper] Failed to get Alchemy API key from Redux:', error);
    return null;
  }
}
