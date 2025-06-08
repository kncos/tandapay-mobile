/* @flow strict-local */

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from '../../../react-redux';
import { updateTokenBalance } from '../../tandaPayActions';
import { getTokenBalance, isTokenBalanceStale } from '../../tokens/tokenSelectors';
import { fetchBalance } from '../../web3';
import type { Token } from '../../tokens/tokenTypes';

export type BalanceState = {|
  balance: ?string,
  loading: boolean,
  error: ?string,
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
  const [error, setError] = useState<?string>(null);

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
  // console.log('useUpdateBalance: token =', token?.symbol, 'walletAddress =', walletAddress);

  const refreshBalance = useCallback(async () => {
    if (!token || walletAddress == null || walletAddress === '') {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fetchedBalance = await fetchBalance(token, walletAddress, network);
      dispatch(updateTokenBalance(token.symbol, fetchedBalance));
    } catch (err) {
      const errorMessage = err?.message ?? 'Failed to fetch balance';
      setError(errorMessage);
      // Error fetching balance handled by state
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
        .then(bal => {
          if (isMounted && token) {
            dispatch(updateTokenBalance(token.symbol, bal));
            setLoading(false);
          }
        })
        .catch(err => {
          if (isMounted) {
            const errorMessage = err?.message ?? 'Failed to fetch balance';
            setError(errorMessage);
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
