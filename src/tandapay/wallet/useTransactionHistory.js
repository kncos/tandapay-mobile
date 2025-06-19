/* @flow strict-local */

import { useState, useEffect, useCallback } from 'react';
import { fetchTransactionHistory } from './TransactionService';
import type { EtherscanTransaction } from './TransactionService';
import type { TandaPayError } from '../errors/types';
import TandaPayErrorHandler from '../errors/ErrorHandler';

export type TransactionState =
  | {| status: 'idle' |}
  | {| status: 'loading' |}
  | {| status: 'success', transactions: $ReadOnlyArray<EtherscanTransaction>, hasMore: boolean |}
  | {| status: 'error', error: TandaPayError |};

export type LoadMoreState =
  | {| status: 'idle' |}
  | {| status: 'loading' |}
  | {| status: 'complete' |};

type UseTransactionHistoryProps = {|
  walletAddress: ?string,
  apiKeyConfigured: boolean,
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
}: UseTransactionHistoryProps): UseTransactionHistoryReturn {
  const [transactionState, setTransactionState] = useState<TransactionState>({ status: 'idle' });
  const [loadMoreState, setLoadMoreState] = useState<LoadMoreState>({ status: 'idle' });
  const [currentPage, setCurrentPage] = useState(1);

  // Reset when wallet or API key changes
  useEffect(() => {
    setTransactionState({ status: 'idle' });
    setLoadMoreState({ status: 'idle' });
    setCurrentPage(1);
  }, [walletAddress, apiKeyConfigured]);  const fetchInitialTransactions = useCallback(async () => {
    if (walletAddress == null || walletAddress === '') {
      return;
    }

    setTransactionState({ status: 'loading' });

    try {
      const result = await fetchTransactionHistory(walletAddress, 1, 10);

      if (result.success) {
        const hasMore = result.data.length === 10;

        setTransactionState({
          status: 'success',
          transactions: result.data,
          hasMore,
        });
        setCurrentPage(1);
      } else {
        setTransactionState({ status: 'error', error: result.error });
      }
    } catch (error) {
      // Create a TandaPayError for unexpected errors
      const tandaPayError = TandaPayErrorHandler.createError(
        'API_ERROR',
        error.message || 'Failed to fetch transactions',
        {
          userMessage: 'Failed to load transaction history. Please try again.',
          details: error
        }
      );
      setTransactionState({
        status: 'error',
        error: tandaPayError,
      });
    }
  }, [walletAddress]);

  // Initial fetch
  useEffect(() => {
    if (
      walletAddress != null
      && walletAddress !== ''
      && apiKeyConfigured
      && transactionState.status === 'idle'
    ) {
      fetchInitialTransactions();
    }
  }, [walletAddress, apiKeyConfigured, transactionState.status, fetchInitialTransactions]);  const loadMore = useCallback(async () => {
    if (
      walletAddress == null
      || walletAddress === ''
      || transactionState.status !== 'success'
      || !transactionState.hasMore
      || loadMoreState.status === 'loading'
      || loadMoreState.status === 'complete'
    ) {
      return;
    }

    setLoadMoreState({ status: 'loading' });

    try {
      const nextPage = currentPage + 1;

      const result = await fetchTransactionHistory(walletAddress, nextPage, 10);

      if (result.success) {
        const hasMore = result.data.length === 10;

        setTransactionState({
          status: 'success',
          transactions: [...transactionState.transactions, ...result.data],
          hasMore,
        });

        setCurrentPage(nextPage);
        setLoadMoreState(hasMore ? { status: 'idle' } : { status: 'complete' });
      } else {
        // Treat "no more transactions" as completion, not error
        setLoadMoreState({ status: 'complete' });
      }
    } catch (error) {
      // For load more errors, just mark as complete
      setLoadMoreState({ status: 'complete' });
    }
  }, [walletAddress, transactionState, loadMoreState.status, currentPage]);

  const refresh = useCallback(() => {
    setTransactionState({ status: 'idle' });
    setLoadMoreState({ status: 'idle' });
    setCurrentPage(1);
  }, []);

  return {
    transactionState,
    loadMoreState,
    loadMore,
    refresh,
  };
}
