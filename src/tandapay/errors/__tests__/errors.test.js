/* @flow strict-local */

/**
 * Basic tests for TandaPay Error Handling System
 * Run with: npm test -- errors.test.js
 */

import TandaPayErrorHandler from '../ErrorHandler';
import type { TandaPayResult } from '../types';

// Increase timeout for async tests
jest.setTimeout(10000);

// Mock data for testing
const mockOperation = async (shouldFail: boolean = false): Promise<string> => {
  if (shouldFail) {
    throw new Error('Mock operation failed');
  }
  return 'success data';
};

const mockSyncOperation = (shouldFail: boolean = false): string => {
  if (shouldFail) {
    throw new Error('Mock sync operation failed');
  }
  return 'sync success';
};

describe('TandaPayErrorHandler', () => {
  describe('createError', () => {
    test('creates error with required fields', () => {
      const error = TandaPayErrorHandler.createError(
        'NETWORK_ERROR',
        'Test error message'
      );

      expect(error.type).toBe('NETWORK_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.timestamp).toBeGreaterThan(0);
      expect(error.userMessage).toBeTruthy(); // Should have default user message
    });

    test('creates error with custom options', () => {
      const error = TandaPayErrorHandler.createError(
        'API_ERROR',
        'API failure',
        {
          userMessage: 'Custom user message',
          code: 'API_001',
          details: { endpoint: '/api/test' },
          retryable: true,
        }
      );

      expect(error.type).toBe('API_ERROR');
      expect(error.message).toBe('API failure');
      expect(error.userMessage).toBe('Custom user message');
      expect(error.code).toBe('API_001');
      expect(error.details).toEqual({ endpoint: '/api/test' });
      expect(error.retryable).toBe(true);
    });
  });

  describe('withErrorHandling', () => {
    test('returns success result for successful operation', async () => {
      const result: TandaPayResult<string> = await TandaPayErrorHandler.withErrorHandling(
        () => mockOperation(false),
        'NETWORK_ERROR',
        'Operation failed'
      );

      expect(result.success).toBe(true);
      expect(result).toMatchObject({
        success: true,
        data: 'success data'
      });
    });

    test('returns error result for failed operation', async () => {
      const result: TandaPayResult<string> = await TandaPayErrorHandler.withErrorHandling(
        () => mockOperation(true),
        'NETWORK_ERROR',
        'Custom error message',
        'TEST_CODE'
      );

      expect(result.success).toBe(false);

      // Assert that we have an error result and test its properties
      expect(result).toMatchObject({
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          userMessage: 'Custom error message',
          code: 'TEST_CODE',
          message: 'Mock operation failed'
        }
      });
    });
  });

  describe('withSyncErrorHandling', () => {
    test('returns success result for successful sync operation', () => {
      const result: TandaPayResult<string> = TandaPayErrorHandler.withSyncErrorHandling(
        () => mockSyncOperation(false),
        'VALIDATION_ERROR',
        'Validation failed'
      );

      expect(result.success).toBe(true);
      expect(result).toMatchObject({
        success: true,
        data: 'sync success'
      });
    });

    test('returns error result for failed sync operation', () => {
      const result: TandaPayResult<string> = TandaPayErrorHandler.withSyncErrorHandling(
        () => mockSyncOperation(true),
        'VALIDATION_ERROR',
        'Custom validation error',
        'VALIDATION_001'
      );

      expect(result.success).toBe(false);
      expect(result).toMatchObject({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          userMessage: 'Custom validation error',
          code: 'VALIDATION_001',
          message: 'Mock sync operation failed'
        }
      });
    });
  });

  describe('error creator shortcuts', () => {
    test('createNetworkError creates network error', () => {
      const error = TandaPayErrorHandler.createNetworkError(
        'Connection failed',
        { timeout: true }
      );

      expect(error.type).toBe('NETWORK_ERROR');
      expect(error.message).toBe('Connection failed');
      expect(error.details).toEqual({ timeout: true });
    });

    test('createValidationError creates validation error', () => {
      const error = TandaPayErrorHandler.createValidationError(
        'Invalid input',
        'Please check your input'
      );

      expect(error.type).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.userMessage).toBe('Please check your input');
    });

    test('createWalletError creates wallet error', () => {
      const error = TandaPayErrorHandler.createWalletError(
        'Wallet access failed',
        { operation: 'signing' }
      );

      expect(error.type).toBe('WALLET_ERROR');
      expect(error.message).toBe('Wallet access failed');
      expect(error.details).toEqual({ operation: 'signing' });
    });

    test('createContractError creates contract error', () => {
      const error = TandaPayErrorHandler.createContractError(
        'Contract call failed',
        { gasLimit: '21000' }
      );

      expect(error.type).toBe('CONTRACT_ERROR');
      expect(error.message).toBe('Contract call failed');
      expect(error.details).toEqual({ gasLimit: '21000' });
    });

    test('createApiError creates API error', () => {
      const error = TandaPayErrorHandler.createApiError(
        'API rate limited',
        'RATE_LIMIT',
        { retryAfter: 60 }
      );

      expect(error.type).toBe('API_ERROR');
      expect(error.message).toBe('API rate limited');
      expect(error.code).toBe('RATE_LIMIT');
      expect(error.details).toEqual({ retryAfter: 60 });
    });
  });

  describe('getDefaultUserMessage', () => {
    test('returns appropriate message for each error type', () => {
      const networkMessage = TandaPayErrorHandler.getDefaultUserMessage('NETWORK_ERROR');
      expect(networkMessage).toContain('Network');

      const apiMessage = TandaPayErrorHandler.getDefaultUserMessage('API_ERROR');
      expect(apiMessage).toContain('Service');

      const validationMessage = TandaPayErrorHandler.getDefaultUserMessage('VALIDATION_ERROR');
      expect(validationMessage).toContain('input');

      const walletMessage = TandaPayErrorHandler.getDefaultUserMessage('WALLET_ERROR');
      expect(walletMessage).toContain('wallet');
    });
  });

  describe('isRetryableByDefault', () => {
    test('marks appropriate errors as retryable', () => {
      expect(TandaPayErrorHandler.isRetryableByDefault('NETWORK_ERROR')).toBe(true);
      expect(TandaPayErrorHandler.isRetryableByDefault('TIMEOUT_ERROR')).toBe(true);
      expect(TandaPayErrorHandler.isRetryableByDefault('RATE_LIMITED')).toBe(true);

      expect(TandaPayErrorHandler.isRetryableByDefault('VALIDATION_ERROR')).toBe(false);
      expect(TandaPayErrorHandler.isRetryableByDefault('USER_CANCELLED')).toBe(false);
      expect(TandaPayErrorHandler.isRetryableByDefault('INSUFFICIENT_FUNDS')).toBe(false);
    });
  });
});

