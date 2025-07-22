// @flow

import { ethers } from 'ethers';
import type { SignedTransaction, Transfer } from './AlchemyApiTypes';
import { TandaPayInfo } from '../contract/utils/TandaPay';
import { Erc20Abi } from '../contract/utils/Erc20Abi';

export type DecodedAbiInput = {|
  functionName: string,
  functionSignature: string,
  arguments: Array<{ name: string, type: string, value: mixed }>,
|};

export type GasInfo = {|
  gasUsed: string,          // gas units, hexadecimal string
  gasPricePerUnit: string,  // gas price per unit, in gwei, hexadecimal string
|};

export type FullTransaction = {|
  hash: string | null,
  blockNum: string | null, // in hex format
  // a tandapay transaction can involve erc20 tokens and takes precedence over generic 'erc20' transactions
  type: 'tandapay' | 'erc20' | 'eth' | 'deployment' | 'self' | 'unknown',
  isSelfTransaction: boolean, // true if this is a self-transfer (from and to are the same)
  selfTransferAmount: number | null, // amount of the self-transfer, if applicable
  selfTransferAsset: string | null, // asset of the self-transfer, if applicable
  isErc20Transferred: boolean, // true if this transaction involves an ERC20 token transfer
  netValueChanges: Map<string, number> | null, // map of assets to net value changes
  transferDirection: 'sent' | 'received' | null, // overall direction of the transaction, null if no net transfer
  transfers: Transfer[] | null, // array of transfer objects

  // additional details for tandapay transactions
  additionalDetails?: {
    signedTransaction?: SignedTransaction | null, // the signed transaction object, if available
    decodedInput?: DecodedAbiInput | null,
  },
  fetchGasInfo: () => Promise<GasInfo>,
|};

/**
 * Get the chip info for a full transaction to display in a UI component.
 * @param {FullTransaction} ft - The full transaction object.
 * @returns {string[]} Array of strings representing each line for the chip info.
 */
export const getFullTransactionChipInfo = (ft: FullTransaction): string[] => {
  const lines: string[] = [];

  const blockTimestamp = ft.transfers && ft.transfers[0] && ft.transfers[0].metadata
    ? ft.transfers[0].metadata.blockTimestamp
    : null;
  const timestamp = blockTimestamp ? new Date(blockTimestamp) : null;

  if (ft.type === 'tandapay') {
    lines.push('TandaPay Action');
    lines.push(ft.additionalDetails?.decodedInput?.functionName || 'Unknown Function');
    lines.push(`${timestamp?.toLocaleString() ?? 'Unknown Timestamp'}`);
    return lines;
  }
  else if (ft.type === 'self' || ft.isSelfTransaction) {
    lines.push('Self Transfer');
    lines.push(`Amount: ${ft.selfTransferAmount || 0} ${ft.selfTransferAsset || 'Unknown Asset'}`);
    lines.push(`${timestamp?.toLocaleString() ?? 'Unknown Timestamp'}`);
    return lines;
  }
  else if (ft.type === 'erc20') {
    if (ft.isErc20Transferred) {
      const anyEntry = ft.netValueChanges ? ft.netValueChanges.entries().next().value : null;
      if (anyEntry) {
        const [asset, value] = anyEntry;
        const directionText = ft.transferDirection === 'sent' ? 'Sent'
          : ft.transferDirection === 'received' ? 'Received'
          : 'Transferred';
        lines.push(`${asset} ${directionText}`);
        lines.push(`Amount: ${Math.abs(value)}`); // Show absolute value for display
        lines.push(`${timestamp?.toLocaleString() ?? 'Unknown Timestamp'}`);
        return lines;
      }
    }

    lines.push('ERC20 Action');
    lines.push(`${ft.additionalDetails?.decodedInput?.functionName || 'Unknown Function'}`);
    lines.push(`${timestamp?.toLocaleString() ?? 'Unknown Timestamp'}`);
    return lines;
  }
  else if (ft.type === 'eth') {
    const anyEntry = ft.netValueChanges ? ft.netValueChanges.entries().next().value : null;
    if (anyEntry) {
      const [asset, value] = anyEntry;
      const directionText = ft.transferDirection === 'sent' ? 'Sent'
        : ft.transferDirection === 'received' ? 'Received'
        : 'Transferred';
      lines.push(`${asset} ${directionText}`);
      lines.push(`Amount: ${Math.abs(value)}`); // Show absolute value for display
      lines.push(`${timestamp?.toLocaleString() ?? 'Unknown Timestamp'}`);
      return lines;
    } else {
      lines.push('ETH Transfer');
      lines.push(`${timestamp?.toLocaleString() ?? 'Unknown Timestamp'}`);
      return lines;
    }
  } else if (ft.type === 'deployment') {
    lines.push('Contract Deployment');
    lines.push(`${timestamp?.toLocaleString() ?? 'Unknown Timestamp'}`);
    return lines;
  }

  lines.push('Misc Transaction');
  lines.push(`${timestamp?.toLocaleString() ?? 'Unknown Timestamp'}`);
  return lines;
};

