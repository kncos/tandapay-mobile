// @flow

import { ethers } from 'ethers';
import { TandaPayInfo } from '../utils/TandaPay';
import TandaPayErrorHandler from '../../errors/ErrorHandler';
import { executeTandaPayMulticall } from '../utils/multicall';
import type { TandaPayResult } from '../../errors/types';

/**
 * IMPORTANT: These read actions are designed for single, one-off contract calls.
 *
 * If you need to fetch multiple pieces of data at once, prefer using multicall
 * directly with the TandaPay ABI to batch your calls efficiently:
 *
 * ```javascript
 * import { executeTandaPayMulticall } from '../utils/multicall';
 * import { TandaPayInfo } from '../utils/TandaPay';
 *
 * const calls = [
 *   { functionName: 'getCurrentMemberCount' },
 *   { functionName: 'getCurrentSubgroupCount' },
 *   // ... more calls
 * ];
 *
 * const result = await executeTandaPayMulticall(contractAddress, TandaPayInfo.abi, calls);
 * ```
 *
 * This approach is much more efficient than using Promise.all with individual readActions calls.
 */

import type {
  SubgroupInfo,
  ClaimInfo,
  MemberInfo,
  PeriodInfo,
  TandaPayStateType,
} from '../types';
import {
  convertRawMemberInfo,
  convertRawSubgroupInfo,
  convertRawPeriodInfo,
  convertRawClaimInfo,
} from '../utils/converters';

// Flow type for ethers BigNumber - using mixed since ethers is not Flow-typed
type BigNumber = mixed;
type EthersContract = any;

// Type for the read actions object
type TandaPayReadActions = {|
  +getPaymentTokenAddress: () => Promise<string>,
  +getCurrentMemberCount: () => Promise<BigNumber>,
  +getCurrentSubgroupCount: () => Promise<BigNumber>,
  +getCurrentClaimId: () => Promise<BigNumber>,
  +getCurrentPeriodId: () => Promise<BigNumber>,
  +getTotalCoverageAmount: () => Promise<BigNumber>,
  +getBasePremium: () => Promise<BigNumber>,
  +getCommunityState: () => Promise<TandaPayStateType>,
  +getSubgroupInfo: (subgroupId: number | string) => Promise<SubgroupInfo>,
  +getClaimInfo: (claimId: number | string, periodId?: number | string) => Promise<ClaimInfo>,
  +getClaimIdsInPeriod: (periodId?: number | string) => Promise<Array<BigNumber>>,
  +getDefectorMemberIdsInPeriod: (periodId?: number | string) => Promise<Array<BigNumber>>,
  +getMemberIdFromAddress: (walletAddress: string) => Promise<BigNumber>,
  +getWhitelistedClaimIdsInPeriod: (periodId?: number | string) => Promise<Array<BigNumber>>,
  +getMemberInfoFromAddress: (walletAddress: string, periodId?: number | string) => Promise<MemberInfo>,
  +getSecretaryAddress: () => Promise<string>,
  +getPeriodInfo: (periodId?: number | string) => Promise<PeriodInfo>,
  +getSecretarySuccessorList: () => Promise<Array<string>>,
  +isVoluntaryHandoverInProgress: () => Promise<boolean>,
  +getVoluntaryHandoverNominee: () => Promise<string>,
  +getEmergencyHandoverNominees: () => Promise<Array<string>>,
  +getMemberInfoFromId: (memberId: number | string, periodId?: number | string) => Promise<MemberInfo>,
  +batchGetAllMemberInfo: (memberCount: number, periodId?: number | string, maxBatchSize?: number) => Promise<TandaPayResult<Array<MemberInfo>>>,
  +batchGetAllSubgroupInfo: (subgroupCount: number, maxBatchSize?: number) => Promise<TandaPayResult<Array<SubgroupInfo>>>,
|};

/**
 * Get the payment token address used by the TandaPay contract
 */
export const getPaymentTokenAddress = async (contract: EthersContract): Promise<string> => contract.getPaymentTokenAddress();

/** @returns A promise that resolves to the total number of members in the TandaPay community. */
export const getCurrentMemberCount = async (contract: EthersContract): Promise<BigNumber> => contract.getCurrentMemberCount();

