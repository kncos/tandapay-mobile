/* @flow strict-local */

// $FlowIgnore[untyped-import] - expo-secure-store doesn't have Flow types
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
// $FlowIgnore[untyped-import] - ethers doesn't have proper Flow types
import { ethers } from 'ethers';

import TandaPayErrorHandler from '../errors/ErrorHandler';
import type { TandaPayResult } from '../errors/types';

// Storage keys for secure store
const MNEMONIC_STORAGE_KEY = 'wallet_mnemonic';
const WALLET_ADDRESS_STORAGE_KEY = 'wallet_address';
const HAS_WALLET_KEY = 'has_wallet';
const ALCHEMY_API_KEY_STORAGE_KEY = 'alchemy_api_key';

export type WalletInfo = {|
  address: string,
  mnemonic?: string, // Only included when creating/importing
|};

/**
 * Check if user has a wallet set up
 */
export async function hasWallet(): Promise<TandaPayResult<boolean>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const hasWalletFlag = await SecureStore.getItemAsync(HAS_WALLET_KEY);
      return hasWalletFlag === 'true';
    },
    'STORAGE_ERROR',
    'Unable to check wallet status. Please try restarting the app.',
    'WALLET_STATUS_CHECK'
  );
}

/**
 * Get the current wallet address (if exists)
 */
export async function getWalletAddress(): Promise<TandaPayResult<?string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const address = await SecureStore.getItemAsync(WALLET_ADDRESS_STORAGE_KEY);
      return address; // Can be null if no wallet exists
    },
    'STORAGE_ERROR',
    'Unable to access wallet address. Please try restarting the app.',
    'WALLET_ADDRESS_FETCH'
  );
}

/**
 * Generate a new wallet with mnemonic
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

      try {
        // Store the mnemonic and address securely
        // eslint-disable-next-line no-console
        console.log('[WalletManager] Storing mnemonic...');

        // Try with authentication first, fall back to no authentication if it fails
        try {
          await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, wallet.mnemonic.phrase, {
            requireAuthentication: true,
          });
          // eslint-disable-next-line no-console
          console.log('[WalletManager] Mnemonic stored with authentication');
        } catch (authError) {
          // eslint-disable-next-line no-console
          console.warn('[WalletManager] Failed to store with authentication, trying without:', authError.message);
          await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, wallet.mnemonic.phrase, {
            requireAuthentication: false,
          });
          // eslint-disable-next-line no-console
          console.log('[WalletManager] Mnemonic stored without authentication');
        }

        // eslint-disable-next-line no-console
        console.log('[WalletManager] Storing wallet address...');
        await SecureStore.setItemAsync(WALLET_ADDRESS_STORAGE_KEY, wallet.address, {
          requireAuthentication: false,
        });

        // eslint-disable-next-line no-console
        console.log('[WalletManager] Setting wallet flag...');
        await SecureStore.setItemAsync(HAS_WALLET_KEY, 'true', {
          requireAuthentication: false,
        });

        // eslint-disable-next-line no-console
        console.log('[WalletManager] All storage operations completed successfully');
      } catch (storageError) {
        // eslint-disable-next-line no-console
        console.error('[WalletManager] Storage operation failed:', storageError);
        throw storageError; // Re-throw to be caught by the outer error handler
      }

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

      // Store the mnemonic and address securely
      try {
        await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, wallet.mnemonic.phrase, {
          requireAuthentication: true,
        });
      } catch (authError) {
        // eslint-disable-next-line no-console
        console.warn('[WalletManager] Import: Failed to store with authentication, trying without:', authError.message);
        await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, wallet.mnemonic.phrase, {
          requireAuthentication: false,
        });
      }

      await SecureStore.setItemAsync(WALLET_ADDRESS_STORAGE_KEY, wallet.address, {
        requireAuthentication: false,
      });
      await SecureStore.setItemAsync(HAS_WALLET_KEY, 'true', {
        requireAuthentication: false,
      });

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
          'No wallet mnemonic found in secure storage',
          { userMessage: 'No wallet found. Please create or import a wallet first.' }
        );
      }

      let wallet;
      try {
        wallet = ethers.Wallet.fromMnemonic(mnemonic);
      } catch (ethersError) {
        throw TandaPayErrorHandler.createError(
          'WALLET_ERROR',
          `Failed to create wallet from stored mnemonic: ${ethersError.message}`,
          { userMessage: 'Wallet data is corrupted. Please reimport your wallet.' }
        );
      }

      return provider ? wallet.connect(provider) : wallet;
    },
    'STORAGE_ERROR',
    'Unable to access wallet. Please try restarting the app.',
    'WALLET_INSTANCE_FETCH'
  );
}

/**
 * Get the stored mnemonic (for backup/recovery display)
 */
