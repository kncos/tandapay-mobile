/* @flow strict-local */

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

import { getEtherscanApiKey } from './WalletManager';
import { getTandaPaySelectedNetwork, getTandaPayCustomRpcConfig } from '../redux/selectors';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import type { TandaPayResult } from '../errors/types';
import store from '../../boot/store';
import { tryGetActiveAccountState } from '../../selectors';

export type EtherscanTransaction = {|
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
|};

export type EtherscanResponse = {|
  status: string,
  message: string,
  result: $ReadOnlyArray<EtherscanTransaction>,
|};

export type TransactionFetchResult = TandaPayResult<$ReadOnlyArray<EtherscanTransaction>>;

/**
 * LEGACY TYPE: Deprecated - Use TandaPayResult<EtherscanTransaction[]> instead
 * @deprecated
 */
export type LegacyTransactionFetchResult =
  | {| success: true, transactions: $ReadOnlyArray<EtherscanTransaction> |}
  | {| success: false, error: string, errorType: 'NO_API_KEY' | 'NETWORK_ERROR' | 'API_ERROR' |};

/**
 * Get network configuration from Redux state
 */
type NetworkInfo = {|
  selectedNetwork: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom',
  chainId: ?number,
  supportsEtherscan: boolean,
|};

function getNetworkInfo(): NetworkInfo {
  try {
    const globalState = store.getState();
    const perAccountState = tryGetActiveAccountState(globalState);

    if (!perAccountState) {
      return { selectedNetwork: 'sepolia', chainId: 11155111, supportsEtherscan: true };
    }

    const selectedNetwork = getTandaPaySelectedNetwork(perAccountState);
    const customRpcConfig = getTandaPayCustomRpcConfig(perAccountState);

    // Get chain ID based on network
    let chainId = null;
    let supportsEtherscan = false;

    if (selectedNetwork === 'custom' && customRpcConfig) {
      chainId = customRpcConfig.chainId;

      // Check if custom network chain ID is supported by Etherscan V2 API
      // Etherscan V2 supports 50+ chains including popular ones
      const supportedChainIds = [
        1,        // Ethereum Mainnet
        11155111, // Sepolia Testnet
        17000,    // Holesky Testnet
        42161,    // Arbitrum One Mainnet
        421614,   // Arbitrum Sepolia Testnet
        42170,    // Arbitrum Nova Mainnet
        8453,     // Base Mainnet
        84532,    // Base Sepolia Testnet
        56,       // BNB Smart Chain Mainnet
        97,       // BNB Smart Chain Testnet
        137,      // Polygon Mainnet
        80002,    // Polygon Amoy Testnet
        1101,     // Polygon zkEVM Mainnet
        2442,     // Polygon zkEVM Cardona Testnet
        10,       // OP Mainnet
        11155420, // OP Sepolia Testnet
        43114,    // Avalanche C-Chain
        43113,    // Avalanche Fuji Testnet
        100,      // Gnosis
        25,       // Cronos Mainnet
        324,      // zkSync Mainnet
        300,      // zkSync Sepolia Testnet
        59144,    // Linea Mainnet
        59141,    // Linea Sepolia Testnet
        534352,   // Scroll Mainnet
        534351,   // Scroll Sepolia Testnet
        5000,     // Mantle Mainnet
        5003,     // Mantle Sepolia Testnet
        252,      // Fraxtal Mainnet
        2522,     // Fraxtal Testnet
        81457,    // Blast Mainnet
        168587773, // Blast Sepolia Testnet
        1284,     // Moonbeam Mainnet
        1285,     // Moonriver Mainnet
        1287,     // Moonbase Alpha Testnet
        204,      // opBNB Mainnet
        5611,     // opBNB Testnet
        // Add more supported chain IDs as needed
      ];

      supportsEtherscan = supportedChainIds.includes(chainId);
    } else {
      // Use standard network chain IDs
      // With Etherscan V2 API, all supported networks now use Etherscan with single API key
      switch (selectedNetwork) {
        case 'mainnet':
          chainId = 1;
          supportsEtherscan = true;
          break;
        case 'sepolia':
          chainId = 11155111;
          supportsEtherscan = true;
          break;
        case 'arbitrum':
          chainId = 42161;
          supportsEtherscan = true; // Now supported with Etherscan V2 API
          break;
        case 'polygon':
          chainId = 137;
          supportsEtherscan = true; // Now supported with Etherscan V2 API
          break;
        default:
          chainId = 11155111; // Default to Sepolia
          supportsEtherscan = true;
      }
    }

    return { selectedNetwork, chainId, supportsEtherscan };
  } catch (error) {
    // Fallback to default
    return { selectedNetwork: 'sepolia', chainId: 11155111, supportsEtherscan: true };
  }
}

/**
 * Fetch transaction history for a wallet address using Etherscan API with comprehensive error handling.
 * Returns a TandaPayResult with either the transactions array or structured error information.
 */
