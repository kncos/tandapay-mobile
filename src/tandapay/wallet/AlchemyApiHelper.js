// @flow strict-local

/**
 * Clean Alchemy API helper module
 *
 * This module provides a clean interface for Alchemy API calls using:
 * - ethers.js JsonRpcProvider for asset transfers (alchemy_getAssetTransfers)
 * - Direct HTTP JSON-RPC for transaction details and batch operations
 *
 * Supports batch requests for efficient transaction detail fetching and method name decoding.
 * All API calls use the same network stack as wallet balance fetches for maximum reliability.
 */

// $FlowFixMe[untyped-import] - ethers is not typed for Flow
import { ethers } from 'ethers';

import TandaPayErrorHandler from '../errors/ErrorHandler';
import { getAlchemyRpcUrl } from '../providers/ProviderManager';
import { getAlchemyApiKey } from './WalletManager';
import type { SupportedNetwork } from '../definitions';
import type {
  AssetTransferParams,
  JsonRpcRequest,
  JsonRpcResponse,
  SignedTransaction,
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
 * Used for asset transfers since direct HTTP API was deprecated
 */
// $FlowFixMe[unclear-type] - ethers provider type is complex
async function getAlchemyJsonRpcProvider(network: SupportedNetwork): Promise<any> {
  const alchemyUrl = await getValidatedAlchemyRpcUrl(network);

  // Create provider with Alchemy RPC endpoint
  const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);

  return provider;
}

/**
 * Make a single JSON-RPC request to Alchemy API
 */
async function makeJsonRpcRequest(
  network: SupportedNetwork,
  method: string,
  params: Array<mixed>
): Promise<mixed> {
  const rpcUrl = await getValidatedAlchemyRpcUrl(network);

  const request: JsonRpcRequest = {
    id: Date.now(),
    jsonrpc: '2.0',
    method,
    params,
  };

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw TandaPayErrorHandler.createError(
      'NETWORK_ERROR',
      `HTTP ${response.status}: ${response.statusText}`,
      {
        userMessage: 'Network request failed. Please check your connection.',
        details: { network, method, status: response.status }
      }
    );
  }

  const result: JsonRpcResponse = await response.json();

  if (result.error != null) {
    throw TandaPayErrorHandler.createError(
      'API_ERROR',
      `JSON-RPC error: ${result.error.message}`,
      {
        userMessage: 'API request failed. Please try again.',
        details: { network, method, error: result.error }
      }
    );
  }

  return result.result;
}

/**
 * Internal helper for making a single batch request
 */
async function makeSingleBatchRequest(
  network: SupportedNetwork,
  requests: Array<{| method: string, params: Array<mixed> |}>
): Promise<Array<mixed>> {
  const rpcUrl = await getValidatedAlchemyRpcUrl(network);

  const jsonRpcRequests: Array<JsonRpcRequest> = requests.map((req, index) => ({
    id: index,
    jsonrpc: '2.0',
    method: req.method,
    params: req.params,
  }));

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jsonRpcRequests),
  });

  if (!response.ok) {
    throw TandaPayErrorHandler.createError(
      'NETWORK_ERROR',
      `HTTP ${response.status}: ${response.statusText}`,
      {
        userMessage: 'Network request failed. Please check your connection.',
        details: { network, batchSize: requests.length, status: response.status }
      }
    );
  }

  const results: Array<JsonRpcResponse> = await response.json();

  // Check for errors and extract results in order
  return results.map((result, index) => {
    if (result.error != null) {
      // eslint-disable-next-line no-console
      console.warn(`Batch request ${index} failed:`, result.error);
      return null; // Return null for failed requests
    }
    return result.result;
  });
}

/**
 * Make a batch JSON-RPC request to Alchemy API
 * Supports up to 1000 requests per batch for efficiency
 */
export async function makeBatchJsonRpcRequest(
  network: SupportedNetwork,
  requests: Array<{| method: string, params: Array<mixed> |}>
): Promise<Array<mixed>> {
  if (requests.length === 0) {
    return [];
  }

  // Alchemy supports up to 1000 requests per batch
  const BATCH_SIZE = 1000;
  const results = [];

  for (let i = 0; i < requests.length; i += BATCH_SIZE) {
    const batch = requests.slice(i, i + BATCH_SIZE);
    const batchResults = await makeSingleBatchRequest(network, batch);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Get transaction details by hash using eth_getTransactionByHash
 */
export async function getTransactionByHash(
  network: SupportedNetwork,
  txHash: string
): Promise<SignedTransaction | null> {
  try {
    const result = await makeJsonRpcRequest(network, 'eth_getTransactionByHash', [txHash]);
    // $FlowFixMe[incompatible-return] - JSON-RPC result type
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

/**
 * Get multiple transaction details by hash using batch requests
 */
export async function getBatchTransactionsByHash(
  network: SupportedNetwork,
  txHashes: Array<string>
): Promise<Array<SignedTransaction | null>> {
  if (txHashes.length === 0) {
    return [];
  }

  try {
    const requests = txHashes.map(hash => ({
      method: 'eth_getTransactionByHash',
      params: [hash],
    }));

    const results = await makeBatchJsonRpcRequest(network, requests);
    // $FlowFixMe[incompatible-return] - JSON-RPC batch result type
    return results;
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
    const provider = await getAlchemyJsonRpcProvider(network);

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
