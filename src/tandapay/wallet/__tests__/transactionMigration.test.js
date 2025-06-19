/* @flow strict-local */
/* eslint-disable jest/no-conditional-expect */

import { fetchTransactionHistory } from '../TransactionService';
import { getEtherscanApiKey } from '../WalletManager';

// Mock the dependencies
jest.mock('../WalletManager');
jest.mock('../../boot/store');
jest.mock('../../../selectors');

describe('Transaction History Migration (Phase 1.2)', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    // $FlowFixMe[prop-missing] - fetch is mocked in test environment
    fetch.reset();
  });

  it('should return TandaPayResult structure with success', async () => {
    // Mock API key
    // $FlowFixMe[prop-missing] - jest mocked function
    getEtherscanApiKey.mockResolvedValue('test-api-key');

    // Mock successful API response
    // $FlowFixMe[prop-missing] - fetch is mocked in test environment
    fetch.mockResponseSuccess(JSON.stringify({
      status: '1',
      message: 'OK',
      result: [
        {
          blockNumber: '123456',
          timeStamp: '1640995200',
          hash: '0xtest123',
          from: '0xfrom123',
          to: '0xto123',
          value: '1000000000000000000',
          gas: '21000',
          gasPrice: '20000000000',
          isError: '0',
          txreceipt_status: '1',
          input: '0x',
          contractAddress: '',
          cumulativeGasUsed: '21000',
          gasUsed: '21000',
          confirmations: '100',
          methodId: '0x',
          functionName: '',
          nonce: '1',
          blockHash: '0xblock123',
          transactionIndex: '0',
        },
      ],
    }));

    const result = await fetchTransactionHistory('0x123abc', 1, 10);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].hash).toBe('0xtest123');
    }
  });

  it('should return TandaPayResult structure with structured error for missing API key', async () => {
    // Mock missing API key
    // $FlowFixMe[prop-missing] - jest mocked function
    getEtherscanApiKey.mockResolvedValue(null);

    const result = await fetchTransactionHistory('0x123abc', 1, 10);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('API_ERROR');
      expect(result.error.code).toBe('NO_API_KEY');
      expect(result.error.userMessage).toBe('Configure Etherscan API key to view transaction history');
      expect(result.error.retryable).toBe(false);
    }
  });

  it('should return TandaPayResult structure with structured error for network errors', async () => {
    // Mock API key
    // $FlowFixMe[prop-missing] - jest mocked function
    getEtherscanApiKey.mockResolvedValue('test-api-key');

    // Mock network error
    // $FlowFixMe[prop-missing] - fetch is mocked in test environment
    fetch.mockResponseFailure(new Error('Network error'));

    const result = await fetchTransactionHistory('0x123abc', 1, 10);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('API_ERROR');
      expect(result.error.userMessage).toBe('Failed to load transaction history. Please check your connection and try again.');
      expect(result.error.retryable).toBe(true);
    }
  });

  it('should return TandaPayResult structure with structured error for validation errors', async () => {
    const result = await fetchTransactionHistory('', 1, 10);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('VALIDATION_ERROR');
      expect(result.error.userMessage).toBe('Please provide a valid wallet address');
      expect(result.error.retryable).toBe(false);
    }
  });
});
