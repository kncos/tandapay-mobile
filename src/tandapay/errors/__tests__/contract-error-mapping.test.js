/* @flow strict-local */

import TandaPayErrorHandler from '../ErrorHandler';

describe('TandaPay Contract Error Mapping', () => {
  test('shows user-friendly messages for known TandaPay errors', () => {
    const error = {
      code: 'CALL_EXCEPTION',
      message: 'call revert exception; VM Exception while processing transaction: reverted with custom error \'InsufficientFunds()\'',
      errorName: 'InsufficientFunds',
    };

    const result = TandaPayErrorHandler.parseEthersError(error);

    expect(result.type).toBe('CONTRACT_ERROR');
    expect(result.userMessage).toBe('Insufficient funds to complete this transaction.');
    expect(result.message).toBe('Transaction would revert: InsufficientFunds');
  });

  test('shows user-friendly messages for timing errors', () => {
    const error = {
      code: 'CALL_EXCEPTION',
      message: 'call revert exception; VM Exception while processing transaction: reverted with custom error \'NotPayWindow()\'',
      errorName: 'NotPayWindow',
    };

    const result = TandaPayErrorHandler.parseEthersError(error);

    expect(result.type).toBe('CONTRACT_ERROR');
    expect(result.userMessage).toBe('Payments can only be made during the payment window');
    expect(result.message).toBe('Transaction would revert: NotPayWindow');
  });

  test('shows user-friendly messages for state errors', () => {
    const error = {
      code: 'CALL_EXCEPTION',
      message: 'call revert exception; VM Exception while processing transaction: reverted with custom error \'CommunityIsCollapsed()\'',
      errorName: 'CommunityIsCollapsed',
    };

    const result = TandaPayErrorHandler.parseEthersError(error);

    expect(result.type).toBe('CONTRACT_ERROR');
    expect(result.userMessage).toBe('Community has collapsed');
    expect(result.message).toBe('Transaction would revert: CommunityIsCollapsed');
  });

  test('shows generic message for unknown contract errors', () => {
    const error = {
      code: 'CALL_EXCEPTION',
      message: 'call revert exception; VM Exception while processing transaction: reverted with custom error \'UnknownContractError()\'',
      errorName: 'UnknownContractError',
    };

    const result = TandaPayErrorHandler.parseEthersError(error);

    expect(result.type).toBe('CONTRACT_ERROR');
    expect(result.userMessage).toBe('Transaction would revert: Contract error: UnknownContractError');
    expect(result.message).toBe('Transaction would revert');
  });
});
