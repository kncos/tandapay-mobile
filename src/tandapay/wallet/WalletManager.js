/* @flow strict-local */

// $FlowIgnore[untyped-import] - expo-secure-store doesn't have Flow types
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
// $FlowIgnore[untyped-import] - ethers doesn't have proper Flow types
import { ethers } from 'ethers';

import TandaPayErrorHandler from '../errors/ErrorHandler';
import type { TandaPayResult } from '../errors/types';
import { syncWalletToRedux, clearWalletFromRedux, getWalletStateFromRedux, getAlchemyApiKeyFromRedux } from './WalletReduxHelper';
import { setAlchemyApiKey, clearAlchemyApiKey } from '../redux/actions';
import store from '../../boot/store';

// Storage keys for secure store (only mnemonic now)
const MNEMONIC_STORAGE_KEY = 'wallet_mnemonic';

export type WalletInfo = {|
  address: string,
  mnemonic?: string, // Only included when creating/importing
|};

/**
 * Check if user has a wallet set up (for UI display purposes only)
 * Uses Redux state only - no SecureStore access, no fingerprint prompt
 * This should be used by UI components to determine whether to show wallet or setup screens
 */
export function hasWalletForUI(): boolean {
  try {
    const walletState = getWalletStateFromRedux(store.getState);
    // eslint-disable-next-line no-console
    console.log('[WalletManager] hasWalletForUI() Redux state:', walletState);
    return walletState.hasWallet && walletState.walletAddress != null && walletState.walletAddress !== '';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[WalletManager] hasWalletForUI() error accessing Redux state:', error);
    return false;
  }
}

/**
 * Check if user has a wallet set up
 * Uses direct SecureStore call like getMnemonic() does (no timeout needed)
 * This triggers fingerprint authentication and should only be used when authentication is required
 */
export async function hasWallet(): Promise<TandaPayResult<boolean>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // eslint-disable-next-line no-console
      console.log('[WalletManager] hasWallet() called - checking SecureStore directly...');

      // Use same approach as getMnemonic() - no timeout needed
      const mnemonic = await SecureStore.getItemAsync(MNEMONIC_STORAGE_KEY);

      const walletExists = mnemonic != null && mnemonic.trim() !== '';
      // eslint-disable-next-line no-console
      console.log('[WalletManager] hasWallet() SecureStore result:', walletExists);

      // If we have a wallet but Redux state doesn't know about it, sync it
      if (walletExists) {
        const walletState = getWalletStateFromRedux(store.getState);
        // eslint-disable-next-line no-console
        console.log('[WalletManager] hasWallet() Current Redux state:', walletState);

        if (!walletState.hasWallet || walletState.walletAddress == null || walletState.walletAddress === '') {
          // eslint-disable-next-line no-console
          console.log('[WalletManager] hasWallet() Wallet exists but Redux not synced, syncing...');
          try {
            const wallet = ethers.Wallet.fromMnemonic(mnemonic);
            // $FlowFixMe[incompatible-call] - store.dispatch type is too strict
            const syncResult = await syncWalletToRedux(wallet.address, store.dispatch);
            if (syncResult.success) {
              // eslint-disable-next-line no-console
              console.log('[WalletManager] hasWallet() Redux sync completed');
              // Wait a moment for Redux to update
              await new Promise(resolve => setTimeout(resolve, 100));
              const updatedState = getWalletStateFromRedux(store.getState);
              // eslint-disable-next-line no-console
              console.log('[WalletManager] hasWallet() Updated Redux state:', updatedState);
            } else {
              // eslint-disable-next-line no-console
              console.warn('[WalletManager] hasWallet() Redux sync failed:', syncResult.error);
            }
          } catch (syncError) {
            // eslint-disable-next-line no-console
            console.warn('[WalletManager] hasWallet() Redux sync error:', syncError);
            // Continue anyway since mnemonic exists
          }
        }
      }

      return walletExists;
    },
    'STORAGE_ERROR',
    'Unable to check wallet status. Please try restarting the app.',
    'WALLET_STATUS_CHECK'
  );
}

/**
 * Get the current wallet address (if exists)
 * Uses Redux state only (no legacy SecureStore fallback)
 */
export async function getWalletAddress(): Promise<TandaPayResult<?string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Check Redux state only
      const walletState = getWalletStateFromRedux(store.getState);
      // $FlowFixMe[sketchy-null-check] - Intentionally checking for both null and empty string
      if (walletState.walletAddress != null && walletState.walletAddress !== '') {
        return walletState.walletAddress;
      }
      return null;
    },
    'STORAGE_ERROR',
    'Unable to access wallet address. Please try restarting the app.',
    'WALLET_ADDRESS_FETCH'
  );
}

