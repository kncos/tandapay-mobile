// @flow strict-local

/**
 * Clean Alchemy API helper module
 *
 * This module provides a clean interface for Alchemy API calls using ethers.js provider
 * instead of the alchemy-sdk, which has proven to be unreliable in React Native.
 *
 * All API calls use the same network stack as wallet balance fetches for maximum reliability.
 */

// $FlowFixMe[untyped-import] - ethers is not typed for Flow
import { ethers } from 'ethers';

import TandaPayErrorHandler from '../errors/ErrorHandler';
import { getAlchemyRpcUrl } from '../providers/ProviderManager';
import { getAlchemyApiKey } from './WalletManager';
import type { SupportedNetwork } from '../definitions';

export type Transfer = {
  category: 'external' | 'internal' | 'erc20' | 'erc721' | 'erc1155' | 'specialnft',
  blockNum: string | null, // block number of the transfer (hex string)
  from: string | null, // from address (hex string).
  to: string | null, // to address (hex string). null if contract creation.
  value: number | null, // asset transfer value. null if it's ERC721 or unknown decimals
  asset: string | null, // ETH or the token's symbol, null if unavailable
  uniqueId: string | null, // unique identifier for the transfer; will be a hash plus a suffix
  hash: string | null, // transaction hash, null if unavailable
  rawContract: {|
    value: string | null, // raw hex transfer value. null for NFT transfers
    address: string | null, // contract address, null for external or internal transfers
    decimal: string | null, // contract decimal in hex. null if not known
  |} | null,
  metaData: {|
    blockTimestamp: string | null, // timestamp of the block in ISO format, null if unavailable
  |} | null,

  // erc721TokenId -- omitted because we don't use it in this app
  // erc1155Metadata -- omitted because we don't use it in this app
  // tokenId: string | null -- for NFT tokens, we don't use it in this app
};

// TODO: review this type
/**
 * Response from eth_getTransactionReceipt API call
 */
export type TransactionReceiptResponse = {|
  transactionHash: string,
  transactionIndex: string,
  blockHash: string,
  blockNumber: string,
  from: string,
  to?: string,
  gasUsed: string,
  effectiveGasPrice?: string,
  status?: string,
  type?: string,
  confirmations?: number,
  logs?: Array<mixed>,
|};

// TODO: review this type
/**
 * Parameters for alchemy_getAssetTransfers API call
 */
export type AssetTransferParams = {|
  fromBlock?: string,
  toBlock?: string,
  fromAddress?: string,
  toAddress?: string,
  contractAddresses?: Array<string>,
  category: Array<string>,
  withMetadata?: boolean,
  excludeZeroValue?: boolean,
  order?: string,
  pageKey?: string,
  maxCount?: number,
|};

// TODO: review this type
/**
 * Response from eth_getTransactionByHash API call
 */
type TransactionResponse = {|
  hash: string,
  nonce: string,
  blockHash?: string,
  blockNumber?: string,
  transactionIndex?: string,
  from: string,
  to?: string,
  value: string,
  gasPrice?: string,
  gas: string,
  input: string,
  type?: string,
|};

/**
 * Check if Alchemy API key is available
 */
export async function hasAlchemyApiKey(): Promise<boolean> {
  try {
    const result = await getAlchemyApiKey();
    return result.success && result.data != null && result.data.trim() !== '';
  } catch (error) {
    return false;
  }
}

/**
 * Get ethers.js provider configured with Alchemy RPC endpoint
 */
// $FlowFixMe[unclear-type] - ethers provider type is complex
async function getAlchemyProvider(network: SupportedNetwork): Promise<any> {  const hasApiKey = await hasAlchemyApiKey();
  if (!hasApiKey) {
    throw TandaPayErrorHandler.createError(
      'VALIDATION_ERROR',
      'Alchemy API key not configured',
      {
        userMessage: 'Please configure an Alchemy API key in wallet settings to view transaction history.',
        details: { network }
      }
    );
  }  const alchemyUrl = await getAlchemyRpcUrl(network);
  if (alchemyUrl == null || alchemyUrl === '') {
    throw TandaPayErrorHandler.createError(
      'VALIDATION_ERROR',
      `Alchemy not supported for network: ${network}`,
      {
        userMessage: 'Transaction history is not available for this network.',
        details: { network }
      }
    );
  }

  // Create provider with Alchemy RPC endpoint
  const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);

  return provider;
}

/**
 * Convert numeric values to hex format for Alchemy API
 */
