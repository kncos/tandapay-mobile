// @flow strict-local

/**
 * Transaction details fetcher using clean Alchemy API helper
 *
 * Fetches detailed transaction information including gas and fee data
 */

// $FlowFixMe[untyped-import] - ethers is not typed for Flow
import { ethers } from 'ethers';

import { getTransactionDetails } from './AlchemyApiHelper';
import type { SupportedNetwork } from '../definitions';

export type TransactionDetails = {|
  gasPrice: ?string,
  gasLimit: ?string,
  gasUsed: ?string,
  effectiveGasPrice: ?string,
  transactionFee: ?string,
  confirmations: ?number,
  status: ?number,
  type: ?number,
  nonce: ?number,
  blockHash: ?string,
|};

/**
 * Convert BigNumber to readable string
 */
function bigNumberToString(value: mixed): ?string {
  if (value == null) {
    return null;
  }

  try {
    // $FlowFixMe[unclear-type] - BigNumber handling
    const bigNumber = (value: any);
    if (bigNumber && typeof bigNumber.toString === 'function') {
      return bigNumber.toString();
    }
    return String(value);
  } catch (error) {
    return null;
  }
}

/**
 * Format wei to ETH with proper precision
 */
function formatWeiToEth(weiValue: ?string): ?string {
  if (weiValue == null || weiValue === '0') {
    return null;
  }

  try {
    const ethValue = ethers.utils.formatEther(weiValue);
    const numericValue = parseFloat(ethValue);

    if (numericValue === 0) {
      return null;
    }
    if (numericValue < 0.000001) {
      return `${numericValue.toExponential(3)} ETH`;
    }
    return `${numericValue.toFixed(6)} ETH`;
  } catch (error) {
    return null;
  }
}

/**
 * Calculate transaction fee from gas data
 * Uses gasLimit if gasUsed is not available
 */
function calculateTransactionFee(gasAmount: ?string, gasPrice: ?string, effectiveGasPrice: ?string): ?string {
  const price = effectiveGasPrice != null ? effectiveGasPrice : gasPrice;
  if (gasAmount == null || price == null) {
    return null;
  }

  try {
    const fee = ethers.BigNumber.from(gasAmount).mul(ethers.BigNumber.from(price));
    return fee.toString();
  } catch (error) {
    return null;
  }
}

/**
 * Fetch detailed transaction information using clean Alchemy API
 */
export async function fetchTransactionDetails(txHash: string, apiKey: string, network: SupportedNetwork = 'mainnet'): Promise<TransactionDetails | null> {
  try {
    // Use the new Alchemy API helper
    const result = await getTransactionDetails(network, txHash);

    if (!result.receipt) {
      return null;
    }

    const receipt = result.receipt;
    const transaction = result.transaction;

    // Extract gas information from receipt and transaction
    const gasUsed = bigNumberToString(receipt.gasUsed);
    const effectiveGasPrice = bigNumberToString(receipt.effectiveGasPrice);
    const gasPrice = transaction ? bigNumberToString(transaction.gasPrice) : effectiveGasPrice;
    const gasLimit = transaction ? bigNumberToString(transaction.gas) : null;

    // Calculate transaction fee using actual gas used and effective gas price
    const transactionFee = calculateTransactionFee(gasUsed, effectiveGasPrice);

    return {
      gasPrice,
      gasLimit,
      gasUsed,
      effectiveGasPrice,
      transactionFee,
      confirmations: null, // Not available in our response format
      status: receipt.status != null && receipt.status !== '' ? parseInt(receipt.status, 16) : null,
      type: receipt.type != null && receipt.type !== '' ? parseInt(receipt.type, 16) : null,
      nonce: transaction ? parseInt(transaction.nonce, 16) : null,
      blockHash: receipt.blockHash || null,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Format gas information for display
 */
export function formatGasInfoForDisplay(details: TransactionDetails): {|
  gasLimit: ?string,
  gasUsed: ?string,
  gasPrice: ?string,
  effectiveGasPrice: ?string,
  transactionFee: ?string,
  efficiency: ?string,
|} {
  // Only show fields that are actually available from the receipt
  const gasLimit = null; // Not available in receipt
  const gasUsed = details.gasUsed != null ? `${parseInt(details.gasUsed, 10).toLocaleString()}` : null;
  const gasPrice = details.gasPrice != null ? `${(parseInt(details.gasPrice, 10) / 1e9).toFixed(2)} Gwei` : null;
  const effectiveGasPrice = details.effectiveGasPrice != null ? `${(parseInt(details.effectiveGasPrice, 10) / 1e9).toFixed(2)} Gwei` : null;
  const transactionFee = details.transactionFee != null ? formatWeiToEth(details.transactionFee) : null;
  const efficiency = null; // Can't calculate without gas limit

  return {
    gasLimit,
    gasUsed,
    gasPrice,
    effectiveGasPrice,
    transactionFee,
    efficiency,
  };
}
