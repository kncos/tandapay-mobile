/* eslint-disable no-console */
// @flow

import { PriorityQueue } from 'datastructures-js';
import { ethers } from 'ethers';
import { getAssetTransfers } from './AlchemyApiHelper';
import type { Transfer } from './AlchemyApiHelper';
import type { SupportedNetwork } from '../definitions';
import type { FullTransaction } from './FullTransaction';
import { toFullTransaction } from './FullTransaction';

export class TransactionManager {
  _network: SupportedNetwork;
  _walletAddress: string;
  _tandapayContractAddress: string;

  // $FlowFixMe[value-as-type] - PriorityQueue is imported from datastructures-js
  _transactionQueue: PriorityQueue<Transfer>;
  _nextIncomingPage: ?string;
  _nextOutgoingPage: ?string;
  _pageSize: number;

  _pagesLoaded = 0;

  _inorderTransactionHashes: string[];
  _allTransactions: Map<string, Transfer[]>;

  _getOrderedTransactionsCache: ?Array<FullTransaction>;

  _lock: boolean = false;

  constructor(network: SupportedNetwork, walletAddress: string, tandapayContractAddress: string, pageSize: number = 10) {
    // ensure these parameters are provided and valid
    if (!network || !walletAddress || !tandapayContractAddress) {
      throw new Error('Invalid parameters provided to TransactionManager constructor');
    }

    if (!ethers.utils.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address provided');
    }

    if (!ethers.utils.isAddress(tandapayContractAddress)) {
      throw new Error('Invalid TandaPay contract address provided');
    }

    // inputs
    this._network = network;
    this._walletAddress = walletAddress;
    this._tandapayContractAddress = tandapayContractAddress;

    // Initialize any necessary properties or dependencies here
    this._transactionQueue = new PriorityQueue((a, b) => this._transactionSortKey(a, b));
    // we use x2 since transactions can include multiple transfers (e.g., external and log transfers).
    // makes it less likely that we have <pageSize full transactions in the queue
    this._pageSize = pageSize * 2;
    this._pagesLoaded = 0;

    // this is the transaction hashes in order by timestamp. It is guaranteed that
    // each transaction hash will only appear once, and that they are ordered by timestamp.
    this._inorderTransactionHashes = [];

    // this will store objects for all transactions we've seen so far, keyed by hash.
    // This can be used in conjunction with _inorderTransactionHashes to
    // retrieve the full transaction object for transactions in order.
    this._allTransactions = new Map<string, Transfer[]>();
  }

  /**
   * This method just helps us fill in some parameters that are common to all Alchemy API calls.
   * @returns {Object} - Default parameters for the Alchemy API call.
   */
  _getDefaultParams() {
    return {
      fromBlock: '0x0',
      toBlock: 'latest',
      category: ['external', 'erc20'],
      withMetadata: true,
      excludeZeroValue: false,
      order: 'desc',
      maxCount: this._pageSize, // we use x2 because we can get 2 transactions per hash (external and log)
    };
  }

  /**
   * Get a sort key for two transactions based on their metadata block timestamps.
   * @param {*} tx1 - The first transaction object.
   * @param {*} tx2 - The second transaction object.
   * @returns {number} - A negative number if tx1 is more recent, a positive number if tx2 is more recent, or 0 if they are equal.
   */
  _transactionSortKey(tx1, tx2) {
    if (tx1.metadata.blockTimestamp === undefined || tx1.metadata.blockTimestamp === null) {
      throw new Error('Transaction metadata blockTimestamp is missing for tx1');
    }
    if (tx2.metadata.blockTimestamp === undefined || tx2.metadata.blockTimestamp === null) {
      throw new Error('Transaction metadata blockTimestamp is missing for tx2');
    }

    const date1 = new Date(tx1.metadata.blockTimestamp);
    const date2 = new Date(tx2.metadata.blockTimestamp);
    if (Number.isNaN(date1.getTime()) || Number.isNaN(date2.getTime())) {
      throw new Error('Invalid date in transaction metadata blockTimestamp');
    }

    // Sort by block timestamp, descending
    if (date1 > date2) {
      return -1; // tx1 is more recent
    }
    if (date1 < date2) {
      return 1; // tx2 is more recent
    }
    return 0; // equal timestamps
  }

