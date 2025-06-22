// @flow strict-local

/**
 * Transaction details fetcher using Alchemy SDK
 *
 * Fetches detailed transaction information including gas and fee data
 */

// $FlowFixMe[untyped-import] - alchemy-sdk is a third-party library
import { Alchemy, Network } from 'alchemy-sdk';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

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
 * Fetch detailed transaction information
 */
export async function fetchTransactionDetails(txHash: string, apiKey: string, network: string = 'mainnet'): Promise<TransactionDetails | null> {
  try {
    // Map network name to Alchemy network - same mapping as useTransactionHistory
    let alchemyNetwork;
    switch (network) {
      case 'mainnet':
        alchemyNetwork = Network.ETH_MAINNET;
        break;
      case 'sepolia':
        alchemyNetwork = Network.ETH_SEPOLIA;
        break;
      case 'arbitrum':
        alchemyNetwork = Network.ARB_MAINNET;
        break;
      case 'polygon':
        alchemyNetwork = Network.MATIC_MAINNET;
        break;
      default:
        alchemyNetwork = Network.ETH_SEPOLIA; // Default to Sepolia
    }

    const config = {
      apiKey,
      network: alchemyNetwork,
    };

    const alchemy = new Alchemy(config);

    // Fetch transaction receipt - this contains all the information we need for confirmed transactions
    const receipt = await alchemy.core.getTransactionReceipt(txHash);

    if (!receipt) {
      return null;
    }

    // Extract gas information from receipt
    const gasUsed = bigNumberToString(receipt.gasUsed);
    const effectiveGasPrice = bigNumberToString(receipt.effectiveGasPrice);

    // Calculate transaction fee using actual gas used and effective gas price
    const transactionFee = calculateTransactionFee(gasUsed, effectiveGasPrice, null);

    return {
      gasPrice: effectiveGasPrice, // Use effective gas price as the main gas price
      gasLimit: null, // Not available in receipt
      gasUsed,
      effectiveGasPrice,
      transactionFee,
      confirmations: receipt.confirmations || null,
      status: receipt.status || null,
      type: receipt.type || null,
      nonce: null, // Not available in receipt
      blockHash: receipt.blockHash || null,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error fetching transaction details:', error);
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