function convertParamsToAlchemyFormat(params: AssetTransferParams): mixed {
  // $FlowFixMe[unclear-type] - Alchemy API expects mixed parameter types
  const alchemyParams: any = { ...params };

  // Convert maxCount to hex format (required by Alchemy API)
  if (typeof params.maxCount === 'number') {
    alchemyParams.maxCount = `0x${params.maxCount.toString(16)}`;
  }

  return alchemyParams;
}
type AssetTransferResponse = {|
  transfers: Array<Transfer>,
  pageKey?: string,
|};

/**
 * Get asset transfers using alchemy_getAssetTransfers API
 */
export async function getAssetTransfers(
  network: SupportedNetwork,
  params: AssetTransferParams
): Promise<AssetTransferResponse> {
  try {
    const provider = await getAlchemyProvider(network);

    // Convert parameters to Alchemy-compatible format
    const alchemyParams = convertParamsToAlchemyFormat(params);

    const response = await provider.send('alchemy_getAssetTransfers', [alchemyParams]);

    const result = {
      transfers: response.transfers || [],
      pageKey: response.pageKey || null,
    };

    return result;
  } catch (error) {
    throw TandaPayErrorHandler.createError(
      'API_ERROR',
      `Failed to fetch asset transfers: ${error?.message || 'Unknown error'}`,
      {
        userMessage: 'Failed to load transaction history. Please check your connection and try again.',
        details: { network, params, originalError: error }
      }
    );
  }
}

/**
 * Get transaction receipt using eth_getTransactionReceipt API
 */
export async function getTransactionReceipt(
  network: SupportedNetwork,
  txHash: string
): Promise<?TransactionReceiptResponse> {
  try {
    const provider = await getAlchemyProvider(network);

    const receipt = await provider.send('eth_getTransactionReceipt', [txHash]);

    return receipt;
  } catch (error) {
    throw TandaPayErrorHandler.createError(
      'API_ERROR',
      `Failed to fetch transaction receipt: ${error?.message || 'Unknown error'}`,
      {
        userMessage: 'Failed to load transaction details. Please check your connection and try again.',
        details: { network, txHash, originalError: error }
      }
    );
  }
}

/**
 * Get transaction by hash using eth_getTransactionByHash API
 */
export async function getTransactionByHash(
  network: SupportedNetwork,
  txHash: string
): Promise<?TransactionResponse> {
  try {
    const provider = await getAlchemyProvider(network);

    const transaction = await provider.send('eth_getTransactionByHash', [txHash]);

    return transaction;
  } catch (error) {
    throw TandaPayErrorHandler.createError(
      'API_ERROR',
      `Failed to fetch transaction: ${error?.message || 'Unknown error'}`,
      {
        userMessage: 'Failed to load transaction details. Please check your connection and try again.',
        details: { network, txHash, originalError: error }
      }
    );
  }
}

/**
 * Convenience function to get comprehensive transaction details
 * Combines both transaction and receipt data
 */
export async function getTransactionDetails(
  network: SupportedNetwork,
  txHash: string
): Promise<{|
  transaction?: TransactionResponse,
  receipt?: TransactionReceiptResponse,
|}> {
  try {
    const [transaction, receipt] = await Promise.all([
      getTransactionByHash(network, txHash),
      getTransactionReceipt(network, txHash),
    ]);

    return {
      transaction: transaction || undefined,
      receipt: receipt || undefined,
    };
  } catch (error) {
    throw TandaPayErrorHandler.createError(
      'API_ERROR',
      `Failed to fetch transaction details: ${error?.message || 'Unknown error'}`,
      {
        userMessage: 'Failed to load transaction details. Please check your connection and try again.',
        details: { network, txHash, originalError: error }
      }
    );
  }
}

/**
 * Helper to create standard asset transfer parameters
 */
export function createAssetTransferParams(options: {|
  fromAddress?: string,
  toAddress?: string,
  category?: Array<string>,
  withMetadata?: boolean,
  excludeZeroValue?: boolean,
  order?: string,
  pageKey?: string,
  maxCount?: number,
|}): AssetTransferParams {
  const params: AssetTransferParams = {
    category: options.category || ['external', 'internal', 'erc20'],
    withMetadata: options.withMetadata !== false, // Default to true
    excludeZeroValue: options.excludeZeroValue || false,
    order: options.order != null ? options.order : 'desc',
    maxCount: options.maxCount != null ? options.maxCount : 10,
  };

  if (options.fromAddress != null && options.fromAddress !== '') {
    params.fromAddress = options.fromAddress;
  }

  if (options.toAddress != null && options.toAddress !== '') {
    params.toAddress = options.toAddress;
  }

  if (options.pageKey != null && options.pageKey !== '') {
    params.pageKey = options.pageKey;
  }

  return params;
}
