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

/**
 * Response for alchemy_getAssetTransfers API call.
 * Retrieved from https://www.alchemy.com/docs/reference/sdk-getassettransfers.
 * Verified on 2025-07-08
 */
export type Transfer = {
  category: 'external' | 'internal' | 'erc20' | 'erc721' | 'erc1155' | 'specialnft',
  blockNum: string | null,  // block number of the transfer (hex string)
  from: string | null,      // from address (hex string).
  to: string | null,        // to address (hex string). null if contract creation.
  value: number | null,     // asset transfer value. null if it's ERC721 or unknown decimals
  asset: string | null,     // ETH or the token's symbol, null if unavailable
  uniqueId: string | null,  // unique identifier for the transfer; will be a hash plus a suffix
  hash: string | null,      // transaction hash, null if unavailable
  rawContract: {|
    value: string | null,   // raw hex transfer value. null for NFT transfers
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

/**
 * Parameters for alchemy_getAssetTransfers API call.
 * Retrieved from https://www.alchemy.com/docs/reference/sdk-getassettransfers.
 * Verified on 2025-07-08
 */
export type AssetTransferParams = {|
  fromBlock?: string,                 // starting block to check for transfers (hex string). 0x0 if omitted
  toBlock?: string,                   // inclusive to block (hex string, int, or 'latest'). 'latest' if omitted
  order?: string,                     // whether to return results in ascending or descending order. Defaults to 'ascending' if omitted
  fromAddress?: string,               // from address to filter transfers. Defaults to a wildcard if omitted
  toAddress?: string,                 // to address to filter transfers. Defaults to a wildcard if omitted
  contractAddresses?: Array<string>,  // list of contract addresses to filter for. Only applies to erc20/erc721/erc1155 transfers. Defaults to all if omitted
  category: Array<string>,            // list of transfer categories to include. Options: 'external', 'internal', 'erc20', 'erc721', 'erc1155', 'specialnft'.
  excludeZeroValue?: boolean,         // whether to exclude transfers with zero value. Defaults to false if omitted
  pageKey?: string,                   // page key from previous response. `null` if omitted which retrieves 1st page. Otherwise, retrieves next page
  maxCount?: number,                  // maximum number of transfers to return per page. Defaults to `1000` if omitted.
  withMetadata?: boolean,             // whether to include metadata in the response. Defaults to true if omitted
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
async function getAlchemyProvider(network: SupportedNetwork): Promise<any> {
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
