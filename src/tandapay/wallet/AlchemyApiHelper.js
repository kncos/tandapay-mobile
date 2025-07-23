// @flow strict-local

/**
 * Clean Alchemy API helper module
 *
 * This module provides a clean interface for Alchemy API calls using:
 * - ethers.js JsonRpcProvider for most operations (standard rate limits)
 * - Direct HTTP fetch for batch transaction fetching (higher rate limits)
 *
 * The getBatchTransactionsByHash method uses HTTP fetch to take advantage of
 * higher rate limits when fetching multiple transaction details.
 * All other methods use ethers.js provider for consistency and reliability.
 */

// $FlowFixMe[untyped-import] - ethers is not typed for Flow
import { ethers } from 'ethers';

import TandaPayErrorHandler from '../errors/ErrorHandler';
import { getAlchemyRpcUrl } from '../providers/ProviderManager';
import { getAlchemyApiKey } from './WalletManager';
import type { SupportedNetwork } from '../definitions';
import type {
  AssetTransferParams,
  JsonRpcResponse,
  SignedTransaction,
  TransactionReceipt,
  Transfer,
} from './AlchemyApiTypes';

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
 * Get Alchemy RPC URL for network and validate API key
 */
async function getValidatedAlchemyRpcUrl(network: SupportedNetwork): Promise<string> {
  const hasApiKey = await hasAlchemyApiKey();
  if (!hasApiKey) {
    throw TandaPayErrorHandler.createError(
      'VALIDATION_ERROR',
      'Alchemy API key not configured',
      {
        userMessage: 'Please configure an Alchemy API key in wallet settings to view transaction history.',
        details: { network }
      }
    );
  }

  const alchemyUrl = await getAlchemyRpcUrl(network);
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

  return alchemyUrl;
}

/**
 * Get ethers.js provider configured with Alchemy RPC endpoint
 * Used for most operations - provides standard rate limits and ethers.js integration
 */
// $FlowFixMe[unclear-type] - ethers provider type is complex
async function getAlchemyProvider(network: SupportedNetwork): Promise<any> {
  const alchemyUrl = await getValidatedAlchemyRpcUrl(network);

  // Create provider with Alchemy RPC endpoint
  const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);

  return provider;
}

/**
 * Get multiple transaction details by hash using HTTP batch requests
 * Uses HTTP fetch for higher rate limits when fetching many transactions
 */
export async function getBatchTransactionsByHash(
  network: SupportedNetwork,
  txHashes: Array<string>
): Promise<Array<SignedTransaction | null>> {
  if (txHashes.length === 0) {
    return [];
  }

  try {
    const rpcUrl = await getValidatedAlchemyRpcUrl(network);

    // Create batch requests
    const requests = txHashes.map((hash, index) => ({
      id: index,
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
      params: [hash],
    }));

    // Alchemy supports up to 1000 requests per batch
    const BATCH_SIZE = 1000;
    const allResults = [];

    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
      const batch = requests.slice(i, i + BATCH_SIZE);

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        throw TandaPayErrorHandler.createError(
          'NETWORK_ERROR',
          `HTTP ${response.status}: ${response.statusText}`,
          {
            userMessage: 'Network request failed. Please check your connection.',
            details: { network, batchSize: batch.length, status: response.status }
          }
        );
      }

      const batchResults: Array<JsonRpcResponse> = await response.json();

      // Extract results and handle errors
      const results = batchResults.map((result, index) => {
        if (result.error != null) {
          // eslint-disable-next-line no-console
          console.warn(`Batch request ${index} failed:`, result.error);
          return null; // Return null for failed requests
        }
        return result.result;
      });

      allResults.push(...results);
    }

    // $FlowFixMe[incompatible-return] - HTTP JSON-RPC batch result type
    return allResults;
  } catch (error) {
    throw TandaPayErrorHandler.createError(
      'API_ERROR',
      `Failed to fetch batch transaction details: ${error?.message || 'Unknown error'}`,
      {
        userMessage: 'Failed to load transaction details. Please try again.',
        details: { network, txCount: txHashes.length, originalError: error }
      }
    );
  }
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
 * Get asset transfers using alchemy_getAssetTransfers API via ethers provider
 * Uses ethers.js since the direct HTTP API documentation was removed
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

/**
 * Get transaction receipt by hash using ethers provider
 * @param {*} network currently selected network
 * @param {*} txHash transaction hash to fetch receipt for
 * @returns {Promise<TransactionReceipt>}
 */
export async function getTransactionReceipt(
  network: SupportedNetwork,
  txHash: string
): Promise<TransactionReceipt> {
  // console.log('[AlchemyApiHelper] Fetching transaction receipt for:', txHash.slice(0, 6), '...');
  try {
    const provider = await getAlchemyProvider(network);
    const result = await provider.getTransactionReceipt(txHash);
    // $FlowFixMe[incompatible-return] - ethers provider result type
    return result;
  } catch (error) {
    throw TandaPayErrorHandler.createError(
      'API_ERROR',
      `Failed to fetch transaction receipt: ${error?.message || 'Unknown error'}`,
      {
        userMessage: 'Failed to load transaction receipt. Please try again.',
        details: { network, txHash, originalError: error }
      }
    );
  }
}

/**
 * Get transaction details by hash using ethers provider
 */
export async function getTransactionByHash(
  network: SupportedNetwork,
  txHash: string
): Promise<SignedTransaction | null> {
  try {
    const provider = await getAlchemyProvider(network);
    const result = await provider.getTransaction(txHash);
    // $FlowFixMe[incompatible-return] - ethers provider result type
    return result;
  } catch (error) {
    throw TandaPayErrorHandler.createError(
      'API_ERROR',
      `Failed to fetch transaction details: ${error?.message || 'Unknown error'}`,
      {
        userMessage: 'Failed to load transaction details. Please try again.',
        details: { network, txHash, originalError: error }
      }
    );
  }
}
