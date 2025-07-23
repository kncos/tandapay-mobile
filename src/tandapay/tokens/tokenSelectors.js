/* @flow strict-local */

import type { PerAccountState } from '../../reduxTypes';
import type { TokenWithBalance, TokenState, NetworkData } from './tokenTypes';
import type { NetworkIdentifier } from '../definitions/types';
import { getTandaPaySelectedNetwork } from '../redux/selectors';
import { initializePerNetworkTokenState } from '../utils/tokenMigration';

/**
 * Get the token state from Redux state
 */
export function getTokenState(state: PerAccountState): TokenState {
  // Check if tandaPay state exists and has the new structure
  if (state.tandaPay && state.tandaPay.tokens && state.tandaPay.tokens.perNetworkData) {
    return state.tandaPay.tokens;
  }

  // Fallback: Return a properly initialized token state structure if new structure doesn't exist
  // This handles cases where migration hasn't run yet
  return initializePerNetworkTokenState();
}

/**
 * Get the network data for a specific network
 */
export function getNetworkData(state: PerAccountState, network: NetworkIdentifier): NetworkData {
  const tokenState = getTokenState(state);

  // Check if we have the new perNetworkData structure
  if (tokenState.perNetworkData && tokenState.perNetworkData[network]) {
    return tokenState.perNetworkData[network];
  }

  // Fallback: Create a temporary NetworkData from legacy state if it exists
  // This handles the case when migration hasn't run yet
  const fallbackNetworkData: NetworkData = {
    contractAddress: null,
    networkPerformance: null,
    selectedToken: 'ETH', // Default fallback
    tokens: {}, // Empty tokens map
  };

  return fallbackNetworkData;
}

/**
 * Get the network data for the currently selected network
 */
export function getCurrentNetworkData(state: PerAccountState): NetworkData {
  const selectedNetwork = getTandaPaySelectedNetwork(state);
  return getNetworkData(state, selectedNetwork);
}

/**
 * Get the currently selected token symbol for the current network
 */
export function getSelectedTokenSymbol(state: PerAccountState): string {
  const networkData = getCurrentNetworkData(state);
  return networkData.selectedToken;
}

/**
 * Get the currently selected token symbol for a specific network
 */
export function getSelectedTokenSymbolForNetwork(state: PerAccountState, network: NetworkIdentifier): string {
  const networkData = getNetworkData(state, network);
  return networkData.selectedToken;
}

/**
 * Get all available tokens for the current network
 */
export function getAvailableTokens(state: PerAccountState): $ReadOnlyArray<TokenWithBalance> {
  const networkData = getCurrentNetworkData(state);
  return Object.keys(networkData.tokens).map(key => networkData.tokens[key]);
}

/**
 * Get all available tokens for a specific network
 */
export function getAvailableTokensForNetwork(state: PerAccountState, network: NetworkIdentifier): $ReadOnlyArray<TokenWithBalance> {
  const networkData = getNetworkData(state, network);
  return Object.keys(networkData.tokens).map(key => networkData.tokens[key]);
}

/**
 * Get a specific token by key (address or symbol) from the current network
 */
export function getTokenByKey(state: PerAccountState, tokenKey: string): TokenWithBalance | null {
  const networkData = getCurrentNetworkData(state);
  return networkData.tokens[tokenKey] || null;
}

/**
 * Get a specific token by symbol from the current network
 */
export function getTokenBySymbol(state: PerAccountState, symbol: string): TokenWithBalance | null {
  const allTokens = getAvailableTokens(state);
  return allTokens.find(token => token.symbol === symbol) || null;
}

/**
 * Get the currently selected token object
 */
export function getSelectedToken(state: PerAccountState): TokenWithBalance | null {
  const selectedSymbol = getSelectedTokenSymbol(state);
  return getTokenBySymbol(state, selectedSymbol);
}

/**
 * Get the cached balance for the currently selected token
 */
export function getSelectedTokenBalance(state: PerAccountState): string {
  const selectedToken = getSelectedToken(state);
  return selectedToken?.balance || '0';
}

