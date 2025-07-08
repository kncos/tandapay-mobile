// @flow

import { ethers } from 'ethers';
import type { Transfer } from './AlchemyApiHelper';

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
  transfers: Transfer[] | null, // array of transfer objects
|};

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

export const toFullTransaction = (params: {
  walletAddress: string,
  tandapayContractAddress: string,
  transfers: Transfer[]
}): FullTransaction => {
  // validate parameters
  const { walletAddress, tandapayContractAddress, transfers } = params;
  // validate parameters
  if (!Array.isArray(transfers) || transfers.length === 0) {
    throw new Error('transfers must be a non-empty array!');
  }
  if (!walletAddress || ethers.utils.isAddress(walletAddress) === false) {
    throw new Error('invalid walletAddress provided!');
  }
  if (!tandapayContractAddress || ethers.utils.isAddress(tandapayContractAddress) === false) {
    throw new Error('invalid tandapayContractAddress provided!');
  }

  // test if it's a tandapay transaction
  const isTandaPay = transfers.some(tx => isTandaPayTransaction(tx, tandapayContractAddress));
  const isErc20 = transfers.some(tx => isErc20Transaction(tx));
  const calculatedNetValueChanges = calculateNetValueChanges(walletAddress, transfers).size;
  // we'll have this default to null if the size of the map was 0
  const netValueChanges = calculatedNetValueChanges > 0 ? calculateNetValueChanges(walletAddress, transfers) : null;

  // precedence order: tandapay > deployment > self > erc20 > eth > unknown

  // first test if it is a tandapay transaction
  if (isTandaPay) {
    // if it is, we can just return a full transaction object with the type set to 'tandapay'
    return {
      hash: transfers[0].hash || null,
      blockNum: transfers[0].blockNum || null,
      type: 'tandapay',
      isSelfTransaction: false,
      // erc20 value can sometimes be exchanged in tandapay transactions
      isErc20Transferred: isErc20,
      selfTransferAmount: null,
      selfTransferAsset: null,
      netValueChanges,
      transfers
    };
  // otherwise we might have a deployment transaction
  } else if (transfers.some(tx => getTransferDirection(tx, walletAddress) === 'deployment')) {
    return {
      hash: transfers[0].hash || null,
      blockNum: transfers[0].blockNum || null,
      type: 'deployment',
      isSelfTransaction: false,
      isErc20Transferred: isErc20,
      selfTransferAmount: null,
      selfTransferAsset: null,
      netValueChanges,
      transfers: [...transfers]
    };
  }
  // otherwise, we might have a self-transfer transaction
  else if (transfers.some(tx => getTransferDirection(tx, walletAddress) === 'self')) {
    let selfTransferAmount = null;
    let selfTransferAsset = null;
    for (const tx of transfers) {
      if (getTransferDirection(tx, walletAddress) === 'self') {
        selfTransferAmount = (tx.value !== null && tx.value !== undefined && tx.value > 0) ? tx.value : null;
        selfTransferAsset = tx.asset || null;
      }
    }

    return {
      hash: transfers[0].hash || null,
      blockNum: transfers[0].blockNum || null,
      type: 'self',
      isSelfTransaction: true,
      isErc20Transferred: isErc20,
      selfTransferAmount,
      selfTransferAsset,
      netValueChanges,
      transfers: [...transfers]
    };
  // if not, see if it's a general erc20 transaction
  } else if (isErc20) {
    return {
      hash: transfers[0].hash || null,
      blockNum: transfers[0].blockNum || null,
      type: 'erc20',
      isSelfTransaction: false,
      isErc20Transferred: isErc20,
      selfTransferAmount: null,
      selfTransferAsset: null,
      netValueChanges,
      transfers
    };
  // if not, just see if any value was transferred in general. If so it's probably an eth transfer
  } else if (netValueChanges) {
    return {
      hash: transfers[0].hash || null,
      blockNum: transfers[0].blockNum || null,
      type: 'eth',
      isSelfTransaction: false,
      isErc20Transferred: isErc20,
      selfTransferAmount: null,
      selfTransferAsset: null,
      netValueChanges,
      transfers
    };
  }

  // otherwise, it's some other type of transaction (unknown)
  return {
    hash: transfers[0].hash || null,
    blockNum: transfers[0].blockNum || null,
    type: 'unknown',
    isSelfTransaction: false,
    isErc20Transferred: false,
    selfTransferAmount: null,
    selfTransferAsset: null,
    netValueChanges: null,
    transfers
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