/**
 * Get the transfer direction for a transaction to determine color coding.
 * This reuses the same logic that's used internally for chip text.
 * @param {FullTransaction} ft - The full transaction object.
 * @returns {'sent' | 'received' | 'tandapay' | null} - The transfer direction or type.
 */
export const getTransactionDirection = (ft: FullTransaction): 'sent' | 'received' | 'tandapay' | null => {
  if (ft.type === 'tandapay') {
    return 'tandapay';
  }

  // For ERC20 and ETH transactions, use the computed transferDirection
  if ((ft.type === 'erc20' || ft.type === 'eth') && ft.transferDirection) {
    return ft.transferDirection;
  }

  return null;
};

const isTandaPayTransaction = (tx: Transfer, tandapayContractAddress: string) => {
  if (tx.to !== null && tx.to.toLowerCase() === tandapayContractAddress.toLowerCase()) {
    return true; // this transaction is to the TandaPay contract
  }
  if (tx.from !== null && tx.from.toLowerCase() === tandapayContractAddress.toLowerCase()) {
    return true; // this transaction is from the TandaPay contract
  }
  return false;
};

const isErc20Transaction = (tx: Transfer): boolean => tx && tx.category && tx.category === 'erc20';

const getTransferDirection = (tx: Transfer, walletAddress: string): 'in' | 'out' | 'self' | 'deployment' | 'unknown' => {
  // from should generally always be populated?
  if (tx.from === null) {
    return 'unknown';
  }
  // if to isn't populated, it means this is a contract deployment
  else if (tx.to === null) {
    return 'deployment'; // contract deployment
  }
  // if to and from are the same, it's a self transfer
  else if (tx.from && tx.to && tx.to.toLowerCase() === tx.from?.toLowerCase()) {
    return 'self'; // self-transfer
  }
  // if from is the wallet address, it's an outgoing transfer
  else if (tx.from && tx.from.toLowerCase() === walletAddress.toLowerCase()) {
    return 'out'; // transfer out from the wallet
  }
  // if to is the wallet address, it's an incoming transfer
  else if (tx.to && tx.to.toLowerCase() === walletAddress.toLowerCase()) {
    return 'in'; // transfer in to the wallet
  }
  // if none of the above, it's an unknown direction
  return 'unknown';
};

const calculateNetValueChanges = (walletAddress: string, transfers: Transfer[]): Map<string, number> => {
  // validate parameters
  if (!Array.isArray(transfers) || transfers.length === 0) {
    throw new Error('transfers must be a non-empty array!');
  }
  if (!walletAddress || ethers.utils.isAddress(walletAddress) === false) {
    throw new Error('invalid walletAddress provided!');
  }

  const netValueChanges = new Map<string, number>();
  // iterate through each transfer to tally the total net changes
  for (const transfer of transfers) {
    if (transfer.value === null || transfer.value <= 0) {
      continue; // skip transfers with no value
    }

    // figure out how to categorize this asset
    const asset = (() => {
      // use asset symbol if it is available. This should work in most cases
      if (transfer.asset && transfer.asset !== '') {
        return transfer.asset;
      // TODO: later on, implement a way to check the contract address against our known tokens
      // otherwise, if it's an ERC20 transfer, we can just mark it as an unknown erc20
      } else if (transfer.category === 'erc20') {
        return 'unknown-erc20';
      // TODO: we could check the network settings later on and populate this that way
      // if it's a native token transfer, we'll just assume it's eth
      } else {
        return 'ETH';
      }
    })();

    const currentValue = netValueChanges.get(asset) || 0;
    const transferValue = transfer.value || 0;
    const transferDirection = getTransferDirection(transfer, walletAddress);

    if (transferDirection === 'in') {
      // incoming transfer, add the value
      netValueChanges.set(asset, currentValue + transferValue);
    } else if (transferDirection === 'out') {
      // outgoing transfer, subtract the value
      netValueChanges.set(asset, currentValue - transferValue);
    }
  }

  // we'll just delete any where the net change was 0
  const toRemove = [];
  for (const [asset, value] of netValueChanges) {
    if (value === 0) {
      toRemove.push(asset);
    }
  }
  for (const asset of toRemove) {
    netValueChanges.delete(asset);
  }
  // finally, return the net value changes map
  return netValueChanges;
};

