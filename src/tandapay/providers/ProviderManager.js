/* @flow strict-local */

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

// $FlowFixMe[untyped-import] - env is a local module without flow types
import { alchemy_sepolia_url } from '../env';

/**
 * Network configuration for providers
 */
type NetworkConfig = {|
  name: string,
  rpcUrl: string,
  chainId: number,
  blockExplorerUrl?: string,
|};

const NETWORK_CONFIGS: {|
  mainnet: NetworkConfig,
  sepolia: NetworkConfig,
  arbitrum: NetworkConfig,
  polygon: NetworkConfig
|} = {
  mainnet: {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.merkle.io', // Free public node
    chainId: 1,
    blockExplorerUrl: 'https://etherscan.io',
  },
  sepolia: {
    name: 'Sepolia Testnet',
    rpcUrl: alchemy_sepolia_url,
    chainId: 11155111,
    blockExplorerUrl: 'https://sepolia.etherscan.io',
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
 * Get provider instance for a specific network or custom configuration
 */
export function createProvider(
  network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom',
  customConfig?: NetworkConfig
): mixed {
  let cacheKey = network;
  let config;

  if (network === 'custom' && customConfig) {
    cacheKey = `custom-${customConfig.chainId}`;
    config = customConfig;
  } else if (network !== 'custom') {
    config = NETWORK_CONFIGS[network];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }
  } else {
    throw new Error('Custom network requires customConfig parameter');
  }

  if (providerCache.has(cacheKey)) {
    updateCacheAccess(cacheKey);
    return providerCache.get(cacheKey);
  }

  // Evict old entries before adding new one
  evictLRUIfNeeded();

  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  providerCache.set(cacheKey, provider);
  updateCacheAccess(cacheKey);
  return provider;
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
 * Get network configuration
 */
export function getNetworkConfig(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'): NetworkConfig {
  const config = NETWORK_CONFIGS[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return config;
}

/**
 * Get all supported networks
 */
export function getSupportedNetworks(): $ReadOnlyArray<'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'> {
  return Object.keys(NETWORK_CONFIGS);
}

/**
 * Validate custom RPC configuration
 */
export function validateCustomRpcConfig(config: {
  name: string,
  rpcUrl: string,
  chainId: number,
  blockExplorerUrl?: string,
}): NetworkConfig {
  if (!config.name || !config.rpcUrl || !config.chainId) {
    throw new Error('Custom RPC config must include name, rpcUrl, and chainId');
  }

  if (config.chainId <= 0) {
    throw new Error('Chain ID must be a positive number');
  }

  if (!config.rpcUrl.startsWith('http://') && !config.rpcUrl.startsWith('https://')) {
    throw new Error('RPC URL must be a valid HTTP or HTTPS URL');
  }

  return config;
}
