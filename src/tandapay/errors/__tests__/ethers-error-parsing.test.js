/* @flow strict-local */

import TandaPayErrorHandler from '../ErrorHandler';

describe('TandaPayErrorHandler - Ethers Error Parsing', () => {
  describe('parseEthersError', () => {
    test('handles insufficient funds errors', () => {
      const error = new Error('insufficient funds for gas * price + value');
      const result = TandaPayErrorHandler.parseEthersError(error);

      expect(result.type).toBe('INSUFFICIENT_FUNDS');
      expect(result.userMessage).toContain('don\'t have enough funds');
      expect(result.message).toBe('Insufficient funds for transaction');
    });

    test('handles network detection errors', () => {
      const error = new Error('could not detect network');
      const result = TandaPayErrorHandler.parseEthersError(error);

      expect(result.type).toBe('NETWORK_ERROR');
      expect(result.userMessage).toContain('Unable to connect to the blockchain network');
      expect(result.message).toBe('Network connection failed');
    });

    test('handles gas estimation errors', () => {
      const error = new Error('cannot estimate gas; transaction may fail or may require manual gas limit');
      const result = TandaPayErrorHandler.parseEthersError(error);

      expect(result.type).toBe('CONTRACT_ERROR');
      expect(result.userMessage).toBe('Transaction would revert');
      expect(result.message).toBe('Transaction would revert');
    });

    test('handles timeout errors', () => {
      const error = new Error('timeout of 5000ms exceeded');
      const result = TandaPayErrorHandler.parseEthersError(error);

      expect(result.type).toBe('TIMEOUT_ERROR');
      expect(result.userMessage).toContain('took too long to complete');
      expect(result.message).toBe('Operation timed out');
    });

    test('handles invalid address errors', () => {
      const error = new Error('invalid address');
      const result = TandaPayErrorHandler.parseEthersError(error);

      expect(result.type).toBe('VALIDATION_ERROR');
      expect(result.userMessage).toContain('address format is invalid');
      expect(result.message).toBe('Invalid address format');
    });

    test('handles nonce errors', () => {
      const error = new Error('nonce too low');
      const result = TandaPayErrorHandler.parseEthersError(error);

      expect(result.type).toBe('NETWORK_ERROR');
      expect(result.userMessage).toContain('issue with the transaction sequence');
      expect(result.message).toBe('Transaction nonce error');
    });

    test('handles rate limiting errors', () => {
      const error = new Error('rate limit exceeded');
      const result = TandaPayErrorHandler.parseEthersError(error);

      expect(result.type).toBe('RATE_LIMITED');
      expect(result.userMessage).toContain('Too many requests');
      expect(result.message).toBe('Rate limited by provider');
    });

    test('handles unknown errors gracefully', () => {
      const error = new Error('some random ethers error');
      const result = TandaPayErrorHandler.parseEthersError(error);

      expect(result.type).toBe('UNKNOWN_ERROR');
      expect(result.userMessage).toContain('unexpected error occurred');
      expect(result.message).toBe('some random ethers error');
    });

    test('handles non-Error objects', () => {
      const result = TandaPayErrorHandler.parseEthersError('simple string error');

      expect(result.type).toBe('UNKNOWN_ERROR');
      expect(result.userMessage).toContain('unexpected error occurred');
      expect(result.message).toBe('simple string error');
    });

    test('handles null/undefined errors', () => {
      const result = TandaPayErrorHandler.parseEthersError(null);

      expect(result.type).toBe('UNKNOWN_ERROR');
      expect(result.userMessage).toContain('unexpected error occurred');
      expect(result.message).toBe('Unknown error');
    });

    it('handles gas estimation with insufficient funds', () => {
      const gasEstimationInsufficientFundsErrors = [
        'execution reverted: insufficient balance',
        'cannot estimate gas; transaction may fail: insufficient funds',
        'execution reverted: transfer amount exceeds balance',
        'revert insufficient balance for transfer',
        'always failing transaction: insufficient funds'
      ];

      gasEstimationInsufficientFundsErrors.forEach(errorMessage => {
        const result = TandaPayErrorHandler.parseEthersError({ message: errorMessage });
        expect(result.type).toBe('INSUFFICIENT_FUNDS');
        expect(result.userMessage).toContain('You don\'t have enough funds');
        expect(result.userMessage).toContain('check your balance');
      });
    });

    it('handles regular gas estimation errors', () => {
      const revertErrors = [
        'cannot estimate gas; transaction may fail due to invalid recipient',
        'execution reverted: custom error message'
      ];

      revertErrors.forEach(errorMessage => {
        const result = TandaPayErrorHandler.parseEthersError({ message: errorMessage });
        expect(result.type).toBe('CONTRACT_ERROR');
        expect(result.userMessage).toBe('Transaction would revert');
      });

      // Test true gas estimation errors (not reverts)
      const trueGasErrors = [
        'gas required exceeds allowance'
      ];

      trueGasErrors.forEach(errorMessage => {
        const result = TandaPayErrorHandler.parseEthersError({ message: errorMessage });
        expect(result.type).toBe('CONTRACT_ERROR');
        expect(result.userMessage).toContain('Smart contract operation failed');
      });
    });

    test('handles CALL_EXCEPTION with specific error names', () => {
      const callExceptionErrors = [
        {
          message: 'call revert exception; VM Exception while processing transaction: reverted with reason string "NotValidMember"',
          expectedUserMessage: 'You are not authorized to perform this action.',
          expectedErrorName: 'NotValidMember'
        },
        {
          message: 'call revert exception; VM Exception while processing transaction: reverted with reason string "AlreadyAdded"',
          expectedUserMessage: 'This member has already been added to the community.',
          expectedErrorName: 'AlreadyAdded'
        },
        {
          message: 'call revert exception; VM Exception while processing transaction: reverted with reason string "InsufficientFunds"',
          expectedUserMessage: 'Insufficient funds to complete this transaction.',
          expectedErrorName: 'InsufficientFunds'
        },
        {
          code: 'CALL_EXCEPTION',
          message: 'call revert exception; VM Exception while processing transaction: reverted with reason string "NotValidMember"',
          expectedUserMessage: 'You are not authorized to perform this action.',
          expectedErrorName: 'NotValidMember'
        },
        {
          code: 'CALL_EXCEPTION',
          message: 'execution reverted: NotValidMember',
          expectedUserMessage: 'You are not authorized to perform this action.',
          expectedErrorName: 'NotValidMember'
        }
      ];

      callExceptionErrors.forEach((errorCase, index) => {
        const result = TandaPayErrorHandler.parseEthersError(errorCase);

        expect(result.type).toBe('CONTRACT_ERROR');
        expect(result.userMessage).toBe(errorCase.expectedUserMessage);
        expect(result.message).toContain(errorCase.expectedErrorName);

        // The user message should be specific, not generic
        expect(result.userMessage).not.toBe('Transaction would revert');
        expect(result.userMessage).not.toContain('Smart contract operation failed');
      });
    });

    test('handles CALL_EXCEPTION without specific error names', () => {
      const genericCallExceptionErrors = [
        {
          code: 'CALL_EXCEPTION',
          message: 'call revert exception; VM Exception while processing transaction: reverted'
        },
        {
          message: 'call revert exception; VM Exception while processing transaction: execution reverted'
        },
        {
          message: 'execution reverted'
        }
      ];

      genericCallExceptionErrors.forEach((errorCase) => {
        const result = TandaPayErrorHandler.parseEthersError(errorCase);

        expect(result.type).toBe('CONTRACT_ERROR');
        expect(result.userMessage).toBe('Transaction would revert');
        expect(result.message).toBe('Transaction would revert');
      });
    });
  });

  describe('withEthersErrorHandling', () => {
    test('returns success for successful operation', async () => {
      const operation = async () => 'success result';
      const result = await TandaPayErrorHandler.withEthersErrorHandling(operation);

      expect(result.success).toBe(true);
      // eslint-disable-next-line jest/no-conditional-expect
      expect(result.success && result.data).toBe('success result');
    });

    test('parses ethers errors correctly', async () => {
      const operation = async () => {
        throw new Error('insufficient funds for gas * price + value');
      };

      const result = await TandaPayErrorHandler.withEthersErrorHandling(operation);

      expect(result.success).toBe(false);
      // eslint-disable-next-line jest/no-conditional-expect
      expect(!result.success && result.error.type).toBe('INSUFFICIENT_FUNDS');
      // eslint-disable-next-line jest/no-conditional-expect
      expect(!result.success && result.error.userMessage).toContain('don\'t have enough funds');
    });

    test('uses custom user message when provided', async () => {
      const operation = async () => {
        throw new Error('insufficient funds for gas * price + value');
      };

      const customMessage = 'Custom insufficient funds message';
      const result = await TandaPayErrorHandler.withEthersErrorHandling(
        operation,
        customMessage
      );

      expect(result.success).toBe(false);
      // eslint-disable-next-line jest/no-conditional-expect
      expect(!result.success && result.error.userMessage).toBe(customMessage);
      // eslint-disable-next-line jest/no-conditional-expect
      expect(!result.success && result.error.type).toBe('INSUFFICIENT_FUNDS');
    });

    test('includes error code when provided', async () => {
      const operation = async () => {
        throw new Error('network error');
      };

      const result = await TandaPayErrorHandler.withEthersErrorHandling(
        operation,
        undefined,
        'NETWORK_001'
      );

      expect(result.success).toBe(false);
      // eslint-disable-next-line jest/no-conditional-expect
      expect(!result.success && result.error.code).toBe('NETWORK_001');
    });
  });
});
