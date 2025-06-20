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
import TandaPayColors from '../styles/colors';

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
  try {
    // Input validation
    if (!walletAddress || walletAddress.trim() === '') {
      return {
        success: false,
        error: TandaPayErrorHandler.createValidationError(
          'Invalid wallet address',
          'Please provide a valid wallet address'
        )
      };
    }

    if (page < 1 || offset < 1 || offset > 10000) {
      return {
        success: false,
        error: TandaPayErrorHandler.createValidationError(
          'Invalid pagination parameters',
          'Page must be >= 1 and offset must be between 1 and 10000'
        )
      };
    }

    // Check if API key is configured
    const apiKeyResult = await getEtherscanApiKey();
    if (!apiKeyResult.success) {
      return {
        success: false,
        error: TandaPayErrorHandler.createError(
          'STORAGE_ERROR',
          'Failed to retrieve Etherscan API key',
          {
            userMessage: 'Unable to access API key. Please try restarting the app.',
            code: 'API_KEY_ACCESS_ERROR',
            retryable: false
          }
        )
      };
    }

    const apiKey = apiKeyResult.data;
    if (apiKey == null || apiKey === '') {
      return {
        success: false,
        error: TandaPayErrorHandler.createError(
          'API_ERROR',
          'No Etherscan API key configured',
          {
            userMessage: 'Configure Etherscan API key to view transaction history',
            code: 'NO_API_KEY',
            retryable: false
          }
        )
      };
    }

    // Get network information from Redux state
    const networkInfo = getNetworkInfo();

    if (!networkInfo.supportsEtherscan) {
      return {
        success: false,
        error: TandaPayErrorHandler.createError(
          'API_ERROR',
          `Transaction history not supported for ${networkInfo.selectedNetwork} network`,
          {
            userMessage: `Transaction history is not available for ${networkInfo.selectedNetwork} network`,
            code: 'UNSUPPORTED_NETWORK',
            retryable: false
          }
        )
      };
    }

    if (networkInfo.chainId == null || networkInfo.chainId === 0) {
      return {
        success: false,
        error: TandaPayErrorHandler.createError(
          'API_ERROR',
          `Invalid chain ID for ${networkInfo.selectedNetwork} network`,
          {
            userMessage: 'Network configuration error. Please try a different network.',
            code: 'INVALID_CHAIN_ID',
            retryable: false
          }
        )
      };
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
          return {
            success: false,
            error: TandaPayErrorHandler.createError(
              'RATE_LIMITED',
              'Too many requests to Etherscan API',
              {
                userMessage: 'Too many requests. Please wait a moment and try again.',
                retryable: true,
                details: { status: response.status, statusText: response.statusText }
              }
            )
          };
        } else if (response.status === 401) {
          return {
            success: false,
            error: TandaPayErrorHandler.createError(
              'API_ERROR',
              'Invalid Etherscan API key',
              {
                userMessage: 'Invalid API key. Please check your Etherscan API key configuration.',
                code: 'INVALID_API_KEY',
                retryable: false
              }
            )
          };
        } else {
          return {
            success: false,
            error: TandaPayErrorHandler.createNetworkError(
              `HTTP ${response.status}: ${response.statusText}`,
              {
                userMessage: 'Network error while fetching transactions. Please try again.',
                details: { status: response.status, statusText: response.statusText }
              }
            )
          };
        }
      }

      const data: EtherscanResponse = await response.json();

      if (data.status !== '1') {
        // Check if it's a "no transactions found" case (common for pagination)
        if (data.message && data.message.toLowerCase().includes('no transactions found')) {
          return { success: true, data: [] }; // Return empty array for no more transactions
        }

        // For any other error, use the result field as the error message
        // Etherscan provides good error messages in the result field when status is "0"
        const errorMessage = String(data.result || data.message || 'Unknown API error');

        // Check if it's an API key error specifically
        if (errorMessage.toLowerCase().includes('invalid api key')) {
          return {
            success: false,
            error: TandaPayErrorHandler.createError(
              'API_ERROR',
              `Etherscan API error: ${errorMessage}`,
              {
                userMessage: errorMessage,
                code: 'INVALID_API_KEY',
                retryable: false,
                details: { apiMessage: data.message, apiResult: data.result }
              }
            )
          };
        }

        return {
          success: false,
          error: TandaPayErrorHandler.createError(
            'API_ERROR',
            `Etherscan API error: ${errorMessage}`,
            {
              userMessage: errorMessage,
              code: 'ETHERSCAN_API_ERROR',
              retryable: true,
              details: { apiMessage: data.message, apiResult: data.result }
            }
          )
        };
      }

      // Validate the result
      if (!Array.isArray(data.result)) {
        return {
          success: false,
          error: TandaPayErrorHandler.createError(
            'PARSING_ERROR',
            'Invalid transaction data format received',
            {
              userMessage: 'Received invalid transaction data. Please try again.',
              details: { result: data.result }
            }
          )
        };
      }

      return { success: true, data: data.result };
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        return {
          success: false,
          error: TandaPayErrorHandler.createError(
            'TIMEOUT_ERROR',
            'Transaction history request timed out',
            {
              userMessage: 'Request timed out. Please check your connection and try again.',
              retryable: true
            }
          )
        };
      }

      // Re-throw if it's already a TandaPayError
      if (fetchError.type) {
        return { success: false, error: fetchError };
      }

      // Handle other fetch errors
      return {
        success: false,
        error: TandaPayErrorHandler.createNetworkError(
          `Network request failed: ${fetchError.message}`,
          {
            userMessage: 'Network error while fetching transactions. Please check your connection.',
            details: { originalError: fetchError.message }
          }
        )
      };
    }
  } catch (error) {
    // Handle any other unexpected errors
    return {
      success: false,
      error: TandaPayErrorHandler.createError(
        'API_ERROR',
        error.message || 'Failed to fetch transaction history',
        {
          userMessage: 'Failed to load transaction history. Please try again.',
          details: error
        }
      )
    };
  }
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

