/* @flow strict-local */

import TandaPayErrorHandler from '../ErrorHandler';

describe('CALL_EXCEPTION Fix - Specific Error Names', () => {
  test('handles the exact error from the issue description', () => {
    // This is the exact error message from the original issue
    const error = {
      code: 'CALL_EXCEPTION',
      message: 'call revert exception [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="defectFromCommunity()", data="0x4975e368", errorArgs=[], errorName="NotValidMember", errorSignature="NotValidMember()", reason=null, code=CALL_EXCEPTION, version=abi/5.8.0)'
    };

    const result = TandaPayErrorHandler.parseEthersError(error);

    // Should be recognized as a CONTRACT_ERROR
    expect(result.type).toBe('CONTRACT_ERROR');

    // Should show specific error message for NotValidMember, not generic "Transaction would revert"
    expect(result.userMessage).toBe('You are not authorized to perform this action.');

    // Should NOT show generic messages
    expect(result.userMessage).not.toBe('Transaction would revert');
    expect(result.userMessage).not.toContain('Gas Estimation Failed');
    expect(result.userMessage).not.toContain('Smart contract operation failed');

    // Should contain the error name in the message
    expect(result.message).toContain('NotValidMember');
  });

  test('handles CALL_EXCEPTION with errorName in user message for unknown errors', () => {
    // Test with the "NotRefundWindow" error from the user's example - should now be recognized
    const error = {
      code: 'CALL_EXCEPTION',
      message: 'call revert exception [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="issueRefund(bool)", data="0xd53184ed", errorArgs=[], errorName="NotRefundWindow", errorSignature="NotRefundWindow()", reason=null, code=CALL_EXCEPTION, version=abi/5.8.0)',
      errorName: 'NotRefundWindow'
    };

    const result = TandaPayErrorHandler.parseEthersError(error);

    // Should be recognized as a CONTRACT_ERROR
    expect(result.type).toBe('CONTRACT_ERROR');

    // Should show specific error message for NotRefundWindow now that it's in our predefined list
    expect(result.userMessage).toBe('Refunds are not available at this time.');

    // Should contain the error name in the message
    expect(result.message).toContain('NotRefundWindow');
  });

  test('handles CALL_EXCEPTION with errorName in user message for truly unknown errors', () => {
    // Test with a completely unknown error name
    const error = {
      code: 'CALL_EXCEPTION',
      message: 'call revert exception (errorName="CompletelyUnknownError", errorSignature="CompletelyUnknownError()")',
      errorName: 'CompletelyUnknownError'
    };

    const result = TandaPayErrorHandler.parseEthersError(error);

    // Should be recognized as a CONTRACT_ERROR
    expect(result.type).toBe('CONTRACT_ERROR');

    // Should show error name in the user message since "CompletelyUnknownError" is not in our predefined list
    expect(result.userMessage).toBe('Transaction would revert: Contract error: CompletelyUnknownError');

    // Should contain the error name
    expect(result.message).toBe('Transaction would revert');
  });

  test('shows generic revert message for unknown CALL_EXCEPTION errors', () => {
    const error = {
      code: 'CALL_EXCEPTION',
      message: 'call revert exception; VM Exception while processing transaction: reverted'
    };

    const result = TandaPayErrorHandler.parseEthersError(error);

    expect(result.type).toBe('CONTRACT_ERROR');
    expect(result.userMessage).toBe('Transaction would revert');
    expect(result.message).toBe('Transaction would revert');
  });

  test('handles CALL_EXCEPTION with known TandaPay error in errorName field', () => {
    // Simulate an error where errorName is in the structured data
    const error = {
      code: 'CALL_EXCEPTION',
      message: 'call revert exception (errorName="AlreadyAdded", errorSignature="AlreadyAdded()")',
      errorName: 'AlreadyAdded'
    };

    const result = TandaPayErrorHandler.parseEthersError(error);

    expect(result.type).toBe('CONTRACT_ERROR');
    expect(result.userMessage).toBe('This member has already been added to the community.');
    expect(result.message).toContain('AlreadyAdded');
  });

  test('extracts error name from errorSignature pattern', () => {
    const error = {
      code: 'CALL_EXCEPTION',
      message: 'call revert exception (errorSignature="CustomError()", errorName="CustomError")'
    };

    const result = TandaPayErrorHandler.parseEthersError(error);

    expect(result.type).toBe('CONTRACT_ERROR');
    expect(result.userMessage).toBe('Transaction would revert: Contract error: CustomError');
  });

  test('falls back to generic revert message when no error name is found', () => {
    const error = {
      code: 'CALL_EXCEPTION',
      message: 'call revert exception; VM Exception while processing transaction: reverted'
    };

    const result = TandaPayErrorHandler.parseEthersError(error);

    expect(result.type).toBe('CONTRACT_ERROR');
    expect(result.userMessage).toBe('Transaction would revert');
    expect(result.message).toBe('Transaction would revert');
  });
});
