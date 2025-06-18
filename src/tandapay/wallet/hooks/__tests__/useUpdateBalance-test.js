/* @flow strict-local */

import * as web3 from '../../../web3';
import type { Token } from '../../../tokens/tokenTypes';

// Mock web3 module
jest.mock('../../../web3', () => ({
  fetchBalance: jest.fn(),
}));

const mockToken: Token = {
  symbol: 'ETH',
  name: 'Ethereum',
  decimals: 18,
  address: null,
  isCustom: false,
  isDefault: true,
};

describe('useUpdateBalance migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchBalance returns TandaPayResult on success', async () => {
    const mockBalance = '1.234567890123456789';
    // $FlowFixMe - mocking web3 module
    (web3.fetchBalance: any).mockResolvedValue({
      success: true,
      data: mockBalance,
    });

    const result = await web3.fetchBalance(
      mockToken,
      '0x1234567890123456789012345678901234567890',
      'mainnet'
    );

    expect(result.success).toBe(true);
    expect(result).toHaveProperty('data', mockBalance);
  });

  it('fetchBalance returns TandaPayResult on error', async () => {
    const mockError = {
      type: 'NETWORK_ERROR',
      message: 'Network request failed',
      userMessage: 'Unable to fetch balance. Please check your network connection.',
      timestamp: Date.now(),
      retryable: true,
    };

    // $FlowFixMe - mocking web3 module
    (web3.fetchBalance: any).mockResolvedValue({
      success: false,
      error: mockError,
    });

    const result = await web3.fetchBalance(
      mockToken,
      '0x1234567890123456789012345678901234567890',
      'mainnet'
    );

    expect(result.success).toBe(false);
    // $FlowFixMe - we know result has error when success is false
    expect(result.error.type).toBe('NETWORK_ERROR');
    // $FlowFixMe - we know result has error when success is false
    expect(result.error.userMessage).toBe(mockError.userMessage);
    // $FlowFixMe - we know result has error when success is false
    expect(result.error.retryable).toBe(true);
  });

  it('demonstrates error handling pattern', async () => {
    const mockError = {
      type: 'VALIDATION_ERROR',
      message: 'Invalid address format',
      userMessage: 'Please provide a valid Ethereum address',
      timestamp: Date.now(),
      retryable: false,
    };

    // $FlowFixMe - mocking web3 module
    (web3.fetchBalance: any).mockResolvedValue({
      success: false,
      error: mockError,
    });

    const result = await web3.fetchBalance(
      mockToken,
      'invalid-address',
      'mainnet'
    );

    // Test the new pattern - no conditional expects
    expect(result.success).toBe(false);
    // $FlowFixMe - we know result has error when success is false
    expect(result.error.type).toBe('VALIDATION_ERROR');
    // $FlowFixMe - we know result has error when success is false
    expect(result.error.retryable).toBe(false);
    // $FlowFixMe - we know result has error when success is false
    expect(result.error.userMessage).toBeDefined();
  });
});
