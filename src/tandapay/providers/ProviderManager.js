/* @flow strict-local */

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import type { TandaPayResult } from '../errors/types';
import type { PerAccountState } from '../../reduxTypes';
import { getAlchemyApiKey } from '../wallet/WalletManager';
import { getChainByNetwork, getSupportedNetworks as getSupportedNetworksFromDefinitions, type SupportedNetwork, type NetworkIdentifier } from '../definitions';
import { getTandaPayCustomRpcConfig } from '../redux/selectors';
import { isAlchemyUrl } from './AlchemyDetection';

/**
 * Dynamically get Alchemy RPC URL for any network (supported or custom)
 * This function handles the logic for both supported networks and custom networks
 */
async function getAlchemyRpcUrl(network: NetworkIdentifier, perAccountState?: ?PerAccountState): Promise<?string> {
  // Handle custom networks
  if (network === 'custom') {
    // Get custom RPC config from Redux state
    if (!perAccountState) {
      return null;
    }

    const customRpcConfig = getTandaPayCustomRpcConfig(perAccountState);

    if (!customRpcConfig || !customRpcConfig.rpcUrl) {
      return null;
    }

    // Check if the custom RPC URL is an Alchemy endpoint
    const isAlchemy = isAlchemyUrl(customRpcConfig.rpcUrl);

    if (isAlchemy) {
      return customRpcConfig.rpcUrl; // Return the full URL (may include API key)
    }

    return null; // Custom network is not Alchemy
  }

  // Handle supported networks
  const result = await getAlchemyApiKey();

  // Only proceed if we have a valid API key
  if (!result.success || result.data == null || result.data.trim() === '') {
    return null;
  }

  const apiKey = result.data;

  // $FlowFixMe[incompatible-cast] - we know network is not 'custom' at this point
  const supportedNetwork = (network: SupportedNetwork);
  const chain = getChainByNetwork(supportedNetwork);
  // $FlowFixMe[prop-missing] - alchemy property may not exist
  const alchemyEndpoint = chain.rpcUrls.alchemy && chain.rpcUrls.alchemy.http[0];

  if (alchemyEndpoint && apiKey != null) {
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
  multicall3Address?: string,
  nativeToken?: ?{|
    name: string,
    symbol: string,
    decimals: number,
  |},
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
  multicall3Address: string,
  nativeToken?: ?{|
    name: string,
    symbol: string,
    decimals: number,
  |},
}): TandaPayResult<NetworkConfig> {
  try {
    if (!config.name || !config.rpcUrl || !config.chainId || !config.multicall3Address) {
      throw TandaPayErrorHandler.createValidationError(
        'Custom RPC config must include name, rpcUrl, chainId, and multicall3Address',
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

    // Validate multicall3Address format (basic Ethereum address check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(config.multicall3Address)) {
      throw TandaPayErrorHandler.createValidationError(
        'Multicall3 address must be a valid Ethereum address',
        'Please enter a valid Ethereum address for the Multicall3 contract.'
      );
    }

    // Validate native token configuration if provided
    if (config.nativeToken != null) {
      if (!config.nativeToken.name || !config.nativeToken.symbol || config.nativeToken.decimals <= 0) {
        throw TandaPayErrorHandler.createValidationError(
          'Native token configuration is invalid',
          'Please provide valid name, symbol, and decimals for the native token.'
        );
      }
    }

    // Return a properly typed NetworkConfig
    const networkConfig: NetworkConfig = {
      name: config.name,
      rpcUrl: config.rpcUrl,
      chainId: config.chainId,
      blockExplorerUrl: config.blockExplorerUrl,
      multicall3Address: config.multicall3Address,
      nativeToken: config.nativeToken,
    };

    return { success: true, data: networkConfig };
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
