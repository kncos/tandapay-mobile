// @flow strict-local

/**
 * Transaction history hook using TransactionManagerNew
 *
 * This replaces the old transaction fetching logic with the new robust system
 * that properly handles deduplication and chronological ordering.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import type { NetworkIdentifier } from '../definitions';
import type { TandaPayError } from '../errors/types';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import { TransactionManager } from './TransactionManagerNew';
import { getAlchemyRpcUrl } from '../providers/ProviderManager';
import type { FullTransaction } from './FullTransaction';
import { useSelector } from '../../react-redux';

export type TransactionState =
  | {| status: 'idle' |}
  | {| status: 'loading' |}
  | {| status: 'success', transactions: $ReadOnlyArray<FullTransaction>, hasMore: boolean |}
  | {| status: 'error', error: TandaPayError |};

export type LoadMoreState =
  | {| status: 'idle' |}
  | {| status: 'loading' |}
  | {| status: 'complete' |};

type UseTransactionHistoryProps = {|
  walletAddress: ?string,
  apiKeyConfigured: boolean,
  network?: NetworkIdentifier,
  tandaPayContractAddress?: ?string,
|};

type UseTransactionHistoryReturn = {|
  transactionState: TransactionState,
  loadMoreState: LoadMoreState,
  loadMore: () => Promise<void>,
  refresh: () => Promise<void>,
|};

export default function useTransactionHistory({
  walletAddress,
  apiKeyConfigured,
  network = 'sepolia',
  tandaPayContractAddress: tandapayContractAddress,
}: UseTransactionHistoryProps): UseTransactionHistoryReturn {
  const [transactionState, setTransactionState] = useState<TransactionState>({ status: 'idle' });
  const [loadMoreState, setLoadMoreState] = useState<LoadMoreState>({ status: 'idle' });

  // Use refs to maintain instances across re-renders
  const managerRef = useRef<?TransactionManager>(null);
  const isMountedRef = useRef<boolean>(true);

  // Get Redux state for custom network configuration
  const perAccountState = useSelector(state => state);

  // Initialize or reset the transaction manager when dependencies change
  useEffect(() => {
    isMountedRef.current = true;

    // Reset state and manager first
    setTransactionState({ status: 'idle' });
    setLoadMoreState({ status: 'idle' });
    managerRef.current = null;

    // Check required conditions - wallet address is required
    if (walletAddress == null || walletAddress === '') {
      return;
    }

    // Check if Alchemy is available using the centralized function
    const initializeManager = async () => {
      try {
        // For supported networks, we require an API key
        if (network !== 'custom' && !apiKeyConfigured) {
          return; // Don't initialize if API key is not configured for supported networks
        }

        // Set loading state immediately for any initialization attempt
        setTransactionState({ status: 'loading' });

        // Check if Alchemy is available using the centralized function
        const alchemyUrl = await getAlchemyRpcUrl(network, perAccountState);
        if (alchemyUrl == null || alchemyUrl === '') {
          // For networks without Alchemy, show "no transactions found" state
          setTransactionState({ status: 'success', transactions: [], hasMore: false });
          return;
        }

        managerRef.current = new TransactionManager({
          network,
          perAccountState,
          walletAddress,
          tandapayContractAddress: tandapayContractAddress != null ? tandapayContractAddress : null,
        });

        // Trigger initial load automatically
        if (!isMountedRef.current) {
          return;
        }

        const manager = managerRef.current;
        if (!manager) {
          return;
        }

        setLoadMoreState({ status: 'loading' });

        await manager.loadMore();

        if (!isMountedRef.current) {
          return;
        }

        const transactions = manager.getOrderedTransactions();
        const hasMore = !manager.isAtLastPage();

        setTransactionState({ status: 'success', transactions, hasMore });
        setLoadMoreState(hasMore ? { status: 'idle' } : { status: 'complete' });
      } catch (error) {
        const tandaPayError = TandaPayErrorHandler.createError('VALIDATION_ERROR', error.message || 'Failed to initialize TransactionManager', {
          userMessage: 'Failed to initialize transaction manager. Please try again.',
          details: error,
        });
        setTransactionState({ status: 'error', error: tandaPayError });
      }
    };

    initializeManager();

    return () => {
      isMountedRef.current = false;
    };
  }, [walletAddress, apiKeyConfigured, network, tandapayContractAddress, perAccountState]);

  const loadMore = useCallback(async () => {
    const manager = managerRef.current;
    if (!manager || !isMountedRef.current) {
      return;
    }

    if (loadMoreState.status === 'loading') {
      return;
    }

    try {
      setLoadMoreState({ status: 'loading' });

      // If this is the first load, also set main state to loading
      if (transactionState.status === 'idle') {
        setTransactionState({ status: 'loading' });
      }

      await manager.loadMore();

      if (!isMountedRef.current) {
        return;
      }

      const transactions = manager.getOrderedTransactions();
      const hasMore = !manager.isAtLastPage();

      setTransactionState({
        status: 'success',
        transactions,
        hasMore,
      });

      setLoadMoreState(hasMore ? { status: 'idle' } : { status: 'complete' });
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      const tandaPayError = TandaPayErrorHandler.createError('API_ERROR', error.message || 'Failed to load more transactions', {
        userMessage: 'Failed to load transaction history. Please try again.',
        details: error,
      });
      setTransactionState({ status: 'error', error: tandaPayError });
      setLoadMoreState({ status: 'idle' });
    }
  }, [transactionState.status, loadMoreState.status]);

  const refresh = useCallback(async () => {
    // Check required conditions first
    if (!apiKeyConfigured || walletAddress == null || walletAddress === '') {
      return;
    }

    try {
      // Reset the manager and states
      managerRef.current = null;
      setLoadMoreState({ status: 'idle' });
      setTransactionState({ status: 'loading' });

      // Create a new manager
      managerRef.current = new TransactionManager({
        network,
        walletAddress,
        tandapayContractAddress: tandapayContractAddress != null ? tandapayContractAddress : null,
      });

      // Immediately start loading
      await loadMore();
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      const tandaPayError = TandaPayErrorHandler.createError('API_ERROR', error.message || 'Failed to refresh transactions', {
        userMessage: 'Failed to refresh transaction history. Please try again.',
        details: error,
      });
      setTransactionState({ status: 'error', error: tandaPayError });
    }
  }, [apiKeyConfigured, walletAddress, network, tandapayContractAddress, loadMore]);

  return {
    transactionState,
    loadMoreState,
    loadMore,
    refresh,
  };
}
