/* @flow strict-local */

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';
import type { Token } from './tokenTypes';
import { getChainByNetwork, type SupportedNetwork, type NetworkIdentifier } from '../definitions';

// Cache for default tokens to ensure object identity consistency
const defaultTokensCache: Map<string, $ReadOnlyArray<Token>> = new Map();

/**
 * Default tokens that are always available in the wallet
 * These tokens will be shown to all users by default
 */
export function getDefaultTokens(network: SupportedNetwork = 'sepolia'): $ReadOnlyArray<Token> {
  // Check cache first to ensure object identity consistency
  const cached = defaultTokensCache.get(network);
  if (cached) {
    return cached;
  }

  const chain = getChainByNetwork(network);

  // Define native token based on chain definition
  const nativeToken = {
    symbol: chain.nativeCurrency.symbol,
    address: null, // Native token, no contract address
    name: chain.nativeCurrency.name,
    decimals: chain.nativeCurrency.decimals,
    isCustom: false,
  };

  const tokens = [
    nativeToken,
    // Add ERC20 tokens from chain definition
    ...Object.keys(chain.tokens).map(tokenKey => {
      // $FlowFixMe[prop-missing] - We're iterating over existing keys, so this access is safe
      const token = chain.tokens[tokenKey];
      return {
        symbol: token.symbol,
        address: token.address,
        name: token.name,
        decimals: token.decimals,
        isCustom: false,
      };
    }),
  ];

  // Cache the result
  defaultTokensCache.set(network, tokens);
  return tokens;
}

/**
 * Get all available tokens (default + custom)
 */
export function getAllTokens(
  customTokens: $ReadOnlyArray<Token>,
  network: NetworkIdentifier = 'sepolia'
): $ReadOnlyArray<Token> {
  if (network === 'custom') {
    // For custom networks, default to ETH as native token
    const ethToken = {
      symbol: 'ETH',
      address: null,
      name: 'Ethereum',
      decimals: 18,
      isCustom: false,
    };
    return [ethToken, ...customTokens];
  }
  return [...getDefaultTokens(network), ...customTokens];
}

/**
 * Find a token by symbol from the available tokens
 */
export function findTokenBySymbol(
  symbol: string,
  customTokens: $ReadOnlyArray<Token>,
  network: NetworkIdentifier = 'sepolia'
): Token | null {
  const allTokens = getAllTokens(customTokens, network);
  return allTokens.find(token => token.symbol === symbol) || null;
}

/**
 * Validate a custom token before adding it
 */
export function validateCustomToken(token: {|
  symbol: string,
  address: string,
  name: string,
  decimals?: number,
|}): {| isValid: boolean, error?: string |} {
  // Check symbol format
  if (!token.symbol || token.symbol.length < 1 || token.symbol.length > 10) {
    return { isValid: false, error: 'Symbol must be 1-10 characters' };
  }

  // Check if symbol already exists in default tokens
  if (getDefaultTokens().some(t => t.symbol.toLowerCase() === token.symbol.toLowerCase())) {
    return { isValid: false, error: 'Token symbol already exists in default tokens' };
  }

  // Check address format (basic Ethereum address validation)
  if (!ethers.utils.isAddress(token.address)) {
    return { isValid: false, error: 'Invalid Ethereum address format' };
  }

  // Check name
  if (!token.name || token.name.length < 1 || token.name.length > 50) {
    return { isValid: false, error: 'Name must be 1-50 characters' };
  }

  // Check decimals
  const decimals = token.decimals != null ? token.decimals : 18;
  if (decimals < 0 || decimals > 77) {
    return { isValid: false, error: 'Decimals must be between 0 and 77' };
  }

  return { isValid: true };
}