export async function getMnemonic(): Promise<TandaPayResult<?string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const mnemonic = await SecureStore.getItemAsync(MNEMONIC_STORAGE_KEY);
      return mnemonic; // Can be null if no wallet exists
    },
    'STORAGE_ERROR',
    'Unable to access wallet backup phrase. Please try restarting the app.',
    'MNEMONIC_FETCH'
  );
}

/**
 * Delete wallet and all associated data
 */
export async function deleteWallet(): Promise<TandaPayResult<void>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Delete all wallet-related data
      const deletePromises = [
        SecureStore.deleteItemAsync(MNEMONIC_STORAGE_KEY),
        SecureStore.deleteItemAsync(WALLET_ADDRESS_STORAGE_KEY),
        SecureStore.deleteItemAsync(HAS_WALLET_KEY),
        SecureStore.deleteItemAsync(ALCHEMY_API_KEY_STORAGE_KEY),
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
 */
export async function hasAlchemyApiKey(): Promise<TandaPayResult<boolean>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const apiKey = await SecureStore.getItemAsync(ALCHEMY_API_KEY_STORAGE_KEY);
      return apiKey !== null && apiKey.trim() !== '';
    },
    'STORAGE_ERROR',
    'Unable to check Alchemy API key status. Please try restarting the app.',
    'ALCHEMY_API_KEY_STATUS_CHECK'
  );
}

/**
 * Store Alchemy API key securely
 */
export async function storeAlchemyApiKey(apiKey: string): Promise<TandaPayResult<void>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const trimmedApiKey = apiKey.trim();
      if (!trimmedApiKey) {
        throw TandaPayErrorHandler.createError(
          'VALIDATION_ERROR',
          'Empty API key provided',
          { userMessage: 'Please enter a valid Alchemy API key.' }
        );
      }

      await SecureStore.setItemAsync(ALCHEMY_API_KEY_STORAGE_KEY, trimmedApiKey, {
        requireAuthentication: false,
      });
    },
    'STORAGE_ERROR',
    'Failed to store Alchemy API key. Please try again.',
    'ALCHEMY_API_KEY_STORAGE'
  );
}

/**
 * Get the stored Alchemy API key
 */
export async function getAlchemyApiKey(): Promise<TandaPayResult<?string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const apiKey = await SecureStore.getItemAsync(ALCHEMY_API_KEY_STORAGE_KEY);
      return apiKey; // Can be null if no API key is stored
    },
    'STORAGE_ERROR',
    'Unable to access Alchemy API key. Please try restarting the app.',
    'ALCHEMY_API_KEY_FETCH'
  );
}

/**
 * Delete the stored Alchemy API key
 */
export async function deleteAlchemyApiKey(): Promise<TandaPayResult<void>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      await SecureStore.deleteItemAsync(ALCHEMY_API_KEY_STORAGE_KEY);
    },
    'STORAGE_ERROR',
    'Failed to delete Alchemy API key. Please try again.',
    'ALCHEMY_API_KEY_DELETION'
  );
}
