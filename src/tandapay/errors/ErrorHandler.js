/* @flow strict-local */

import { Alert } from 'react-native';
import { getContractErrorMessage } from './contractErrorMapping';
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

    // FIRST PRIORITY: Insufficient funds errors (check these first, even if they contain "reverted")
    if ((errorMessage.includes('insufficient funds') && !errorMessage.includes('reverted with reason string'))
        || (errorMessage.includes('insufficient balance') && !errorMessage.includes('reverted with reason string'))
        || errorMessage.includes('sender doesn\'t have enough funds')
        || errorMessage.includes('transfer amount exceeds balance')
        || errorMessage.includes('always failing transaction: insufficient funds')
        || errorMessage.includes('cannot estimate gas; transaction may fail: insufficient funds')
        || (errorMessage.includes('execution reverted: insufficient') && (errorMessage.includes('balance') || errorMessage.includes('funds')))
        || (errorMessage.includes('revert insufficient') && (errorMessage.includes('balance') || errorMessage.includes('funds')))
        || errorCode === 'INSUFFICIENT_FUNDS') {
      return {
        message: 'Insufficient funds for transaction',
        userMessage: 'You don\'t have enough funds to complete this transaction. Please check your balance.',
        type: 'INSUFFICIENT_FUNDS'
      };
    }

    // SECOND PRIORITY: CALL_EXCEPTION and contract revert detection (with error mapping)
    if (errorCode === 'CALL_EXCEPTION'
        || errorMessage.includes('call revert exception')
        || errorMessage.includes('call exception')
        || errorMessage.includes('execution reverted')
        || errorMessage.includes('VM Exception while processing transaction')
        || errorMessage.includes('transaction reverted')
        || (errorMessage.includes('revert') && !errorMessage.includes('gas required exceeds'))) {
      // Try to extract error name from multiple sources
      let extractedErrorName: ?string = null;

      // First, check if there's an errorName in the error object
      if (error != null && typeof error === 'object' && typeof error.errorName === 'string') {
        extractedErrorName = error.errorName;
      }

      // Try to extract from errorName= format in the message
      if (extractedErrorName == null || extractedErrorName === '') {
        const errorNameMatch = errorMessage.match(/errorName=["']([^"']+)["']/i);
        if (errorNameMatch && errorNameMatch[1]) {
          extractedErrorName = errorNameMatch[1];
        }
      }

      // Try to extract from errorSignature pattern
      if (extractedErrorName == null || extractedErrorName === '') {
        const errorSignatureMatch = errorMessage.match(/errorSignature=["']([^"'(]+)\(\)/i);
        if (errorSignatureMatch && errorSignatureMatch[1]) {
          extractedErrorName = errorSignatureMatch[1];
        }
      }

      // Try to extract from "reverted with reason string" pattern
      if (extractedErrorName == null || extractedErrorName === '') {
        const reasonStringMatch = errorMessage.match(/reverted with reason string ["']([^"']+)["']/i);
        if (reasonStringMatch && reasonStringMatch[1]) {
          extractedErrorName = reasonStringMatch[1];
        }
      }

      // Try to extract from "execution reverted: ErrorName" pattern (only valid error names)
      if (extractedErrorName == null || extractedErrorName === '') {
        const executionRevertMatch = errorMessage.match(/execution reverted:\s*([A-Z][A-Za-z0-9_]*)/);
        if (executionRevertMatch && executionRevertMatch[1]) {
          // Only extract if it looks like a valid error name (starts with uppercase)
          extractedErrorName = executionRevertMatch[1];
        }
      }

      // Create user message with error name if available
      let userMessage = 'Transaction would revert';
      let message = 'Transaction would revert';

      if (extractedErrorName != null && extractedErrorName !== '') {
        // Get user-friendly message for the error name
        const friendlyMessage = getContractErrorMessage(extractedErrorName);

        // If we have a known error (not starting with "Contract error:"), return the friendly message directly
        if (!friendlyMessage.startsWith('Contract error:')) {
          userMessage = friendlyMessage;
          message = `Transaction would revert: ${extractedErrorName}`;
        } else {
          // For unknown errors, include the "Transaction would revert: " prefix
          userMessage = `Transaction would revert: ${friendlyMessage}`;
          message = 'Transaction would revert';
        }
      }

      // For CALL_EXCEPTION and explicit reverts, show explicit revert message
      return {
        message,
        userMessage,
        type: 'CONTRACT_ERROR'
      };
    }

    // THIRD PRIORITY: Network detection errors
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

    // FOURTH PRIORITY: Parse TandaPay contract-specific errors (legacy patterns)
    // (including those within CALL_EXCEPTION messages)
    const tandaPayError = this.parseTandaPayContractError(errorMessage, error);
    if (tandaPayError != null) {
      return tandaPayError;
    }

    // FIFTH PRIORITY: Gas estimation errors (for true gas estimation issues)
    if (errorMessage.includes('cannot estimate gas')
        || errorMessage.includes('gas required exceeds allowance')
        || errorMessage.includes('always failing transaction')
        || errorMessage.includes('transaction may fail or may require manual gas limit')
        || errorCode === 'UNPREDICTABLE_GAS_LIMIT'
        || errorMessage.includes('unpredictable gas limit')) {
      // Check if it's likely an insufficient funds issue during gas estimation
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

      // For UNPREDICTABLE_GAS_LIMIT, this is usually a revert scenario
      if (errorCode === 'UNPREDICTABLE_GAS_LIMIT' || errorMessage.includes('unpredictable gas limit')) {
        return {
          message: 'Transaction would revert',
          userMessage: 'Transaction would revert',
          type: 'CONTRACT_ERROR'
        };
      }

      // Check for revert patterns in gas estimation messages
      if (errorMessage.includes('execution reverted')
          || errorMessage.includes('revert')
          || errorMessage.includes('always failing transaction')
          || errorMessage.includes('transaction may fail')) {
        return {
          message: 'Transaction would revert',
          userMessage: 'Transaction would revert',
          type: 'CONTRACT_ERROR'
        };
      }

      // Fallback for true gas estimation issues (network congestion, etc.)
      return {
        message: 'Gas estimation failed',
        userMessage: 'Smart contract operation failed. This may be due to network congestion or insufficient gas.',
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

    // Contract revert errors (catch common revert patterns)
    if (errorMessage.includes('revert')
        || errorMessage.includes('execution reverted')
        || errorMessage.includes('transaction failed')) {
      return {
        message: 'Transaction would revert',
        userMessage: 'This transaction cannot be completed at this time. The contract state may not allow this operation right now.',
        type: 'CONTRACT_ERROR'
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
   * Parse TandaPay contract-specific errors to provide user-friendly messages
   */
  static parseTandaPayContractError(errorMessage: string, originalError?: mixed): ?{| message: string, userMessage: string, type: ErrorType |} {
    // Extract error name from complex CALL_EXCEPTION messages
    // Patterns like: 'call revert exception; VM Exception while processing transaction: reverted with reason string "NotValidMember"'
    // Or: 'call revert exception (errorName="NotValidMember", errorSignature="NotValidMember()")'
    let extractedErrorName = errorMessage;

    // Try to extract from errorName field if available
    if (originalError != null && typeof originalError === 'object' && typeof originalError.errorName === 'string') {
      extractedErrorName = originalError.errorName;
    }

    // Try to extract the error name from within quotes (ethers.js format)
    const reasonStringMatch = errorMessage.match(/reverted with reason string ["']([^"']+)["']/i);
    if (reasonStringMatch && reasonStringMatch[1]) {
      extractedErrorName = reasonStringMatch[1];
    }

    // Try to extract from errorName= format in the message
    const errorNameMatch = errorMessage.match(/errorName=["']([^"']+)["']/i);
    if (errorNameMatch && errorNameMatch[1]) {
      extractedErrorName = errorNameMatch[1];
    }

    // Try to extract from "execution reverted: ErrorName" format
    const executionRevertedMatch = errorMessage.match(/execution reverted:?\s*([A-Za-z][A-Za-z0-9_]*)/i);
    if (executionRevertedMatch && executionRevertedMatch[1]) {
      extractedErrorName = executionRevertedMatch[1];
    }

    // Common TandaPay contract errors with user-friendly messages
    const contractErrors = [
      {
        pattern: /AlreadyAdded|already added/i,
        userMessage: 'This member has already been added to the community.',
      },
      {
        pattern: /AlreadyClaimed|already claimed/i,
        userMessage: 'This claim has already been processed.',
      },
      {
        pattern: /AlreadySet|already set/i,
        userMessage: 'This value has already been configured.',
      },
      {
        pattern: /AlreadySubmitted|already submitted/i,
        userMessage: 'This request has already been submitted.',
      },
      {
        pattern: /AmountZero|amount.*zero/i,
        userMessage: 'Amount cannot be zero.',
      },
      {
        pattern: /CannotBeZeroAddress|zero address/i,
        userMessage: 'Address cannot be empty.',
      },
      {
        pattern: /CannotEmergencyRefund|emergency refund/i,
        userMessage: 'Emergency refund is not available at this time.',
      },
      {
        pattern: /ClaimNoOccured|claim.*not.*occurred/i,
        userMessage: 'No valid claim was found.',
      },
      {
        pattern: /ClaimantNotValidMember|claimant.*not.*valid/i,
        userMessage: 'Only valid community members can submit claims.',
      },
      {
        pattern: /CommunityIsCollapsed|community.*collapsed/i,
        userMessage: 'The community has collapsed and is no longer active.',
      },
      {
        pattern: /CoverageFullfilled|coverage.*fulfilled/i,
        userMessage: 'The coverage requirement has already been met.',
      },
      {
        pattern: /DFNotMet|defection.*fund.*not.*met/i,
        userMessage: 'Defection fund requirements are not met.',
      },
      {
        pattern: /DelayInitiated|delay.*initiated/i,
        userMessage: 'A delay period has been initiated. Please wait.',
      },
      {
        pattern: /EmergencyGracePeriod|emergency.*grace/i,
        userMessage: 'Currently in emergency grace period.',
      },
      {
        pattern: /InsufficientFunds|insufficient.*funds/i,
        userMessage: 'Insufficient funds to complete this transaction.',
      },
      {
        pattern: /InvalidInput|invalid.*input/i,
        userMessage: 'Invalid input provided.',
      },
      {
        pattern: /InvalidMember|invalid.*member/i,
        userMessage: 'Invalid member for this operation.',
      },
      {
        pattern: /InvalidPeriod|invalid.*period/i,
        userMessage: 'This operation is not valid for the current period.',
      },
      {
        pattern: /MemberNotFound|member.*not.*found/i,
        userMessage: 'Member not found in the community.',
      },
      {
        pattern: /NotAuthorized|not.*authorized/i,
        userMessage: 'You are not authorized to perform this action.',
      },
      {
        pattern: /NotValidMember|not.*valid.*member/i,
        userMessage: 'You are not authorized to perform this action.',
      },
      {
        pattern: /NotRefundWindow|not.*refund.*window/i,
        userMessage: 'Refunds are not available at this time.',
      },
      {
        pattern: /NotInSubgroup|not.*in.*subgroup/i,
        userMessage: 'You must be in a subgroup to perform this action.',
      },
      {
        pattern: /NotSecretary|not.*secretary/i,
        userMessage: 'This action can only be performed by the secretary.',
      },
      {
        pattern: /PeriodNotActive|period.*not.*active/i,
        userMessage: 'The current period is not active for this operation.',
      },
      {
        pattern: /PremiumAlreadyPaid|premium.*already.*paid/i,
        userMessage: 'Premium has already been paid for this period.',
      },
      {
        pattern: /PremiumNotPaid|premium.*not.*paid/i,
        userMessage: 'Premium must be paid before performing this action.',
      },
      {
        pattern: /SubgroupFull|subgroup.*full/i,
        userMessage: 'The subgroup is full and cannot accept new members.',
      },
      {
        pattern: /TooEarly|too.*early/i,
        userMessage: 'This action cannot be performed yet. Please wait.',
      },
      {
        pattern: /TooLate|too.*late/i,
        userMessage: 'The time window for this action has passed.',
      },
    ];

    // Test both the original error message and the extracted error name
    for (const error of contractErrors) {
      if (error.pattern.test(errorMessage) || error.pattern.test(extractedErrorName)) {
        return {
          message: `TandaPay contract error: ${extractedErrorName}`,
          userMessage: error.userMessage,
          type: 'CONTRACT_ERROR',
        };
      }
    }

    return null;
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
