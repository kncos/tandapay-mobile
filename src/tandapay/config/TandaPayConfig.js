// @flow strict-local

/**
 * TandaPay Configuration
 *
 * This file contains utility functions for TandaPay network configuration.
 * Contract addresses are now user-configurable through network settings.
 */

import { getChainByNetwork } from '../definitions';

/**
 * Get block explorer URL for a specific network
 * @param network The network name
 * @returns The block explorer URL for the network
 */
export function getBlockExplorerUrl(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'): string {
  const chainConfig = getChainByNetwork(network);
  return chainConfig.blockExplorers.default.url;
}
