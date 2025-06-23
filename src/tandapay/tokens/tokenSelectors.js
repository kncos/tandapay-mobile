/* @flow strict-local */

import type { PerAccountState } from '../../reduxTypes';
import type { Token, TokenState } from './tokenTypes';
import { getTandaPaySelectedNetwork } from '../redux/selectors';
import { getDefaultTokens as getDefaultTokensFromConfig } from './tokenConfig';

/**
 * Get the token state from Redux state
 */
export function getTokenState(state: PerAccountState): TokenState {
  return state.tandaPay.tokens;
}

/**
 * Get the currently selected token symbol
 */
export function getSelectedTokenSymbol(state: PerAccountState): string {
  return getTokenState(state).selectedTokenSymbol;
}

/**
 * Get all available tokens (default + custom)
 */
export function getAvailableTokens(state: PerAccountState): $ReadOnlyArray<Token> {
  const tokenState = getTokenState(state);
  const selectedNetwork = getTandaPaySelectedNetwork(state);

  // Get network-specific default tokens
  const supportedNetwork = selectedNetwork === 'custom' ? 'sepolia' : selectedNetwork;
  const networkDefaultTokens = getDefaultTokensFromConfig(supportedNetwork);

  // Combine network-specific default tokens with custom tokens
  return [...networkDefaultTokens, ...tokenState.customTokens];
}

/**
 * Get the currently selected token object
 */
export function getSelectedToken(state: PerAccountState): Token | null {
  const tokenState = getTokenState(state);
  const allTokens = getAvailableTokens(state);

  // Try to find the selected token first
  let selectedToken = allTokens.find(token => token.symbol === tokenState.selectedTokenSymbol);

  // If the selected token doesn't exist in the current network's token list,
  // fallback to the native token (first token in the list)
  if (!selectedToken && allTokens.length > 0) {
    selectedToken = allTokens[0]; // First token is always the native token
  }

  return selectedToken || null;
}

/**
 * Get the cached balance for a specific token
 */
export function getTokenBalance(state: PerAccountState, tokenSymbol: string): string | null {
  const tokenState = getTokenState(state);
  return tokenState.balances[tokenSymbol] || null;
}

/**
 * Get the cached balance for the currently selected token
 */
export function getSelectedTokenBalance(state: PerAccountState): string | null {
  const selectedSymbol = getSelectedTokenSymbol(state);
  return getTokenBalance(state, selectedSymbol);
}

/**
 * Get the last update timestamp for a token's balance
 */
export function getTokenBalanceLastUpdated(state: PerAccountState, tokenSymbol: string): number | null {
  const tokenState = getTokenState(state);
  return tokenState.lastUpdated[tokenSymbol] || null;
}

/**
 * Check if a token balance is stale (older than 5 minutes)
 */
export function isTokenBalanceStale(state: PerAccountState, tokenSymbol: string): boolean {
  const lastUpdated = getTokenBalanceLastUpdated(state, tokenSymbol);
  if (lastUpdated == null) {
    return true;
  }

  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  return lastUpdated < fiveMinutesAgo;
}

/**
 * Get only the custom tokens added by the user
 */
export function getCustomTokens(state: PerAccountState): $ReadOnlyArray<Token> {
  return getTokenState(state).customTokens;
}

/**
 * Get only the default tokens
 */
export function getDefaultTokens(state: PerAccountState): $ReadOnlyArray<Token> {
  const selectedNetwork = getTandaPaySelectedNetwork(state);
  const supportedNetwork = selectedNetwork === 'custom' ? 'sepolia' : selectedNetwork;
  return getDefaultTokensFromConfig(supportedNetwork);
}
