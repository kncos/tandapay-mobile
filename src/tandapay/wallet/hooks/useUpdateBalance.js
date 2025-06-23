/* @flow strict-local */

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from '../../../react-redux';
import { updateTokenBalance } from '../../redux/actions';
import { getTokenBalance, isTokenBalanceStale } from '../../tokens/tokenSelectors';
import { fetchBalance } from '../../web3';
import TandaPayErrorHandler from '../../errors/ErrorHandler';
import type { Token } from '../../tokens/tokenTypes';
import type { TandaPayError } from '../../errors/types';

export type BalanceState = {|
  balance: ?string,
  loading: boolean,
  error: ?TandaPayError,
|};

export type BalanceActions = {|
  refreshBalance: () => Promise<void>,
  clearBalance: () => void,
|};

export function useUpdateBalance(
  token: ?Token,
  walletAddress: ?string,
): {| ...BalanceState, ...BalanceActions |} {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<?TandaPayError>(null);

  const balance = useSelector(state =>
    token ? getTokenBalance(state, token.symbol) : null
  );

  const network = useSelector(state =>
    state.tandaPay.settings.selectedNetwork
  );

  const isBalanceStale = useSelector(state =>
    token ? isTokenBalanceStale(state, token.symbol) : true
  );

  const refreshBalance = useCallback(async () => {
    if (!token || walletAddress == null || walletAddress === '') {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await fetchBalance(token, walletAddress, network);

      if (result.success) {
        dispatch(updateTokenBalance(token.symbol, result.data));
      } else {
        setError(result.error);
      }
    } catch (err) {
      // Fallback error handling for unexpected errors
      const fallbackError = TandaPayErrorHandler.createError(
        'UNKNOWN_ERROR',
        err?.message ?? 'Failed to fetch balance',
        {
          userMessage: 'An unexpected error occurred. Please try again.',
          retryable: true,
        }
      );
      setError(fallbackError);
    } finally {
      setLoading(false);
    }
  }, [dispatch, token, walletAddress, network]);

  const clearBalance = useCallback(() => {
    if (token) {
      dispatch(updateTokenBalance(token.symbol, '0'));
    }
    setError(null);
  }, [dispatch, token]);

  useEffect(() => {
    let isMounted = true;

    if (walletAddress == null || walletAddress === '' || !token) {
      // Clear balance for empty wallet or no selected token
      if (token) {
        dispatch(updateTokenBalance(token.symbol, '0'));
      }
      setError(null);
      return;
    }

    // Only fetch if balance is stale or missing
    if (isBalanceStale) {
      setLoading(true);
      setError(null);

      fetchBalance(token, walletAddress, network)
        .then(result => {
          if (!isMounted) {
            return;
          }

          if (result.success) {
            dispatch(updateTokenBalance(token.symbol, result.data));
          } else {
            setError(result.error);
          }
          setLoading(false);
        })
        .catch(err => {
          if (isMounted) {
            // Fallback error handling for unexpected errors
            const fallbackError = TandaPayErrorHandler.createError(
              'UNKNOWN_ERROR',
              err?.message ?? 'Failed to fetch balance',
              {
                userMessage: 'An unexpected error occurred. Please try again.',
                retryable: true,
              }
            );
            setError(fallbackError);
            setLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [dispatch, token, walletAddress, isBalanceStale, network]);

  return {
    balance,
    loading,
    error,
    refreshBalance,
    clearBalance,
  };
}
