/* @flow strict-local */

import { Alert } from 'react-native';
import type { TandaPayError, ErrorType, TandaPayResult } from './types';

/**
 * Centralized error handling utility for TandaPay operations.
 * Provides consistent error creation, user messaging, and logging.
 */
class TandaPayErrorHandler {
  /**
   * Create a standardized TandaPay error object
   */
  static createError(
    type: ErrorType,
    message: string,
    options?: $ReadOnly<{|
      userMessage?: string,
      code?: string,
      details?: mixed,
      retryable?: boolean,
    |}>
  ): TandaPayError {
    return {
      type,
      message,
      userMessage: options?.userMessage != null ? options.userMessage : this.getDefaultUserMessage(type),
      code: options?.code,
      details: options?.details,
      retryable: options?.retryable ?? this.isRetryableByDefault(type),
      timestamp: Date.now(),
    };
  }

  /**
   * Handle an error by logging and optionally showing user alert
   */
  static handleError(error: TandaPayError, showAlert: boolean = true): void {
    // Show user-friendly alert if requested and user message exists
    if (showAlert && error.userMessage != null && error.userMessage.length > 0) {
      const buttons = error.retryable === true
        ? [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Retry',
              onPress: () => {
                // Note: Actual retry logic will be implemented by calling code
              }
            }
          ]
        : [{ text: 'OK' }];

      Alert.alert(
        this.getAlertTitle(error.type),
        error.userMessage,
        buttons
      );
    }
  }

  /**
   * Get default user-friendly message for error type
   */
  static getDefaultUserMessage(type: ErrorType): string {
    switch (type) {
      case 'NETWORK_ERROR':
        return 'Network connection failed. Please check your internet connection and try again.';
      case 'API_ERROR':
        return 'Service temporarily unavailable. Please try again later.';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'WALLET_ERROR':
        return 'Wallet operation failed. Please check your wallet configuration and try again.';
      case 'CONTRACT_ERROR':
        return 'Smart contract operation failed. This may be due to network congestion or insufficient gas.';
      case 'STORAGE_ERROR':
        return 'Storage operation failed. Please ensure you have sufficient device storage.';
      case 'USER_CANCELLED':
        return 'Operation was cancelled.';
      case 'INSUFFICIENT_FUNDS':
        return 'Insufficient funds to complete this transaction.';
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment and try again.';
      case 'TIMEOUT_ERROR':
        return 'Operation timed out. Please check your connection and try again.';
      case 'PARSING_ERROR':
        return 'Data format error. Please try again or contact support if the problem persists.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get appropriate alert title for error type
   */
  static getAlertTitle(type: ErrorType): string {
    switch (type) {
      case 'NETWORK_ERROR':
        return 'Connection Error';
      case 'VALIDATION_ERROR':
        return 'Invalid Input';
      case 'INSUFFICIENT_FUNDS':
        return 'Insufficient Funds';
      case 'USER_CANCELLED':
        return 'Cancelled';
      case 'WALLET_ERROR':
        return 'Wallet Error';
      case 'CONTRACT_ERROR':
        return 'Transaction Error';
      case 'RATE_LIMITED':
        return 'Too Many Requests';
      default:
        return 'Error';
    }
  }

  /**
   * Determine if error type is retryable by default
   */
  static isRetryableByDefault(type: ErrorType): boolean {
    return [
      'NETWORK_ERROR',
      'API_ERROR',
      'TIMEOUT_ERROR',
      'RATE_LIMITED',
      'CONTRACT_ERROR' // Gas issues, network congestion, etc.
    ].includes(type);
  }

  /**
   * Wrap async operations with standardized error handling
   * This is the main utility function for migrating existing code
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    errorType: ErrorType,
    userMessage?: string,
    code?: string
  ): Promise<TandaPayResult<T>> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const tandaPayError = this.createError(
        errorType,
        error?.message || String(error) || 'Unknown error occurred',
        {
          userMessage,
          code,
          details: error?.stack || error
        }
      );
      return { success: false, error: tandaPayError };
    }
  }

  /**
   * Wrap sync operations with standardized error handling
   */
  static withSyncErrorHandling<T>(
    operation: () => T,
    errorType: ErrorType,
    userMessage?: string,
    code?: string
  ): TandaPayResult<T> {
    try {
      const data = operation();
      return { success: true, data };
    } catch (error) {
      const tandaPayError = this.createError(
        errorType,
        error?.message || String(error) || 'Unknown error occurred',
        {
          userMessage,
          code,
          details: error?.stack || error
        }
      );
      return { success: false, error: tandaPayError };
    }
  }

  /**
   * Create a specific error for common blockchain operations
   */
  static createNetworkError(message: string, details?: mixed): TandaPayError {
    return this.createError('NETWORK_ERROR', message, { details });
  }

  static createValidationError(message: string, userMessage?: string): TandaPayError {
    return this.createError('VALIDATION_ERROR', message, { userMessage });
  }

  static createWalletError(message: string, details?: mixed): TandaPayError {
    return this.createError('WALLET_ERROR', message, { details });
  }

  static createContractError(message: string, details?: mixed): TandaPayError {
    return this.createError('CONTRACT_ERROR', message, { details });
  }

  static createApiError(message: string, code?: string, details?: mixed): TandaPayError {
    return this.createError('API_ERROR', message, { code, details });
  }

  /**
   * Parse common ethers.js errors and return user-friendly messages
   */
  static parseEthersError(error: mixed): {| message: string, userMessage: string, type: ErrorType |} {
    let errorMessage = 'Unknown error';
    let errorCode = null;

    // Safely extract error message and code
    if (error != null && typeof error === 'object') {
      if (typeof error.message === 'string') {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      if (typeof error.code === 'string') {
        errorCode = error.code;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Insufficient funds errors (broader detection)
    if (errorMessage.includes('insufficient funds')
        || errorMessage.includes('insufficient balance')
        || errorMessage.includes('sender doesn\'t have enough funds')
        || errorMessage.includes('transfer amount exceeds balance')
        || errorCode === 'INSUFFICIENT_FUNDS') {
      return {
        message: 'Insufficient funds for transaction',
        userMessage: 'You don\'t have enough funds to complete this transaction. Please check your balance.',
        type: 'INSUFFICIENT_FUNDS'
      };
    }

    // Network detection errors
    if (errorMessage.includes('could not detect network')
        || errorMessage.includes('network is not configured')
        || errorMessage.includes('failed to connect')
        || errorCode === 'NETWORK_ERROR') {
      return {
        message: 'Network connection failed',
        userMessage: 'Unable to connect to the blockchain network. Please check your internet connection and try again.',
        type: 'NETWORK_ERROR'
      };
    }

    // Gas estimation errors (enhanced detection for insufficient funds during gas estimation)
    if (errorMessage.includes('cannot estimate gas')
        || errorMessage.includes('execution reverted')
        || errorMessage.includes('gas required exceeds allowance')
        || errorMessage.includes('revert')
        || errorMessage.includes('always failing transaction')
        || errorMessage.includes('transaction may fail or may require manual gas limit')) {
      // Check if it's likely an insufficient funds issue during gas estimation
      // Be more specific to avoid false positives like "gas required exceeds allowance"
      if ((errorMessage.includes('insufficient') && errorMessage.includes('funds'))
          || (errorMessage.includes('insufficient') && errorMessage.includes('balance'))
          || (errorMessage.includes('transfer amount') && errorMessage.includes('exceeds'))
          || (errorMessage.includes('balance') && errorMessage.includes('exceeds'))
          || errorMessage.includes('sender doesn\'t have enough')
          || errorMessage.includes('insufficient balance for transfer')) {
        return {
          message: 'Insufficient funds for gas estimation',
          userMessage: 'You don\'t have enough funds to complete this transaction. Please check your balance.',
          type: 'INSUFFICIENT_FUNDS'
        };
      }

      return {
        message: 'Gas estimation failed',
        userMessage: 'Unable to estimate transaction cost. This may be due to insufficient funds or an invalid transaction.',
        type: 'CONTRACT_ERROR'
      };
    }

    // Transaction timeout errors
    if (errorMessage.includes('timeout')
        || errorMessage.includes('timed out')
        || errorCode === 'TIMEOUT') {
      return {
        message: 'Operation timed out',
        userMessage: 'The operation took too long to complete. Please try again.',
        type: 'TIMEOUT_ERROR'
      };
    }

    // Nonce errors
    if (errorMessage.includes('nonce too low')
        || errorMessage.includes('nonce too high')
        || errorMessage.includes('replacement transaction underpriced')) {
      return {
        message: 'Transaction nonce error',
        userMessage: 'There was an issue with the transaction sequence. Please try again.',
        type: 'NETWORK_ERROR'
      };
    }

    // Gas price errors
    if (errorMessage.includes('gas price too low')
        || errorMessage.includes('transaction underpriced')) {
      return {
        message: 'Gas price too low',
        userMessage: 'The network is busy. Please try again with higher gas fees.',
        type: 'NETWORK_ERROR'
      };
    }

    // Invalid address errors
    if (errorMessage.includes('invalid address')
        || errorMessage.includes('bad address checksum')
        || errorMessage.includes('invalid recipient')) {
      return {
        message: 'Invalid address format',
        userMessage: 'The address format is invalid. Please check the address and try again.',
        type: 'VALIDATION_ERROR'
      };
    }

    // Contract interaction errors
    if (errorMessage.includes('call exception')
        || errorMessage.includes('contract call failed')
        || errorMessage.includes('missing response')) {
      return {
        message: 'Contract interaction failed',
        userMessage: 'Unable to interact with the smart contract. Please try again later.',
        type: 'CONTRACT_ERROR'
      };
    }

    // Rate limiting errors
    if (errorMessage.includes('rate limit')
        || errorMessage.includes('too many requests')
        || errorMessage.includes('request throttled')) {
      return {
        message: 'Rate limited by provider',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        type: 'RATE_LIMITED'
      };
    }

    // Default case - return a generic but friendly message
    return {
      message: errorMessage,
      userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      type: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Enhanced wrapper for async operations that handles ethers.js errors specifically
   */
  static async withEthersErrorHandling<T>(
    operation: () => Promise<T>,
    userMessage?: string,
    code?: string,
    defaultErrorType: ErrorType = 'NETWORK_ERROR'
  ): Promise<TandaPayResult<T>> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      // Use our enhanced ethers error parser
      const parsedError = this.parseEthersError(error);

      const tandaPayError = this.createError(
        parsedError.type,
        parsedError.message,
        {
          userMessage: (userMessage != null && userMessage.length > 0) ? userMessage : parsedError.userMessage,
          code: (code != null && code.length > 0) ? code : undefined,
          details: error?.stack || error
        }
      );
      return { success: false, error: tandaPayError };
    }
  }
}

export default TandaPayErrorHandler;
