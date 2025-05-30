/* @flow strict-local */

/**
 * Represents a cryptocurrency token that can be displayed in the wallet
 */
export type Token = $ReadOnly<{|
  symbol: string,        // Token symbol (e.g., 'ETH', 'USDC')
  address: ?string,      // Contract address (null for native tokens like ETH)
  name: string,          // Full token name (e.g., 'Ethereum', 'USD Coin')
  decimals: number,      // Number of decimal places (18 for ETH, 6 for USDC)
  isDefault: boolean,    // Whether this is a default token
  isCustom: boolean,     // Whether this is a user-added custom token
|}>;

/**
 * Token state management for TandaPay wallet
 */
export type TokenState = $ReadOnly<{|
  // Currently selected token symbol
  selectedTokenSymbol: string,
  
  // Default tokens that are always available
  defaultTokens: $ReadOnlyArray<Token>,
  
  // User-added custom tokens
  customTokens: $ReadOnlyArray<Token>,
  
  // Cached balances for tokens (symbol -> balance string)
  balances: $ReadOnly<{ [string]: string }>,
  
  // Last balance update timestamp for each token
  lastUpdated: $ReadOnly<{ [string]: number }>,
|}>;

/**
 * Network configuration for token addresses
 */
export type NetworkTokenAddresses = $ReadOnly<{|
  mainnet: $ReadOnly<{ [string]: string }>,
  sepolia: $ReadOnly<{ [string]: string }>,
  // Can add more networks as needed
|}>;
