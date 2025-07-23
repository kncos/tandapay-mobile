/* @flow strict-local */

// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

import { mainnet } from './mainnet';
import { polygon } from './polygon';
import { arbitrum } from './arbitrum';
import { sepolia } from './sepolia';
import type { SupportedNetwork, TokenConfig, NetworkIdentifier } from './types';

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

// =============================================================================
// TOKEN UTILITIES
// =============================================================================

export type TokenFormatResult = {|
  amount: string,
  symbol: string,
  formattedDisplay: string,
|};

/**
 * Formats a token amount from smallest units to a human-readable string
 *
 * @param token - Token configuration object (can be null for edge cases)
 * @param amountInSmallestUnits - Amount in smallest possible units (e.g., wei for ETH)
 * @returns Formatted string like "1.25 ETH" or fallback like "1250000000000000000 units"
 */
export function formatTokenAmount(
  token: ?TokenConfig,
  amountInSmallestUnits: string | number
): TokenFormatResult {
  // Handle null token case
  if (!token) {
    const amountStr = typeof amountInSmallestUnits === 'number'
      ? amountInSmallestUnits.toString()
      : amountInSmallestUnits;

    return {
      amount: amountStr,
      symbol: 'units',
      formattedDisplay: `${amountStr} units`,
    };
  }

  try {
    // Convert amount to string if it's a number
    const amountStr = typeof amountInSmallestUnits === 'number'
      ? amountInSmallestUnits.toString()
      : amountInSmallestUnits;

    // Format using ethers with the token's decimals
    const formattedAmount = ethers.utils.formatUnits(amountStr, token.decimals);

    // Remove unnecessary trailing zeros and decimal point
    const cleanAmount = parseFloat(formattedAmount).toString();

    return {
      amount: cleanAmount,
      symbol: token.symbol,
      formattedDisplay: `${cleanAmount} ${token.symbol}`,
    };
  } catch (error) {
    // Fallback if formatting fails
    const amountStr = typeof amountInSmallestUnits === 'number'
      ? amountInSmallestUnits.toString()
      : amountInSmallestUnits;

    return {
      amount: amountStr,
      symbol: token.symbol || 'units',
      formattedDisplay: `${amountStr} ${token.symbol || 'units'}`,
    };
  }
}

/**
 * Get all available tokens for a specific network
 *
 * @param network - The network to get tokens for
 * @returns Array of token configurations including native token
 */
export function getTokensForNetwork(network: SupportedNetwork): Array<TokenConfig> {
  const chainConfig = getChainByNetwork(network);
  const tokens: Array<TokenConfig> = [];

  // Add native token first
  tokens.push({
    symbol: chainConfig.nativeCurrency.symbol,
    name: chainConfig.nativeCurrency.name,
    decimals: chainConfig.nativeCurrency.decimals,
    address: null, // Native tokens don't have contract addresses
  });

  // Add all configured tokens
  const tokensObj = chainConfig.tokens;
  const tokenKeys = Object.keys(tokensObj);
  for (const key of tokenKeys) {
    const tokenConfig = tokensObj[key];
    tokens.push(tokenConfig);
  }

  return tokens;
}

/**
 * Get tokens for a custom network with optional native token configuration
 *
 * @param nativeToken - Optional custom native token config, defaults to ETH
 * @returns Array with just the native token (custom networks don't have predefined tokens)
 */
export function getTokensForCustomNetwork(nativeToken?: ?{|
  name: string,
  symbol: string,
  decimals: number,
|}): Array<TokenConfig> {
  // Use provided native token or default to ETH
  const nativeTokenConfig = nativeToken || {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  };

  return [{
    symbol: nativeTokenConfig.symbol,
    name: nativeTokenConfig.name,
    decimals: nativeTokenConfig.decimals,
    address: null, // Native tokens don't have contract addresses
  }];
}

/**
 * Find a token by its contract address on a specific network
 *
 * @param network - The network to search in
 * @param address - The contract address to search for (null for native token)
 * @returns Token configuration or null if not found
 */
