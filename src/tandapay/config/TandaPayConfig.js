// @flow strict-local

/**
 * TandaPay Configuration
 *
 * This file contains configuration for TandaPay contract addresses
 * across different networks and environments.
 */

type TandaPayNetworkConfig = {|
  contractAddress: string,
  blockExplorerUrl: string,
|};

type TandaPayConfig = {|
  +networks: {|
    +mainnet: TandaPayNetworkConfig,
    +sepolia: TandaPayNetworkConfig,
    +arbitrum: TandaPayNetworkConfig,
    +polygon: TandaPayNetworkConfig,
  |},
|};

/**
 * TandaPay contract addresses for different networks
 * Note: These are placeholder addresses. Update them when contracts are deployed.
 */
const TANDAPAY_CONFIG: TandaPayConfig = {
  networks: {
    mainnet: {
      // TODO: Replace with actual mainnet contract address when deployed
      contractAddress: '0x0000000000000000000000000000000000000000',
      blockExplorerUrl: 'https://etherscan.io',
    },
    sepolia: {
      // TODO: Replace with actual Sepolia testnet contract address
      // Example: contractAddress: '0x1234567890123456789012345678901234567890',
      contractAddress: '0x0000000000000000000000000000000000000000',
      blockExplorerUrl: 'https://sepolia.etherscan.io',
    },
    arbitrum: {
      // TODO: Replace with actual Arbitrum contract address when deployed
      contractAddress: '0x0000000000000000000000000000000000000000',
      blockExplorerUrl: 'https://arbiscan.io',
    },
    polygon: {
      // TODO: Replace with actual Polygon contract address when deployed
      contractAddress: '0x0000000000000000000000000000000000000000',
      blockExplorerUrl: 'https://polygonscan.com',
    },
  },
};

/**
 * Get TandaPay contract address for a specific network
 * @param network The network name
 * @returns The contract address for the network
 */
export function getTandaPayContractAddress(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'): string {
  return TANDAPAY_CONFIG.networks[network].contractAddress;
}

/**
 * Get block explorer URL for a specific network
 * @param network The network name
 * @returns The block explorer URL for the network
 */
export function getBlockExplorerUrl(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'): string {
  return TANDAPAY_CONFIG.networks[network].blockExplorerUrl;
}

/**
 * Check if a contract address is configured for a network
 * @param network The network name
 * @returns True if the contract address is configured (not the zero address)
 */
export function isContractDeployed(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'): boolean {
  const address = getTandaPayContractAddress(network);
  return address !== '0x0000000000000000000000000000000000000000';
}

export default TANDAPAY_CONFIG;
