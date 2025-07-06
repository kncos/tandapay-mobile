// @flow strict-local

/**
 * Simple Transaction Manager - A clean, robust approach to paginated transaction feeds
 *
 * This manager uses a much simpler strategy:
 * 1. Fetch pages from both directions independently
 * 2. Merge and sort all fetched transactions chronologically
 * 3. Serve the next N transactions from the sorted list
 * 4. When buffer runs low, fetch more pages from both directions
 *
 * No complex feed position tracking - just simple buffer management.
 */

import { AlchemyTransferFetcher } from './AlchemyTransferFetcher';
import type { SupportedNetwork } from '../definitions/types';

type Transfer = mixed;

type TransferPage = {
  transfers: Array<Transfer>,
  hasMore: boolean,
  pageKey: string | null,
};

export type SimpleTransactionResult = {
  transfers: Array<Transfer>,
  hasMore: boolean,
  metadata: {
    totalInBuffer: number,
    totalServed: number,
    incomingPages: number,
    outgoingPages: number,
    hasMoreIncoming: boolean,
    hasMoreOutgoing: boolean,
  },
};

export default class SimpleTransactionManager {
  _walletAddress: string;
  _network: SupportedNetwork;
  _fetcher: AlchemyTransferFetcher;

  // Simple buffers for each direction
  _incomingTransfers: Array<Transfer> = [];
  _outgoingTransfers: Array<Transfer> = [];

  // Pagination state
  _incomingPageKey: string | null = null;
  _outgoingPageKey: string | null = null;
  _hasMoreIncoming: boolean = true;
  _hasMoreOutgoing: boolean = true;
  _incomingPages: number = 0;
  _outgoingPages: number = 0;

  // Combined sorted buffer
  _sortedTransfers: Array<Transfer> = [];
  _totalServed: number = 0;

  // Configuration
  _pageSize: number = 25;
  _serveSize: number = 10; // How many to serve per request
  _bufferThreshold: number = 20; // When to fetch more
  
  // Synchronization to prevent concurrent fetching
  _isFetching: boolean = false;

  constructor(walletAddress: string, network: SupportedNetwork = 'sepolia') {
    this._walletAddress = walletAddress;
    this._network = network;
    this._fetcher = new AlchemyTransferFetcher(network);

    console.log('[SimpleTransactionManager] Created for address:', `${walletAddress.slice(0, 10)}...`);
  }

  /**
   * Get the next batch of transactions
   */
  async getMoreTransactions(): Promise<SimpleTransactionResult> {
    console.log('[SimpleTransactionManager] getMoreTransactions called:', {
      totalServed: this._totalServed,
      bufferSize: this._sortedTransfers.length,
      hasMoreIncoming: this._hasMoreIncoming,
      hasMoreOutgoing: this._hasMoreOutgoing,
    });

    // Ensure we have enough transactions in buffer
    await this._ensureBufferSize();

    // Serve the next batch from sorted buffer
    const availableCount = this._sortedTransfers.length - this._totalServed;
    const toServe = Math.min(this._serveSize, availableCount);

    const transfers = this._sortedTransfers.slice(this._totalServed, this._totalServed + toServe);
    this._totalServed += toServe;

    const hasMore = this._totalServed < this._sortedTransfers.length
                   || this._hasMoreIncoming
                   || this._hasMoreOutgoing;

    console.log('[SimpleTransactionManager] Serving transactions:', {
      served: toServe,
      totalServed: this._totalServed,
      bufferSize: this._sortedTransfers.length,
      hasMore,
    });

    return {
      transfers,
      hasMore,
      metadata: {
        totalInBuffer: this._sortedTransfers.length,
        totalServed: this._totalServed,
        incomingPages: this._incomingPages,
        outgoingPages: this._outgoingPages,
        hasMoreIncoming: this._hasMoreIncoming,
        hasMoreOutgoing: this._hasMoreOutgoing,
      },
    };
  }

  /**
   * Ensure we have enough transactions in the buffer
   */
  async _ensureBufferSize(): Promise<void> {
    const availableCount = this._sortedTransfers.length - this._totalServed;

    // If we have enough in buffer and can't fetch more, we're done
    if (availableCount >= this._bufferThreshold
        || (!this._hasMoreIncoming && !this._hasMoreOutgoing)) {
      return;
    }

    // Prevent concurrent fetching
    if (this._isFetching) {
      console.log('[SimpleTransactionManager] Already fetching, skipping...');
      return;
    }

    console.log('[SimpleTransactionManager] Buffer low, fetching more pages...', {
      available: availableCount,
      threshold: this._bufferThreshold,
    });

    this._isFetching = true;

    try {
      // Fetch more pages from both directions if possible
      const promises = [];

      if (this._hasMoreIncoming) {
        promises.push(this._fetchIncomingPage());
      }

      if (this._hasMoreOutgoing) {
        promises.push(this._fetchOutgoingPage());
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        this._rebuildSortedBuffer();
      }
    } finally {
      this._isFetching = false;
    }
  }

  /**
   * Fetch the next page of incoming transfers
   */
  async _fetchIncomingPage(): Promise<void> {
    if (!this._hasMoreIncoming)
{ return; }

    try {
      const result = await this._fetcher.fetchTransfers(
        this._walletAddress,
        'incoming',
        this._incomingPages + 1,
        this._pageSize
      );

      console.log('[SimpleTransactionManager] Fetched incoming page:', {
        page: this._incomingPages + 1,
        count: result.transfers.length,
        hasMore: result.hasMore,
      });

      // Cast the mixed transfers to our Transfer type
      const typedTransfers = (result.transfers: Array<Transfer>);
      this._incomingTransfers.push(...typedTransfers);
      this._incomingPageKey = result.pageKey != null ? result.pageKey : null;
      this._hasMoreIncoming = result.hasMore;
      this._incomingPages++;
    } catch (error) {
      console.error('[SimpleTransactionManager] Error fetching incoming:', error);
      this._hasMoreIncoming = false;
    }
  }

