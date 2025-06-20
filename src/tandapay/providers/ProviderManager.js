/* @flow strict-local */

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import type { TandaPayResult } from '../errors/types';
import { getAlchemyApiKey } from '../wallet/WalletManager';

// Fallback Alchemy API key for development (will be replaced with user's key when available)
const FALLBACK_ALCHEMY_API = 'atytcJvyhx1n4LPRJXc8kQuauFC1Uro8';

/**
 * Dynamically get Alchemy RPC URL with user's API key
 */
async function getAlchemySepoliaUrl(): Promise<string> {
  const result = await getAlchemyApiKey();
  const apiKey = (result.success && result.data != null && result.data.trim() !== '') ? result.data : FALLBACK_ALCHEMY_API;
  return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
}

// Export for backward compatibility (will use fallback key)
export const alchemy_sepolia_url = `https://eth-sepolia.g.alchemy.com/v2/${FALLBACK_ALCHEMY_API}`;

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
async function getNetworkConfig(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'): Promise<NetworkConfig> {
  const staticConfigs = {
    mainnet: {
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://eth.merkle.io', // Free public node
      chainId: 1,
      blockExplorerUrl: 'https://etherscan.io',
    },
    arbitrum: {
      name: 'Arbitrum One',
      rpcUrl: 'https://arb1.arbitrum.io/rpc', // Free public node
      chainId: 42161,
      blockExplorerUrl: 'https://arbiscan.io',
    },
    polygon: {
      name: 'Polygon',
      rpcUrl: 'https://polygon-rpc.com', // Free public node
      chainId: 137,
      blockExplorerUrl: 'https://polygonscan.com',
    },
  };

  if (network === 'sepolia') {
    const sepoliaUrl = await getAlchemySepoliaUrl();
    return {
      name: 'Sepolia Testnet',
      rpcUrl: sepoliaUrl,
      chainId: 11155111,
      blockExplorerUrl: 'https://sepolia.etherscan.io',
    };
  }

  return staticConfigs[network];
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
  network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom',
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
export function getSupportedNetworks(): $ReadOnlyArray<'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'> {
  return ['mainnet', 'sepolia', 'arbitrum', 'polygon'];
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

/**
 * Get basic network configuration synchronously (for UI display purposes)
 * Note: For sepolia, this returns static info without the dynamic API key URL
 */
export function getNetworkDisplayInfo(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'): {|
  name: string,
  chainId: number,
  blockExplorerUrl?: string,
|} {
  const configs = {
    mainnet: {
      name: 'Ethereum Mainnet',
      chainId: 1,
      blockExplorerUrl: 'https://etherscan.io',
    },
    sepolia: {
      name: 'Sepolia Testnet',
      chainId: 11155111,
      blockExplorerUrl: 'https://sepolia.etherscan.io',
    },
    arbitrum: {
      name: 'Arbitrum One',
      chainId: 42161,
      blockExplorerUrl: 'https://arbiscan.io',
    },
    polygon: {
      name: 'Polygon',
      chainId: 137,
      blockExplorerUrl: 'https://polygonscan.com',
    },
  };

  return configs[network];
}