/**
 * Generate a new wallet with mnemonic
 * Automatically syncs wallet state to Redux
 */
export async function generateWallet(): Promise<TandaPayResult<WalletInfo>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // eslint-disable-next-line no-console
      console.log('[WalletManager] Starting wallet generation...');

      // Generate a random wallet
      const wallet = ethers.Wallet.createRandom();
      // eslint-disable-next-line no-console
      console.log('[WalletManager] Wallet created, address:', wallet.address);

      // Validate the generated wallet
      if (!wallet.mnemonic?.phrase || !wallet.address) {
        // eslint-disable-next-line no-console
        console.error('[WalletManager] Wallet validation failed:', {
          hasMnemonic: !!wallet.mnemonic?.phrase,
          hasAddress: !!wallet.address,
        });
        throw TandaPayErrorHandler.createError(
          'WALLET_ERROR',
          'Wallet generation failed - invalid wallet created',
          { userMessage: 'Failed to generate wallet. Please try again.' }
        );
      }

      // eslint-disable-next-line no-console
      console.log('[WalletManager] Starting secure storage operations...');

      // Store mnemonic with authentication fallback
      try {
        await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, wallet.mnemonic.phrase, {
          requireAuthentication: true,
        });
        // eslint-disable-next-line no-console
        console.log('[WalletManager] Mnemonic stored with authentication');
      } catch (authError) {
        // eslint-disable-next-line no-console
        console.warn('[WalletManager] Failed to store with authentication, trying without:', authError.message);
        try {
          await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, wallet.mnemonic.phrase, {
            requireAuthentication: false,
          });
          // eslint-disable-next-line no-console
          console.log('[WalletManager] Mnemonic stored without authentication');
        } catch (noAuthError) {
          // eslint-disable-next-line no-console
          console.error('[WalletManager] Failed to store mnemonic even without authentication:', noAuthError);
          throw TandaPayErrorHandler.createError(
            'STORAGE_ERROR',
            `Failed to store wallet mnemonic: ${noAuthError.message}`,
            { userMessage: 'Failed to securely store wallet data. Please try restarting the app.' }
          );
        }
      }

      // Sync wallet state to Redux
      // eslint-disable-next-line no-console
      console.log('[WalletManager] Syncing wallet state to Redux...');
      // $FlowFixMe[incompatible-call] - store.dispatch type is too strict
      const syncResult = await syncWalletToRedux(wallet.address, store.dispatch);
      if (!syncResult.success) {
        throw TandaPayErrorHandler.createError(
          'STORAGE_ERROR',
          `Failed to sync wallet state to Redux: ${syncResult.error ? syncResult.error.message : 'Unknown error'}`,
          { userMessage: 'Failed to complete wallet setup. Please try restarting the app.' }
        );
      }
      // eslint-disable-next-line no-console
      console.log('[WalletManager] Wallet state synced to Redux successfully');

      // eslint-disable-next-line no-console
      console.log('[WalletManager] All storage operations completed successfully');

      return {
        address: wallet.address,
        mnemonic: wallet.mnemonic.phrase,
      };
    },
    'STORAGE_ERROR',
    'Failed to create wallet. Please ensure you have sufficient device storage and try again.',
    'WALLET_GENERATION'
  );
}

/**
 * Import wallet from mnemonic
 * Automatically syncs wallet state to Redux
 */