/**
 * Get the cached balance for a specific token by symbol
 */
export function getTokenBalance(state: PerAccountState, tokenSymbol: string): string {
  const token = getTokenBySymbol(state, tokenSymbol);
  return token?.balance || '0';
}

/**
 * Get the last update timestamp for the selected token's balance
 */
export function getSelectedTokenBalanceLastUpdated(state: PerAccountState): number {
  const selectedToken = getSelectedToken(state);
  return selectedToken?.lastUpdated || 0;
}

/**
 * Get the last update timestamp for a token's balance by symbol
 */
export function getTokenBalanceLastUpdated(state: PerAccountState, tokenSymbol: string): number {
  const token = getTokenBySymbol(state, tokenSymbol);
  return token?.lastUpdated || 0;
}

/**
 * Check if a token balance is stale (older than 5 minutes)
 */
export function isTokenBalanceStale(state: PerAccountState, tokenSymbol: string): boolean {
  const lastUpdated = getTokenBalanceLastUpdated(state, tokenSymbol);
  if (lastUpdated === 0) {
    return true;
  }

  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  return lastUpdated < fiveMinutesAgo;
}

/**
 * Filter tokens to get only custom (user-added) tokens for current network
 */
export function getOnlyCustomTokens(state: PerAccountState): $ReadOnlyArray<TokenWithBalance> {
  const allTokens = getAvailableTokens(state);
  return allTokens.filter(token => token.isCustom);
}

/**
 * Filter tokens to get only default tokens for current network
 */
export function getOnlyDefaultTokens(state: PerAccountState): $ReadOnlyArray<TokenWithBalance> {
  const allTokens = getAvailableTokens(state);
  return allTokens.filter(token => !token.isCustom);
}

/**
 * Get the contract address for the current network
 */
export function getContractAddress(state: PerAccountState): ?string {
  const networkData = getCurrentNetworkData(state);
  return networkData.contractAddress;
}

/**
 * Get the contract address for a specific network
 */
export function getContractAddressForNetwork(state: PerAccountState, network: NetworkIdentifier): ?string {
  const networkData = getNetworkData(state, network);
  return networkData.contractAddress;
}

/**
 * Get the network performance data for the current network
 */
export function getNetworkPerformance(state: PerAccountState): ?{|
  avgBlockTime: number,
  gasPrice: number,
  lastChecked: number,
|} {
  const networkData = getCurrentNetworkData(state);
  return networkData.networkPerformance;
}

/**
 * Get the network performance data for a specific network
 */
export function getNetworkPerformanceForNetwork(state: PerAccountState, network: NetworkIdentifier): ?{|
  avgBlockTime: number,
  gasPrice: number,
  lastChecked: number,
|} {
  const networkData = getNetworkData(state, network);
  return networkData.networkPerformance;
}

/**
 * Find a token by its contract address in the current network
 * Useful for displaying token info when you only have the address
 */
export function getTokenByAddress(state: PerAccountState, address: string): TokenWithBalance | null {
  const allTokens = getAvailableTokens(state);
  const normalizedAddress = address.toLowerCase();

  return allTokens.find(token =>
    token.address?.toLowerCase() === normalizedAddress
  ) || null;
}

/**
 * Find a token by its contract address in a specific network
 */
export function getTokenByAddressForNetwork(
  state: PerAccountState,
  address: string,
  network: NetworkIdentifier
): TokenWithBalance | null {
  const allTokens = getAvailableTokensForNetwork(state, network);
  const normalizedAddress = address.toLowerCase();

  return allTokens.find(token =>
    token.address?.toLowerCase() === normalizedAddress
  ) || null;
}

/**
 * Get token symbol, name, and decimals by address from the current network
 * Useful for display purposes when you have a token address
 */
export function getTokenMetadataByAddress(state: PerAccountState, address: string): ?{|
  symbol: string,
  name: string,
  decimals: number,
|} {
  const token = getTokenByAddress(state, address);
  if (!token) {
    return null;
  }
  return {
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
  };
}
