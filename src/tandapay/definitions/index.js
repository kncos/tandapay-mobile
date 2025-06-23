/* @flow strict-local */

import { mainnet } from './mainnet';
import { polygon } from './polygon';
import { arbitrum } from './arbitrum';
import { sepolia } from './sepolia';

export { mainnet, polygon, arbitrum, sepolia };

// Chain lookup by network key
export const chains = {
  mainnet,
  polygon,
  arbitrum,
  sepolia,
};

// Helper to get chain by network key
export function getChainByNetwork(
  network: 'mainnet' | 'polygon' | 'arbitrum' | 'sepolia'
): typeof mainnet | typeof polygon | typeof arbitrum | typeof sepolia {
  return chains[network];
}

// Helper to get all supported network keys
export function getSupportedNetworks(): Array<'mainnet' | 'polygon' | 'arbitrum' | 'sepolia'> {
  return ['mainnet', 'polygon', 'arbitrum', 'sepolia'];
}

// Helper to check if a network is a testnet
export function isTestnet(network: 'mainnet' | 'polygon' | 'arbitrum' | 'sepolia'): boolean {
  return network === 'sepolia';
}

// Helper to get block explorer URL for a network
export function getBlockExplorerUrl(network: 'mainnet' | 'polygon' | 'arbitrum' | 'sepolia'): string {
  const chainConfig = getChainByNetwork(network);
  return chainConfig.blockExplorers.default.url;
}