export async function importWallet(mnemonic: string): Promise<TandaPayResult<WalletInfo>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Validate mnemonic format
      const trimmedMnemonic = mnemonic.trim();
      if (!trimmedMnemonic) {
        throw TandaPayErrorHandler.createError(
          'VALIDATION_ERROR',
          'Empty mnemonic phrase provided',
          { userMessage: 'Please enter a valid mnemonic phrase.' }
        );
      }

      // Validate and create wallet from mnemonic
      let wallet;
      try {
        wallet = ethers.Wallet.fromMnemonic(trimmedMnemonic);
      } catch (ethersError) {
        throw TandaPayErrorHandler.createError(
          'VALIDATION_ERROR',
          `Invalid mnemonic phrase: ${ethersError.message}`,
          { userMessage: 'The mnemonic phrase you entered is invalid. Please check it and try again.' }
        );
      }

      // Validate the created wallet
      if (!wallet.mnemonic?.phrase || !wallet.address) {
        throw TandaPayErrorHandler.createError(
          'WALLET_ERROR',
          'Wallet import failed - invalid wallet created from mnemonic',
          { userMessage: 'Failed to import wallet. Please check your mnemonic phrase and try again.' }
        );
      }

      // Store mnemonic with authentication fallback
      try {
        await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, wallet.mnemonic.phrase, {
          requireAuthentication: true,
        });
      } catch (authError) {
        // eslint-disable-next-line no-console
        console.warn('[WalletManager] Import: Failed to store with authentication, trying without:', authError.message);
        try {
          await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, wallet.mnemonic.phrase, {
            requireAuthentication: false,
          });
        } catch (noAuthError) {
          throw TandaPayErrorHandler.createError(
            'STORAGE_ERROR',
            `Failed to store wallet mnemonic: ${noAuthError.message}`,
            { userMessage: 'Failed to securely store wallet data. Please try restarting the app.' }
          );
        }
      }

      // Sync wallet state to Redux
      // $FlowFixMe[incompatible-call] - store.dispatch type is too strict
      const syncResult = await syncWalletToRedux(wallet.address, store.dispatch);
      if (!syncResult.success) {
        throw TandaPayErrorHandler.createError(
          'STORAGE_ERROR',
          `Failed to sync wallet state to Redux: ${syncResult.error ? syncResult.error.message : 'Unknown error'}`,
          { userMessage: 'Failed to complete wallet import. Please try restarting the app.' }
        );
      }

      return {
        address: wallet.address,
        mnemonic: wallet.mnemonic.phrase,
      };
    },
    'STORAGE_ERROR',
    'Failed to import wallet. Please ensure you have sufficient device storage and try again.',
    'WALLET_IMPORT'
  );
}

/**
 * Get the wallet instance for transactions (requires mnemonic)
 */
// $FlowIgnore[unclear-type] - using any for ethers types
export async function getWalletInstance(provider?: any): Promise<TandaPayResult<any>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const mnemonic = await SecureStore.getItemAsync(MNEMONIC_STORAGE_KEY);
      if (!mnemonic) {
        throw TandaPayErrorHandler.createError(
          'WALLET_ERROR',
          'No wallet found',
          { userMessage: 'Please create or import a wallet first.' }
        );
      }

      try {
        const wallet = ethers.Wallet.fromMnemonic(mnemonic);
        return provider ? wallet.connect(provider) : wallet;
      } catch (ethersError) {
        throw TandaPayErrorHandler.createError(
          'WALLET_ERROR',
          `Failed to create wallet instance: ${ethersError.message}`,
          { userMessage: 'Failed to access wallet. The wallet data may be corrupted.' }
        );
      }
    },
    'WALLET_ERROR',
    'Unable to access wallet. Please try restarting the app.',
    'WALLET_INSTANCE_CREATION'
  );
}

/**
 * Get the mnemonic phrase (for backup purposes)
 */
export async function getMnemonic(): Promise<TandaPayResult<?string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const mnemonic = await SecureStore.getItemAsync(MNEMONIC_STORAGE_KEY);
      return mnemonic || null;
    },
    'STORAGE_ERROR',
    'Unable to access wallet mnemonic. Please try restarting the app.',
    'MNEMONIC_FETCH'
  );
}

/**
 * Delete wallet and clear all related data
 * Note: Does NOT delete the Alchemy API key - it's preserved for reuse
 * Automatically clears wallet state from Redux
 */
export async function deleteWallet(): Promise<TandaPayResult<void>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Delete only the mnemonic from SecureStore and clear wallet state from Redux
      // Note: We DO NOT delete the Alchemy API key as it should be preserved
      const deletePromises = [
        SecureStore.deleteItemAsync(MNEMONIC_STORAGE_KEY),
        // $FlowFixMe[incompatible-call] - store.dispatch type is too strict
        clearWalletFromRedux(store.dispatch).then(() => {}), // Convert to Promise<void>
      ];

      // Wait for all deletions to complete
      await Promise.all(deletePromises);
    },
    'STORAGE_ERROR',
    'Failed to delete wallet. Some wallet data may still remain on the device.',
    'WALLET_DELETION'
  );
}

/**
 * Validate a mnemonic phrase
 */
export function validateMnemonic(mnemonic: string): TandaPayResult<boolean> {
  return TandaPayErrorHandler.withSyncErrorHandling(
    () => {
      if (!mnemonic || !mnemonic.trim()) {
        return false;
      }

      try {
        ethers.utils.HDNode.fromMnemonic(mnemonic.trim());
        return true;
      } catch {
        return false;
      }
    },
    'VALIDATION_ERROR',
    'Unable to validate mnemonic phrase.',
    'MNEMONIC_VALIDATION'
  );
}

