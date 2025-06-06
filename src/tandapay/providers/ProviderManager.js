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
|};

const NETWORK_CONFIGS: {| mainnet: NetworkConfig, sepolia: NetworkConfig |} = {
  mainnet: {
    name: 'mainnet',
    rpcUrl: 'https://eth.merkle.io', // Using same API key for now
    chainId: 1,
  },
  sepolia: {
    name: 'sepolia',
    rpcUrl: alchemy_sepolia_url,
    chainId: 11155111,
  },
};

/**
 * Provider cache to avoid creating multiple instances
 */
// $FlowFixMe[unclear-type] - ethers provider type is complex
const providerCache: Map<string, any> = new Map();

/**
 * Get provider instance for a specific network
 * This function will be updated to use Redux state in web3.js
 */
// $FlowFixMe[unclear-type] - ethers provider type is complex
export function createProvider(network: 'mainnet' | 'sepolia'): any {
  if (providerCache.has(network)) {
    return providerCache.get(network);
  }

  const config = NETWORK_CONFIGS[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }

  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  providerCache.set(network, provider);
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
export function getNetworkConfig(network: 'mainnet' | 'sepolia'): NetworkConfig {
  const config = NETWORK_CONFIGS[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return config;
}

/**
 * Get all supported networks
 */
export function getSupportedNetworks(): $ReadOnlyArray<'mainnet' | 'sepolia'> {
  return Object.keys(NETWORK_CONFIGS);
}