/**
 * Enhanced transaction information including ERC20 details
 */
export type TransactionDetails = {|
  direction: 'sent' | 'received',
  counterparty: string,
  isERC20Transfer: boolean,
  tokenInfo?: {|
    symbol: string,
    amount: string,
    contractAddress: string,
  |},
  ethValue: string,
  formattedDate: string,
  status: 'success' | 'failed',
|};

// ERC20 transfer function signature
const ERC20_TRANSFER_SIGNATURE = '0xa9059cbb';

/**
 * Detect if a transaction is an ERC20 transfer
 */
export function isERC20Transfer(transaction: EtherscanTransaction): boolean {
  return transaction.input.startsWith(ERC20_TRANSFER_SIGNATURE) && transaction.input.length >= 138;
}

/**
 * Parse ERC20 transfer data from transaction input
 */
export function parseERC20Transfer(transaction: EtherscanTransaction): ?{|
  to: string,
  amount: string,
|} {
  if (!isERC20Transfer(transaction)) {
    return null;
  }

  try {
    // Remove function signature (first 10 characters: 0xa9059cbb)
    const inputData = transaction.input.slice(10);

    // Extract to address (first 32 bytes, last 20 bytes are the address)
    const toAddress = `0x${inputData.slice(24, 64)}`;

    // Extract amount (next 32 bytes)
    const amountHex = inputData.slice(64, 128);
    const amount = ethers.BigNumber.from(`0x${amountHex}`).toString();

    return { to: toAddress, amount };
  } catch {
    return null;
  }
}

/**
 * Format token amount with proper decimal handling
 */
export function formatTokenAmount(amountWei: string, decimals: number = 18, symbol: string = 'TOKEN'): string {
  try {
    const tokenAmount = ethers.utils.formatUnits(amountWei, decimals);
    const value = parseFloat(tokenAmount);

    if (value === 0) {
      return `0 ${symbol}`;
    }
    if (value < 0.0001) {
      return `< 0.0001 ${symbol}`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M ${symbol}`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K ${symbol}`;
    }
    return `${value.toFixed(4)} ${symbol}`;
  } catch {
    return `0 ${symbol}`;
  }
}

/**
 * Get enhanced transaction information with ERC20 detection
 */
export function getTransactionDetails(transaction: EtherscanTransaction, walletAddress: string): TransactionDetails {
  const normalizedWallet = walletAddress.toLowerCase();
  const isERC20 = isERC20Transfer(transaction);

  let direction: 'sent' | 'received';
  let counterparty: string;

  if (isERC20) {
    const erc20Data = parseERC20Transfer(transaction);
    if (erc20Data) {
      // For ERC20 transfers, check if the recipient matches our wallet
      direction = erc20Data.to.toLowerCase() === normalizedWallet ? 'received' : 'sent';
      counterparty = direction === 'received' ? transaction.from : erc20Data.to;
    } else {
      // Fallback to regular transaction logic if parsing fails
      direction = transaction.to.toLowerCase() === normalizedWallet ? 'received' : 'sent';
      counterparty = direction === 'received' ? transaction.from : transaction.to;
    }
  } else {
    // Regular ETH transaction
    direction = transaction.to.toLowerCase() === normalizedWallet ? 'received' : 'sent';
    counterparty = direction === 'received' ? transaction.from : transaction.to;
  }

  // Determine transaction status
  const status: 'success' | 'failed' = transaction.isError === '0' && transaction.txreceipt_status === '1'
    ? 'success'
    : 'failed';

  const result: TransactionDetails = {
    direction,
    counterparty,
    isERC20Transfer: isERC20,
    ethValue: formatTransactionValue(transaction.value),
    formattedDate: formatTransactionDate(transaction.timeStamp),
    status,
  };

  // Add token info for ERC20 transfers
  if (isERC20) {
    const erc20Data = parseERC20Transfer(transaction);
    if (erc20Data) {
      result.tokenInfo = {
        symbol: 'TOKEN', // Default symbol - can be enhanced with contract calls
        amount: formatTokenAmount(erc20Data.amount),
        contractAddress: transaction.to,
      };
    }
  }

  return result;
}

/**
 * Get color for transaction based on direction and status
 */
export function getTransactionColor(details: TransactionDetails): string {
  if (details.status === 'failed') {
    return TandaPayColors.error;
  }

  return details.direction === 'received' ? TandaPayColors.success : TandaPayColors.primary;
}

/**
 * Format transaction display text with proper formatting
 */
export function formatTransactionDisplay(transaction: EtherscanTransaction, walletAddress: string): {|
  text: string,
  color: string,
  details: TransactionDetails,
|} {
  const details = getTransactionDetails(transaction, walletAddress);
  const color = getTransactionColor(details);

  let text: string;

  if (details.isERC20Transfer && details.tokenInfo) {
    // ERC20 transfer display - no hash, cleaner format
    const action = details.direction === 'sent' ? 'Sent' : 'Received';
    text = `${action} ${details.tokenInfo.amount}`;
  } else {
    // Regular ETH transaction display - no hash, cleaner format
    const action = details.direction === 'sent' ? 'Sent' : 'Received';
    text = `${action} ${details.ethValue}`;
  }

  if (details.status === 'failed') {
    text = `❌ ${text}`;
  }

  return { text, color, details };
}
