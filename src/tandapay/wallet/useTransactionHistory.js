// @flow strict-local

/**
 * Transaction history hook using ChronologicalTransferManager
 *
 * This replaces the old transaction fetching logic with the new robust system
 * that properly handles deduplication and chronological ordering.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import SimpleTransactionManager from './SimpleTransactionManager';
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

// Global lock to prevent multiple manager instances from running simultaneously
let globalManagerLock = false;

export default function useTransactionHistory({
  walletAddress,
  apiKeyConfigured,
  network = 'sepolia',
  tandaPayContractAddress,
}: UseTransactionHistoryProps): UseTransactionHistoryReturn {
  const [transactionState, setTransactionState] = useState<TransactionState>({ status: 'idle' });
  const [loadMoreState, setLoadMoreState] = useState<LoadMoreState>({ status: 'idle' });

  // Use refs to maintain instances across re-renders
  const managerRef = useRef<?SimpleTransactionManager>(null);
  const isMountedRef = useRef<boolean>(true);

  // Helper function to process raw transfers into etherscan format
  const processTransfers = useCallback(async (rawTransfers: $ReadOnlyArray<Transfer>) => {
    console.log('[useTransactionHistory] processTransfers called with', rawTransfers.length, 'transfers');
    
    if (walletAddress == null || walletAddress === '' || !isMountedRef.current) {
      return rawTransfers;
    }

    try {
      const processedTransfers = await Promise.all(
        rawTransfers.map(async (transfer, index) => {
          if (!isMountedRef.current) {
            return transfer;
          }
          try {
            const result = await convertTransferToEtherscanFormat(transfer, walletAddress, tandaPayContractAddress, network);
            console.log('[useTransactionHistory] Processed transfer', index + 1, 'of', rawTransfers.length, ':', {
              hash: result.hash,
              direction: result.direction,
              asset: result.asset,
              isTandaPayTransaction: result.isTandaPayTransaction,
              formattedValue: result.formattedValue
            });
            return result;
          } catch (error) {
            console.log('[useTransactionHistory] Failed to process transfer', index + 1, ':', error.message);
            // If processing fails, return the original transfer
            return transfer;
          }
        })
      );

      if (!isMountedRef.current) {
        return rawTransfers;
      }

      console.log('[useTransactionHistory] processTransfers completed:', {
        input: rawTransfers.length,
        output: processedTransfers.length
      });

      return processedTransfers;
    } catch (error) {
      console.log('[useTransactionHistory] processTransfers failed:', error.message);
      // If all processing fails, return original transfers
      return rawTransfers;
    }
  }, [walletAddress, tandaPayContractAddress, network]);

  // Track current manager configuration
  const managerConfigRef = useRef<?{| address: string, network: SupportedNetwork |}>(null);

  // Initialize Alchemy and managers when needed
  const initializeManagers = useCallback(async () => {
    if (walletAddress == null || walletAddress === '' || !apiKeyConfigured || !isMountedRef.current) {
      return null;
    }

    // Check if we already have a manager for this address and network
    if (managerRef.current 
        && managerConfigRef.current
        && managerConfigRef.current.address === walletAddress
        && managerConfigRef.current.network === network) {
      console.log('[useTransactionHistory] Reusing existing manager for:', walletAddress.slice(0, 10) + '...');
      return managerRef.current;
    }

    // Prevent multiple simultaneous manager creations
    if (globalManagerLock) {
      console.log('[useTransactionHistory] Global manager lock active, waiting...');
      // Wait a bit and retry once
      await new Promise(resolve => setTimeout(resolve, 150));
      if (globalManagerLock) {
        console.log('[useTransactionHistory] Global manager lock still active, skipping manager initialization');
        return null;
      }
    }

    console.log('[useTransactionHistory] Creating new manager instance for address:', walletAddress.slice(0, 10) + '...');
    globalManagerLock = true;

    try {
      // Check if API key is available using our helper
      if (!await hasAlchemyApiKey()) {
        return null;
      }

      if (!isMountedRef.current) {
        return null;
      }

      // Double-check that another instance wasn't created while we were waiting
      if (managerRef.current && 
          managerConfigRef.current &&
          managerConfigRef.current.address === walletAddress &&
          managerConfigRef.current.network === network) {
        console.log('[useTransactionHistory] Manager was created by another call, using existing one');
        return managerRef.current;
      }

      // Create SimpleTransactionManager
      const manager = new SimpleTransactionManager(walletAddress, network);

      managerRef.current = manager;
      managerConfigRef.current = { address: walletAddress, network };

      console.log('[useTransactionHistory] Manager creation completed successfully');
      return manager;
    } catch (error) {
      console.log('[useTransactionHistory] Manager creation failed:', error.message);
      return null;
    } finally {
      globalManagerLock = false;
    }
  }, [walletAddress, apiKeyConfigured, network]);

  // Reset when wallet, API key, network, or contract address changes
  useEffect(() => {
    setTransactionState({ status: 'idle' });
    setLoadMoreState({ status: 'idle' });

    // Clean up previous instances
    managerRef.current = null;
    managerConfigRef.current = null;
  }, [walletAddress, apiKeyConfigured, network, tandaPayContractAddress]);

  // Fetch initial transactions
  const fetchInitialTransactions = useCallback(async () => {
    if (walletAddress == null || walletAddress === '') {
      return;
    }

    if (!isMountedRef.current) {
      return;
    }

    // Prevent concurrent calls
    if (transactionState.status === 'loading') {
      console.log('[useTransactionHistory] fetchInitialTransactions already loading, skipping');
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

      if (!isMountedRef.current) {
        return;
      }

      setTransactionState({
        status: 'success',
        transfers: processedTransfers,
        hasMore: result.hasMore,
      });
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

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
  }, [walletAddress, initializeManagers, processTransfers, transactionState.status]);

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
    console.log('[useTransactionHistory] loadMore called:', {
      walletAddress: walletAddress ? walletAddress.slice(0, 10) + '...' : 'null',
      transactionStateStatus: transactionState.status,
      hasMore: transactionState.status === 'success' ? transactionState.hasMore : null,
      loadMoreStateStatus: loadMoreState.status,
      currentTransferCount: transactionState.status === 'success' ? transactionState.transfers.length : 0
    });

    if (
      walletAddress == null
      || walletAddress === ''
      || transactionState.status !== 'success'
      || !transactionState.hasMore
      || loadMoreState.status === 'loading'
      || loadMoreState.status === 'complete'
      || !managerRef.current
      || !isMountedRef.current
    ) {
      console.log('[useTransactionHistory] loadMore early return due to conditions');
      return;
    }

    console.log('[useTransactionHistory] loadMore proceeding with current manager');
    setLoadMoreState({ status: 'loading' });

    try {
      const manager = managerRef.current;
      if (manager == null) {
        return;
      }

      console.log('[useTransactionHistory] Calling manager.getMoreTransactions()...');
      const result = await manager.getMoreTransactions();

      console.log('[useTransactionHistory] Got result from manager:', {
        newTransferCount: result.transfers.length,
        hasMore: result.hasMore,
        metadata: result.metadata
      });

      // Process the new transactions before adding them
      const processedNewTransfers = await processTransfers(result.transfers);

      if (!isMountedRef.current) {
        return;
      }

      console.log('[useTransactionHistory] Setting new transaction state:', {
        existingCount: transactionState.transfers.length,
        newCount: processedNewTransfers.length,
        totalCount: transactionState.transfers.length + processedNewTransfers.length,
        hasMore: result.hasMore
      });

      // Check for duplicates before adding
      const existingHashes = new Set(transactionState.transfers.map(t => {
        const tx = (t: any);
        return `${tx.hash}-${tx.direction}`;
      }));

      const deduplicatedNewTransfers = processedNewTransfers.filter(t => {
        const tx = (t: any);
        const key = `${tx.hash}-${tx.direction}`;
        if (existingHashes.has(key)) {
          console.log('[useTransactionHistory] Filtering out duplicate:', key);
          return false;
        }
        existingHashes.add(key);
        return true;
      });

      console.log('[useTransactionHistory] After deduplication:', {
        originalNewCount: processedNewTransfers.length,
        deduplicatedCount: deduplicatedNewTransfers.length,
        duplicatesFiltered: processedNewTransfers.length - deduplicatedNewTransfers.length
      });

      setTransactionState({
        status: 'success',
        transfers: [...transactionState.transfers, ...deduplicatedNewTransfers],
        hasMore: result.hasMore,
      });

      setLoadMoreState(result.hasMore ? { status: 'idle' } : { status: 'complete' });
    } catch (error) {
      console.log('[useTransactionHistory] loadMore error:', error.message);
      if (!isMountedRef.current) {
        return;
      }
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
    isMountedRef.current = false;
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
