/* @flow strict-local */

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from '../../../react-redux';
import { updateTokenBalance } from '../../redux/actions';
import { getTokenBalance, isTokenBalanceStale } from '../../tokens/tokenSelectors';
import { fetchBalance } from '../../web3';
import TandaPayErrorHandler from '../../errors/ErrorHandler';
import type { TokenWithBalance } from '../../tokens/tokenTypes';
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
  token: ?TokenWithBalance,
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
    console.log('useUpdateBalance: refreshBalance called with:', {
      token: token?.symbol,
      walletAddress,
      network,
      isBalanceStale
    });

    if (!token || walletAddress == null || walletAddress === '') {
      console.log('useUpdateBalance: Missing token or wallet address, returning early');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await fetchBalance(
        {
          symbol: token.symbol,
          address: token.address,
          name: token.name,
          decimals: token.decimals,
          isCustom: token.isCustom,
        },
        walletAddress,
        network
      );

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

    console.log('useUpdateBalance: useEffect triggered with:', {
      walletAddress,
      token: token?.symbol,
      isBalanceStale,
      hasToken: !!token,
      hasWalletAddress: walletAddress != null && walletAddress !== ''
    });

    if (walletAddress == null || walletAddress === '' || !token) {
      console.log('useUpdateBalance: Clearing balance - no wallet or token');
      // Clear balance for empty wallet or no selected token
      if (token) {
        dispatch(updateTokenBalance(token.symbol, '0'));
      }
      setError(null);
      return;
    }

    // Only fetch if balance is stale or missing
    if (isBalanceStale) {
      console.log('useUpdateBalance: Balance is stale, fetching...');
      setLoading(true);
      setError(null);

      fetchBalance(
        {
          symbol: token.symbol,
          address: token.address,
          name: token.name,
          decimals: token.decimals,
          isCustom: token.isCustom,
        },
        walletAddress,
        network
      )
        .then(result => {
          if (!isMounted) {
            return;
          }

          console.log('useUpdateBalance: Balance fetch result:', result);

          if (result.success) {
            console.log('useUpdateBalance: Dispatching updateTokenBalance with:', token.symbol, result.data);
            dispatch(updateTokenBalance(token.symbol, result.data));
          } else {
            console.log('useUpdateBalance: Balance fetch failed:', result.error);
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
