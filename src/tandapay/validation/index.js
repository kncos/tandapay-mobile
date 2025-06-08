/* @flow strict-local */

/**
 * Centralized validation utilities for TandaPay
 * This module consolidates all validation logic that was previously scattered
 * across different files to improve maintainability and consistency.
 */

// Re-export existing validations for backward compatibility
export {
  validateNetwork,
  validateCustomRpcConfig,
  validateTandaPaySettings,
} from '../stateValidation';

export type { ValidationResult } from '../stateValidation';

export {
  validateCustomToken,
} from '../tokens/tokenConfig';

// Network validation constants
export const SUPPORTED_NETWORKS = ['mainnet', 'sepolia', 'arbitrum', 'polygon', 'custom'];

// Token validation constants
export const MIN_TOKEN_DECIMALS = 0;
export const MAX_TOKEN_DECIMALS = 18;
export const MAX_TOKEN_SYMBOL_LENGTH = 10;
