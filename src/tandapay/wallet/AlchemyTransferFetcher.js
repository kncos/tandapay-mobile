// @flow strict-local

/**
 * Robust, reusable Alchemy API fetcher for asset transfers
 *
 * Features:
 * - Encapsulated pagination state
 * - Configurable and reusable
 * - Debuggable with state inspection
 * - Memory management with cleanup
 * - Error handling and retry logic
 * - Thread-safe operations
 */

import TandaPayErrorHandler from '../errors/ErrorHandler';

/**
 * Session class to manage state for a specific address
 */
class AddressSession {
  address: string;
  pageKeys: {|
    incoming: Map<number, string>,
    outgoing: Map<number, string>
  |};
  completed: {|
    incoming: boolean,
    outgoing: boolean
  |};
  stats: {|
    incoming: {| pages: number, transfers: number, errors: number |},
    outgoing: {| pages: number, transfers: number, errors: number |}
  |};
  createdAt: Date;
  lastActivity: Date;

  constructor(address: string) {
    this.address = address;
    this.pageKeys = {
      incoming: new Map(), // page -> pageKey
      outgoing: new Map()  // page -> pageKey
    };
    this.completed = {
      incoming: false,
      outgoing: false
    };
    this.stats = {
      incoming: { pages: 0, transfers: 0, errors: 0 },
      outgoing: { pages: 0, transfers: 0, errors: 0 }
    };
    this.createdAt = new Date();
    this.lastActivity = new Date();
  }

  getPageKey(direction: 'incoming' | 'outgoing', page: number): ?string {
    this.lastActivity = new Date();
    return this.pageKeys[direction].get(page);
  }

  setPageKey(direction: 'incoming' | 'outgoing', page: number, pageKey: string): void {
    this.lastActivity = new Date();
    this.pageKeys[direction].set(page, pageKey);
  }

  markComplete(direction: 'incoming' | 'outgoing'): void {
    this.lastActivity = new Date();
    this.completed[direction] = true;
  }

  isComplete(direction: 'incoming' | 'outgoing'): boolean {
    return this.completed[direction];
  }

  updateStats(direction: 'incoming' | 'outgoing', transferCount: number): void {
    this.lastActivity = new Date();
    this.stats[direction].pages++;
    this.stats[direction].transfers += transferCount;
  }

  recordError(direction: 'incoming' | 'outgoing', error: mixed): void {
    this.lastActivity = new Date();
    this.stats[direction].errors++;
  }

  getStats(): {|
    address: string,
    createdAt: Date,
    lastActivity: Date,
    completed: {| incoming: boolean, outgoing: boolean |},
    stats: {|
      incoming: {| pages: number, transfers: number, errors: number |},
      outgoing: {| pages: number, transfers: number, errors: number |},
    |},
    pageKeys: {| incoming: number, outgoing: number |},
  |} {
    return {
      address: this.address,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      completed: { ...this.completed },
      stats: JSON.parse(JSON.stringify(this.stats)),
      pageKeys: {
        incoming: this.pageKeys.incoming.size,
        outgoing: this.pageKeys.outgoing.size
      }
    };
  }

  reset(): void {
    this.pageKeys.incoming.clear();
    this.pageKeys.outgoing.clear();
    this.completed.incoming = false;
    this.completed.outgoing = false;
    this.stats = {
      incoming: { pages: 0, transfers: 0, errors: 0 },
      outgoing: { pages: 0, transfers: 0, errors: 0 }
    };
    this.lastActivity = new Date();
  }
}

export class AlchemyTransferFetcher {
  // $FlowFixMe[unclear-type] - Alchemy instance type is complex
  alchemy: any;
  options: {|
    category: Array<string>,
    withMetadata: boolean,
    excludeZeroValue: boolean,
    order: string,
    maxRetries: number,
    retryDelay: number,
  |};
  sessions: Map<string, AddressSession>;