export async function fetchTransactionHistory(
  walletAddress: string,
  page: number = 1,
  offset: number = 10,
): Promise<TransactionFetchResult> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Input validation
      if (!walletAddress || walletAddress.trim() === '') {
        throw TandaPayErrorHandler.createValidationError(
          'Invalid wallet address',
          'Please provide a valid wallet address'
        );
      }

      if (page < 1 || offset < 1 || offset > 10000) {
        throw TandaPayErrorHandler.createValidationError(
          'Invalid pagination parameters',
          'Page must be >= 1 and offset must be between 1 and 10000'
        );
      }

      // Check if API key is configured
      const apiKey = await getEtherscanApiKey();
      if (apiKey == null || apiKey === '') {
        throw TandaPayErrorHandler.createError(
          'API_ERROR',
          'No Etherscan API key configured',
          {
            userMessage: 'Configure Etherscan API key to view transaction history',
            code: 'NO_API_KEY',
            retryable: false
          }
        );
      }

      // Get network information from Redux state
      const networkInfo = getNetworkInfo();

      if (!networkInfo.supportsEtherscan) {
        throw TandaPayErrorHandler.createError(
          'API_ERROR',
          `Transaction history not supported for ${networkInfo.selectedNetwork} network`,
          {
            userMessage: `Transaction history is not available for ${networkInfo.selectedNetwork} network`,
            code: 'UNSUPPORTED_NETWORK',
            retryable: false
          }
        );
      }

      if (networkInfo.chainId == null || networkInfo.chainId === 0) {
        throw TandaPayErrorHandler.createError(
          'API_ERROR',
          `Invalid chain ID for ${networkInfo.selectedNetwork} network`,
          {
            userMessage: 'Network configuration error. Please try a different network.',
            code: 'INVALID_CHAIN_ID',
            retryable: false
          }
        );
      }

      const apiUrl = 'https://api.etherscan.io/v2/api'; // Default Etherscan API URL

      // Build API URL
      const url = new URL(apiUrl);
      url.searchParams.set('chainid', String(networkInfo.chainId));
      url.searchParams.set('module', 'account');
      url.searchParams.set('action', 'txlist');
      url.searchParams.set('address', walletAddress);
      url.searchParams.set('startblock', '0');
      url.searchParams.set('endblock', '99999999');
      url.searchParams.set('page', String(page));
      url.searchParams.set('offset', String(offset));
      url.searchParams.set('sort', 'desc'); // Most recent first
      url.searchParams.set('apikey', apiKey);

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        // Make API request
        const response = await fetch(url.toString(), {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429) {
            throw TandaPayErrorHandler.createError(
              'RATE_LIMITED',
              'Too many requests to Etherscan API',
              {
                userMessage: 'Too many requests. Please wait a moment and try again.',
                retryable: true,
                details: { status: response.status, statusText: response.statusText }
              }
            );
          } else if (response.status === 401) {
            throw TandaPayErrorHandler.createError(
              'API_ERROR',
              'Invalid Etherscan API key',
              {
                userMessage: 'Invalid API key. Please check your Etherscan API key configuration.',
                code: 'INVALID_API_KEY',
                retryable: false
              }
            );
          } else {
            throw TandaPayErrorHandler.createNetworkError(
              `HTTP ${response.status}: ${response.statusText}`,
              {
                userMessage: 'Network error while fetching transactions. Please try again.',
                details: { status: response.status, statusText: response.statusText }
              }
            );
          }
        }

        const data: EtherscanResponse = await response.json();

        if (data.status !== '1') {
          // Check if it's a "no transactions found" case (common for pagination)
          if (data.message && data.message.toLowerCase().includes('no transactions found')) {
            return []; // Return empty array for no more transactions
          }

          // For any other error, use the result field as the error message
          // Etherscan provides good error messages in the result field when status is "0"
          const errorMessage = String(data.result || data.message || 'Unknown API error');

          throw TandaPayErrorHandler.createError(
            'API_ERROR',
            `Etherscan API error: ${errorMessage}`,
            {
              userMessage: errorMessage,
              code: 'ETHERSCAN_API_ERROR',
              retryable: true,
              details: { apiMessage: data.message, apiResult: data.result }
            }
          );
        }

        // Validate the result
        if (!Array.isArray(data.result)) {
          throw TandaPayErrorHandler.createError(
            'PARSING_ERROR',
            'Invalid transaction data format received',
            {
              userMessage: 'Received invalid transaction data. Please try again.',
              details: { result: data.result }
            }
          );
        }

        return data.result;
      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          throw TandaPayErrorHandler.createError(
            'TIMEOUT_ERROR',
            'Transaction history request timed out',
            {
              userMessage: 'Request timed out. Please check your connection and try again.',
              retryable: true
            }
          );
        }

        // Re-throw if it's already a TandaPayError
        if (fetchError.type) {
          throw fetchError;
        }

        // Handle other fetch errors
        throw TandaPayErrorHandler.createNetworkError(
          `Network request failed: ${fetchError.message}`,
          {
            userMessage: 'Network error while fetching transactions. Please check your connection.',
            details: { originalError: fetchError.message }
          }
        );
      }
    },
    'API_ERROR',
    'Failed to load transaction history. Please check your connection and try again.',
    'TRANSACTION_HISTORY_FETCH'
  );
}

/**
 * Format transaction value from wei to ETH using ethers.js
 */
export function formatTransactionValue(valueWei: string): string {
  try {
    const ethValue = ethers.utils.formatEther(valueWei);
    const value = parseFloat(ethValue);

    if (value === 0) {
      return '0 ETH';
    }
    if (value < 0.0001) {
      return '< 0.0001 ETH';
    }
    return `${value.toFixed(4)} ETH`;
  } catch {
    return '0 ETH';
  }
}

/**
 * Format timestamp to readable date
 */
export function formatTransactionDate(timestamp: string): string {
  try {
    const date = new Date(parseInt(timestamp, 10) * 1000);
    return date.toLocaleDateString();
  } catch {
    return 'Unknown';
  }
}

/**
 * Get transaction direction and counterparty
 */
export function getTransactionInfo(transaction: EtherscanTransaction, walletAddress: string): {|
  direction: 'sent' | 'received',
  counterparty: string,
|} {
  const isReceived = transaction.to.toLowerCase() === walletAddress.toLowerCase();
  return {
    direction: isReceived ? 'received' : 'sent',
    counterparty: isReceived ? transaction.from : transaction.to,
  };
}
