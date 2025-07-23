/* @flow strict-local */

import type { Token, TokenWithBalance, NetworkData, TokenState } from '../tokens/tokenTypes';
import type { NetworkIdentifier } from '../definitions/types';
import { getDefaultTokens } from '../tokens/tokenConfig';

/**
 * Convert a Token to a TokenWithBalance with default values
 */
function tokenToTokenWithBalance(token: Token): TokenWithBalance {
  return {
    ...token,
    balance: '0',
    lastUpdated: 0,
  };
}

/**
 * Get the token key for the tokens map (address for ERC20, symbol for native)
 */
function getTokenKey(token: Token): string {
  return token.address ?? token.symbol;
}

/**
 * Create a tokens map from an array of tokens
 */
function createTokensMap(tokens: $ReadOnlyArray<Token>): $ReadOnly<{ [string]: TokenWithBalance }> {
  const map = {};
  for (const token of tokens) {
    const key = getTokenKey(token);
    map[key] = tokenToTokenWithBalance(token);
  }
  return map;
}

/**
 * Initialize a NetworkData object with default tokens for the given network
 */
function initializeNetworkData(network: NetworkIdentifier): NetworkData {
  const defaultTokens = network === 'custom'
    ? [{
        symbol: 'ETH',
        address: null,
        name: 'Ethereum',
        decimals: 18,
        isCustom: false,
      }]
    : getDefaultTokens(network);

  const firstToken = defaultTokens[0];

  return {
    contractAddress: null,
    networkPerformance: null,
    selectedToken: firstToken ? firstToken.symbol : 'ETH',
    tokens: createTokensMap(defaultTokens),
  };
}

/**
 * Initialize the complete per-network token state structure
 */
export function initializePerNetworkTokenState(): TokenState {
  return {
    perNetworkData: {
      mainnet: initializeNetworkData('mainnet'),
      sepolia: initializeNetworkData('sepolia'),
      arbitrum: initializeNetworkData('arbitrum'),
      polygon: initializeNetworkData('polygon'),
      custom: initializeNetworkData('custom'),
    },
  };
}

/**
 * Add a custom token to a specific network
 */
export function addCustomTokenToNetwork(
  networkData: NetworkData,
  newToken: Token
): NetworkData {
  const key = getTokenKey(newToken);
  const customToken = { ...newToken, isCustom: true };

  return {
    ...networkData,
    tokens: {
      ...networkData.tokens,
      [key]: tokenToTokenWithBalance(customToken),
    },
  };
}

/**
 * Remove a token from a network (only allows removal of custom tokens)
 */
export function removeTokenFromNetwork(
  networkData: NetworkData,
  tokenKey: string
): NetworkData {
  const token = networkData.tokens[tokenKey];
  if (!token || !token.isCustom) {
    // Don't remove default tokens
    return networkData;
  }

  const newTokens = { ...networkData.tokens };
  delete newTokens[tokenKey];

  return {
    ...networkData,
    tokens: newTokens,
  };
}

/**
 * Update token balance for a specific network
 */
export function updateTokenBalance(
  networkData: NetworkData,
  tokenKey: string,
  balance: string
): NetworkData {
  const token = networkData.tokens[tokenKey];
  if (!token) {
    return networkData;
  }

  return {
    ...networkData,
    tokens: {
      ...networkData.tokens,
      [tokenKey]: {
        ...token,
        balance,
        lastUpdated: Date.now(),
      },
    },
  };
}

/**
 * Set the selected token for a network
 */
export function setSelectedTokenForNetwork(
  networkData: NetworkData,
  tokenSymbol: string
): NetworkData {
  return {
    ...networkData,
    selectedToken: tokenSymbol,
  };
}

/**
 * Set the contract address for a network
 */
export function setContractAddressForNetwork(
  networkData: NetworkData,
  contractAddress: ?string
): NetworkData {
  return {
    ...networkData,
    contractAddress,
  };
}

/**
 * Update network performance data
 */
export function updateNetworkPerformance(
  networkData: NetworkData,
  performance: {|
    avgBlockTime: number,
    gasPrice: number,
    lastChecked: number,
  |}
): NetworkData {
  return {
    ...networkData,
    networkPerformance: performance,
  };
}

/**
 * Update custom network tokens based on customRpcConfig
 * This should be called when customRpcConfig changes to update the native token
 */
export function updateCustomNetworkTokens(
  networkData: NetworkData,
  nativeToken?: ?{|
    name: string,
    symbol: string,
    decimals: number,
  |}
): NetworkData {
  // Use provided native token or default to ETH
  const defaultNativeToken = nativeToken || {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
  };

  const nativeTokenKey = defaultNativeToken.symbol;
  const nativeTokenWithBalance: TokenWithBalance = {
    symbol: defaultNativeToken.symbol,
    address: null,
    name: defaultNativeToken.name,
    decimals: defaultNativeToken.decimals,
    isCustom: false,
    balance: networkData.tokens[nativeTokenKey] ? networkData.tokens[nativeTokenKey].balance : '0',
    lastUpdated: networkData.tokens[nativeTokenKey] ? networkData.tokens[nativeTokenKey].lastUpdated : 0,
  };

  // Create new tokens map with updated native token
  const newTokens = { ...networkData.tokens };

  // Remove old native tokens (tokens with null address) if they're different
  for (const [key, token] of Object.entries(networkData.tokens)) {
    if (token != null && typeof token === 'object' && token.address === null && key !== nativeTokenKey) {
      delete newTokens[key];
    }
  }

  // Add/update the new native token
  newTokens[nativeTokenKey] = nativeTokenWithBalance;

  // Update selected token if it was the old native token
  const currentSelectedToken = networkData.selectedToken;
  const currentSelectedTokenData = networkData.tokens[currentSelectedToken];
  const isCurrentSelectedNative = currentSelectedTokenData && currentSelectedTokenData.address === null;

  return {
    ...networkData,
    tokens: newTokens,
    selectedToken: isCurrentSelectedNative ? nativeTokenKey : currentSelectedToken,
  };
}