export function findTokenByAddress(
  network: SupportedNetwork,
  address: ?string
): ?TokenConfig {
  const chainConfig = getChainByNetwork(network);

  // Handle native token case (address is null)
  if (address === null || address === undefined) {
    return {
      symbol: chainConfig.nativeCurrency.symbol,
      name: chainConfig.nativeCurrency.name,
      decimals: chainConfig.nativeCurrency.decimals,
      address: null,
    };
  }

  // Search through configured tokens
  const tokensObj = chainConfig.tokens;
  const tokenKeys = Object.keys(tokensObj);
  for (const key of tokenKeys) {
    const typedToken = tokensObj[key];
    if (typedToken.address != null
        && typedToken.address.toLowerCase() === address.toLowerCase()) {
      return typedToken;
    }
  }

  return null;
}

/**
 * Find a token by address in a custom network
 *
 * @param address - The contract address to search for (null for native token)
 * @param nativeToken - The custom native token configuration
 * @returns Token configuration or null if not found (only native token supported)
 */
export function findTokenByAddressInCustomNetwork(
  address: ?string,
  nativeToken?: ?{|
    name: string,
    symbol: string,
    decimals: number,
  |}
): ?TokenConfig {
  // Handle native token case (address is null)
  if (address === null || address === undefined) {
    const nativeTokenConfig = nativeToken || {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    };

    return {
      symbol: nativeTokenConfig.symbol,
      name: nativeTokenConfig.name,
      decimals: nativeTokenConfig.decimals,
      address: null,
    };
  }

  // Custom networks don't have predefined ERC20 tokens
  return null;
}

/**
 * Find a token by its symbol on a specific network
 *
 * @param network - The network to search in
 * @param symbol - The token symbol to search for
 * @returns Token configuration or null if not found
 */
export function findTokenBySymbol(
  network: SupportedNetwork,
  symbol: string
): ?TokenConfig {
  const chainConfig = getChainByNetwork(network);

  // Check native token first
  if (chainConfig.nativeCurrency.symbol === symbol) {
    return {
      symbol: chainConfig.nativeCurrency.symbol,
      name: chainConfig.nativeCurrency.name,
      decimals: chainConfig.nativeCurrency.decimals,
      address: null,
    };
  }

  // Search through configured tokens
  const tokensObj = chainConfig.tokens;
  const tokenKeys = Object.keys(tokensObj);
  for (const key of tokenKeys) {
    const typedToken = tokensObj[key];
    if (typedToken.symbol === symbol) {
      return typedToken;
    }
  }

  return null;
}

/**
 * Find a token by symbol in a custom network
 *
 * @param symbol - The token symbol to search for
 * @param nativeToken - The custom native token configuration
 * @returns Token configuration or null if not found (only native token supported)
 */
export function findTokenBySymbolInCustomNetwork(
  symbol: string,
  nativeToken?: ?{|
    name: string,
    symbol: string,
    decimals: number,
  |}
): ?TokenConfig {
  const nativeTokenConfig = nativeToken || {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  };

  // Check if it matches the native token
  if (nativeTokenConfig.symbol === symbol) {
    return {
      symbol: nativeTokenConfig.symbol,
      name: nativeTokenConfig.name,
      decimals: nativeTokenConfig.decimals,
      address: null,
    };
  }

  // Custom networks don't have predefined ERC20 tokens
  return null;
}

/**
 * Check if a network supports a specific token address
 *
 * @param network - The network to check
 * @param address - The token address to check (null for native token)
 * @returns true if the token is supported on this network
 */
export function isTokenSupportedOnNetwork(
  network: SupportedNetwork,
  address: ?string
): boolean {
  return findTokenByAddress(network, address) !== null;
}

/**
 * Get the native token configuration for a network
 *
 * @param network - The network to get the native token for
 * @returns Native token configuration
 */
export function getNativeTokenForNetwork(network: SupportedNetwork): TokenConfig {
  const chainConfig = getChainByNetwork(network);
  return {
    symbol: chainConfig.nativeCurrency.symbol,
    name: chainConfig.nativeCurrency.name,
    decimals: chainConfig.nativeCurrency.decimals,
    address: null,
  };
}