/** @returns A promise that resolves to the total number of subgroups in the TandaPay community. */
export const getCurrentSubgroupCount = async (contract: EthersContract): Promise<BigNumber> => contract.getCurrentSubgroupCount();

/** @returns A promise that resolves to the total number of claims that have occurred in the TandaPay community. This will also be the ID of the next claim */
export const getCurrentClaimId = async (contract: EthersContract): Promise<BigNumber> => contract.getCurrentClaimId();

/** @returns A promise that resolves to the current period ID, which is just the total number of periods that have elapsed since the community's inception */
export const getCurrentPeriodId = async (contract: EthersContract): Promise<BigNumber> => contract.getCurrentPeriodId();

/** @returns A promise that resolves to the total coverage amount the community has, i.e. how much must collectively go into the community escrow each period */
export const getTotalCoverageAmount = async (contract: EthersContract): Promise<BigNumber> => contract.getTotalCoverageAmount();

/** @returns A promise that resolves to the base premium, a.k.a. the community escrow contribution each individual member must make. Calculated as `(total coverage) / (member count)` */
export const getBasePremium = async (contract: EthersContract): Promise<BigNumber> => contract.getBasePremium();

/** @returns A promise that resolves to an enum value representing the state the TandaPay community is in. (e.g. initialization, default, fractured, collapsed) */
export const getCommunityState = async (contract: EthersContract): Promise<TandaPayStateType> => contract.getCommunityState();

/**
 * get up-to-date information about a subgroup
 * @param subgroupId Subgroup ID you want information about
 * @returns A promise resolving to an object containing information about the subgroup
 */
export const getSubgroupInfo = async (contract: EthersContract, subgroupId: number | string): Promise<SubgroupInfo> => {
  const rawSubgroupInfo = await contract.getSubgroupInfo(ethers.BigNumber.from(subgroupId));
  return convertRawSubgroupInfo(rawSubgroupInfo);
};

/**
 * Get information about a claim, given a period and claim ID
 * @param claimId claim Id for the claim you want information about
 * @param periodId period Id in which the claim occurred
 * @returns A promise that resolves to an object containing information about the claim
 */
export const getClaimInfo = async (contract: EthersContract, claimId: number | string, periodId: number | string = 0): Promise<ClaimInfo> => {
  const rawClaimInfo = await contract.getClaimInfo(
    ethers.BigNumber.from(periodId),
    ethers.BigNumber.from(claimId)
  );
  return convertRawClaimInfo(rawClaimInfo, ethers.BigNumber.from(periodId));
};

/**
 * Retrieve a list of claim IDs for claims that occurred in a given period
 * @param periodId The period to retrieve claim IDs from
 * @returns A promise resolving to an array of claim IDs in the given period
 */
export const getClaimIdsInPeriod = async (contract: EthersContract, periodId: number | string = 0): Promise<Array<BigNumber>> => contract.getClaimIdsInPeriod(ethers.BigNumber.from(periodId));

/**
 * Retrieve a list of defectors' member IDs in a given period
 * @param periodId The period to query for defectors
 * @returns A promise resolving to an array of member IDs for members who defected in the given period
 */
export const getDefectorMemberIdsInPeriod = async (contract: EthersContract, periodId: number | string = 0): Promise<Array<BigNumber>> => contract.getDefectorMemberIdsInPeriod(ethers.BigNumber.from(periodId));

/**
 * Retrieve a member ID given the member's wallet address
 * @param walletAddress wallet address, as a hexadecimal string (valid hex string prefixed with `0x`)
 * @returns A promise resolving to the member's ID number within the community
 */
export const getMemberIdFromAddress = async (contract: EthersContract, walletAddress: string): Promise<BigNumber> => contract.getMemberIdFromAddress(walletAddress);

/**
 * Retrieve whitelisted claims that occurred in a given period
 * @param periodId The period ID to query for whitelisted claims
 * @returns A promise resolving to an array of claim IDs for whitelisted claims in the given period
 */
export const getWhitelistedClaimIdsInPeriod = async (contract: EthersContract, periodId: number | string = 0): Promise<Array<BigNumber>> => contract.getWhitelistedClaimIdsInPeriod(ethers.BigNumber.from(periodId));

