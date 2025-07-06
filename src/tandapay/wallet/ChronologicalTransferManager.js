// @flow strict-local

/**
 * ChronologicalTransferManager
 *
 * Manages chronological pagination of asset transfers by fetching pages from both
 * incoming and outgoing directions and merging them into a single chronological feed.
 *
 * Strategy:
 * 1. Fetch page N from both incoming and outgoing transfers
 * 2. Store all transfers in memory sorted by timestamp (descending)
 * 3. Return the next batch of transfers chronologically
 * 4. Keep track of position in the combined feed
 */

export class ChronologicalTransferManager {
  // $FlowFixMe[unclear-type] - AlchemyTransferFetcher instance
  alchemyFetcher: any;
  address: string;
  pageSize: number;
  bufferSize: number;
  fetchSize: number;
  outgoingTransfers: Array<mixed>;
  incomingTransfers: Array<mixed>;
  combinedFeed: Array<mixed>;
  currentPage: number;
  feedPosition: number;
  hasMoreOutgoing: boolean;
  hasMoreIncoming: boolean;
  isInitialized: boolean;
  isProcessing: boolean;

  // $FlowFixMe[unclear-type] - AlchemyTransferFetcher instance
  constructor(alchemyFetcher: any, address: string, pageSize: number = 10, bufferSize: number = 5) {
    this.alchemyFetcher = alchemyFetcher; // AlchemyTransferFetcher instance
    this.address = address; // Ethereum address to fetch transfers for
    this.pageSize = pageSize; // How many transfers to return per call
    this.bufferSize = bufferSize; // Extra transactions to maintain as buffer
    this.fetchSize = (pageSize * 2) + bufferSize; // Fetch extra to account for duplicates

    this.outgoingTransfers = []; // All outgoing transfers in memory
    this.incomingTransfers = []; // All incoming transfers in memory
    this.combinedFeed = []; // Combined chronological feed
    this.currentPage = 0; // Current page for outgoing/incoming fetches
    this.feedPosition = 0; // Current position in the combined feed
    this.hasMoreOutgoing = true; // Whether more outgoing transfers exist
    this.hasMoreIncoming = true; // Whether more incoming transfers exist
    this.isInitialized = false; // Whether we've made initial fetch
    this.isProcessing = false; // Lock to prevent concurrent operations
  }

