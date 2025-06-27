// @flow strict-local

/**
 * Transaction display formatter for transfer system
 *
 * Formats Alchemy transfer objects for display in the UI
 */

// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';
import {
  decodeTandaPayTransaction,
  isTandaPayTransaction,
  getTandaPayTransactionSummary
} from './TandaPayTransactionDecoder';
import type { DecodedTandaPayTransaction } from './TandaPayTransactionDecoder';

type Transfer = mixed;

export type FormattedTransfer = {|
  hash: string,
  blockNumber: ?string,
  timestamp: ?string,
  direction: 'IN' | 'OUT',
  asset: string,
  value: string,
  formattedValue: string,
  category: string,
  from: string,
  to: string,
  contractAddress: ?string,
  // TandaPay specific fields
  isTandaPayTransaction: boolean,
  tandaPayDecoded: ?DecodedTandaPayTransaction,
  tandaPaySummary: ?string,
|};

/**
 * Format value for display based on asset type
 */
function formatValueForDisplay(value: string, asset: string, category: string): string {
  if (!value || value === '0') {
    return `0 ${asset}`;
  }

  try {
    if (asset === 'ETH' || category === 'external' || category === 'internal') {
      // ETH values are in wei, convert to ETH
      const ethValue = ethers.utils.formatEther(value);
      const numericValue = parseFloat(ethValue);

      if (numericValue === 0) {
        return '0 ETH';
      } else if (numericValue < 0.001) {
        return `${numericValue.toExponential(3)} ETH`;
      } else {
        return `${numericValue.toFixed(6)} ETH`;
      }
    } else if (category === 'erc20') {
      // ERC20 tokens - use value as-is since Alchemy returns properly formatted values
      return `${value} ${asset}`;
    } else {
      // Fallback for any other category
      return `${value} ${asset}`;
    }
  } catch (error) {
    // Fallback to raw value if formatting fails
    return `${value} ${asset}`;
  }
}

/**
 * Enhance transfer with TandaPay transaction data (async)
 */
export async function enhanceTransferWithTandaPayData(
  transfer: Transfer,
  walletAddress: string,
  tandaPayContractAddress?: ?string,
  network?: string
): Promise<FormattedTransfer> {
  // $FlowFixMe[unclear-type] - Transfer object structure is dynamic from Alchemy
  const transferObj = (transfer: any);

  const hash = transferObj?.hash || '';
  const blockNumber = transferObj?.blockNum ? parseInt(transferObj.blockNum, 16).toString() : null;
  const timestamp = transferObj?.metadata?.blockTimestamp || null;
  const direction = transferObj?.direction || 'IN';
  const asset = transferObj?.asset || 'ETH';
  const value = transferObj?.value?.toString() || '0';
  const category = transferObj?.category || 'external';
  const from = transferObj?.from || '';
  const to = transferObj?.to || '';
  const contractAddress = transferObj?.rawContract?.address || null;

  // Format the value for display
  const formattedValue = formatValueForDisplay(value, asset, category);

  // Check if this is a TandaPay transaction
  const isTPTransaction = isTandaPayTransaction(transferObj, tandaPayContractAddress);
  let decodedTandaPayData: ?DecodedTandaPayTransaction = null;
  let tandaPayActionSummary: ?string = null;

  if (isTPTransaction) {
    // Try to decode the transaction data, fetching full transaction if needed
    const inputData = transferObj?.input || transferObj?.data || '0x';
    try {
      const decodedResult = await decodeTandaPayTransaction(inputData, hash, network, 'success');
      if (decodedResult != null) {
        decodedTandaPayData = decodedResult;
        tandaPayActionSummary = getTandaPayTransactionSummary(decodedResult);
      }
    } catch (error) {
      // If decoding fails, leave both as null
      decodedTandaPayData = null;
      tandaPayActionSummary = null;
    }
  }

  return {
    hash,
    blockNumber,
    timestamp,
    direction,
    asset,
    value,
    formattedValue,
    category,
    from,
    to,
    contractAddress,
    isTandaPayTransaction: isTPTransaction,
    tandaPayDecoded: decodedTandaPayData,
    tandaPaySummary: tandaPayActionSummary,
  };
}

/**
 * Get display symbol for transfer direction
 */
export function getTransferSymbol(direction: 'IN' | 'OUT'): string {
  return direction === 'IN' ? '📥' : '📤';
}

/**
 * Format transfer for one-line display in lists
 */
export async function formatTransferSummary(
  transfer: Transfer,
  walletAddress: string,
  tandaPayContractAddress?: ?string,
  network?: string
): Promise<string> {
  const formatted = await enhanceTransferWithTandaPayData(transfer, walletAddress, tandaPayContractAddress, network);
  const symbol = getTransferSymbol(formatted.direction);

  return `${symbol} ${formatted.direction} | ${formatted.formattedValue} | Block ${formatted.blockNumber != null ? formatted.blockNumber : 'Unknown'}`;
}

/**
 * Convert transfer to EtherscanTransaction format for compatibility
 */
export async function convertTransferToEtherscanFormat(
  transfer: Transfer,
  walletAddress: string,
  tandaPayContractAddress?: ?string,
  network?: string
): Promise<{|
  hash: string,
  blockNumber: string,
  timeStamp: string,
  from: string,
  to: string,
  value: string,
  gas: string,
  gasPrice: string,
  gasUsed: string,
  cumulativeGasUsed: string,
  input: string,
  confirmations: string,
  isError: string,
  txreceipt_status: string,
  contractAddress: string,
  functionName: string,
  methodId: string,
  direction: 'IN' | 'OUT',
  asset: string,
  formattedValue: string,
  // TandaPay specific fields
  isTandaPayTransaction: boolean,
  tandaPayDecoded: ?DecodedTandaPayTransaction,
  tandaPaySummary: ?string,
|}> {
  const formatted = await enhanceTransferWithTandaPayData(transfer, walletAddress, tandaPayContractAddress, network);

  // $FlowFixMe[unclear-type] - Transfer object structure is dynamic from Alchemy
  const transferObj = (transfer: any);
  const inputData = transferObj?.input || transferObj?.data || '0x';

  return {
    hash: formatted.hash,
    blockNumber: formatted.blockNumber != null ? formatted.blockNumber : '0',
    timeStamp: formatted.timestamp != null ? formatted.timestamp : '0',
    from: formatted.from,
    to: formatted.to,
    value: formatted.value,
    gas: '0',
    gasPrice: '0',
    gasUsed: '0',
    cumulativeGasUsed: '0',
    input: inputData,
    confirmations: '0',
    isError: '0',
    txreceipt_status: '1',
    contractAddress: formatted.contractAddress || '',
    functionName: '',
    methodId: '0x',
    direction: formatted.direction,
    asset: formatted.asset,
    formattedValue: formatted.formattedValue,
    isTandaPayTransaction: formatted.isTandaPayTransaction,
    tandaPayDecoded: formatted.tandaPayDecoded,
    tandaPaySummary: formatted.tandaPaySummary,
  };
}
