/* @flow strict-local */

export type ErrorType =
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'VALIDATION_ERROR'
  | 'WALLET_ERROR'
  | 'CONTRACT_ERROR'
  | 'STORAGE_ERROR'
  | 'USER_CANCELLED'
  | 'INSUFFICIENT_FUNDS'
  | 'RATE_LIMITED'
  | 'TIMEOUT_ERROR'
  | 'PARSING_ERROR'
  | 'UNKNOWN_ERROR';

export type TandaPayError = $ReadOnly<{|
  type: ErrorType,
  message: string,
  userMessage?: string,  // User-friendly message for display
  code?: string,         // Specific error code (e.g., 'ETHERSCAN_API_INVALID')
  details?: mixed,       // Additional error context
  retryable?: boolean,   // Whether operation can be retried
  timestamp: number,
|}>;

export type TandaPayResult<T> =
  | $ReadOnly<{| success: true, data: T |}>
  | $ReadOnly<{| success: false, error: TandaPayError |}>;

// Helper type for operations that don't return data
export type TandaPayOperation = TandaPayResult<void>;

// Types for transaction operations
export type GasEstimateData = $ReadOnly<{|
  gasLimit: string,
  gasPrice: string,
  estimatedCost: string,
|}>;

export type TokenInfo = $ReadOnly<{|
  symbol: string,
  name: string,
  decimals: number,
|}>;
