// @flow strict-local

/**
 * TandaPay Contract Instance Manager
 *
 * This service handles the creation and management of TandaPay contract instances
 * with proper signer and provider integration.
 */

// $FlowFixMe[untyped-import] - ethers doesn't have proper Flow types
import { ethers } from 'ethers';

// $FlowFixMe[untyped-import] - TandaPayInfo module doesn't have Flow types
import { TandaPayInfo } from '../contract/TandaPay';
import { getTandaPayContractAddress, isContractDeployed } from '../config/TandaPayConfig';
import { getWalletInstance } from '../wallet/WalletManager';
import { createProvider } from '../providers/ProviderManager';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import type { TandaPayResult } from '../errors/types';

/**
 * Contract instance cache to avoid creating multiple instances
 */
const contractInstanceCache = new Map();

/**
 * Create a TandaPay contract instance with signer for write operations
 * @param network The network to connect to
 * @returns A TandaPayResult containing the contract instance
 */
// $FlowFixMe[unclear-type] - ethers contract types are complex
export async function createTandaPayContractWithSigner(
  network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'
  // $FlowFixMe[unclear-type] - ethers contract types are complex
): Promise<TandaPayResult<any>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Check if contract is deployed on this network
      if (!isContractDeployed(network)) {
        throw TandaPayErrorHandler.createError(
          'CONTRACT_ERROR',
          `TandaPay contract not deployed on ${network}`,
          { userMessage: `TandaPay is not yet available on ${network}. Please try a different network.` }
        );
      }

      const contractAddress = getTandaPayContractAddress(network);
      const cacheKey = `${network}_${contractAddress}_signer`;

      // Check cache first
      if (contractInstanceCache.has(cacheKey)) {
        return contractInstanceCache.get(cacheKey);
      }

      // Create provider
      const providerResult = await createProvider(network);
      if (!providerResult.success) {
        throw providerResult.error;
      }

      const provider = providerResult.data;

      // Get wallet instance
      const walletResult = await getWalletInstance(provider);
      if (!walletResult.success) {
        throw walletResult.error;
      }

      const signer = walletResult.data;

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, TandaPayInfo.abi, signer);

      // Cache the instance
      contractInstanceCache.set(cacheKey, contract);

      return contract;
    },
    'CONTRACT_ERROR',
    'Unable to create TandaPay contract instance. Please check your network connection and try again.',
    'CONTRACT_INSTANCE_CREATION'
  );
}

/**
 * Create a TandaPay contract instance with provider for read operations
 * @param network The network to connect to
 * @returns A TandaPayResult containing the contract instance
 */
// $FlowFixMe[unclear-type] - ethers contract types are complex
export async function createTandaPayContractWithProvider(
  network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'
  // $FlowFixMe[unclear-type] - ethers contract types are complex
): Promise<TandaPayResult<any>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Check if contract is deployed on this network
      if (!isContractDeployed(network)) {
        throw TandaPayErrorHandler.createError(
          'CONTRACT_ERROR',
          `TandaPay contract not deployed on ${network}`,
          { userMessage: `TandaPay is not yet available on ${network}. Please try a different network.` }
        );
      }

      const contractAddress = getTandaPayContractAddress(network);
      const cacheKey = `${network}_${contractAddress}_provider`;

      // Check cache first
      if (contractInstanceCache.has(cacheKey)) {
        return contractInstanceCache.get(cacheKey);
      }

      // Create provider
      const providerResult = await createProvider(network);
      if (!providerResult.success) {
        throw providerResult.error;
      }

      const provider = providerResult.data;

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, TandaPayInfo.abi, provider);

      // Cache the instance
      contractInstanceCache.set(cacheKey, contract);

      return contract;
    },
    'CONTRACT_ERROR',
    'Unable to create TandaPay contract instance. Please check your network connection and try again.',
    'CONTRACT_INSTANCE_CREATION'
  );
}

/**
 * Clear the contract instance cache (useful for network changes)
 */
export function clearContractCache(): void {
  contractInstanceCache.clear();
}

/**
 * Get the current contract address for a network
 * @param network The network name
 * @returns The contract address
 */
export function getContractAddress(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'): string {
  return getTandaPayContractAddress(network);
}

/**
 * Check if TandaPay is available on a specific network
 * @param network The network name
 * @returns True if TandaPay is deployed on the network
 */
export function isTandaPayAvailable(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'): boolean {
  return isContractDeployed(network);
}
