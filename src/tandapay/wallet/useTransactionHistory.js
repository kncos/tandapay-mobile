// @flow strict-local

/**
 * Transaction history hook using ChronologicalTransferManager
 *
 * This replaces the old transaction fetching logic with the new robust system
 * that properly handles deduplication and chronological ordering.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import { AlchemyTransferFetcher } from './AlchemyTransferFetcher';
import { ChronologicalTransferManager } from './ChronologicalTransferManager';
import { hasAlchemyApiKey } from './AlchemyApiHelper';
import type { SupportedNetwork } from '../definitions';
import type { TandaPayError } from '../errors/types';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import { convertTransferToEtherscanFormat } from './TransactionFormatter';

type Transfer = mixed;

export type TransactionState =
  | {| status: 'idle' |}
  | {| status: 'loading' |}
  | {| status: 'success', transfers: $ReadOnlyArray<Transfer>, hasMore: boolean |}
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
  getStats: () => ?{|
    outgoingTransfers: number,
    incomingTransfers: number,
    combinedFeed: number,
    feedPosition: number,
    currentPage: number,
    hasMoreIncoming: boolean,
    hasMoreOutgoing: boolean,
    isInitialized: boolean,
  |},
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
  const alchemyFetcherRef = useRef<?AlchemyTransferFetcher>(null);
  const managerRef = useRef<?ChronologicalTransferManager>(null);

  // Helper function to process raw transfers into etherscan format
  const processTransfers = useCallback(async (rawTransfers: $ReadOnlyArray<Transfer>) => {
    if (walletAddress == null || walletAddress === '') {
      return rawTransfers;
    }

    try {
      const processedTransfers = await Promise.all(
        rawTransfers.map(async (transfer) => {
          try {
            const result = await convertTransferToEtherscanFormat(transfer, walletAddress, tandaPayContractAddress, network);
            return result;
          } catch (error) {
            // If processing fails, return the original transfer
            return transfer;
          }
        })
      );
      return processedTransfers;
    } catch (error) {
      // If all processing fails, return original transfers
      return rawTransfers;
    }
  }, [walletAddress, tandaPayContractAddress, network]);

  // Initialize Alchemy and managers when needed
  const initializeManagers = useCallback(async () => {
    if (walletAddress == null || walletAddress === '' || !apiKeyConfigured) {
      return null;
    }

    try {
      // Check if API key is available using our helper
      if (!await hasAlchemyApiKey()) {
        return null;
      }

      // Create fetcher with the current network
      const alchemyFetcher = new AlchemyTransferFetcher(network);
      const manager = new ChronologicalTransferManager(alchemyFetcher, walletAddress, 10, 5);

      alchemyFetcherRef.current = alchemyFetcher;
      managerRef.current = manager;

      return manager;
    } catch (error) {
      return null;
    }
  }, [walletAddress, apiKeyConfigured, network]);

  // Reset when wallet, API key, network, or contract address changes
  useEffect(() => {
    setTransactionState({ status: 'idle' });
    setLoadMoreState({ status: 'idle' });

    // Clean up previous instances
    alchemyFetcherRef.current = null;
    managerRef.current = null;
  }, [walletAddress, apiKeyConfigured, network, tandaPayContractAddress]);

  // Fetch initial transactions
  const fetchInitialTransactions = useCallback(async () => {
    if (walletAddress == null || walletAddress === '') {
      return;
    }

    setTransactionState({ status: 'loading' });

    try {
      const manager = await initializeManagers();
      if (!manager) {
        throw TandaPayErrorHandler.createError(
          'API_ERROR',
          'Unable to initialize Alchemy API',
          {
            userMessage: 'Please configure an Alchemy API key in wallet settings to view transaction history.'
          }
        );
      }

      const result = await manager.getMoreTransactions();

      // Process the transactions before setting state
      const processedTransfers = await processTransfers(result.transfers);

      setTransactionState({
        status: 'success',
        transfers: processedTransfers,
        hasMore: result.metadata.hasMore,
      });
    } catch (error) {
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
  }, [walletAddress, initializeManagers, processTransfers]);

  // Initial fetch effect
  useEffect(() => {
    if (
      walletAddress != null
      && walletAddress !== ''
      && apiKeyConfigured
      && transactionState.status === 'idle'
    ) {
      fetchInitialTransactions();
    }
  }, [walletAddress, apiKeyConfigured, transactionState.status, fetchInitialTransactions]);

  // Load more transactions
  const loadMore = useCallback(async () => {
    if (
      walletAddress == null
      || walletAddress === ''
      || transactionState.status !== 'success'
      || !transactionState.hasMore
      || loadMoreState.status === 'loading'
      || loadMoreState.status === 'complete'
      || !managerRef.current
    ) {
      return;
    }

    setLoadMoreState({ status: 'loading' });

    try {
      if (managerRef.current == null) {
        return;
      }

      const result = await managerRef.current.getMoreTransactions();

      // Process the new transactions before adding them
      const processedNewTransfers = await processTransfers(result.transfers);

      setTransactionState({
        status: 'success',
        transfers: [...transactionState.transfers, ...processedNewTransfers],
        hasMore: result.metadata.hasMore,
      });

      setLoadMoreState(result.metadata.hasMore ? { status: 'idle' } : { status: 'complete' });
    } catch (error) {
      // For load more errors, just mark as complete
      setLoadMoreState({ status: 'complete' });
    }
  }, [walletAddress, transactionState, loadMoreState.status, processTransfers]);

  // Refresh functionality
  const refresh = useCallback(() => {
    setTransactionState({ status: 'idle' });
    setLoadMoreState({ status: 'idle' });

    // Reset the manager
    if (managerRef.current) {
      managerRef.current.reset();
    }
  }, []);

  // Get statistics
  const getStats = useCallback(() =>
    managerRef.current ? managerRef.current.getStats() : null,
  []);

  // Cleanup on unmount
  useEffect(() => () => {
    // Clear refs on unmount
    alchemyFetcherRef.current = null;
    managerRef.current = null;
  }, []);

  return {
    transactionState,
    loadMoreState,
    loadMore,
    refresh,
    getStats,
  };
}