  /**
   * Fetch the next batch of chronologically ordered transfers
   * @returns {Promise<Object>} Object with transfers array and metadata
   */
  async getMoreTransactions(): Promise<{|
    transfers: Array<mixed>,
    metadata: {|
      hasMore: boolean,
      message?: string,
      currentPosition?: number,
      totalInMemory?: number,
      remainingInBuffer?: number,
      page?: number,
      totalReturned?: number,
      fetcherStats?: ?mixed,
      pages?: mixed,
      stats?: mixed,
    |},
  |}> {
    console.log('[ChronologicalTransferManager] getMoreTransactions called:', {
      isInitialized: this.isInitialized,
      feedPosition: this.feedPosition,
      combinedFeedLength: this.combinedFeed.length,
      hasMoreOutgoing: this.hasMoreOutgoing,
      hasMoreIncoming: this.hasMoreIncoming,
      currentPage: this.currentPage,
      isProcessing: this.isProcessing
    });

    // Prevent concurrent processing
    if (this.isProcessing) {
      console.log('[ChronologicalTransferManager] Already processing, returning empty result');
      return {
        transfers: [],
        metadata: {
          hasMore: this._hasMoreData(),
          message: 'Processing in progress',
          currentPosition: this.feedPosition,
          totalInMemory: this.combinedFeed.length,
        }
      };
    }

    try {
      this.isProcessing = true;

      // If we haven't initialized or need more data, fetch it
      if (!this.isInitialized || this._needsMoreData()) {
        console.log('[ChronologicalTransferManager] Fetching more pages...');
        await this._fetchMorePages();
        this._rebuildCombinedFeed();
      }

      // Check if we have any transfers left
      const remainingTransfers = this.combinedFeed.length - this.feedPosition;

      if (remainingTransfers === 0 && !this._hasMoreFromAPI()) {
        return {
          transfers: [],
          metadata: {
            message: 'All caught up!',
            currentPosition: this.feedPosition,
            totalInMemory: this.combinedFeed.length,
            hasMore: false,
            remainingInBuffer: 0,
            pages: {
              outgoing: this.currentPage,
              incoming: this.currentPage,
            },
            stats: {
              outgoingInMemory: this.outgoingTransfers.length,
              incomingInMemory: this.incomingTransfers.length,
            }
          }
        };
      }

      // Get the next batch from our combined feed
      const startIndex = this.feedPosition;
      const endIndex = Math.min(startIndex + this.pageSize, this.combinedFeed.length);
      const transfers = this.combinedFeed.slice(startIndex, endIndex);

      // Update position
      this.feedPosition = endIndex;

      return {
        transfers,
        metadata: {
          currentPosition: this.feedPosition,
          totalInMemory: this.combinedFeed.length,
          hasMore: this._hasMoreData(),
          remainingInBuffer: this.combinedFeed.length - this.feedPosition,
          pages: {
            outgoing: this.currentPage,
            incoming: this.currentPage,
          },
          stats: {
            outgoingInMemory: this.outgoingTransfers.length,
            incomingInMemory: this.incomingTransfers.length,
          },
        },
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Reset the manager to start from the beginning
   */
  reset() {
    this.outgoingTransfers = [];
    this.incomingTransfers = [];
    this.combinedFeed = [];
    this.currentPage = 0;
    this.feedPosition = 0;
    this.hasMoreOutgoing = true;
    this.hasMoreIncoming = true;
    this.isInitialized = false;
    this.isProcessing = false;
  }

  /**
   * Get current statistics
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
      outgoingTransfers: this.outgoingTransfers.length,
      incomingTransfers: this.incomingTransfers.length,
      combinedFeed: this.combinedFeed.length,
      currentPage: this.currentPage,
      feedPosition: this.feedPosition,
      hasMoreOutgoing: this.hasMoreOutgoing,
      hasMoreIncoming: this.hasMoreIncoming,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Get AlchemyTransferFetcher session statistics
   */
  getFetcherStats(): ?mixed {
    return this.alchemyFetcher.getSessionStats(this.address);
  }

  /**
   * Check if we need to fetch more data (with buffer consideration)
   * @private
   */
  _needsMoreData() {
    // If we don't have enough data to serve another full page plus buffer
    const remainingInFeed = this.combinedFeed.length - this.feedPosition;
    const hasMoreData = this.hasMoreOutgoing || this.hasMoreIncoming;

    // Fetch more if we're approaching the buffer limit and more data exists
    return remainingInFeed <= (this.pageSize + this.bufferSize) && hasMoreData;
  }

  /**
   * Check if we have more data available (either in memory or from API)
   * @private
   */
  _hasMoreData() {
    const remainingInFeed = this.combinedFeed.length - this.feedPosition;
    const hasMoreFromAPI = this.hasMoreOutgoing || this.hasMoreIncoming;

    return remainingInFeed > 0 || hasMoreFromAPI;
  }

  /**
   * Check if we have more data available from API
   * @private
   */
  _hasMoreFromAPI() {
    return this.hasMoreOutgoing || this.hasMoreIncoming;
  }

  /**
   * Fetch the next page from both outgoing and incoming transfers
   * @private
   */
  async _fetchMorePages() {
    console.log('[ChronologicalTransferManager] _fetchMorePages called:', {
      currentPage: this.currentPage,
      hasMoreOutgoing: this.hasMoreOutgoing,
      hasMoreIncoming: this.hasMoreIncoming,
      outgoingCount: this.outgoingTransfers.length,
      incomingCount: this.incomingTransfers.length
    });

    const fetchPromises = [];

    // Fetch next outgoing page if available
    if (this.hasMoreOutgoing) {
      fetchPromises.push(
        this._fetchDirection('outgoing')
      );
    }

    // Fetch next incoming page if available
    if (this.hasMoreIncoming) {
      fetchPromises.push(
        this._fetchDirection('incoming')
      );
    }

    // Wait for all fetches to complete
    if (fetchPromises.length > 0) {
      await Promise.all(fetchPromises);
      this.currentPage++;
    }

    this.isInitialized = true;

    console.log('[ChronologicalTransferManager] _fetchMorePages completed:', {
      newCurrentPage: this.currentPage,
      newOutgoingCount: this.outgoingTransfers.length,
      newIncomingCount: this.incomingTransfers.length,
      hasMoreOutgoing: this.hasMoreOutgoing,
      hasMoreIncoming: this.hasMoreIncoming
    });
  }

  /**
   * Fetch transfers for a specific direction with proper size
   * @private
   */
  async _fetchDirection(direction) {
    try {
      const result = await this.alchemyFetcher.fetchTransfers(
        this.address,
        direction,
        this.currentPage + 1,
        this.fetchSize
      );

      if (result.transfers && result.transfers.length > 0) {
        if (direction === 'outgoing') {
          this.outgoingTransfers.push(...result.transfers);
          this.hasMoreOutgoing = result.hasMore !== false;
        } else {
          this.incomingTransfers.push(...result.transfers);
          this.hasMoreIncoming = result.hasMore !== false;
        }
      } else if (direction === 'outgoing') {
          this.hasMoreOutgoing = false;
        } else {
          this.hasMoreIncoming = false;
        }
    } catch (error) {
      // Log error silently and mark direction as complete
      if (direction === 'outgoing') {
        this.hasMoreOutgoing = false;
      } else {
        this.hasMoreIncoming = false;
      }
    }
  }

  /**
   * Remove zero-value ETH transfers that have corresponding token transfers
   * @private
   */
  _deduplicateTransfers(transfers) {
    console.log('[ChronologicalTransferManager] _deduplicateTransfers called with', transfers.length, 'transfers');

    const hashGroups = new Map();

    // Group by transaction hash
    for (const transfer of transfers) {
      // $FlowFixMe[prop-missing] - Transfer object structure is dynamic
      const hash = transfer.hash;
      if (!hashGroups.has(hash)) {
        hashGroups.set(hash, []);
      }
      // $FlowFixMe[incompatible-call] - Map.get may return undefined but we use has() above to ensure it exists
      const group = hashGroups.get(hash);
      if (group) {
        group.push(transfer);
      }
    }

    console.log('[ChronologicalTransferManager] Hash groups:', {
      uniqueHashes: hashGroups.size,
      duplicateHashes: Array.from(hashGroups.entries()).filter(([hash, group]) => group.length > 1).length
    });

    const deduplicated = [];

    for (const [hash, transferGroup] of hashGroups) {
      if (transferGroup.length === 1) {
        // Single transfer, keep it
        deduplicated.push(transferGroup[0]);
      } else {
        // Multiple transfers with same hash - smart deduplication
        console.log('[ChronologicalTransferManager] Processing duplicate group for hash:', hash, {
          count: transferGroup.length,
          directions: transferGroup.map(t => (t: any).direction),
          assets: transferGroup.map(t => (t: any).asset),
          categories: transferGroup.map(t => (t: any).category)
        });

        const tokenTransfers = transferGroup.filter(t =>
          // $FlowFixMe[prop-missing] - Transfer object structure is dynamic
          t.category !== 'external' && t.category !== 'internal'
        );
        // $FlowFixMe[prop-missing] - Transfer object structure is dynamic
        const ethTransfers = transferGroup.filter(t => t.asset === 'ETH');

        if (tokenTransfers.length > 0 && ethTransfers.length > 0) {
          // Keep token transfers and only non-zero ETH transfers
          const nonZeroEthTransfers = ethTransfers.filter(t =>
            // $FlowFixMe[prop-missing] - Transfer object structure is dynamic
            t.value && parseFloat(t.value) > 0
          );
          console.log('[ChronologicalTransferManager] Keeping', tokenTransfers.length, 'token transfers and', nonZeroEthTransfers.length, 'non-zero ETH transfers for hash:', hash);
          deduplicated.push(...tokenTransfers, ...nonZeroEthTransfers);
        } else {
          // No conflict, keep all
          console.log('[ChronologicalTransferManager] No conflict, keeping all', transferGroup.length, 'transfers for hash:', hash);
          deduplicated.push(...transferGroup);
        }
      }
    }

    console.log('[ChronologicalTransferManager] _deduplicateTransfers completed:', {
      input: transfers.length,
      output: deduplicated.length,
      removed: transfers.length - deduplicated.length
    });

    return deduplicated;
  }

  /**
   * Rebuild the combined chronological feed from all transfers in memory
   * @private
   */
  _rebuildCombinedFeed() {
    console.log('[ChronologicalTransferManager] _rebuildCombinedFeed called:', {
      outgoingCount: this.outgoingTransfers.length,
      incomingCount: this.incomingTransfers.length,
      currentCombinedFeedLength: this.combinedFeed.length,
      currentFeedPosition: this.feedPosition
    });

    // Store the current transactions that have been served to track position
    const previouslyServedHashes = this.combinedFeed.slice(0, this.feedPosition).map(t => (t: any).hash);

    // Combine all transfers
    const allTransfers = [
      ...this.outgoingTransfers.map((t) => ({ ...t, direction: 'OUT' })),
      ...this.incomingTransfers.map((t) => ({ ...t, direction: 'IN' })),
    ];

    console.log('[ChronologicalTransferManager] Combined transfers before deduplication:', {
      totalCount: allTransfers.length,
      outgoingAdded: this.outgoingTransfers.length,
      incomingAdded: this.incomingTransfers.length,
      previouslyServedCount: previouslyServedHashes.length
    });

    // Deduplicate transfers with same hash
    const deduplicated = this._deduplicateTransfers(allTransfers);

    console.log('[ChronologicalTransferManager] Deduplicated transfers:', {
      beforeDeduplication: allTransfers.length,
      afterDeduplication: deduplicated.length,
      duplicatesRemoved: allTransfers.length - deduplicated.length
    });

    // Sort by block number descending (most recent first), then by timestamp
    deduplicated.sort((a, b) => {
      // $FlowIgnore[unclear-type]
      const blockA = parseInt((a: any).blockNum, 16) || 0;
      // $FlowIgnore[unclear-type]
      const blockB = parseInt((b: any).blockNum, 16) || 0;

      // Primary sort: block number (descending)
      if (blockB !== blockA) {
        return blockB - blockA;
      }

      // Secondary sort: timestamp (descending) as fallback
      // $FlowIgnore[unclear-type]
      const timestampA = parseInt((a: any).metadata?.blockTimestamp || '0', 16) || 0;
      // $FlowIgnore[unclear-type]
      const timestampB = parseInt((b: any).metadata?.blockTimestamp || '0', 16) || 0;

      if (timestampB !== timestampA) {
        return timestampB - timestampA;
      }

      // Tertiary sort: transaction index within block (ascending for FIFO within block)
      // $FlowIgnore[unclear-type]
      const indexA = parseInt((a: any).transactionIndex || '0', 16) || 0;
      // $FlowIgnore[unclear-type]
      const indexB = parseInt((b: any).transactionIndex || '0', 16) || 0;

      return indexA - indexB;
    });

    // Log first 5 transactions for debugging
    console.log('[ChronologicalTransferManager] First 5 sorted transactions:', deduplicated.slice(0, 5).map(t => ({
      // $FlowIgnore[unclear-type]
      hash: `${((t: any).hash || '').slice(0, 10)}...`,
      // $FlowIgnore[unclear-type]
      blockNum: (t: any).blockNum,
      // $FlowIgnore[unclear-type]
      blockDecimal: parseInt((t: any).blockNum, 16),
      // $FlowIgnore[unclear-type]
      timestamp: (t: any).metadata?.blockTimestamp,
      // $FlowIgnore[unclear-type]
      direction: (t: any).direction,
      // $FlowIgnore[unclear-type]
      asset: (t: any).asset
    })));

    // Add detailed debugging to understand what's happening with the sort and positions
    if (previouslyServedHashes.length > 0) {
      console.log('[ChronologicalTransferManager] Debug: Previously served hashes:', 
        previouslyServedHashes.map(h => h.slice(0, 10) + '...'));
      console.log('[ChronologicalTransferManager] Debug: New sorted order (first 15):', 
        deduplicated.slice(0, 15).map((t, i) => ({
          position: i,
          hash: ((t: any).hash || '').slice(0, 10) + '...',
          wasServed: previouslyServedHashes.includes((t: any).hash),
          // $FlowIgnore[unclear-type]
          blockDecimal: parseInt((t: any).blockNum, 16),
          // $FlowIgnore[unclear-type]
          direction: (t: any).direction
        })));
    }

    this.combinedFeed = deduplicated;

    // Recalculate feed position based on previously served transactions
    if (previouslyServedHashes.length > 0) {
      let newFeedPosition = 0;
      let servedCount = 0;
      
      // Find all previously served transactions in the new sorted order
      for (let i = 0; i < this.combinedFeed.length; i++) {
        const currentHash = (this.combinedFeed[i]: any).hash;
        if (previouslyServedHashes.includes(currentHash)) {
          servedCount++;
          newFeedPosition = i + 1;
        }
        
        // Stop when we've found all served transactions
        if (servedCount >= previouslyServedHashes.length) {
          break;
        }
      }
      
      this.feedPosition = newFeedPosition;
      
      console.log('[ChronologicalTransferManager] Feed position recalculated:', {
        oldPosition: previouslyServedHashes.length,
        newPosition: this.feedPosition,
        positionDiff: this.feedPosition - previouslyServedHashes.length,
        servedTransactionsFound: servedCount,
        expectedServedCount: previouslyServedHashes.length
      });
    }

    console.log('[ChronologicalTransferManager] _rebuildCombinedFeed completed:', {
      newCombinedFeedLength: this.combinedFeed.length,
      feedPosition: this.feedPosition,
      remainingTransactions: this.combinedFeed.length - this.feedPosition
    });
  }
}

/**
 * Pure function to merge transfer arrays chronologically
 * @param {Array} outgoingTransfers - Outgoing transfers
 * @param {Array} incomingTransfers - Incoming transfers
 * @param {Function} getTimestamp - Function to extract timestamp from transfer
 * @returns {Array} Merged array sorted by timestamp descending
 */
export function mergeTransfersChronologically(
  outgoingTransfers: Array<mixed>,
  incomingTransfers: Array<mixed>,
  getTimestamp: (t: mixed) => number = (t) =>
    // $FlowIgnore[unclear-type]
    (t: any).timestamp || (t: any).blockNumber || 0
): Array<mixed> {
  const allTransfers = [
    ...outgoingTransfers.map((t) => ({ ...t, direction: 'OUT' })),
    ...incomingTransfers.map((t) => ({ ...t, direction: 'IN' })),
  ];

  return allTransfers.sort((a, b) => getTimestamp(b) - getTimestamp(a));
}

/**
 * Pure function to determine if more data is needed
 * @param {number} currentFeedLength - Current combined feed length
 * @param {number} feedPosition - Current position in feed
 * @param {number} pageSize - Desired page size
 * @param {boolean} hasMoreOutgoing - Whether more outgoing data exists
 * @param {boolean} hasMoreIncoming - Whether more incoming data exists
 * @returns {boolean} Whether more data should be fetched
 */
export function shouldFetchMoreData(
  currentFeedLength: number,
  feedPosition: number,
  pageSize: number,
  hasMoreOutgoing: boolean,
  hasMoreIncoming: boolean
): boolean {
  const remainingInFeed = currentFeedLength - feedPosition;
  const hasMoreData = hasMoreOutgoing || hasMoreIncoming;

  return remainingInFeed < pageSize && hasMoreData;
}