  async loadMore() {
    // lock the transaction manager to prevent concurrent fetches
    if (this._lock) {
      console.warn('TransactionManager is currently locked. Please wait for the current operation to complete.');
      return;
      // throw new Error('TransactionManager is currently locked. Please wait for the current operation to complete.');
    }
    this._lock = true;

    // store incoming and outgoing transactions in separate arrays
    const incoming: Transfer[] = [];
    const outgoing: Transfer[] = [];

    // we'll try to fetch both incoming and outgoing transactions in parallel
    try {
      // nextIncomingPage is initially undefined. When we pass undefined to the API, it will fetch the first page.
      // The response will contain a pageKey that we can use for the next page in subsequent calls. Once
      // the response returns null, there are no more pages to fetch. So, undefined = first page, null = no more pages.
      const incomingPromise = this._nextIncomingPage !== null
        ? getAssetTransfers(this._network, {
            ...this._getDefaultParams(),
            toAddress: this._walletAddress,
            pageKey: this._nextIncomingPage || undefined,
          })
        : Promise.resolve({ transfers: [], pageKey: null });
      // same logic applies for outgoing transactions
      const outgoingPromise = this._nextOutgoingPage !== null
        ? getAssetTransfers(this._network, {
            ...this._getDefaultParams(),
            fromAddress: this._walletAddress,
            pageKey: this._nextOutgoingPage || undefined,
          })
        : Promise.resolve({ transfers: [], pageKey: null });

      // wait for both promises to resolve
      const [incomingResponse, outgoingResponse] = await Promise.all([incomingPromise, outgoingPromise]);

      // if either response has a null pageKey, it means there are no more pages to fetch
      this._nextIncomingPage = incomingResponse.pageKey;
      this._nextOutgoingPage = outgoingResponse.pageKey;

      // push the transfers from both responses into their respective arrays
      incoming.push(...incomingResponse.transfers);
      outgoing.push(...outgoingResponse.transfers);
    } catch (error) {
      this._lock = false; // unlock on error
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    // add new transactions to the queue
    incoming.forEach(tx => this._transactionQueue.enqueue(tx));
    outgoing.forEach(tx => this._transactionQueue.enqueue(tx));
    this._pagesLoaded += 1;
    this._dropGetOrderedTransactionsCache(); // invalidate the cache of ordered transactions

    // fetches complete, unlock the transaction manager
    this._lock = false;
  }

  /**
   * Checks if the transaction manager is at the last page of transactions. when a pageKey is null,
   * it indicates that there are no more pages to load. When both incoming and outgoing pages are null,
   * it means we have reached the end of both incoming and outgoing transactions, and there are
   * no more to fetch.
   * @returns {boolean} - Returns true if there are no more pages to load, false otherwise.
   */
  isAtLastPage(): boolean {
    return this._nextIncomingPage === null && this._nextOutgoingPage === null;
  }

  _dropGetOrderedTransactionsCache() {
    // this will drop the cache of ordered transactions, so that the next call to getOrdered
    this._allTransactions.clear();
    this._inorderTransactionHashes = [];
    this._getOrderedTransactionsCache = null;
  }

  // for now we will just return an array of objects with the hash and blocknum, in order
  getOrderedTransactions(): Array<FullTransaction> {
    // if we have a cache of ordered transactions, return it. This gets invalidated
    // when _transactionQueue is modified, so we can use this to avoid recalculating
    if (Array.isArray(this._getOrderedTransactionsCache)) {
      // be sure to return a copy of the cache, so that we don't modify it
      return [...this._getOrderedTransactionsCache];
    }

    // iterate over each transaction in the queue
    const transactionsArray = this._transactionQueue.toArray();
    for (const tx of transactionsArray) {
      if (!this._allTransactions.has(tx.hash)) {
        // if we haven't seen this transaction before, add it to the allTransactions map
        this._allTransactions.set(tx.hash, [tx]);
        // and add it to the ordered list
        this._inorderTransactionHashes.push(tx.hash);
      } else {
        // if we have seen it, push it, but it should already be in _inorderTransactionHashes
        this._allTransactions.get(tx.hash)?.push(tx);
      }
    }

    // calculate the maximum safe index of transaction hashes we can return
    const maxSafeIndex = (() => {
      if (this.isAtLastPage()) {
        return this._inorderTransactionHashes.length;
      } else {
        // if we are not at the last page, we can only safely return the transactions we've loaded
        // so far. We can estimate this by multiplying the number of pages loaded by the page size.
        // This is a conservative estimate, as we might have loaded all of the data for way more
        // transactions than this.
        return Math.min(
          // conservative estimate
          this._pagesLoaded * Math.floor(this._pageSize / 2),
          // or the total number of transactions we've seen so far. We subtract 1 for the scenario
          // where some of the transfers are on the next page, so the last hash we've seen might
          // not have all of its transfers loaded yet. We prevent this from going negative as well
          Math.max(this._inorderTransactionHashes.length - 1, 0),
        );
      }
    })();

    // build a list of full transactions in order up to the maxSafeIndex
    const res: FullTransaction[] = [];
    for (let i = 0; i < maxSafeIndex; i += 1) {
      const hash = this._inorderTransactionHashes[i];
      const transfers = this._allTransactions.get(hash);
      if (!transfers || transfers.length === 0) {
        console.warn(`Transaction with hash ${hash} had no transfers associated with it!`);
        continue;
      }

      const fullTransaction = toFullTransaction({
        walletAddress: this._walletAddress,
        tandapayContractAddress: this._tandapayContractAddress,
        transfers,
      });
      res.push(fullTransaction);
    }

    // set the cache and return the result
    this._getOrderedTransactionsCache = [...res];
    return res;
  }
}
