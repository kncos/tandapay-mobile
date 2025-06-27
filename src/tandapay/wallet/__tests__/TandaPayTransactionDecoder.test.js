/* @flow strict-local */

/**
 * Test for TandaPay Transaction Decoder
 */

import {
  decodeTandaPayTransaction,
  isTandaPayTransaction,
  getTandaPayTransactionSummary,
} from '../TandaPayTransactionDecoder';

describe('TandaPayTransactionDecoder', () => {
  // Mock TandaPay contract address
  const mockContractAddress = '0x742d35Cc6478C0532e3EB0111D5BD0b105100000';

  describe('isTandaPayTransaction', () => {
    it('should return true for matching contract address', () => {
      const mockTransaction = {
        to: mockContractAddress,
        hash: '0x123',
      };

      const result = isTandaPayTransaction(mockTransaction, mockContractAddress);
      expect(result).toBe(true);
    });

    it('should return false for different contract address', () => {
      const mockTransaction = {
        to: '0x742d35Cc6478C0532e3EB0111D5BD0b105111111',
        hash: '0x123',
      };

      const result = isTandaPayTransaction(mockTransaction, mockContractAddress);
      expect(result).toBe(false);
    });

    it('should return false when contract address is null', () => {
      const mockTransaction = {
        to: mockContractAddress,
        hash: '0x123',
      };

      const result = isTandaPayTransaction(mockTransaction, null);
      expect(result).toBe(false);
    });

    it('should return false when transaction is null', () => {
      const result = isTandaPayTransaction(null, mockContractAddress);
      expect(result).toBe(false);
    });
  });

  describe('decodeTandaPayTransaction', () => {
    it('should return null for empty transaction data', () => {
      const result = decodeTandaPayTransaction('0x');
      expect(result).toBe(null);
    });

    it('should return null for invalid transaction data', () => {
      const result = decodeTandaPayTransaction('0xinvalid');
      expect(result).toBe(null);
    });

    // Note: Testing actual decoding would require mock setup for ethers.js
    // For now, we test the basic null/invalid cases
  });

  describe('getTandaPayTransactionSummary', () => {
    it('should return friendly name for successful transaction', () => {
      const mockDecoded = {
        methodName: 'joinCommunity',
        friendlyName: 'Join Community',
        isSuccess: true,
      };

      const result = getTandaPayTransactionSummary(mockDecoded);
      expect(result).toBe('Join Community');
    });

    it('should return failed message for unsuccessful transaction', () => {
      const mockDecoded = {
        methodName: 'joinCommunity',
        friendlyName: 'Join Community',
        isSuccess: false,
        errorReason: 'Transaction failed',
      };

      const result = getTandaPayTransactionSummary(mockDecoded);
      expect(result).toBe('Failed: Join Community');
    });

    it('should return friendly name when error reason is empty', () => {
      const mockDecoded = {
        methodName: 'joinCommunity',
        friendlyName: 'Join Community',
        isSuccess: false,
        errorReason: '',
      };

      const result = getTandaPayTransactionSummary(mockDecoded);
      expect(result).toBe('Join Community');
    });
  });
});
