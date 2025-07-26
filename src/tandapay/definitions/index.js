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
 * Convert human-readable token amount to smallest units (wei-like units)
 * This is the inverse operation of formatTokenAmount
 *
 * @param token - Token configuration object (can be null for edge cases)
 * @param humanReadableAmount - Amount in human-readable format (e.g., "10.5" for 10.5 USDC)
 * @returns BigNumber in smallest units or fallback number for unknown tokens
 */
export function parseTokenAmount(
  token: ?TokenConfig,
  humanReadableAmount: string | number
): mixed {
  // Convert amount to string if it's a number
  const amountStr = typeof humanReadableAmount === 'number'
    ? humanReadableAmount.toString()
    : humanReadableAmount;

  // Handle null token case - return as number for backward compatibility
  if (!token) {
    try {
      return Number(amountStr);
    } catch (error) {
      return 0;
    }
  }

  try {
    // Convert human-readable amount to smallest units using ethers
    return ethers.utils.parseUnits(amountStr, token.decimals);
  } catch (error) {
    // Fallback: try as a regular number for backward compatibility
    try {
      return Number(amountStr);
    } catch (numberError) {
      return 0;
    }
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
 * Find a token by its contract address in default/built-in tokens for a specific network
 *
 * @param network - The network to search in
 * @param address - The contract address to search for (null for native token)
 * @returns Token configuration or null if not found
 */
export function findDefaultTokenByAddress(
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
 * Find a token by its symbol in default/built-in tokens for a specific network
 *
 * @param network - The network to search in
 * @param symbol - The token symbol to search for
 * @returns Token configuration or null if not found
 */
export function findDefaultTokenBySymbol(
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

// =============================================================================
// CUSTOM TOKEN UTILITIES
// =============================================================================

/**
 * Find a token by its contract address in custom tokens for the current network
 * This function expects to be called with the Redux state to access custom tokens
 *
 * @param address - The contract address to search for (null for native token)
 * @param availableTokens - Array of available tokens from getAvailableTokens selector
 * @returns Token configuration or null if not found
 */
export function findCustomTokenByAddress(
  address: ?string,
  availableTokens: $ReadOnlyArray<$ReadOnly<{
    symbol: string,
    name: string,
    decimals: number,
    address: ?string,
    isCustom: boolean,
    ...
  }>>
): ?TokenConfig {
  // Handle native token case (address is null)
  if (address === null || address === undefined) {
    const nativeToken = availableTokens.find(token => token.address === null);
    if (nativeToken) {
      return {
        symbol: nativeToken.symbol,
        name: nativeToken.name,
        decimals: nativeToken.decimals,
        address: null,
      };
    }
    return null;
  }

  // Search through available tokens (includes both default and custom)
  for (const token of availableTokens) {
    if (token.address != null
        && token.address.toLowerCase() === address.toLowerCase()) {
      return {
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        address: token.address,
      };
    }
  }

  return null;
}

/**
 * Find a token by its symbol in custom tokens for the current network
 * This function expects to be called with the Redux state to access custom tokens
 *
 * @param symbol - The token symbol to search for
 * @param availableTokens - Array of available tokens from getAvailableTokens selector
 * @returns Token configuration or null if not found
 */
export function findCustomTokenBySymbol(
  symbol: string,
  availableTokens: $ReadOnlyArray<$ReadOnly<{
    symbol: string,
    name: string,
    decimals: number,
    address: ?string,
    isCustom: boolean,
    ...
  }>>
): ?TokenConfig {
  const foundToken = availableTokens.find(token => token.symbol === symbol);

  if (foundToken) {
    return {
      symbol: foundToken.symbol,
      name: foundToken.name,
      decimals: foundToken.decimals,
      address: foundToken.address,
    };
  }

  return null;
}

// =============================================================================
// MAIN TOKEN UTILITIES (USES BOTH DEFAULT AND CUSTOM)
// =============================================================================

/**
 * Find a token by its contract address on any network (default or custom tokens)
 * First checks default tokens, then custom tokens if available
 *
 * @param network - The network identifier
 * @param address - The contract address to search for (null for native token)
 * @param availableTokens - Optional array of available tokens from Redux state
 * @returns Token configuration or null if not found
 */
export function findTokenByAddress(
  network: NetworkIdentifier,
  address: ?string,
  availableTokens?: $ReadOnlyArray<$ReadOnly<{
    symbol: string,
    name: string,
    decimals: number,
    address: ?string,
    isCustom: boolean,
    ...
  }>>
): ?TokenConfig {
  // For supported networks, first try to find in default tokens
  if (network !== 'custom') {
    const defaultToken = findDefaultTokenByAddress(network, address);
    if (defaultToken) {
      return defaultToken;
    }
  }

  // If not found in defaults (or is custom network), try custom tokens
  if (availableTokens) {
    const customToken = findCustomTokenByAddress(address, availableTokens);
    if (customToken) {
      return customToken;
    }
  }

  return null;
}

/**
 * Find a token by its symbol on any network (default or custom tokens)
 * First checks default tokens, then custom tokens if available
 *
 * @param network - The network identifier
 * @param symbol - The token symbol to search for
 * @param availableTokens - Optional array of available tokens from Redux state
 * @returns Token configuration or null if not found
 */
export function findTokenBySymbol(
  network: NetworkIdentifier,
  symbol: string,
  availableTokens?: $ReadOnlyArray<$ReadOnly<{
    symbol: string,
    name: string,
    decimals: number,
    address: ?string,
    isCustom: boolean,
    ...
  }>>
): ?TokenConfig {
  // For supported networks, first try to find in default tokens
  if (network !== 'custom') {
    const defaultToken = findDefaultTokenBySymbol(network, symbol);
    if (defaultToken) {
      return defaultToken;
    }
  }

  // If not found in defaults (or is custom network), try custom tokens
  if (availableTokens) {
    const customToken = findCustomTokenBySymbol(symbol, availableTokens);
    if (customToken) {
      return customToken;
    }
  }

  return null;
}

/**
 * Convert currency parameters from human-readable values to smallest units
 * Helper function for transaction parameter conversion
 *
 * @param paramValues - Array of parameter values from form
 * @param transaction - Transaction object with parameter definitions
 * @param selectedNetwork - Currently selected network
 * @param availableTokens - Available tokens from Redux state
 * @returns Array with currency parameters converted to smallest units
 */
export function convertCurrencyParameters(
  paramValues: mixed[],
  transaction: $ReadOnly<{
    parameters?: $ReadOnlyArray<$ReadOnly<{
      type: string,
      isCurrency?: boolean,
      ...
    }>>,
    prefilledParams?: $ReadOnly<{
      paymentTokenAddress?: string,
      ...
    }>,
    ...
  }>,
  selectedNetwork: string,
  availableTokens: $ReadOnlyArray<$ReadOnly<{
    symbol: string,
    decimals: number,
    address: ?string,
    ...
  }>>
): mixed[] {
  if (!transaction.parameters) {
    return paramValues;
  }

  return transaction.parameters.map((param, index) => {
    const value = paramValues[index];
    
    // Only convert currency uint256 parameters
    if (param.type === 'uint256' && param.isCurrency === true && typeof value === 'string' && value !== '0') {
      // Get token information for conversion
      let tokenInfo = null;
      
      // Check if transaction provides payment token address via prefilledParams
      const paymentTokenAddress = transaction.prefilledParams?.paymentTokenAddress;
      if (paymentTokenAddress != null && paymentTokenAddress !== '') {
        // Try to find token info by looking through availableTokens directly
        if (availableTokens) {
          const foundToken = availableTokens.find(token =>
            token.address === paymentTokenAddress
            || (token.address == null && paymentTokenAddress === '0x0000000000000000000000000000000000000000')
          );
          
          if (foundToken) {
            // Convert to TokenConfig format by excluding isCustom
            tokenInfo = {
              symbol: foundToken.symbol,
              decimals: foundToken.decimals,
              address: foundToken.address,
              name: foundToken.symbol // Use symbol as name since name might not be available
            };
          }
        }
        
        // Fallback: Use basic pattern matching for common tokens if not found
        if (!tokenInfo) {
          const addressLower = paymentTokenAddress.toLowerCase();
          if (addressLower.includes('usdc') || addressLower.includes('usdt')) {
            tokenInfo = {
              symbol: 'USDC',
              decimals: 6,
              address: paymentTokenAddress,
              name: 'USD Coin'
            };
          } else if (addressLower.includes('dai')) {
            tokenInfo = {
              symbol: 'DAI',
              decimals: 18,
              address: paymentTokenAddress,
              name: 'Dai Stablecoin'
            };
          } else {
            tokenInfo = {
              symbol: 'ETH',
              decimals: 18,
              address: null,
              name: 'Ethereum'
            }; // Default fallback
          }
        }
      }
      
      // Use parseTokenAmount utility for conversion
      return parseTokenAmount(tokenInfo, value);
    }
    
    return value;
  });
}

/**
 * Check if a network supports a specific token address
 *
 * @param network - The network to check
 * @param address - The token address to check (null for native token)
 * @param availableTokens - Optional array of available tokens from Redux state
 * @returns true if the token is supported on this network
 */
export function isTokenSupportedOnNetwork(
  network: NetworkIdentifier,
  address: ?string,
  availableTokens?: Array<{
    symbol: string,
    name: string,
    decimals: number,
    address: ?string,
    isCustom: boolean,
    ...
  }>
): boolean {
  return findTokenByAddress(network, address, availableTokens) !== null;
}

// =============================================================================
// LEGACY TOKEN UTILITIES (KEPT FOR BACKWARDS COMPATIBILITY)
// =============================================================================
