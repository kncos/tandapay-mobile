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

type SupportedNetwork = 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom';

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
 */
// $FlowFixMe[unclear-type] - ethers provider type is complex
const providerCache: Map<string, any> = new Map();

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
    return providerCache.get(cacheKey);
  }

  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  providerCache.set(cacheKey, provider);
  return provider;
}

/**
 * Clear provider cache (useful for testing or network switching)
 */
export function clearProviderCache(): void {
  providerCache.clear();
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
