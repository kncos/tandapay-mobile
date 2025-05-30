// @flow strict-local
// Legacy web3 module - DEPRECATED
// Use web3Enhanced.js for new implementations

import { fetchBalance as fetchBalanceEnhanced } from './web3Enhanced';

/**
 * @deprecated Use fetchBalance from web3Enhanced.js instead
 * Legacy function kept for backwards compatibility
 */
export async function fetchBalance(
  token: {| symbol: string, address: ?string, name: string |},
  address: string,
): Promise<string> {
  // Redirect to enhanced implementation
  const enhancedToken = {
    symbol: token.symbol,
    address: token.address,
    name: token.name,
    decimals: 18, // Default for legacy tokens
    isDefault: false,
    isCustom: false,
  };
  return fetchBalanceEnhanced(enhancedToken, address);
}