/**
 * Determine the overall transfer direction based on net value changes.
 * Returns 'sent' if the total net change is negative (money went out),
 * 'received' if positive (money came in), or null if no net transfer.
 */
const getOverallTransferDirection = (netValueChanges: Map<string, number> | null): 'sent' | 'received' | null => {
  if (!netValueChanges || netValueChanges.size === 0) {
    return null;
  }

  const values = Array.from(netValueChanges.values());
  const totalChange = values.reduce((sum, value) => sum + value, 0);

  if (totalChange > 0) {
    return 'received';
  } else if (totalChange < 0) {
    return 'sent';
  }

  return null; // Total change is exactly 0
};

const parseDecodedInfo = (decoded: mixed | null): DecodedAbiInput | null => {
  if (decoded == null || typeof decoded !== 'object') {
    return null;
  }

  // $FlowFixMe[unclear-type] - validating structure at runtime
  const decodedObj: any = decoded;

  // Validate the structure we expect
  if (!decodedObj.name
      || !decodedObj.signature
      || !Array.isArray(decodedObj.args)
      || !decodedObj.functionFragment
      || !Array.isArray(decodedObj.functionFragment.inputs)) {
    return null;
  }

  const functionName = decodedObj.name;
  const functionSignature = decodedObj.signature;
  const args = decodedObj.args;
  const inputs = decodedObj.functionFragment.inputs;

  // Correlate args with inputs to create argument objects
  const argumentsArray = [];
  for (let i = 0; i < args.length && i < inputs.length; i++) {
    const input = inputs[i];
    const value = args[i];

    // Validate input structure
    if (!input.name || !input.type) {
      continue; // Skip invalid inputs
    }

    argumentsArray.push({
      name: input.name,
      type: input.type,
      value,
    });
  }

  return {
    functionName,
    functionSignature,
    arguments: argumentsArray,
  };
};

const decodeTandaPayTransactionInput = (input: string): mixed | null => {
  try {
    const iface = new ethers.utils.Interface(TandaPayInfo.abi);
    const decoded = iface.parseTransaction({ data: input });
    return decoded;
  } catch (error) {
    return null; // return null if decoding fails
  }
};

const decodeErc20TransactionInput = (input: string): mixed | null => {
  try {
    const iface = new ethers.utils.Interface(Erc20Abi);
    const decoded = iface.parseTransaction({ data: input });
    return decoded;
  } catch (error) {
    return null; // return null if decoding fails
  }
};

