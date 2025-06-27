/* @flow strict-local */

/**
 * Simple test for payment token display functionality
 * To run: npx jest src/tandapay/utils/__tests__/tokenUtils.test.js
 */

import { findTokenByAddress, getTokenDisplayText } from '../tokenUtils';

describe('Payment Token Display', () => {
  test('should return unknown token for unrecognized address', () => {
    const randomAddress = '0x1234567890123456789012345678901234567890';
    const mockDefaultTokens = [];
    const mockCustomTokens = [];

    const result = findTokenByAddress(
      randomAddress,
      'mainnet',
      mockDefaultTokens,
      mockCustomTokens
    );

    expect(result).not.toBeNull();
    expect(result?.symbol).toBe('UNKNOWN');
    expect(result?.name).toBe('Unknown Token');
    expect(result?.isKnown).toBe(false);
    expect(result?.address).toBe(randomAddress);
  });

  test('should find custom token from Redux store', () => {
    const customTokenAddress = '0x1234567890123456789012345678901234567890';
    const mockDefaultTokens = [];
    const mockCustomTokens = [
      {
        address: customTokenAddress,
        symbol: 'CUSTOM',
        name: 'Custom Token',
      }
    ];

    const result = findTokenByAddress(
      customTokenAddress,
      'mainnet',
      mockDefaultTokens,
      mockCustomTokens
    );

    expect(result).not.toBeNull();
    expect(result?.symbol).toBe('CUSTOM');
    expect(result?.name).toBe('Custom Token');
    expect(result?.isKnown).toBe(true);
  });

  test('should return null for invalid address', () => {
    const invalidAddress = 'not-an-address';
    const mockDefaultTokens = [];
    const mockCustomTokens = [];

    const result = findTokenByAddress(
      invalidAddress,
      'mainnet',
      mockDefaultTokens,
      mockCustomTokens
    );

    expect(result).toBeNull();
  });

  test('should handle custom network gracefully', () => {
    const randomAddress = '0x1234567890123456789012345678901234567890';
    const mockDefaultTokens = [];
    const mockCustomTokens = [];

    const result = findTokenByAddress(
      randomAddress,
      'custom',
      mockDefaultTokens,
      mockCustomTokens
    );

    expect(result).not.toBeNull();
    expect(result?.symbol).toBe('UNKNOWN');
    expect(result?.isKnown).toBe(false);
  });

  test('getTokenDisplayText should return correct display text', () => {
    const knownToken = {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      isKnown: true,
    };

    const unknownToken = {
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      address: '0x1234567890123456789012345678901234567890',
      isKnown: false,
    };

    expect(getTokenDisplayText(knownToken)).toBe('USDC');
    expect(getTokenDisplayText(unknownToken)).toBe('Unknown token');
    expect(getTokenDisplayText(null)).toBe('Unknown token');
  });
});
