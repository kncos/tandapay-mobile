// @flow strict-local

/**
 * Transaction history hook using TransactionManagerNew
 *
 * This replaces the old transaction fetching logic with the new robust system
 * that properly handles deduplication and chronological ordering.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import type { SupportedNetwork } from '../definitions';
import type { TandaPayError } from '../errors/types';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import { TransactionManager } from './TransactionManagerNew';
import type { FullTransaction } from './FullTransaction';

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
  network?: SupportedNetwork,
  tandaPayContractAddress?: ?string,
|};

type UseTransactionHistoryReturn = {|
  transactionState: TransactionState,
  loadMoreState: LoadMoreState,
  loadMore: () => Promise<void>,
  refresh: () => void,
|};

export default function useTransactionHistory({
  walletAddress,
  apiKeyConfigured,
  network = 'sepolia',
  tandaPayContractAddress,
}: UseTransactionHistoryProps): UseTransactionHistoryReturn {
  const [transactionState, setTransactionState] = useState<TransactionState>({ status: 'idle' });
  const [loadMoreState, setLoadMoreState] = useState<LoadMoreState>({ status: 'idle' });

  // Use refs to maintain instances across re-renders
  const managerRef = useRef<?TransactionManager>(null);
  const isMountedRef = useRef<boolean>(true);

  // Initialize or reset the transaction manager when dependencies change
  useEffect(() => {
    isMountedRef.current = true;

    if (!apiKeyConfigured || walletAddress == null || walletAddress === '' || tandaPayContractAddress == null || tandaPayContractAddress === '') {
      managerRef.current = null;
      setTransactionState({ status: 'idle' });
      setLoadMoreState({ status: 'idle' });
      return;
    }

    try {
      managerRef.current = new TransactionManager(
        network,
        walletAddress,
        tandaPayContractAddress,
      );
      // eslint-disable-next-line no-console
      console.log('[useTransactionHistory] TransactionManager initialized');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[useTransactionHistory] Failed to initialize TransactionManager:', error);
      const tandaPayError = TandaPayErrorHandler.createError('VALIDATION_ERROR', error.message || 'Failed to initialize TransactionManager', {
        userMessage: 'Failed to initialize transaction manager. Please try again.',
        details: error,
      });
      setTransactionState({ status: 'error', error: tandaPayError });
      managerRef.current = null;
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [walletAddress, apiKeyConfigured, network, tandaPayContractAddress]);

  const loadMore = useCallback(async () => {
    const manager = managerRef.current;
    if (!manager || !isMountedRef.current) {
      // eslint-disable-next-line no-console
      console.warn('[useTransactionHistory] loadMore called but manager not available');
      return;
    }

    if (loadMoreState.status === 'loading') {
      // eslint-disable-next-line no-console
      console.warn('[useTransactionHistory] loadMore already in progress');
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

      // eslint-disable-next-line no-console
      console.log('[useTransactionHistory] loadMore completed:', {
        transactionCount: transactions.length,
        hasMore,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[useTransactionHistory] loadMore failed:', error);

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

  const refresh = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('[useTransactionHistory] refresh called');

    // Reset all state
    setTransactionState({ status: 'idle' });
    setLoadMoreState({ status: 'idle' });

    // Reinitialize the manager if we have the required parameters
    if (apiKeyConfigured && walletAddress != null && walletAddress !== '' && tandaPayContractAddress != null && tandaPayContractAddress !== '') {
      try {
        managerRef.current = new TransactionManager(
          network,
          walletAddress,
          tandaPayContractAddress,
        );
        // eslint-disable-next-line no-console
        console.log('[useTransactionHistory] TransactionManager reinitialized on refresh');

        // Don't trigger initial load here - let the component call loadMore when needed
        // This prevents race conditions and infinite loops
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[useTransactionHistory] Failed to reinitialize TransactionManager on refresh:', error);
        const tandaPayError = TandaPayErrorHandler.createError('API_ERROR', error.message || 'Failed to reinitialize TransactionManager', {
          userMessage: 'Failed to reinitialize transaction manager. Please try again.',
          details: error,
        });
        setTransactionState({ status: 'error', error: tandaPayError });
      }
    }
  }, [apiKeyConfigured, walletAddress, tandaPayContractAddress, network]);

  return {
    transactionState,
    loadMoreState,
    loadMore,
    refresh,
  };
}
