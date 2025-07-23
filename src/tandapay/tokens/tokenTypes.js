/* @flow strict-local */

/**
 * Represents a cryptocurrency token that can be displayed in the wallet
 */
export type Token = $ReadOnly<{|
  symbol: string,        // Token symbol (e.g., 'ETH', 'USDC')
  address: ?string,      // Contract address (null for native tokens like ETH)
  name: string,          // Full token name (e.g., 'Ethereum', 'USD Coin')
  decimals: number,      // Number of decimal places (18 for ETH, 6 for USDC)
  isCustom: boolean,     // Whether this is a user-added custom token (default tokens are !isCustom)
|}>;

/**
 * Token information with balance and metadata
 */
export type TokenWithBalance = $ReadOnly<{|
  ...Token,
  balance: string,           // Current balance as string
  lastUpdated: number,       // Last balance update timestamp
|}>;

/**
 * Network-specific data containing all relevant information for a network
 */
export type NetworkData = $ReadOnly<{|
  contractAddress: ?string,              // TandaPay contract address for this network
  networkPerformance: ?{|               // Network performance metrics
    avgBlockTime: number,
    gasPrice: number,
    lastChecked: number,
  |},
  selectedToken: string,                 // Currently selected token symbol for this network
  tokens: $ReadOnly<{                   // Token map keyed by address (or symbol for native tokens)
    [string]: TokenWithBalance,
  }>,
|}>;

/**
 * Token state management for TandaPay wallet
 */
export type TokenState = $ReadOnly<{|
  // Per-network data containing all network-specific information
  perNetworkData: $ReadOnly<{|
    mainnet: NetworkData,
    sepolia: NetworkData,
    arbitrum: NetworkData,
    polygon: NetworkData,
    custom: NetworkData,
  |}>,
|}>;

/**
 * Network configuration for token addresses
 */
export type NetworkTokenAddresses = $ReadOnly<{|
  mainnet: $ReadOnly<{ [string]: string }>,
  sepolia: $ReadOnly<{ [string]: string }>,
  arbitrum: $ReadOnly<{ [string]: string }>,
  polygon: $ReadOnly<{ [string]: string }>,
|}>;