export const toFullTransaction = (params: {
  walletAddress: string,
  tandapayContractAddress: string | null,
  transfers: Transfer[],
  signedTransaction?: SignedTransaction | null,
}): FullTransaction => {
  // validate parameters
  const { walletAddress, tandapayContractAddress, transfers, signedTransaction } = params;
  // validate parameters
  if (!Array.isArray(transfers) || transfers.length === 0) {
    throw new Error('transfers must be a non-empty array!');
  }
  if (!walletAddress || ethers.utils.isAddress(walletAddress) === false) {
    throw new Error('invalid walletAddress provided!');
  }
//  if (!tandapayContractAddress || ethers.utils.isAddress(tandapayContractAddress) === false) {
//    throw new Error('invalid tandapayContractAddress provided!');
//  }

  const tandapayDecoded = decodeTandaPayTransactionInput(signedTransaction?.input || '');
  const erc20Decoded = decodeErc20TransactionInput(signedTransaction?.input || '');
  const rawDecoded = tandapayDecoded != null ? tandapayDecoded : (erc20Decoded != null ? erc20Decoded : null);
  const decodedInput = parseDecodedInfo(rawDecoded);

  // test if it's a tandapay transaction
  const isTandaPay = tandapayContractAddress && transfers.some(tx => isTandaPayTransaction(tx, tandapayContractAddress)) || tandapayDecoded != null;
  const isErc20 = transfers.some(tx => isErc20Transaction(tx)) || erc20Decoded != null;
  const calculatedNetValueChanges = calculateNetValueChanges(walletAddress, transfers).size;
  // we'll have this default to null if the size of the map was 0
  const netValueChanges = calculatedNetValueChanges > 0 ? calculateNetValueChanges(walletAddress, transfers) : null;

  // Determine overall transfer direction for applicable transaction types
  const transferDirection = getOverallTransferDirection(netValueChanges);

  const fetchGasInfo = async (): Promise<GasInfo> => {
    
  };

  // Base object with common fields
  const baseTransaction = {
    hash: transfers[0].hash || null,
    blockNum: transfers[0].blockNum || null,
    isErc20Transferred: isErc20,
    netValueChanges,
    transferDirection,
    transfers,
    additionalDetails: {
      signedTransaction: signedTransaction || null,
      decodedInput: decodedInput || null,
    },
  };

  // precedence order: tandapay > deployment > self > erc20 > eth > unknown

  // first test if it is a tandapay transaction
  if (isTandaPay) {
    return {
      ...baseTransaction,
      type: 'tandapay',
      isSelfTransaction: false,
      selfTransferAmount: null,
      selfTransferAsset: null,
    };
  }

  // otherwise we might have a deployment transaction
  if (transfers.some(tx => getTransferDirection(tx, walletAddress) === 'deployment')) {
    return {
      ...baseTransaction,
      type: 'deployment',
      isSelfTransaction: false,
      selfTransferAmount: null,
      selfTransferAsset: null,
      transfers: [...transfers],
    };
  }

  // otherwise, we might have a self-transfer transaction
  if (transfers.some(tx => getTransferDirection(tx, walletAddress) === 'self')) {
    let selfTransferAmount = null;
    let selfTransferAsset = null;
    for (const tx of transfers) {
      if (getTransferDirection(tx, walletAddress) === 'self') {
        selfTransferAmount = (tx.value !== null && tx.value !== undefined && tx.value > 0) ? tx.value : null;
        selfTransferAsset = tx.asset || null;
      }
    }

    return {
      ...baseTransaction,
      type: 'self',
      isSelfTransaction: true,
      selfTransferAmount,
      selfTransferAsset,
      transfers: [...transfers],
    };
  }

  // if not, see if it's a general erc20 transaction
  if (isErc20) {
    return {
      ...baseTransaction,
      type: 'erc20',
      isSelfTransaction: false,
      selfTransferAmount: null,
      selfTransferAsset: null,
    };
  }

  // if not, just see if any value was transferred in general. If so it's probably an eth transfer
  if (netValueChanges) {
    return {
      ...baseTransaction,
      type: 'eth',
      isSelfTransaction: false,
      selfTransferAmount: null,
      selfTransferAsset: null,
    };
  }

  // otherwise, it's some other type of transaction (unknown)
  return {
    ...baseTransaction,
    type: 'unknown',
    isSelfTransaction: false,
    selfTransferAmount: null,
    selfTransferAsset: null,
    netValueChanges: null,
  };
};

export const prettyPrintFullTransaction = (ft: FullTransaction, skipUnknown: boolean = true): string => {
  const messages: string[] = [];
  if (!ft || typeof ft !== 'object' || !ft.type) {
    return 'Invalid FullTransaction object.';
  }
  if (skipUnknown && ft.type === 'unknown') {
    return 'Skipping unknown transaction type.';
  }

  messages.push('Full Transaction:');
  messages.push(`  Hash: ${ft.hash ?? 'n/a'}`);
  messages.push(`  Block Number: ${ft.blockNum ?? 'n/a'}`);
  messages.push(`  Type: ${ft.type}`);
  messages.push(`  Is Self Transaction: ${ft.isSelfTransaction ? 'Yes' : 'No'}`);
  messages.push(`  Self Transfer Amount: ${ft.selfTransferAmount || 0}`);
  messages.push(`  Self Transfer Asset: ${ft.selfTransferAsset ?? 'n/a'}`);
  messages.push(`  Is ERC20 Transferred: ${ft.isErc20Transferred ? 'Yes' : 'No'}`);
  messages.push(`  Additional Details: ${ft.additionalDetails ? 'Available' : 'None'}`);
  if (ft.additionalDetails?.decodedInput) {
    const decoded = ft.additionalDetails.decodedInput;
    messages.push(`      Function: ${decoded.functionName}`);
    messages.push(`      Signature: ${decoded.functionSignature}`);
    if (decoded.arguments.length > 0) {
      messages.push('      Arguments:');
      decoded.arguments.forEach((arg, index) => {
        messages.push(`        ${index}: ${arg.name} (${arg.type}) = ${String(arg.value)}`);
      });
    }
  }

  if (ft.netValueChanges instanceof Map) {
    messages.push('  Net Value Changes:');
    // $FlowIgnore[incompatible-use] - we already checked that this is a Map
    for (const [asset, value] of ft.netValueChanges.entries()) {
      messages.push(`    ${asset}: ${value}`);
    }
  } else {
    messages.push('  Net Value Changes: None (0)');
  }

  return messages.join('\n');
};
