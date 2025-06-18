/* @flow strict-local */

/**
 * EXAMPLE IMPLEMENTATION - Phase 1.1: Balance Fetching Migration
 *
 * This file demonstrates how to migrate the balance fetching functionality
 * to use the new TandaPay error handling system.
 *
 * This is a reference implementation that shows the before/after patterns.
 */

import '@ethersproject/shims';
import { useCallback, useEffect, useState } from 'react';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

import type { Token } from '../tokens/tokenTypes';
import type { TandaPayError, TandaPayResult } from './types';
import TandaPayErrorHandler from './ErrorHandler';
import { createProvider } from '../providers/ProviderManager';
import { useDispatch, useSelector } from '../../react-redux';
import { updateTokenBalance } from '../redux/actions';
import { getTokenBalance, isTokenBalanceStale } from '../tokens/tokenSelectors';

// Standard ERC20 ABI for balance operations
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

/**
 * BEFORE: Original fetchBalance function with silent failure
 */
export async function fetchBalance_OLD(
  token: Token,
  address: string,
  network: string
): Promise<string> {
  try {
    // $FlowFixMe[unclear-type] - demo function using simplified network handling
    const provider: any = createProvider((network: any));

    if (token.address == null) {
      // ETH balance
      const bal = await provider.getBalance(address);
      return ethers.utils.formatEther(bal);
    } else {
      // ERC20 balance
      const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
      const balance = await contract.balanceOf(address);
      return ethers.utils.formatUnits(balance, token.decimals);
    }
  } catch (e) {
    // 🔴 PROBLEM: Silent failure - user never knows what went wrong
    // eslint-disable-next-line no-console
    console.log('Balance fetch error:', e);
    return '0';
  }
}

/**
 * AFTER: Migrated fetchBalance function with comprehensive error handling
 */
export async function fetchBalance(
  token: Token,
  address: string,
  network: string
): Promise<TandaPayResult<string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Input validation
      if (!ethers.utils.isAddress(address)) {
        throw TandaPayErrorHandler.createValidationError(
          'Invalid address format',
          'Please provide a valid Ethereum address'
        );
      }

      if (!token || !token.symbol) {
        throw TandaPayErrorHandler.createValidationError(
          'Invalid token',
          'Token information is missing'
        );
      }

      // Create provider with network validation
      const supportedNetworks = ['mainnet', 'sepolia', 'arbitrum', 'polygon'];
      // $FlowFixMe[unclear-type] - safe cast after validation for demo purposes
      const validNetwork = supportedNetworks.includes(network) ? (network: any) : 'sepolia';
      // $FlowFixMe[unclear-type] - ethers provider type is complex
      const provider: any = createProvider(validNetwork);

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(TandaPayErrorHandler.createError(
            'TIMEOUT_ERROR',
            'Balance fetch timed out',
            {
              userMessage: 'Network request timed out. Please try again.',
              retryable: true
            }
          ));
        }, 10000); // 10 second timeout
      });

      let balancePromise: Promise<string>;

      if (token.address == null) {
        // ETH balance
        balancePromise = provider.getBalance(address)
          .then(bal => ethers.utils.formatEther(bal));
      } else {
        // ERC20 balance
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
          balancePromise = contract.balanceOf(address)
            .then(balance => ethers.utils.formatUnits(balance, token.decimals));
        } catch (contractError) {
          throw TandaPayErrorHandler.createContractError(
            'Failed to create token contract',
            { tokenAddress: token.address, contractError }
          );
        }
      }

      // Race between balance fetch and timeout
      const balance = await Promise.race([balancePromise, timeoutPromise]);

      // Validate the result
      if (typeof balance !== 'string' || Number.isNaN(parseFloat(balance))) {
        throw TandaPayErrorHandler.createError(
          'PARSING_ERROR',
          'Invalid balance format received',
          {
            userMessage: 'Received invalid balance data. Please try again.',
            details: { balance, token: token.symbol }
          }
        );
      }

      return balance;
    },
    'NETWORK_ERROR',
    'Unable to fetch balance. Please check your network connection and try again.',
    'BALANCE_FETCH_FAILED'
  );
}

/**
 * BEFORE: Original useUpdateBalance hook with inconsistent error handling
 */
/*
export function useUpdateBalance_OLD(
  token: ?Token,
  walletAddress: ?string,
): {| balance: ?string, loading: boolean, error: ?string |} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<?string>(null);

  const refreshBalance = useCallback(async () => {
    if (!token || !walletAddress) return;

    try {
      setLoading(true);
      setError(null);

      // 🔴 PROBLEM: Using old fetchBalance with silent failures
      const fetchedBalance = await fetchBalance_OLD(token, walletAddress, network);
      dispatch(updateTokenBalance(token.symbol, fetchedBalance));
    } catch (err) {
      // 🔴 PROBLEM: Generic error handling, no user guidance
      const errorMessage = err?.message ?? 'Failed to fetch balance';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, walletAddress, network]);

  // ... rest of hook
}
*/

