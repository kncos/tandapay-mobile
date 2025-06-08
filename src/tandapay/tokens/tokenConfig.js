/* @flow strict-local */

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';
import type { Token, NetworkTokenAddresses } from './tokenTypes';

/**
 * Network-specific token contract addresses
 * These addresses are for demonstration/testing purposes
 */
export const NETWORK_TOKEN_ADDRESSES: NetworkTokenAddresses = {
  mainnet: {
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // Real USDC mainnet address
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Real USDT mainnet address
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',  // Real DAI mainnet address
  },
  sepolia: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Test USDC sepolia address
    USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Test USDT sepolia address
    DAI: '0x68194a729C2450ad26072b3D33ADaCbcef39D574',  // Test DAI sepolia address
  },
  arbitrum: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC on Arbitrum
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT on Arbitrum
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',  // DAI on Arbitrum
  },
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT on Polygon
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',  // DAI on Polygon
  },
};

/**
 * Default tokens that are always available in the wallet
 * These tokens will be shown to all users by default
 */
export function getDefaultTokens(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' = 'sepolia'): $ReadOnlyArray<Token> {
  const addresses = NETWORK_TOKEN_ADDRESSES[network] || NETWORK_TOKEN_ADDRESSES.sepolia;

  return [
    {
      symbol: 'ETH',
      address: null, // Native token, no contract address
      name: 'Ethereum',
      decimals: 18,
      isDefault: true,
      isCustom: false,
    },
    {
      symbol: 'USDC',
      address: addresses.USDC,
      name: 'USD Coin',
      decimals: 6,
      isDefault: true,
      isCustom: false,
    },
    {
      symbol: 'USDT',
      address: addresses.USDT,
      name: 'Tether USD',
      decimals: 6,
      isDefault: true,
      isCustom: false,
    },
    {
      symbol: 'DAI',
      address: addresses.DAI,
      name: 'Dai Stablecoin',
      decimals: 18,
      isDefault: true,
      isCustom: false,
    },
  ];
}

/**
 * Get all available tokens (default + custom)
 */
export function getAllTokens(
  customTokens: $ReadOnlyArray<Token>,
  network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom' = 'sepolia'
): $ReadOnlyArray<Token> {
  if (network === 'custom') {
    // For custom networks, only return custom tokens and ETH
    const ethToken = {
      symbol: 'ETH',
      address: null,
      name: 'Ethereum',
      decimals: 18,
      isDefault: true,
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
  network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom' = 'sepolia'
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
