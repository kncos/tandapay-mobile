// @flow strict-local

/**
 * Transaction history hook using ChronologicalTransferManager
 *
 * This replaces the old transaction fetching logic with the new robust system
 * that properly handles deduplication and chronological ordering.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
// $FlowFixMe[untyped-import] - alchemy-sdk is untyped
import { Alchemy, Network } from 'alchemy-sdk';
import { AlchemyTransferFetcher } from './AlchemyTransferFetcher';
import { ChronologicalTransferManager } from './ChronologicalTransferManager';
import { getAlchemyApiKey } from './WalletManager';
import { getChainByNetwork } from '../definitions';
import type { TandaPayError } from '../errors/types';
import TandaPayErrorHandler from '../errors/ErrorHandler';

type Transfer = mixed;

/**
 * Map network name to Alchemy network constant using chain definitions
 */
function getAlchemyNetwork(networkName: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'): typeof Network.ETH_MAINNET {
  const chainConfig = getChainByNetwork(networkName);

  switch (chainConfig.id) {
    case 1:
      // $FlowFixMe[untyped-import] - alchemy-sdk Network is untyped
      return Network.ETH_MAINNET;
    case 11155111:
      // $FlowFixMe[untyped-import] - alchemy-sdk Network is untyped
      return Network.ETH_SEPOLIA;
    case 42161:
      // $FlowFixMe[untyped-import] - alchemy-sdk Network is untyped
      return Network.ARB_MAINNET;
    case 137:
      // $FlowFixMe[untyped-import] - alchemy-sdk Network is untyped
      return Network.MATIC_MAINNET;
    default:
      // $FlowFixMe[untyped-import] - alchemy-sdk Network is untyped
      return Network.ETH_SEPOLIA; // Default to Sepolia
  }
}

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
  network?: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon',
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
}: UseTransactionHistoryProps): UseTransactionHistoryReturn {
  const [transactionState, setTransactionState] = useState<TransactionState>({ status: 'idle' });
  const [loadMoreState, setLoadMoreState] = useState<LoadMoreState>({ status: 'idle' });

  // Use refs to maintain instances across re-renders
  const alchemyFetcherRef = useRef<?AlchemyTransferFetcher>(null);
  const managerRef = useRef<?ChronologicalTransferManager>(null);

  // Initialize Alchemy and managers when needed
  const initializeManagers = useCallback(async () => {
    if (walletAddress == null || walletAddress === '' || !apiKeyConfigured) {
      return null;
    }

    try {
      const apiKeyResult = await getAlchemyApiKey();
      if (!apiKeyResult.success || apiKeyResult.data == null || apiKeyResult.data === '') {
        return null;
      }

      const apiKey = apiKeyResult.data;

      // Use our centralized chain definitions to get the Alchemy network
      const alchemyNetwork = getAlchemyNetwork(network);

      // $FlowFixMe[untyped-import] - alchemy-sdk Alchemy is untyped
      const alchemy = new Alchemy({
        apiKey,
        network: alchemyNetwork,
      });

      const alchemyFetcher = new AlchemyTransferFetcher(alchemy);
      const manager = new ChronologicalTransferManager(alchemyFetcher, walletAddress, 10, 5);

      alchemyFetcherRef.current = alchemyFetcher;
      managerRef.current = manager;

      return manager;
    } catch (error) {
      return null;
    }
  }, [walletAddress, apiKeyConfigured, network]);

  // Reset when wallet, API key, or network changes
  useEffect(() => {
    setTransactionState({ status: 'idle' });
    setLoadMoreState({ status: 'idle' });

    // Clean up previous instances
    alchemyFetcherRef.current = null;
    managerRef.current = null;
  }, [walletAddress, apiKeyConfigured, network]);

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

      setTransactionState({
        status: 'success',
        transfers: result.transfers,
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
  }, [walletAddress, initializeManagers]);

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

      setTransactionState({
        status: 'success',
        transfers: [...transactionState.transfers, ...result.transfers],
        hasMore: result.metadata.hasMore,
      });

      setLoadMoreState(result.metadata.hasMore ? { status: 'idle' } : { status: 'complete' });
    } catch (error) {
      // For load more errors, just mark as complete
      setLoadMoreState({ status: 'complete' });
    }
  }, [walletAddress, transactionState, loadMoreState.status]);

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
