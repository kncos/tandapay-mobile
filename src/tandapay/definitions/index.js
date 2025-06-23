/* @flow strict-local */

import { mainnet } from './mainnet';
import { polygon } from './polygon';
import { arbitrum } from './arbitrum';
import { sepolia } from './sepolia';
import type { SupportedNetwork } from './types';

export { mainnet, polygon, arbitrum, sepolia };

// Export types
export type { SupportedNetwork, NetworkIdentifier, ChainConfig, TokenConfig } from './types';

// Chain lookup by network key
export const chains = {
  mainnet,
  polygon,
  arbitrum,
  sepolia,
};

// Helper to get chain by network key
export function getChainByNetwork(
  network: SupportedNetwork
): typeof mainnet | typeof polygon | typeof arbitrum | typeof sepolia {
  return chains[network];
}

// Helper to get all supported network keys
export function getSupportedNetworks(): Array<SupportedNetwork> {
  return ['mainnet', 'polygon', 'arbitrum', 'sepolia'];
}

// Helper to check if a network is a testnet
export function isTestnet(network: SupportedNetwork): boolean {
  return network === 'sepolia';
}

// Helper to get block explorer URL for a network
export function getBlockExplorerUrl(network: SupportedNetwork): string {
  const chainConfig = getChainByNetwork(network);
  return chainConfig.blockExplorers.default.url;
}