  // $FlowFixMe[unclear-type] - Alchemy instance type is complex
  constructor(alchemy: any, options?: {|
    category?: Array<string>,
    withMetadata?: boolean,
    excludeZeroValue?: boolean,
    order?: string,
    maxRetries?: number,
    retryDelay?: number,
  |}) {
    this.alchemy = alchemy;
    this.options = {
      category: ['external', 'internal', 'erc20'], // Removed NFT categories
      withMetadata: true,
      excludeZeroValue: false,
      order: 'desc',
      maxRetries: 3,
      retryDelay: 1000,
      ...options
    };

    // State management - separate sessions for different addresses
    this.sessions = new Map(); // address -> AddressSession
  }

  /**
   * Get or create a session for an address
   */
  getSession(address: string): AddressSession {
    if (!this.sessions.has(address)) {
      this.sessions.set(address, new AddressSession(address));
    }
    // $FlowFixMe[incompatible-return] - Map.get can return undefined but we check above
    return this.sessions.get(address);
  }

  /**
   * Fetch transfers for a specific address and direction
   */
  async fetchTransfers(
    address: string,
    direction: 'outgoing' | 'incoming',
    page: number = 1,
    maxCount: number = 10
  ): Promise<{|
    transfers: Array<mixed>,
    hasMore: boolean,
    pageKey?: string,
    page: number,
    direction: 'outgoing' | 'incoming',
    address: string
  |}> {
    const session = this.getSession(address);

    try {
      const queryOptions = {
        ...this.options,
        maxCount
      };

      // Get pagination state for this direction
      const pageKey = session.getPageKey(direction, page - 1);
      if (pageKey != null && pageKey !== '') {
        // $FlowFixMe[prop-missing] - Add pageKey to options
        queryOptions.pageKey = pageKey;
      }

      // Execute API call with retry logic
      const result = await this.executeWithRetry(async () => {
        if (direction === 'outgoing') {
          return this.alchemy.core.getAssetTransfers({
            fromAddress: address,
            ...queryOptions,
          });
        } else {
          return this.alchemy.core.getAssetTransfers({
            toAddress: address,
            ...queryOptions,
          });
        }
      });

      // Update pagination state
      if (result.pageKey) {
        session.setPageKey(direction, page, result.pageKey);
      } else {
        session.markComplete(direction);
      }

      // Update statistics
      session.updateStats(direction, result.transfers?.length || 0);

      return {
        transfers: result.transfers || [],
        hasMore: result.pageKey != null,
        pageKey: result.pageKey,
        page,
        direction,
        address
      };
    } catch (error) {
      session.recordError(direction, error);
      throw TandaPayErrorHandler.createError(
        'API_ERROR',
        `Failed to fetch ${direction} transfers for ${address}`,
        {
          userMessage: 'Failed to load transaction history. Please check your connection and try again.',
          details: { address, direction, page, originalError: error }
        }
      );
    }
  }

  /**
   * Execute function with retry logic
   */
  // $FlowFixMe[unclear-type] - Generic function type
  async executeWithRetry(fn: () => Promise<any>): Promise<any> {
    let lastError;

    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === this.options.maxRetries) {
          break;
        }

        // Wait before retry
        await new Promise(resolve =>
          setTimeout(resolve, this.options.retryDelay * attempt)
        );
      }
    }

    throw lastError;
  }

  /**
   * Get session statistics for debugging
   */
  getSessionStats(address: string): ?{|
    address: string,
    createdAt: Date,
    lastActivity: Date,
    completed: {| incoming: boolean, outgoing: boolean |},
    stats: {|
      incoming: {| pages: number, transfers: number, errors: number |},
      outgoing: {| pages: number, transfers: number, errors: number |},
    |},
    pageKeys: {| incoming: number, outgoing: number |},
  |} {
    const session = this.sessions.get(address);
    return session ? session.getStats() : null;
  }

  /**
   * Reset pagination state for an address
   */
  resetSession(address: string): void {
    const session = this.sessions.get(address);
    if (session) {
      session.reset();
    }
  }

  /**
   * Clean up sessions to prevent memory leaks
   */
  cleanup(address?: ?string): void {
    if (address != null && address !== '') {
      this.sessions.delete(address);
    } else {
      this.sessions.clear();
    }
  }

  /**
   * Get all active sessions (for debugging)
   */
  getActiveSessions(): Array<string> {
    return Array.from(this.sessions.keys());
  }
}
