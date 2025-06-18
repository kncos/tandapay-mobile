/* @flow strict-local */

import { useCallback } from 'react';
import { useSelector, useDispatch } from '../../react-redux';
import { invalidateTokenBalance, invalidateAllTokenBalances } from '../redux/actions';
import { getAvailableTokens } from '../tokens/tokenSelectors';

export type BalanceInvalidationActions = {|
  invalidateToken: (tokenSymbol: string) => void,
  invalidateAllTokens: () => void,
|};

/**
 * Hook to provide balance invalidation functionality.
 * This is useful after transactions to force balance refresh.
 */
export function useBalanceInvalidation(): BalanceInvalidationActions {
  const dispatch = useDispatch();
  const availableTokens = useSelector(getAvailableTokens);

  const invalidateToken = useCallback((tokenSymbol: string) => {
    dispatch(invalidateTokenBalance(tokenSymbol));
  }, [dispatch]);

  const invalidateAllTokens = useCallback(() => {
    const tokenSymbols = availableTokens.map(token => token.symbol);
    const actions = invalidateAllTokenBalances(tokenSymbols);
    actions.forEach(action => dispatch(action));
  }, [dispatch, availableTokens]);

  return {
    invalidateToken,
    invalidateAllTokens,
  };
}
