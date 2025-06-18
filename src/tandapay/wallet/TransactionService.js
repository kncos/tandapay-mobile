/* @flow strict-local */

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

import { getEtherscanApiKey } from './WalletManager';
import { getTandaPaySelectedNetwork, getTandaPayCustomRpcConfig } from '../redux/selectors';
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

export type TransactionFetchResult =
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
      // Custom networks generally don't support Etherscan
      supportsEtherscan = false;
    } else {
      // Use standard network chain IDs
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
          supportsEtherscan = false; // Arbitrum uses Arbiscan, not Etherscan
          break;
        case 'polygon':
          chainId = 137;
          supportsEtherscan = false; // Polygon uses Polygonscan, not Etherscan
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
 * Fetch transaction history for a wallet address using Etherscan API
 */
export async function fetchTransactionHistory(
  walletAddress: string,
  page: number = 1,
  offset: number = 10,
): Promise<TransactionFetchResult> {
  try {
    // Check if API key is configured
    const apiKey = await getEtherscanApiKey();
    if (apiKey == null || apiKey === '') {
      return {
        success: false,
        error: 'No Etherscan API key configured',
        errorType: 'NO_API_KEY',
      };
    }

    // Get network information from Redux state
    const networkInfo = getNetworkInfo();

    if (!networkInfo.supportsEtherscan) {
      return {
        success: false,
        error: `Transaction history not supported for ${networkInfo.selectedNetwork} network`,
        errorType: 'API_ERROR',
      };
    }

    if (networkInfo.chainId == null || networkInfo.chainId === 0) {
      return {
        success: false,
        error: `Invalid chain ID for ${networkInfo.selectedNetwork} network`,
        errorType: 'API_ERROR',
      };
    }

    const apiUrl = 'https://api.etherscan.io/v2/api'; // Default Etherscan API URL
    if (apiUrl == null || apiUrl === '') {
      return {
        success: false,
        error: `Etherscan API not supported for chain ID ${String(networkInfo.chainId)}`,
        errorType: 'API_ERROR',
      };
    }

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

    // Make API request
    // console.log(url.toString());
    const response = await fetch(url.toString());

    if (!response.ok) {
      return {
        success: false,
        error: `Network error: ${response.status} ${response.statusText}`,
        errorType: 'NETWORK_ERROR',
      };
    }

    const data: EtherscanResponse = await response.json();

    if (data.status !== '1') {
      // Check if it's a "no transactions found" case (common for pagination)
      if (data.message && data.message.toLowerCase().includes('no transactions found')) {
        return {
          success: true,
          transactions: [], // Return empty array for no more transactions
        };
      }
      return {
        success: false,
        error: data.message || 'API request failed',
        errorType: 'API_ERROR',
      };
    }

    return {
      success: true,
      transactions: data.result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      errorType: 'NETWORK_ERROR',
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