/**
 * Retrieve information about a member given their wallet address and a period Id.
 * @note IF PASSING 0 FOR `periodId`, the underlying smart contract method call simply returns the values for the current period
 * @param memberWalletAddress wallet address of the member in question, as a hexadecimal (valid hex prefixed with `0x`) string
 * @param periodId which period to query for this information. If 0 is passed, it just uses the current period. Default: 0
 * @returns A promise resolving to an object containing information about the given member in the given period ID
 */
export const getMemberInfoFromAddress = async (contract: EthersContract, walletAddress: string, periodId: number | string = 0): Promise<MemberInfo> => {
  const rawMemberInfo = await contract.getMemberInfoFromAddress(
    walletAddress,
    ethers.BigNumber.from(periodId)
  );
  return convertRawMemberInfo(rawMemberInfo);
};

/** @returns A promise resolving to a hexadecimal string, which is the wallet address of the community's secretary */
export const getSecretaryAddress = async (contract: EthersContract): Promise<string> => contract.getSecretaryAddress();

/**
 * Retrieve information about a given period
 * @param periodId period ID to query
 * @returns A promise resolving to an object containing information about the given period
 */
export const getPeriodInfo = async (contract: EthersContract, periodId: number | string = 0): Promise<PeriodInfo> => {
  const rawPeriodInfo = await contract.getPeriodIdToPeriodInfo(ethers.BigNumber.from(periodId));
  return convertRawPeriodInfo(rawPeriodInfo);
};

/** Returns a list of the secretary successors */
export const getSecretarySuccessorList = async (contract: EthersContract): Promise<Array<string>> => contract.getSecretarySuccessorList();

/** Returns whether or not the secretary has initiated a voluntary handover */
export const isVoluntaryHandoverInProgress = async (contract: EthersContract): Promise<boolean> => contract.getIsHandingOver();

/** If the secretary has initiated a voluntary handover, this returns the address of the nominee */
export const getVoluntaryHandoverNominee = async (contract: EthersContract): Promise<string> => contract.getUpcomingSecretary();

/**
 * Gets the members who have been nominated by secretary successors to take on the role of
 * secretary in the event of an emergency handover
 */
export const getEmergencyHandoverNominees = async (contract: EthersContract): Promise<Array<string>> => contract.getEmergencySecretaries();

/**
 * Get information about a member based on their Id and a given period
 * @param memberId member Id of the member you want to get information about
 * @param periodId what period you want to get information from. Uses current period if 0 is passed. Default = 0
 * @returns information about a member given their Id and an optional periodID
 */
export const getMemberInfoFromId = async (contract: EthersContract, memberId: number | string, periodId: number | string = 0): Promise<MemberInfo> => {
  const rawMemberInfo = await contract.getMemberInfoFromId(
    ethers.BigNumber.from(memberId),
    ethers.BigNumber.from(periodId)
  );
  return convertRawMemberInfo(rawMemberInfo);
};

/**
 * Batch reader utilities for efficiently fetching member and subgroup information using multicall3
 */

/**
 * Batch fetch member information for all members by ID using multicall3
 * @param contractAddress The TandaPay contract address
 * @param memberCount The total number of members in the community
 * @param periodId The period ID to query for member information (default: 0 for current period)
 * @param maxBatchSize Maximum number of calls per multicall batch (default: 16)
 * @returns A promise resolving to an array of MemberInfo objects for all members
 */
