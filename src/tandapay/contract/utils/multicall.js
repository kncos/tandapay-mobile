/* @flow strict-local */

/**
 * TandaPay Multicall Utilities
 *
 * This module provides efficient batching of contract calls using the Multicall3 pattern.
 * It automatically handles:
 * - Network-specific Multicall3 contract address resolution
 * - Call encoding/decoding with proper error handling
 * - Batch execution with configurable failure tolerance
 * - TandaPay-specific multicall orchestration
 *
 * Key features:
 * - Uses aggregate3 for better error handling per call
 * - Supports allowFailure flag to handle individual call failures gracefully
 * - Provides higher-level TandaPay contract helpers
 * - Integrates with TandaPay error handling system
 */

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';
import { getProvider } from '../../web3';
import { getChainByNetwork } from '../../definitions';
import { getTandaPaySelectedNetwork } from '../../redux/selectors';
import { tryGetActiveAccountState } from '../../../selectors';
import TandaPayErrorHandler from '../../errors/ErrorHandler';
import type { TandaPayResult } from '../../errors/types';
import store from '../../../boot/store';

// Multicall3 ABI - only the functions we need
const MULTICALL3_ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)',
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] returnData)',
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] returnData)'
];

type MulticallCall = {|
  target: string,
  callData: string,
  allowFailure?: boolean,
|};

type MulticallResult = {|
  success: boolean,
  returnData: string,
|};

/**
 * Get the Multicall3 contract address for the current network
 */
function getMulticall3Address(): ?string {
  try {
    const globalState = store.getState();
    const perAccountState = tryGetActiveAccountState(globalState);

    if (perAccountState) {
      const selectedNetwork = getTandaPaySelectedNetwork(perAccountState);

      if (selectedNetwork && selectedNetwork !== 'custom') {
        const chain = getChainByNetwork(selectedNetwork);
        const multicallAddress = chain.contracts.multicall3.address;
        return multicallAddress;
      }
    }
  } catch (error) {
    // Error getting multicall address, return null
  }
  return null;
}

/**
 * Execute multiple contract calls in a single transaction using Multicall3
 */
export async function executeMulticall(
  calls: Array<MulticallCall>
): Promise<TandaPayResult<Array<MulticallResult>>> {
  try {
    if (calls.length === 0) {
      return { success: true, data: [] };
    }

    const multicall3Address = getMulticall3Address();

    if (multicall3Address == null || multicall3Address.trim() === '') {
      throw TandaPayErrorHandler.createValidationError(
        'Multicall3 not available on current network',
        'This network does not support batch contract calls. Please try a different network.'
      );
    }

    const provider = await getProvider();
    const multicall3Contract = new ethers.Contract(multicall3Address, MULTICALL3_ABI, provider);

    // Convert calls to the format expected by aggregate3
    const formattedCalls = calls.map(call => [
      call.target,
      call.allowFailure ?? true, // Default to allowing failures
      call.callData
    ]);

    const results = await multicall3Contract.aggregate3(formattedCalls);

    // Convert results to our format
    // $FlowFixMe[unclear-type] - ethers result type is complex
    const formattedResults: Array<MulticallResult> = results.map((result: any) => ({
      success: result.success,
      returnData: result.returnData
    }));

    return { success: true, data: formattedResults };
  } catch (error) {
    return {
      success: false,
      error: TandaPayErrorHandler.createContractError(
        `Multicall failed: ${error.message}`,
        'Failed to execute batch contract calls. Please try again.'
      )
    };
  }
}

/**
 * Helper to encode a contract function call
 */
export function encodeContractCall(
  // $FlowFixMe[unclear-type] - ethers Interface type is complex
  contractInterface: any,
  functionName: string,
  // $FlowFixMe[unclear-type] - function args can be any type
  args: Array<any> = []
): string {
  return contractInterface.encodeFunctionData(functionName, args);
}

/**
 * Helper to decode contract call result
 */
export function decodeContractResult(
  // $FlowFixMe[unclear-type] - ethers Interface type is complex
  contractInterface: any,
  functionName: string,
  data: string
  // $FlowFixMe[unclear-type] - decoded result can be any type
): any {
  try {
    return contractInterface.decodeFunctionResult(functionName, data);
  } catch (error) {
    throw TandaPayErrorHandler.createContractError(
      `Failed to decode result for ${functionName}: ${error.message}`,
      'Failed to decode contract call result.'
    );
  }
}

/**
 * Higher-level helper for executing TandaPay contract calls via multicall
 */
export async function executeTandaPayMulticall(
  contractAddress: string,
  // $FlowFixMe[unclear-type] - ABI is array of any
  contractAbi: Array<any>,
  // $FlowFixMe[unclear-type] - function args can be any type
  calls: Array<{| functionName: string, args?: Array<any> |}>
  // $FlowFixMe[unclear-type] - result can be any type
): Promise<TandaPayResult<Array<any>>> {
  try {
    if (!contractAddress || calls.length === 0) {
      return { success: true, data: [] };
    }

    const contractInterface = new ethers.utils.Interface(contractAbi);

    // Encode all the calls
    const multicallCalls: Array<MulticallCall> = calls.map(call => ({
      target: contractAddress,
      callData: encodeContractCall(contractInterface, call.functionName, call.args || []),
      allowFailure: true
    }));

    const multicallResult = await executeMulticall(multicallCalls);

    if (!multicallResult.success) {
      return multicallResult;
    }

    // Decode the results
    const decodedResults = [];
    for (let i = 0; i < calls.length; i++) {
      const call = calls[i];
      const result = multicallResult.data[i];

      if (result.success) {
        try {
          const decoded = decodeContractResult(contractInterface, call.functionName, result.returnData);
          // For functions that return a single value, extract it from the array
          decodedResults.push(decoded.length === 1 ? decoded[0] : decoded);
        } catch (error) {
          decodedResults.push(null);
        }
      } else {
        decodedResults.push(null);
      }
    }

    return { success: true, data: decodedResults };
  } catch (error) {
    return {
      success: false,
      error: TandaPayErrorHandler.createContractError(
        `TandaPay multicall failed: ${error.message}`,
        'Failed to execute TandaPay contract calls. Please try again.'
      )
    };
  }
}
