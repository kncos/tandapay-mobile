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
    this.feedPosition = 0; // Current position in combined feed
    this.hasMoreOutgoing = true; // Whether more outgoing transfers exist
    this.hasMoreIncoming = true; // Whether more incoming transfers exist
    this.isInitialized = false; // Whether we've made initial fetch
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
    // If we haven't initialized or need more data, fetch it
    if (!this.isInitialized || this._needsMoreData()) {
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

    const deduplicated = [];

    for (const [, transferGroup] of hashGroups) {
      if (transferGroup.length === 1) {
        // Single transfer, keep it
        deduplicated.push(transferGroup[0]);
      } else {
        // Multiple transfers with same hash - smart deduplication
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
          deduplicated.push(...tokenTransfers, ...nonZeroEthTransfers);
        } else {
          // No conflict, keep all
          deduplicated.push(...transferGroup);
        }
      }
    }

    return deduplicated;
  }

  /**
   * Rebuild the combined chronological feed from all transfers in memory
   * @private
   */
  _rebuildCombinedFeed() {
    // Combine all transfers
    const allTransfers = [
      ...this.outgoingTransfers.map((t) => ({ ...t, direction: 'OUT' })),
      ...this.incomingTransfers.map((t) => ({ ...t, direction: 'IN' })),
    ];

    // Deduplicate transfers with same hash
    const deduplicated = this._deduplicateTransfers(allTransfers);

    // Sort by block number descending (most recent first)
    deduplicated.sort((a, b) => {
      // $FlowIgnore[unclear-type]
      const blockA = parseInt((a: any).blockNum, 16) || 0;
      // $FlowIgnore[unclear-type]
      const blockB = parseInt((b: any).blockNum, 16) || 0;
      return blockB - blockA;
    });

    this.combinedFeed = deduplicated;
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