export const batchGetAllMemberInfo = async (
  contractAddress: string,
  memberCount: number,
  periodId: number | string = 0,
  maxBatchSize: number = 16
): Promise<TandaPayResult<Array<MemberInfo>>> => {
  try {
    // Input validation
    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
      throw TandaPayErrorHandler.createValidationError(
        'Invalid contract address',
        'Please provide a valid TandaPay contract address.'
      );
    }

    if (memberCount <= 0 || !Number.isInteger(memberCount)) {
      throw TandaPayErrorHandler.createValidationError(
        'Invalid member count',
        'Member count must be a positive integer.'
      );
    }

    if (maxBatchSize <= 0 || !Number.isInteger(maxBatchSize)) {
      throw TandaPayErrorHandler.createValidationError(
        'Invalid batch size',
        'Batch size must be a positive integer.'
      );
    }

    // Generate all member IDs (1-based, inclusive)
    const memberIds = Array.from({ length: memberCount }, (_, i) => i + 1);
    const results: Array<MemberInfo> = [];

    // Process in batches
    for (let i = 0; i < memberIds.length; i += maxBatchSize) {
      const batch = memberIds.slice(i, i + maxBatchSize);

      // Create multicall calls for this batch
      const calls = batch.map(memberId => ({
        functionName: 'getMemberInfoFromId',
        args: [ethers.BigNumber.from(memberId), ethers.BigNumber.from(periodId)]
      }));

      const multicallResult = await executeTandaPayMulticall(
        contractAddress,
        TandaPayInfo.abi,
        calls
      );

      if (!multicallResult.success) {
        return multicallResult;
      }

      // Process results for this batch
      for (let j = 0; j < multicallResult.data.length; j++) {
        const memberInfo = multicallResult.data[j];
        if (memberInfo != null) {
          // Use converter helper for consistent data shape
          results.push(convertRawMemberInfo(memberInfo));
        }
      }
    }

    return { success: true, data: results };
  } catch (error) {
    if (error?.type) {
      return { success: false, error };
    }
    const tandaPayError = TandaPayErrorHandler.createContractError(
      'Failed to batch fetch member information',
      'Unable to retrieve member information. Please try again.'
    );
    return { success: false, error: tandaPayError };
  }
};

/**
 * Batch fetch subgroup information for all subgroups by ID using multicall3
 * @param contractAddress The TandaPay contract address
 * @param subgroupCount The total number of subgroups in the community
 * @param maxBatchSize Maximum number of calls per multicall batch (default: 16)
 * @returns A promise resolving to an array of SubgroupInfo objects for all subgroups
 */
export const batchGetAllSubgroupInfo = async (
  contractAddress: string,
  subgroupCount: number,
  maxBatchSize: number = 16
): Promise<TandaPayResult<Array<SubgroupInfo>>> => {
  try {
    // Input validation
    if (!contractAddress || !ethers.utils.isAddress(contractAddress)) {
      throw TandaPayErrorHandler.createValidationError(
        'Invalid contract address',
        'Please provide a valid TandaPay contract address.'
      );
    }

    if (subgroupCount <= 0 || !Number.isInteger(subgroupCount)) {
      throw TandaPayErrorHandler.createValidationError(
        'Invalid subgroup count',
        'Subgroup count must be a positive integer.'
      );
    }

    if (maxBatchSize <= 0 || !Number.isInteger(maxBatchSize)) {
      throw TandaPayErrorHandler.createValidationError(
        'Invalid batch size',
        'Batch size must be a positive integer.'
      );
    }

    // Generate all subgroup IDs (1-based, inclusive)
    const subgroupIds = Array.from({ length: subgroupCount }, (_, i) => i + 1);
    const results: Array<SubgroupInfo> = [];

    // Process in batches
    for (let i = 0; i < subgroupIds.length; i += maxBatchSize) {
      const batch = subgroupIds.slice(i, i + maxBatchSize);

      // Create multicall calls for this batch
      const calls = batch.map(subgroupId => ({
        functionName: 'getSubgroupInfo',
        args: [ethers.BigNumber.from(subgroupId)]
      }));

      const multicallResult = await executeTandaPayMulticall(
        contractAddress,
        TandaPayInfo.abi,
        calls
      );

      if (!multicallResult.success) {
        return multicallResult;
      }

      // Process results for this batch (same format as getSubgroupInfo)
      for (let j = 0; j < multicallResult.data.length; j++) {
        const subgroupInfo = multicallResult.data[j];
        if (subgroupInfo != null) {
          // Use converter helper for consistent data shape
          results.push(convertRawSubgroupInfo(subgroupInfo));
        }
      }
    }

    return { success: true, data: results };
  } catch (error) {
    if (error?.type) {
      return { success: false, error };
    }
    const tandaPayError = TandaPayErrorHandler.createContractError(
      'Failed to batch fetch subgroup information',
      'Unable to retrieve subgroup information. Please try again.'
    );
    return { success: false, error: tandaPayError };
  }
};

/**
 * Given an ethers provider/signer and smart contract address, it returns an object that has all TandaPay
 * read actions, automatically injecting the contract instance into the actions so that
 * there is no need to create a new contract instance for each call.
 * @param client An ethers.js Provider or Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns An object with all TandaPay read methods bound to the contract instance
 */
