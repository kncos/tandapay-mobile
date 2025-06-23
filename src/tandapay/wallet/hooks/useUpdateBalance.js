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

  // Debug logging
  console.log('useUpdateBalance DEBUG:', {
    tokenSymbol: token?.symbol,
    walletAddress,
    network,
    hasError: error != null,
    errorType: error?.type,
    errorMessage: error?.message,
    errorUserMessage: error?.userMessage,
    loading,
    balance,
    isBalanceStale
  });

  const refreshBalance = useCallback(async () => {
    if (!token || walletAddress == null || walletAddress === '') {
      console.log('refreshBalance: early return - missing token or address');
      return;
    }

    try {
      console.log('refreshBalance: starting fetch for', token.symbol, 'on network', network);
      setLoading(true);
      setError(null);

      const result = await fetchBalance(token, walletAddress, network);
      console.log('refreshBalance: fetchBalance result:', result);

      if (result.success) {
        dispatch(updateTokenBalance(token.symbol, result.data));
      } else {
        console.log('refreshBalance: setting error:', result.error);
        setError(result.error);
      }
    } catch (err) {
      console.log('refreshBalance: caught error:', err);
      // Fallback error handling for unexpected errors
      const fallbackError = TandaPayErrorHandler.createError(
        'UNKNOWN_ERROR',
        err?.message ?? 'Failed to fetch balance',
        {
          userMessage: 'An unexpected error occurred. Please try again.',
          retryable: true,
        }
      );
      console.log('refreshBalance: setting fallback error:', fallbackError);
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

          // Debug log the result
          console.log('fetchBalance result:', {
            success: result.success,
            data: result.success ? result.data : null,
            error: result.success ? null : {
              type: result.error.type,
              message: result.error.message,
              userMessage: result.error.userMessage,
              retryable: result.error.retryable
            }
          });

          if (result.success) {
            dispatch(updateTokenBalance(token.symbol, result.data));
          } else {
            console.log('Setting error in useUpdateBalance:', result.error);
            setError(result.error);
          }
          setLoading(false);
        })
        .catch(err => {
          if (isMounted) {
            console.log('useUpdateBalance: async catch error:', err);
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