/**
 * Check if an Alchemy API key is stored
 * Uses Redux state only (no legacy SecureStore fallback)
 */
export async function hasAlchemyApiKey(): Promise<TandaPayResult<boolean>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Check Redux state only
      const apiKeyFromRedux = getAlchemyApiKeyFromRedux(store.getState);
      return apiKeyFromRedux !== null && apiKeyFromRedux !== undefined && apiKeyFromRedux.trim() !== '';
    },
    'STORAGE_ERROR',
    'Unable to check Alchemy API key status. Please try restarting the app.',
    'ALCHEMY_API_KEY_CHECK'
  );
}

/**
 * Store Alchemy API key in Redux
 */
export async function storeAlchemyApiKey(apiKey: string): Promise<TandaPayResult<void>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const trimmedApiKey = apiKey.trim();
      if (!trimmedApiKey) {
        throw TandaPayErrorHandler.createError(
          'VALIDATION_ERROR',
          'Empty API key provided',
          { userMessage: 'Please enter a valid API key.' }
        );
      }

      // Store in Redux
      // $FlowFixMe[incompatible-call] - store.dispatch type is too strict
      store.dispatch(setAlchemyApiKey(trimmedApiKey));
    },
    'STORAGE_ERROR',
    'Failed to store Alchemy API key. Please try again.',
    'ALCHEMY_API_KEY_STORAGE'
  );
}

/**
 * Get stored Alchemy API key from Redux
 * Uses Redux state only (no legacy SecureStore fallback)
 */
export async function getAlchemyApiKey(): Promise<TandaPayResult<?string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Check Redux state only
      const apiKeyFromRedux = getAlchemyApiKeyFromRedux(store.getState);
      // $FlowFixMe[sketchy-null-check] - Intentionally checking for both null and empty string
      if (apiKeyFromRedux != null && apiKeyFromRedux !== '') {
        return apiKeyFromRedux;
      }
      return null;
    },
    'STORAGE_ERROR',
    'Unable to retrieve Alchemy API key. Please try restarting the app.',
    'ALCHEMY_API_KEY_FETCH'
  );
}

/**
 * Clear stored Alchemy API key from Redux
 */
export async function deleteAlchemyApiKey(): Promise<TandaPayResult<void>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Clear from Redux
      // $FlowFixMe[incompatible-call] - store.dispatch type is too strict
      store.dispatch(clearAlchemyApiKey());
    },
    'STORAGE_ERROR',
    'Failed to delete Alchemy API key. Please try again.',
    'ALCHEMY_API_KEY_DELETION'
  );
}

/**
 * Attempt to recover from keychain corruption by re-syncing with Redux
 * This is a recovery function for when SecureStore encryption issues persist
 * Automatically syncs recovered wallet state to Redux
 */
export async function recoverFromKeychainCorruption(): Promise<TandaPayResult<boolean>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // eslint-disable-next-line no-console
      console.log('[WalletManager] Starting keychain recovery process...');

      // First, try to get the mnemonic (this is the most important piece)
      let mnemonic;
      try {
        mnemonic = await SecureStore.getItemAsync(MNEMONIC_STORAGE_KEY);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[WalletManager] Cannot recover - mnemonic is not accessible:', error);
        return false;
      }

      if (!mnemonic) {
        // eslint-disable-next-line no-console
        console.log('[WalletManager] No mnemonic found - nothing to recover');
        return false;
      }

      // eslint-disable-next-line no-console
      console.log('[WalletManager] Found mnemonic, re-deriving wallet info...');

      // Re-derive wallet info from mnemonic
      let wallet;
      try {
        wallet = ethers.Wallet.fromMnemonic(mnemonic);
      } catch (walletError) {
        // eslint-disable-next-line no-console
        console.error('[WalletManager] Mnemonic is corrupted:', walletError);
        return false;
      }

      // Sync the recovered wallet state to Redux
      // $FlowFixMe[incompatible-call] - store.dispatch type is too strict
      const syncResult = await syncWalletToRedux(wallet.address, store.dispatch);
      if (!syncResult.success) {
        // eslint-disable-next-line no-console
        console.warn('[WalletManager] Could not sync recovered wallet to Redux, but wallet is still functional');
      } else {
        // eslint-disable-next-line no-console
        console.log('[WalletManager] Successfully synced recovered wallet to Redux');
      }

      // eslint-disable-next-line no-console
      console.log('[WalletManager] Keychain recovery completed');
      return true;
    },
    'STORAGE_ERROR',
    'Failed to recover from keychain corruption. The wallet may still be functional.',
    'KEYCHAIN_RECOVERY'
  );
}
