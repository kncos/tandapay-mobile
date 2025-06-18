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
    // Always log for debugging
    // eslint-disable-next-line no-console
    console.error(`[TandaPay ${error.type}]`, error.message, error.details);

    // Show user-friendly alert if requested and user message exists
    if (showAlert && error.userMessage != null && error.userMessage.length > 0) {
      const buttons = error.retryable === true
        ? [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Retry',
              onPress: () => {
                // Note: Actual retry logic will be implemented by calling code
                // eslint-disable-next-line no-console
                console.log('User requested retry for:', error.type);
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
}

export default TandaPayErrorHandler;
