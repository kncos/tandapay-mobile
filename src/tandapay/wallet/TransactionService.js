/* @flow strict-local */

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

import type { EtherscanTransaction } from './EtherscanService';
import { fetchTransactionHistory as fetchEtherscanHistory } from './EtherscanService';
import { fetchTransactionHistoryAlchemy, convertAlchemyTransferToTransaction } from './AlchemyService';
import { hasAlchemyApiKey, hasEtherscanApiKey } from './WalletManager';
import type { TandaPayResult } from '../errors/types';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import TandaPayColors from '../styles/colors';

// Re-export types for convenience
export type { EtherscanTransaction } from './EtherscanService';

/**
 * Enhanced transaction fetch with Alchemy primary, Etherscan fallback
 */
export async function fetchTransactionHistory(
  walletAddress: string,
  pageKey?: ?string,
  network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' = 'sepolia',
  offset: number = 10
): Promise<TandaPayResult<{| transactions: EtherscanTransaction[], pageKey: ?string, hasMore: boolean |}>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Check for Alchemy API key first (preferred)
      const alchemyKeyResult = await hasAlchemyApiKey();
      if (alchemyKeyResult.success && alchemyKeyResult.data) {
        const alchemyResult = await fetchTransactionHistoryAlchemy(walletAddress, pageKey, network);
        if (alchemyResult.success) {
          // Convert Alchemy transfers to our transaction format
          const transactions = alchemyResult.data.transfers.map(transfer =>
            convertAlchemyTransferToTransaction(transfer, walletAddress)
          );
          // Take only the requested number of transactions
          const limitedTransactions = transactions.slice(0, offset);
          return {
            transactions: limitedTransactions,
            pageKey: alchemyResult.data.pageKey,
            hasMore: limitedTransactions.length === offset && alchemyResult.data.pageKey != null
          };
        }
        // If Alchemy fails, continue to Etherscan fallback
      }

      // Fallback to Etherscan
      const etherscanKeyResult = await hasEtherscanApiKey();
      if (etherscanKeyResult.success && etherscanKeyResult.data) {
        // For Etherscan, convert pageKey logic to page numbers
        const page = pageKey != null ? parseInt(pageKey, 10) : 1;
        const etherscanResult = await fetchEtherscanHistory(walletAddress, page, offset);
        if (etherscanResult.success) {
          return {
            transactions: [...etherscanResult.data],
            pageKey: (page + 1).toString(),
            hasMore: etherscanResult.data.length === offset
          };
        }
      }

      // No API keys available
      throw TandaPayErrorHandler.createError(
        'VALIDATION_ERROR',
        'No API keys configured',
        {
          userMessage: 'Please configure an Alchemy or Etherscan API key in wallet settings to view transaction history.'
        }
      );
    },
    'NETWORK_ERROR',
    'Failed to fetch transaction history. Please check your internet connection and API key configuration.',
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
