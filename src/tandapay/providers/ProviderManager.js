/* @flow strict-local */

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import type { TandaPayResult } from '../errors/types';
import { getAlchemyApiKey } from '../wallet/WalletManager';
import { getChainByNetwork, getSupportedNetworks as getSupportedNetworksFromDefinitions, type SupportedNetwork, type NetworkIdentifier } from '../definitions';

// Fallback Alchemy API key for development (will be replaced with user's key when available)
const FALLBACK_ALCHEMY_API = 'atytcJvyhx1n4LPRJXc8kQuauFC1Uro8';

/**
 * Dynamically get Alchemy RPC URL for any supported network with user's API key
 */
async function getAlchemyRpcUrl(network: SupportedNetwork): Promise<?string> {
  const result = await getAlchemyApiKey();
  const apiKey = (result.success && result.data != null && result.data.trim() !== '') ? result.data : FALLBACK_ALCHEMY_API;

  const chain = getChainByNetwork(network);
  // $FlowFixMe[prop-missing] - alchemy property may not exist
  const alchemyEndpoint = chain.rpcUrls.alchemy?.http[0];

  if (alchemyEndpoint) {
    return `${alchemyEndpoint}/${apiKey}`;
  }

  return null;
}

/**
 * Network configuration for providers
 */
type NetworkConfig = {|
  name: string,
  rpcUrl: string,
  chainId: number,
  blockExplorerUrl?: string,
|};

/**
 * Get network configuration dynamically (for networks that need API keys)
 */
async function getNetworkConfig(network: SupportedNetwork): Promise<NetworkConfig> {
  const chain = getChainByNetwork(network);

  // Try to get Alchemy URL first (for better performance), fall back to default
  const alchemyUrl = await getAlchemyRpcUrl(network);
  const rpcUrl = (alchemyUrl != null && alchemyUrl !== '') ? alchemyUrl : chain.rpcUrls.default.http[0];

  return {
    name: chain.name,
    rpcUrl,
    chainId: chain.id,
    blockExplorerUrl: chain.blockExplorers.default.url,
  };
}

/**
 * Provider cache to avoid creating multiple instances
 * Implements LRU cache with size limit to prevent memory leaks
 */
// $FlowFixMe[unclear-type] - ethers provider type is complex
const providerCache: Map<string, any> = new Map();
const MAX_CACHE_SIZE = 10; // Limit to prevent memory leaks
const cacheAccessOrder: Array<string> = []; // Track access order for LRU

/**
 * Update cache access order for LRU eviction
 */
function updateCacheAccess(key: string): void {
  const existingIndex = cacheAccessOrder.indexOf(key);
  if (existingIndex > -1) {
    cacheAccessOrder.splice(existingIndex, 1);
  }
  cacheAccessOrder.push(key);
}

/**
 * Evict least recently used cache entries if over limit
 */
function evictLRUIfNeeded(): void {
  while (providerCache.size >= MAX_CACHE_SIZE && cacheAccessOrder.length > 0) {
    const oldestKey = cacheAccessOrder.shift();
    if (oldestKey && providerCache.has(oldestKey)) {
      const provider = providerCache.get(oldestKey);
      // Cleanup provider connections if method exists
      if (provider && typeof provider.removeAllListeners === 'function') {
        provider.removeAllListeners();
      }
      providerCache.delete(oldestKey);
    }
  }
}

/**
 * Get provider instance for a specific network or custom configuration with error handling
 */
export async function createProvider(
  network: NetworkIdentifier,
  customConfig?: NetworkConfig
): Promise<TandaPayResult<mixed>> {
  try {
    let cacheKey = network;
    let config;

    if (network === 'custom') {
      if (!customConfig) {
        throw TandaPayErrorHandler.createValidationError(
          'Custom network configuration required',
          'Please provide a valid custom network configuration.'
        );
      }
      cacheKey = `custom-${customConfig.chainId}`;
      config = customConfig;
    } else {
      config = await getNetworkConfig(network);
      if (!config) {
        throw TandaPayErrorHandler.createValidationError(
          `Unsupported network: ${network}`,
          'Please select a supported network from the list.'
        );
      }
    }

    if (providerCache.has(cacheKey)) {
      updateCacheAccess(cacheKey);
      return { success: true, data: providerCache.get(cacheKey) };
    }

    // Evict old entries before adding new one
    evictLRUIfNeeded();

    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    providerCache.set(cacheKey, provider);
    updateCacheAccess(cacheKey);
    return { success: true, data: provider };
  } catch (error) {
    if (error?.type) {
      // Already a TandaPayError
      return { success: false, error };
    }
    const tandaPayError = TandaPayErrorHandler.createError(
      'NETWORK_ERROR',
      error?.message || 'Failed to create network provider',
      {
        userMessage: 'Unable to connect to the selected network. Please check your internet connection and try again.',
        details: error
      }
    );
    return { success: false, error: tandaPayError };
  }
}

/**
 * Clear provider cache (useful for testing or network switching)
 */
export function clearProviderCache(): void {
  // Cleanup all providers before clearing
  providerCache.forEach((provider) => {
    if (provider && typeof provider.removeAllListeners === 'function') {
      provider.removeAllListeners();
    }
  });
  providerCache.clear();
  cacheAccessOrder.length = 0; // Clear access order tracking
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): {| size: number, maxSize: number, keys: Array<string> |} {
  return {
    size: providerCache.size,
    maxSize: MAX_CACHE_SIZE,
    keys: Array.from(providerCache.keys()),
  };
}

/**
 * Get all supported networks
 */
export function getSupportedNetworks(): $ReadOnlyArray<SupportedNetwork> {
  return getSupportedNetworksFromDefinitions();
}

/**
 * Validate custom RPC configuration with error handling
 */
export function validateCustomRpcConfig(config: {
  name: string,
  rpcUrl: string,
  chainId: number,
  blockExplorerUrl?: string,
}): TandaPayResult<NetworkConfig> {
  try {
    if (!config.name || !config.rpcUrl || !config.chainId) {
      throw TandaPayErrorHandler.createValidationError(
        'Custom RPC config must include name, rpcUrl, and chainId',
        'Please provide all required network configuration fields.'
      );
    }

    if (config.chainId <= 0) {
      throw TandaPayErrorHandler.createValidationError(
        'Chain ID must be a positive number',
        'Please enter a valid chain ID greater than 0.'
      );
    }

    if (!config.rpcUrl.startsWith('http://') && !config.rpcUrl.startsWith('https://')) {
      throw TandaPayErrorHandler.createValidationError(
        'RPC URL must be a valid HTTP or HTTPS URL',
        'Please enter a valid RPC URL starting with http:// or https://.'
      );
    }

    return { success: true, data: config };
  } catch (error) {
    if (error?.type) {
      return { success: false, error };
    }
    const tandaPayError = TandaPayErrorHandler.createValidationError(
      'Invalid RPC configuration',
      'Please check your custom RPC configuration and try again.'
    );
    return { success: false, error: tandaPayError };
  }
}

// Export the Alchemy RPC URL helper for use in transaction fetching
export { getAlchemyRpcUrl };

/**
 * Get basic network configuration synchronously (for UI display purposes)
 * Note: For sepolia, this returns static info without the dynamic API key URL
 */
export function getNetworkDisplayInfo(network: SupportedNetwork): {|
  name: string,
  chainId: number,
  blockExplorerUrl?: string,
|} {
  const chain = getChainByNetwork(network);
  return {
    name: chain.name,
    chainId: chain.id,
    blockExplorerUrl: chain.blockExplorers.default.url,
  };
}