/**
 * AFTER: Migrated hook with comprehensive error handling
 */
export function useUpdateBalance(
  token: ?Token,
  walletAddress: ?string,
): {|
  balance: ?string,
  loading: boolean,
  error: ?TandaPayError,
  refreshBalance: () => Promise<void>,
  clearBalance: () => void
|} {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<?TandaPayError>(null);

  const network = useSelector(state =>
    state.tandaPay.settings.selectedNetwork
  );

  const refreshBalance = useCallback(async () => {
    if (!token || walletAddress == null || walletAddress === '') {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ IMPROVEMENT: Using new error-aware fetchBalance
      const result = await fetchBalance(token, walletAddress, network);

      if (result.success) {
        dispatch(updateTokenBalance(token.symbol, result.data));
      } else {
        // ✅ IMPROVEMENT: Structured error handling with user guidance
        setError(result.error);

        // ✅ IMPROVEMENT: Automatic retry for retryable errors
        if (result.error.retryable === true && result.error.type === 'TIMEOUT_ERROR') {
          // eslint-disable-next-line no-console
          console.log('Balance fetch timed out, retrying in 2 seconds...');
          setTimeout(() => {
            refreshBalance();
          }, 2000);
        }

        // ✅ IMPROVEMENT: Silent handling for non-critical errors in hooks
        // Component can decide whether to show user alerts
      }
    } catch (err) {
      // ✅ IMPROVEMENT: Fallback error handling
      const fallbackError = TandaPayErrorHandler.createError(
        'UNKNOWN_ERROR',
        err?.message || 'Unexpected error occurred',
        { userMessage: 'Something went wrong. Please try again.' }
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

  // ✅ IMPROVEMENT: Enhanced automatic balance fetching with error awareness
  const balance = useSelector(state =>
    token ? getTokenBalance(state, token.symbol) : null
  );

  const isBalanceStale = useSelector(state =>
    token ? isTokenBalanceStale(state, token.symbol) : true
  );

  useEffect(() => {
    let isMounted = true;

    if (walletAddress == null || walletAddress === '' || !token) {
      clearBalance();
      return;
    }

    // Only fetch if balance is stale or missing
    if (isBalanceStale) {
      setLoading(true);
      setError(null);

      fetchBalance(token, walletAddress, network)
        .then(result => {
          if (!isMounted)
{ return; }

          if (result.success) {
            dispatch(updateTokenBalance(token.symbol, result.data));
          } else {
            setError(result.error);
          }
          setLoading(false);
        })
        .catch(err => {
          if (!isMounted)
{ return; }

          const fallbackError = TandaPayErrorHandler.createError(
            'UNKNOWN_ERROR',
            err?.message || 'Unexpected error occurred'
          );
          setError(fallbackError);
          setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [dispatch, token, walletAddress, isBalanceStale, network, clearBalance]);

  return {
    balance,
    loading,
    error,
    refreshBalance,
    clearBalance,
  };
}

/**
 * COMPONENT USAGE EXAMPLE: How components should handle the new error patterns
 */
/*
function BalanceDisplay({ token, walletAddress }: Props): Node {
  const { balance, loading, error, refreshBalance } = useUpdateBalance(token, walletAddress);

  // ✅ IMPROVEMENT: Sophisticated error handling in UI
  if (error) {
    return (
      <Card>
        <Text>{error.userMessage}</Text>
        {error.retryable && (
          <Button onPress={refreshBalance}>
            Try Again
          </Button>
        )}
        {error.code === 'BALANCE_FETCH_FAILED' && (
          <Text style={{ fontSize: 12, color: 'gray' }}>
            Check your network connection
          </Text>
        )}
      </Card>
    );
  }

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <Card>
      <Text>Balance: {balance || '0'}</Text>
      <Button onPress={refreshBalance}>Refresh</Button>
    </Card>
  );
}
*/

/**
 * Migration Benefits Demonstrated:
 *
 * 1. ✅ No more silent failures - all errors are captured and categorized
 * 2. ✅ User-friendly error messages instead of technical details
 * 3. ✅ Retry mechanisms for transient errors
 * 4. ✅ Timeout handling prevents hanging requests
 * 5. ✅ Input validation catches issues early
 * 6. ✅ Structured error information for better debugging
 * 7. ✅ Component-level error handling flexibility
 * 8. ✅ Consistent error patterns across the application
 */
