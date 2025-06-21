// @flow strict-local

// $FlowFixMe[untyped-import] - @alch/alchemy-sdk doesn't have Flow types
import { Alchemy, Network } from '@alch/alchemy-sdk';
import { getAlchemyApiKey } from './WalletManager';
import type { TandaPayResult } from '../errors/types';
import TandaPayErrorHandler from '../errors/ErrorHandler';

export type AlchemyTransfer = {|
  blockNum: string,
  hash: string,
  from: string,
  to: ?string,
  value: ?number,
  asset: ?string,
  category: string,
  rawContract: {|
    address: ?string,
    decimal: ?string,
  |},
  metadata: ?{|
    blockTimestamp: string,
  |},
|};

export type AlchemyTransferResponse = {|
  transfers: AlchemyTransfer[],
  pageKey: ?string,
|};

/**
 * Convert network name to Alchemy Network enum
 */
function getAlchemyNetwork(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'): mixed {
  switch (network) {
    case 'mainnet':
      return Network.ETH_MAINNET;
    case 'sepolia':
      return Network.ETH_SEPOLIA;
    case 'arbitrum':
      return Network.ARB_MAINNET;
    case 'polygon':
      return Network.MATIC_MAINNET;
    default:
      return Network.ETH_SEPOLIA; // fallback
  }
}

/**
 * Create Alchemy instance with user's API key
 */
async function createAlchemyInstance(network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon'): Promise<TandaPayResult<mixed>> {
  try {
    const apiKeyResult = await getAlchemyApiKey();
    if (!apiKeyResult.success || apiKeyResult.data == null || apiKeyResult.data.trim() === '') {
      return {
        success: false,
        error: TandaPayErrorHandler.createError(
          'VALIDATION_ERROR',
          'Alchemy API key not configured',
          { userMessage: 'Please configure your Alchemy API key in wallet settings.' }
        )
      };
    }

    const alchemy = new Alchemy({
      apiKey: apiKeyResult.data,
      network: getAlchemyNetwork(network),
    });

    return { success: true, data: alchemy };
  } catch (error) {
    return {
      success: false,
      error: TandaPayErrorHandler.createError(
        'NETWORK_ERROR',
        error?.message || 'Failed to create Alchemy instance',
        { userMessage: 'Failed to connect to Alchemy. Please check your API key.' }
      )
    };
  }
}

/**
 * Fetch transaction history using Alchemy SDK
 */
export async function fetchTransactionHistoryAlchemy(
  walletAddress: string,
  pageKey?: ?string,
  network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' = 'sepolia'
): Promise<TandaPayResult<AlchemyTransferResponse>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      if (!walletAddress || walletAddress.trim() === '') {
        throw TandaPayErrorHandler.createValidationError(
          'Wallet address is required',
          'Please provide a valid wallet address.'
        );
      }

      const alchemyResult = await createAlchemyInstance(network);
      if (!alchemyResult.success) {
        throw alchemyResult.error;
      }

      // $FlowFixMe[unclear-type] - Alchemy SDK types
      const alchemy: any = alchemyResult.data;

      // Fetch both incoming and outgoing transfers
      // Note: We need to make separate calls to avoid duplicates
      const incomingParams = {
        toAddress: walletAddress,
        category: ['erc20', 'erc721', 'erc1155', 'external'],
        withMetadata: true,
        order: 'desc',
        maxCount: 25, // Half of our target
        ...(pageKey != null && pageKey !== '' && { pageKey })
      };

      const outgoingParams = {
        fromAddress: walletAddress,
        category: ['erc20', 'erc721', 'erc1155', 'external'],
        withMetadata: true,
        order: 'desc',
        maxCount: 25, // Half of our target
        ...(pageKey != null && pageKey !== '' && { pageKey })
      };

      // $FlowFixMe[unclear-type] - Alchemy SDK types
      const [incomingResponse, outgoingResponse]: [any, any] = await Promise.all([
        alchemy.core.getAssetTransfers(incomingParams),
        alchemy.core.getAssetTransfers(outgoingParams)
      ]);

      // Combine and deduplicate transfers by hash
      const allTransfers = [...(incomingResponse.transfers || []), ...(outgoingResponse.transfers || [])];
      const uniqueTransfers = [];
      const seenHashes = new Set();

      for (const transfer of allTransfers) {
        if (!seenHashes.has(transfer.hash)) {
          seenHashes.add(transfer.hash);
          uniqueTransfers.push(transfer);
        }
      }

      // Sort by block number (descending - most recent first)
      uniqueTransfers.sort((a, b) => {
        const blockA = parseInt(a.blockNum, 16);
        const blockB = parseInt(b.blockNum, 16);
        return blockB - blockA;
      });

      // Take the most recent transactions up to our limit
      const limitedTransfers = uniqueTransfers.slice(0, 50);

      return {
        transfers: limitedTransfers,
        pageKey: incomingResponse.pageKey || outgoingResponse.pageKey || null
      };
    },
    'NETWORK_ERROR',
    'Failed to fetch transaction history from Alchemy. Please check your internet connection and API key.',
    'ALCHEMY_TRANSACTION_FETCH'
  );
}

/**
 * Convert Alchemy transfer to EtherscanTransaction format
 */
export function convertAlchemyTransferToTransaction(transfer: AlchemyTransfer, walletAddress: string): {|
  blockNumber: string,
  timeStamp: string,
  hash: string,
  nonce: string,
  blockHash: string,
  transactionIndex: string,
  from: string,
  to: string,
  value: string,
  gas: string,
  gasPrice: string,
  isError: string,
  txreceipt_status: string,
  input: string,
  contractAddress: string,
  cumulativeGasUsed: string,
  gasUsed: string,
  confirmations: string,
  methodId: string,
  functionName: string,
|} {
  return {
    blockNumber: transfer.blockNum,
    timeStamp: transfer.metadata?.blockTimestamp || '0',
    hash: transfer.hash,
    nonce: '0', // Not available in Alchemy transfers
    blockHash: '0x0', // Not available in Alchemy transfers
    transactionIndex: '0', // Not available in Alchemy transfers
    from: transfer.from,
    to: transfer.to || '',
    value: transfer.value?.toString() || '0',
    gas: '0', // Not available in Alchemy transfers
    gasPrice: '0', // Not available in Alchemy transfers
    isError: '0', // Assume successful if in transfer list
    txreceipt_status: '1', // Assume successful if in transfer list
    input: '0x', // Not available in Alchemy transfers
    contractAddress: (transfer.rawContract.address != null && transfer.rawContract.address !== '') ? transfer.rawContract.address : '',
    cumulativeGasUsed: '0', // Not available in Alchemy transfers
    gasUsed: '0', // Not available in Alchemy transfers
    confirmations: '0', // Not available in Alchemy transfers
    methodId: '0x', // Not available in Alchemy transfers
    functionName: transfer.category === 'erc20' ? 'transfer' : '', // Basic function name based on category
  };
}