export function getTandaPayReadActions(client: any, contractAddress: string): TandaPayReadActions {
  // Create the contract instance once and reuse it for all method calls
  const contract = new ethers.Contract(contractAddress, TandaPayInfo.abi, client);

  return {
    getPaymentTokenAddress: () => getPaymentTokenAddress(contract),
    getCurrentMemberCount: () => getCurrentMemberCount(contract),
    getCurrentSubgroupCount: () => getCurrentSubgroupCount(contract),
    getCurrentClaimId: () => getCurrentClaimId(contract),
    getCurrentPeriodId: () => getCurrentPeriodId(contract),
    getTotalCoverageAmount: () => getTotalCoverageAmount(contract),
    getBasePremium: () => getBasePremium(contract),
    getCommunityState: () => getCommunityState(contract),
    getSubgroupInfo: (subgroupId) => getSubgroupInfo(contract, subgroupId),
    getClaimInfo: (claimId, periodId) => getClaimInfo(contract, claimId, periodId),
    getClaimIdsInPeriod: (periodId) => getClaimIdsInPeriod(contract, periodId),
    getDefectorMemberIdsInPeriod: (periodId) => getDefectorMemberIdsInPeriod(contract, periodId),
    getMemberIdFromAddress: (walletAddress) => getMemberIdFromAddress(contract, walletAddress),
    getWhitelistedClaimIdsInPeriod: (periodId) => getWhitelistedClaimIdsInPeriod(contract, periodId),
    getMemberInfoFromAddress: (walletAddress, periodId) => getMemberInfoFromAddress(contract, walletAddress, periodId),
    getSecretaryAddress: () => getSecretaryAddress(contract),
    getPeriodInfo: (periodId) => getPeriodInfo(contract, periodId),
    getSecretarySuccessorList: () => getSecretarySuccessorList(contract),
    isVoluntaryHandoverInProgress: () => isVoluntaryHandoverInProgress(contract),
    getVoluntaryHandoverNominee: () => getVoluntaryHandoverNominee(contract),
    getEmergencyHandoverNominees: () => getEmergencyHandoverNominees(contract),
    getMemberInfoFromId: (memberId, periodId) => getMemberInfoFromId(contract, memberId, periodId),
    batchGetAllMemberInfo: (memberCount, periodId, maxBatchSize) => batchGetAllMemberInfo(contractAddress, memberCount, periodId, maxBatchSize),
    batchGetAllSubgroupInfo: (subgroupCount, maxBatchSize) => batchGetAllSubgroupInfo(contractAddress, subgroupCount, maxBatchSize),
  };
}

/**
 * Create a TandaPay contract reader, a thin wrapper around tandapay read methods.
 * Similar to getTandaPayWriter but for read-only operations.
 * @param contractAddress The address of the TandaPay contract
 * @param provider An ethers.js Provider instance
 * @returns An object with all the TandaPay contract read methods
 */
export default function getTandaPayReader(contractAddress: string, provider: any): TandaPayResult<TandaPayReadActions> {
  try {
    if (!ethers.utils.isAddress(contractAddress)) {
      throw TandaPayErrorHandler.createValidationError(
        'Invalid TandaPay contract address',
        'Please provide a valid Ethereum contract address.'
      );
    }
    if (!provider) {
      throw TandaPayErrorHandler.createValidationError(
        'Invalid provider',
        'Please provide a valid network provider.'
      );
    }
    // this one shouldn't happen but will catch a programming mistake
    if (!TandaPayInfo.abi || !Array.isArray(TandaPayInfo.abi)) {
      throw TandaPayErrorHandler.createContractError(
        'Invalid TandaPay ABI',
        'Contract ABI is not available. Please check the contract configuration.'
      );
    }

    const actions = getTandaPayReadActions(provider, contractAddress);
    return { success: true, data: actions };
  } catch (error) {
    if (error?.type) {
      return { success: false, error };
    }
    const tandaPayError = TandaPayErrorHandler.createContractError(
      'Failed to create TandaPay contract reader',
      'Unable to initialize contract reader. Please check the contract address and network connection.'
    );
    return { success: false, error: tandaPayError };
  }
}
