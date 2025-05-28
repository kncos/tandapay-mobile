/* @flow strict-local */

// $FlowIgnore[untyped-import] - expo-secure-store doesn't have Flow types
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
// $FlowIgnore[untyped-import] - ethers doesn't have proper Flow types
import { ethers } from 'ethers';

// Storage keys for secure store
const MNEMONIC_STORAGE_KEY = 'wallet_mnemonic';
const WALLET_ADDRESS_STORAGE_KEY = 'wallet_address';
const HAS_WALLET_KEY = 'has_wallet';

export type WalletInfo = {|
  address: string,
  mnemonic?: string, // Only included when creating/importing
|};

/**
 * Check if user has a wallet set up
 */
export async function hasWallet(): Promise<boolean> {
  try {
    const hasWalletFlag = await SecureStore.getItemAsync(HAS_WALLET_KEY);
    return hasWalletFlag === 'true';
  } catch (error) {
    // Error checking wallet existence
    return false;
  }
}

/**
 * Get the current wallet address (if exists)
 */
export async function getWalletAddress(): Promise<?string> {
  try {
    return await SecureStore.getItemAsync(WALLET_ADDRESS_STORAGE_KEY);
  } catch (error) {
    // Error getting wallet address
    return null;
  }
}

/**
 * Generate a new wallet with mnemonic
 */
export async function generateWallet(): Promise<WalletInfo> {
  try {
    // Generate a random wallet
    const wallet = ethers.Wallet.createRandom();

    // Store the mnemonic and address securely
    await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, wallet.mnemonic.phrase, {
      requireAuthentication: false, // We'll handle auth at app level
    });
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
  } catch (error) {
    // Error generating wallet
    throw new Error('Failed to generate wallet');
  }
}

/**
 * Import wallet from mnemonic
 */
export async function importWallet(mnemonic: string): Promise<WalletInfo> {
  try {
    // Validate and create wallet from mnemonic
    const wallet = ethers.Wallet.fromMnemonic(mnemonic.trim());

    // Store the mnemonic and address securely
    await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, wallet.mnemonic.phrase, {
      requireAuthentication: false,
    });
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
  } catch (error) {
    // Error importing wallet
    throw new Error('Invalid mnemonic phrase');
  }
}

/**
 * Get the wallet instance for transactions (requires mnemonic)
 */
// $FlowIgnore[unclear-type] - using any for ethers types
export async function getWalletInstance(provider?: any): Promise<any> {
  try {
    const mnemonic = await SecureStore.getItemAsync(MNEMONIC_STORAGE_KEY);
    if (!mnemonic) {
      return null;
    }

    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    return provider ? wallet.connect(provider) : wallet;
  } catch (error) {
    // Error getting wallet instance
    return null;
  }
}

/**
 * Get the stored mnemonic (for backup/recovery display)
 */
export async function getMnemonic(): Promise<?string> {
  try {
    return await SecureStore.getItemAsync(MNEMONIC_STORAGE_KEY);
  } catch (error) {
    // Error getting mnemonic
    return null;
  }
}

/**
 * Delete wallet and all associated data
 */
export async function deleteWallet(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(MNEMONIC_STORAGE_KEY);
    await SecureStore.deleteItemAsync(WALLET_ADDRESS_STORAGE_KEY);
    await SecureStore.deleteItemAsync(HAS_WALLET_KEY);
  } catch (error) {
    // Error deleting wallet
    throw new Error('Failed to delete wallet');
  }
}

/**
 * Validate a mnemonic phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
  try {
    ethers.utils.HDNode.fromMnemonic(mnemonic.trim());
    return true;
  } catch {
    return false;
  }
}