  /**
   * Fetch the next page of outgoing transfers
   */
  async _fetchOutgoingPage(): Promise<void> {
    if (!this._hasMoreOutgoing)
{ return; }

    try {
      const result = await this._fetcher.fetchTransfers(
        this._walletAddress,
        'outgoing',
        this._outgoingPages + 1,
        this._pageSize
      );

      console.log('[SimpleTransactionManager] Fetched outgoing page:', {
        page: this._outgoingPages + 1,
        count: result.transfers.length,
        hasMore: result.hasMore,
      });

      // Cast the mixed transfers to our Transfer type
      const typedTransfers = (result.transfers: Array<Transfer>);
      this._outgoingTransfers.push(...typedTransfers);
      this._outgoingPageKey = result.pageKey != null ? result.pageKey : null;
      this._hasMoreOutgoing = result.hasMore;
      this._outgoingPages++;
    } catch (error) {
      console.error('[SimpleTransactionManager] Error fetching outgoing:', error);
      this._hasMoreOutgoing = false;
    }
  }

  /**
   * Rebuild the sorted buffer from all fetched transfers
   */
  _rebuildSortedBuffer(): void {
    console.log('[SimpleTransactionManager] Rebuilding sorted buffer...', {
      incoming: this._incomingTransfers.length,
      outgoing: this._outgoingTransfers.length,
    });

    // Combine all transfers
    const allTransfers = [
      ...this._incomingTransfers,
      ...this._outgoingTransfers,
    ];

    // Deduplicate by hash+direction key
    const deduped = this._deduplicateTransfers(allTransfers);

    // Sort chronologically (newest first)
    this._sortedTransfers = this._sortTransfers(deduped);

    console.log('[SimpleTransactionManager] Buffer rebuilt:', {
      total: allTransfers.length,
      afterDedup: this._sortedTransfers.length,
      duplicatesRemoved: allTransfers.length - this._sortedTransfers.length,
    });
  }

  /**
   * Deduplicate transfers using the same logic as before
   */
  _deduplicateTransfers(transfers: Array<Transfer>): Array<Transfer> {
    const hashGroups = new Map();

    // Group by hash
    for (const transfer of transfers) {
      const tx = (transfer: any);
      const hash = tx.hash;
      if (!hashGroups.has(hash)) {
        hashGroups.set(hash, []);
      }
      hashGroups.get(hash)?.push(transfer);
    }

    const result = [];

    for (const [, group] of hashGroups) {
      if (group.length === 1) {
        // No duplicates
        result.push(group[0]);
      } else {
        // Handle duplicates - prefer tokens over ETH, keep different directions
        const byDirection = new Map();

        for (const transfer of group) {
          const tx = (transfer: any);
          const key = `${tx.direction}-${tx.asset}`;
          if (!byDirection.has(key)
              || (tx.asset !== 'ETH' && (byDirection.get(key): any)?.asset === 'ETH')) {
            byDirection.set(key, transfer);
          }
        }

        result.push(...Array.from(byDirection.values()));
      }
    }

    return result;
  }

  /**
   * Sort transfers chronologically (newest first)
   */
  _sortTransfers(transfers: Array<Transfer>): Array<Transfer> {
    return [...transfers].sort((a, b) => {
      const txA = (a: any);
      const txB = (b: any);

      // Parse block numbers
      const blockA = parseInt(txA.blockNum, 16);
      const blockB = parseInt(txB.blockNum, 16);

      if (blockA !== blockB) {
        return blockB - blockA; // Newer blocks first
      }

      // Same block, sort by timestamp
      const timeA = parseInt(txA.timeStamp, 10);
      const timeB = parseInt(txB.timeStamp, 10);

      if (timeA !== timeB) {
        return timeB - timeA; // Newer timestamps first
      }

      // Same timestamp, sort by hash for consistency
      return txA.hash.localeCompare(txB.hash);
    });
  }

  /**
   * Reset the manager (for refresh)
   */
  reset(): void {
    console.log('[SimpleTransactionManager] Resetting...');

    this._incomingTransfers = [];
    this._outgoingTransfers = [];
    this._sortedTransfers = [];
    this._totalServed = 0;

    this._incomingPageKey = null;
    this._outgoingPageKey = null;
    this._hasMoreIncoming = true;
    this._hasMoreOutgoing = true;
    this._incomingPages = 0;
    this._outgoingPages = 0;
    this._isFetching = false;
  }

  /**
   * Get statistics for debugging/monitoring
   */
  getStats(): {|
    outgoingTransfers: number,
    incomingTransfers: number,
    combinedFeed: number,
    feedPosition: number,
    currentPage: number,
    hasMoreIncoming: boolean,
    hasMoreOutgoing: boolean,
    isInitialized: boolean,
  |} {
    return {
      outgoingTransfers: this._outgoingTransfers.length,
      incomingTransfers: this._incomingTransfers.length,
      combinedFeed: this._sortedTransfers.length,
      feedPosition: this._totalServed,
      currentPage: Math.max(this._incomingPages, this._outgoingPages),
      hasMoreIncoming: this._hasMoreIncoming,
      hasMoreOutgoing: this._hasMoreOutgoing,
      isInitialized: this._sortedTransfers.length > 0 || this._incomingPages > 0 || this._outgoingPages > 0,
    };
  }
}