describe('TandaPayResult Integration', () => {
  // Mock function that uses the new error handling pattern
  const mockFetchBalance = async (shouldFail: boolean = false): Promise<TandaPayResult<string>> => TandaPayErrorHandler.withErrorHandling(
      async () => {
        if (shouldFail) {
          throw new Error('Balance fetch failed');
        }
        return '100.5';
      },
      'NETWORK_ERROR',
      'Unable to fetch balance',
      'BALANCE_FETCH'
    );

  test('handles successful balance fetch', async () => {
    const result = await mockFetchBalance(false);

    expect(result.success).toBe(true);
    expect(result).toMatchObject({
      success: true,
      data: '100.5'
    });
  });

  test('handles failed balance fetch', async () => {
    const result = await mockFetchBalance(true);

    expect(result.success).toBe(false);
    expect(result).toMatchObject({
      success: false,
      error: {
        type: 'NETWORK_ERROR',
        userMessage: 'Unable to fetch balance',
        code: 'BALANCE_FETCH',
        message: 'Balance fetch failed'
      }
    });
  });

  test('demonstrates component usage pattern', async () => {
    // Simulate component state
    let balance = null;
    let error = null;
    let loading = false;

    // Simulate component logic
    loading = true;
    const result = await mockFetchBalance(false);

    if (result.success) {
      balance = result.data;
      error = null;
    } else {
      balance = null;
      error = result.error;
    }
    loading = false;

    // Verify state
    expect(loading).toBe(false);
    expect(balance).toBe('100.5');
    expect(error).toBe(null);
  });
});

/**
 * Usage Example Tests
 * These tests demonstrate how the error handling system would be used
 * in real TandaPay components.
 */
describe('Real-world Usage Examples', () => {
  test('wallet address validation', async () => {
    const validateWalletAddress = async (address: string): Promise<TandaPayResult<string>> => TandaPayErrorHandler.withErrorHandling(
        async () => {
          if (!address || address.trim() === '') {
            throw TandaPayErrorHandler.createValidationError(
              'Empty address',
              'Please enter a wallet address'
            );
          }

          if (!address.startsWith('0x') || address.length !== 42) {
            throw new Error('Please enter a valid Ethereum address');
          }

          return address.toLowerCase();
        },
        'VALIDATION_ERROR',
        'Invalid wallet address',
        'ADDRESS_VALIDATION'
      );

    // Test valid address
    const validResult = await validateWalletAddress('0x742d35Cc6635C0532925a3b8D6Ac6f09be21d0B0');
    expect(validResult.success).toBe(true);

    // Test invalid address
    const invalidResult = await validateWalletAddress('invalid');
    expect(invalidResult.success).toBe(false);
    expect(invalidResult).toMatchObject({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        userMessage: 'Invalid wallet address'
      }
    });
  });

  test('transaction simulation', async () => {
    const simulateTransaction = async (
      shouldFail: boolean = false
    ): Promise<TandaPayResult<{ gasEstimate: string }>> => TandaPayErrorHandler.withErrorHandling(
        async () => {
          if (shouldFail) {
            // Simulate a regular error instead of timeout
            throw new Error('Gas estimation failed');
          }

          return { gasEstimate: '21000' };
        },
        'CONTRACT_ERROR',
        'Failed to estimate gas costs',
        'GAS_ESTIMATION'
      );

    // Test successful simulation
    const successResult = await simulateTransaction(false);
    expect(successResult.success).toBe(true);
    expect(successResult).toMatchObject({
      success: true,
      data: { gasEstimate: '21000' }
    });

    // Test failed simulation
    const failResult = await simulateTransaction(true);
    expect(failResult.success).toBe(false);
    expect(failResult).toMatchObject({
      success: false,
      error: {
        type: 'CONTRACT_ERROR',
        userMessage: 'Failed to estimate gas costs'
      }
    });
  });
});
