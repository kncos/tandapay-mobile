// @flow

import { PriorityQueue } from 'datastructures-js';
import { ethers } from 'ethers';
import { is } from 'date-fns/esm/locale';
import { getAssetTransfers } from './AlchemyApiHelper';
import type { SupportedNetwork } from '../definitions';

export class TransactionManager {
  _network: SupportedNetwork;
  _walletAddress: string;
  _tandapayContractAddress: string;

  _incomingTransactions: Array<any>;
  _outgoingTransactions: Array<any>;
  _transactionQueue: PriorityQueue<any>;
  _nextIncomingPage: ?string;
  _nextOutgoingPage: ?string;
  _pageSize: number;

  constructor(network: SupportedNetwork, walletAddress: string, tandapayContractAddress: string) {
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
    this._incomingTransactions = [];
    this._outgoingTransactions = [];
    this._transactionQueue = new PriorityQueue((a, b) => this._transactionSortKey(a, b));
    this._pageSize = 10;
  }

  _getDefaultParams() {
    return {
      fromBlock: '0x0',
      toBlock: 'latest',
      category: ['external', 'erc20'],
      withMetadata: true,
      excludeZeroValue: false,
      order: 'desc',
      maxCount: this._pageSize,
    };
  }

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

  async fetchNextPage() {
    const incoming = [];
    // We start this as undefined. When we pass undefined to the API, it will fetch the first page.
    // The response will contain a pageKey that we can use for the next page in subsequent calls. Once
    // the response returns null, there are no more pages to fetch. So, undefined = first page, null = no more pages.
    if (this._nextIncomingPage !== null) {
      const response = await getAssetTransfers(this._network, {
        ...this._getDefaultParams(),
        toAddress: this._walletAddress,
        pageKey: this._nextIncomingPage || undefined,
      });
      this._nextIncomingPage = response.pageKey;
      incoming.push(...response.transfers);
    }

    const outgoing = [];
    // Same logic applies here for outgoing transactions.
    if (this._nextOutgoingPage !== null) {
      const response = await getAssetTransfers(this._network, {
        ...this._getDefaultParams(),
        fromAddress: this._walletAddress,
        pageKey: this._nextOutgoingPage || undefined,
      });
      this._nextOutgoingPage = response.pageKey;
      outgoing.push(...response.transfers);
    }

    // use priority queue to maintain combined feed
    incoming.forEach(tx => this._transactionQueue.enqueue(tx));
    outgoing.forEach(tx => this._transactionQueue.enqueue(tx));

    // let's see how it looks
    this._transactionQueue.toArray().forEach(tx => console.log('Transaction:', JSON.stringify(tx, null, 2), '\n\n'));
  }
}
