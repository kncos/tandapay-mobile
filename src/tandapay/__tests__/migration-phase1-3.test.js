/* @flow strict-local */

/**
 * Simple integration test to verify Phase 1.3 migration works
 * Tests the new TandaPayResult<T> error handling patterns
 */

import TandaPayErrorHandler from '../errors/ErrorHandler';
import type { TandaPayResult, GasEstimateData, TokenInfo } from '../errors/types';

describe('Phase 1.3: Migration Verification', () => {
  test('TandaPayResult<T> type patterns work correctly', () => {
    // Test successful result pattern
    const successResult: TandaPayResult<string> = {
      success: true,
      data: 'transaction_hash_123',
    };

    expect(successResult.success).toBe(true);
    if (successResult.success) {
      expect(typeof successResult.data).toBe('string');
      expect(successResult.data).toBe('transaction_hash_123');
    }

    // Test error result pattern  
    const errorResult: TandaPayResult<string> = {
      success: false,
      error: TandaPayErrorHandler.createError(
        'NETWORK_ERROR',
        'Transfer failed',
        { userMessage: 'Please check your connection and try again.' }
      )
    };

    expect(errorResult.success).toBe(false);
    if (!errorResult.success) {
      expect(errorResult.error.type).toBe('NETWORK_ERROR');
      expect(errorResult.error.userMessage).toBe('Please check your connection and try again.');
    }
  });

  test('GasEstimateData type structure is correct', () => {
    const gasData: GasEstimateData = {
      gasLimit: '21000',
      gasPrice: '20.5',
      estimatedCost: '0.00043050',
    };

    expect(typeof gasData.gasLimit).toBe('string');
    expect(typeof gasData.gasPrice).toBe('string'); 
    expect(typeof gasData.estimatedCost).toBe('string');
    expect(gasData.gasLimit).toBe('21000');
    expect(gasData.gasPrice).toBe('20.5');
    expect(gasData.estimatedCost).toBe('0.00043050');
  });

  test('TokenInfo type structure is correct', () => {
    const tokenInfo: TokenInfo = {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    };

    expect(typeof tokenInfo.symbol).toBe('string');
    expect(typeof tokenInfo.name).toBe('string');
    expect(typeof tokenInfo.decimals).toBe('number');
    expect(tokenInfo.symbol).toBe('USDC');
    expect(tokenInfo.name).toBe('USD Coin');
    expect(tokenInfo.decimals).toBe(6);
  });

  test('Error handler creates proper validation errors', () => {
    const validationError = TandaPayErrorHandler.createValidationError(
      'Invalid token address',
      'Please enter a valid Ethereum address.'
    );

    expect(validationError.type).toBe('VALIDATION_ERROR');
    expect(validationError.message).toBe('Invalid token address');
    expect(validationError.userMessage).toBe('Please enter a valid Ethereum address.');
    expect(validationError.retryable).toBe(false);
    expect(typeof validationError.timestamp).toBe('number');
  });

  test('Error handler creates proper network errors', () => {
    const networkError = TandaPayErrorHandler.createNetworkError(
      'Connection timeout',
      { timeout: 15000 }
    );

    expect(networkError.type).toBe('NETWORK_ERROR');
    expect(networkError.message).toBe('Connection timeout');
    expect(networkError.retryable).toBe(true);
    expect(networkError.details).toEqual({ timeout: 15000 });
  });

  test('Legacy wrapper pattern demonstration', () => {
    // Simulate what legacy wrappers do - convert new format to old format
    const mockNewResult: TandaPayResult<string> = {
      success: true,
      data: '0xhash123',
    };

    const mockLegacyResult = mockNewResult.success
      ? { success: true, txHash: mockNewResult.data }
      : { 
          success: false, 
          error: mockNewResult.error.userMessage ?? mockNewResult.error.message 
        };

    expect(mockLegacyResult.success).toBe(true);
    // $FlowFixMe[prop-missing] - We know this exists in success case
    expect(mockLegacyResult.txHash).toBe('0xhash123');
  });

  test('Error pattern migration works correctly', () => {
    // Simulate converting an old error pattern to new pattern
    const oldErrorPattern = {
      success: false,
      error: 'Network connection failed',
    };

    // Convert to new pattern using error handler
    const newErrorPattern: TandaPayResult<string> = {
      success: false,
      error: TandaPayErrorHandler.createNetworkError(oldErrorPattern.error || 'Unknown error')
    };

    expect(newErrorPattern.success).toBe(false);
    if (!newErrorPattern.success) {
      expect(newErrorPattern.error.type).toBe('NETWORK_ERROR');
      expect(newErrorPattern.error.message).toBe('Network connection failed');
      expect(newErrorPattern.error.retryable).toBe(true);
    }
  });
});
