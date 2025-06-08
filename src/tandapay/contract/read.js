/* flow */

import { ethers } from 'ethers';
import { TandaPayInfo } from './TandaPay';

/**
 * Get the payment token address used by the TandaPay contract
 */
export const getPaymentTokenAddress = async (contract) => contract.getPaymentTokenAddress();

/** @returns A promise that resolves to the total number of members in the TandaPay community. */
export const getCurrentMemberCount = async (contract) => contract.getCurrentMemberCount();

/** @returns A promise that resolves to the total number of subgroups in the TandaPay community. */
export const getCurrentSubgroupCount = async (contract) => contract.getCurrentSubgroupCount();

/** @returns A promise that resolves to the total number of claims that have occurred in the TandaPay community. This will also be the ID of the next claim */
export const getCurrentClaimId = async (contract) => contract.getCurrentClaimId();

/** @returns A promise that resolves to the current period ID, which is just the total number of periods that have elapsed since the community's inception */
export const getCurrentPeriodId = async (contract) => contract.getCurrentPeriodId();

/** @returns A promise that resolves to the total coverage amount the community has, i.e. how much must collectively go into the community escrow each period */
export const getTotalCoverageAmount = async (contract) => contract.getTotalCoverageAmount();

/** @returns A promise that resolves to the base premium, a.k.a. the community escrow contribution each individual member must make. Calculated as `(total coverage) / (member count)` */
export const getBasePremium = async (contract) => contract.getBasePremium();

/** @returns A promise that resolves to an enum value representing the state the TandaPay community is in. (e.g. initialization, default, fractured, collapsed) */
export const getCommunityState = async (contract) => contract.getCommunityState();

/**
 * get up-to-date information about a subgroup
 * @param subgroupId Subgroup ID you want information about
 * @returns A promise resolving to an object containing information about the subgroup
 */
export const getSubgroupInfo = async (contract, subgroupId) => contract.getSubgroupInfo(ethers.BigNumber.from(subgroupId));

/**
 * Get information about a claim, given a period and claim ID
 * @param claimId claim Id for the claim you want information about
 * @param periodId period Id in which the claim occurred
 * @returns A promise that resolves to an object containing information about the claim
 */
export const getClaimInfo = async (contract, claimId, periodId = 0) => {
  const res = await contract.getClaimInfo(
    ethers.BigNumber.from(periodId),
    ethers.BigNumber.from(claimId)
  );
  return {
    id: res.id,
    periodId: ethers.BigNumber.from(periodId),
    amount: res.claimAmount,
    isWhitelisted: res.isWhitelistd,
    claimantWalletAddress: res.claimant,
    claimantSubgroupId: res.SGId,
    hasClaimantClaimedFunds: res.isClaimed,
  };
};

/**
 * Retrieve a list of claim IDs for claims that occurred in a given period
 * @param periodId The period to retrieve claim IDs from
 * @returns A promise resolving to an array of claim IDs in the given period
 */
export const getClaimIdsInPeriod = async (contract, periodId = 0) => contract.getClaimIdsInPeriod(ethers.BigNumber.from(periodId));

/**
 * Retrieve a list of defectors' member IDs in a given period
 * @param periodId The period to query for defectors
 * @returns A promise resolving to an array of member IDs for members who defected in the given period
 */
export const getDefectorMemberIdsInPeriod = async (contract, periodId = 0) => contract.getDefectorMemberIdsInPeriod(ethers.BigNumber.from(periodId));

/**
 * Retrieve a member ID given the member's wallet address
 * @param walletAddress wallet address, as a hexadecimal string (valid hex string prefixed with `0x`)
 * @returns A promise resolving to the member's ID number within the community
 */
export const getMemberIdFromAddress = async (contract, walletAddress) => contract.getMemberIdFromAddress(walletAddress);

/**
 * Retrieve whitelisted claims that occurred in a given period
 * @param periodId The period ID to query for whitelisted claims
 * @returns A promise resolving to an array of claim IDs for whitelisted claims in the given period
 */
export const getWhitelistedClaimIdsInPeriod = async (contract, periodId = 0) => contract.getWhitelistedClaimIdsInPeriod(ethers.BigNumber.from(periodId));

/**
 * Retrieve information about a member given their wallet address and a period Id.
 * @note IF PASSING 0 FOR `periodId`, the underlying smart contract method call simply returns the values for the current period
 * @param memberWalletAddress wallet address of the member in question, as a hexadecimal (valid hex prefixed with `0x`) string
 * @param periodId which period to query for this information. If 0 is passed, it just uses the current period. Default: 0
 * @returns A promise resolving to an object containing information about the given member in the given period ID
 */
export const getMemberInfoFromAddress = async (contract, walletAddress, periodId = 0) => {
  const memberInfo = await contract.getMemberInfoFromAddress(
    walletAddress,
    ethers.BigNumber.from(periodId)
  );
  return {
    id: memberInfo.memberId,
    subgroupId: memberInfo.associatedGroupId,
    walletAddress: memberInfo.member,
    communityEscrowAmount: memberInfo.cEscrowAmount,
    savingsEscrowAmount: memberInfo.ISEscorwAmount,
    pendingRefundAmount: memberInfo.pendingRefundAmount,
    availableToWithdrawAmount: memberInfo.availableToWithdraw,
    isEligibleForCoverageThisPeriod: memberInfo.eligibleForCoverageInPeriod,
    isPremiumPaidThisPeriod: memberInfo.isPremiumPaid,
    queuedRefundAmountThisPeriod: memberInfo.idToQuedRefundAmount,
    memberStatus: memberInfo.status,
    assignmentStatus: memberInfo.assignment,
  };
};

/** @returns A promise resolving to a hexadecimal string, which is the wallet address of the community's secretary */
export const getSecretaryAddress = async (contract) => contract.getSecretaryAddress();

/**
 * Retrieve information about a given period
 * @param periodId period ID to query
 * @returns A promise resolving to an object containing information about the given period
 */
export const getPeriodInfo = async (contract, periodId = 0) => {
  const periodInfo = await contract.getPeriodIdToPeriodInfo(ethers.BigNumber.from(periodId));
  return {
    startTimestamp: periodInfo.startedAt,
    endTimestamp: periodInfo.willEndAt,
    coverageAmount: periodInfo.coverage,
    totalPremiumsPaid: periodInfo.totalPaid,
    claimIds: periodInfo.claimIds,
  };
};

/** Returns a list of the secretary successors */
export const getSecretarySuccessorList = async (contract) => contract.getSecretarySuccessorList();

/** Returns whether or not the secretary has initiated a voluntary handover */
export const isVoluntaryHandoverInProgress = async (contract) => contract.getIsHandingOver();

/** If the secretary has initiated a voluntary handover, this returns the address of the nominee */
export const getVoluntaryHandoverNominee = async (contract) => contract.getUpcomingSecretary();

/**
 * Gets the members who have been nominated by secretary successors to take on the role of
 * secretary in the event of an emergency handover
 */
export const getEmergencyHandoverNominees = async (contract) => contract.getEmergencySecretaries();

/**
 * Get information about a member based on their Id and a given period
 * @param memberId member Id of the member you want to get information about
 * @param periodId what period you want to get information from. Uses current period if 0 is passed. Default = 0
 * @returns information about a member given their Id and an optional periodID
 */
export const getMemberInfoFromId = async (contract, memberId, periodId = 0) => {
  const memberInfo = await contract.getMemberInfoFromId(
    ethers.BigNumber.from(memberId),
    ethers.BigNumber.from(periodId)
  );
  // map raw type to MemberInfo type
  return {
    id: memberInfo.memberId,
    subgroupId: memberInfo.associatedGroupId,
    walletAddress: memberInfo.member,
    communityEscrowAmount: memberInfo.cEscrowAmount,
    savingsEscrowAmount: memberInfo.ISEscorwAmount,
    pendingRefundAmount: memberInfo.pendingRefundAmount,
    availableToWithdrawAmount: memberInfo.availableToWithdraw,
    isEligibleForCoverageThisPeriod: memberInfo.eligibleForCoverageInPeriod,
    isPremiumPaidThisPeriod: memberInfo.isPremiumPaid,
    queuedRefundAmountThisPeriod: memberInfo.idToQuedRefundAmount,
    memberStatus: memberInfo.status,
    assignmentStatus: memberInfo.assignment,
  };
};

/**
 * Given an ethers provider/signer and smart contract address, it returns an object that has all TandaPay
 * read actions, automatically injecting the contract instance into the actions so that
 * there is no need to create a new contract instance for each call.
 * @param client An ethers.js Provider or Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns An object with all TandaPay read methods bound to the contract instance
 */
export function getTandaPayReadActions(client, contractAddress) {
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
  };
}

/**
 * Create a TandaPay contract reader, a thin wrapper around tandapay read methods.
 * Similar to getTandaPayWriter but for read-only operations.
 * @param contractAddress The address of the TandaPay contract
 * @param provider An ethers.js Provider instance
 * @returns An object with all the TandaPay contract read methods
 */
export default function getTandaPayReader(contractAddress, provider) {
  if (!ethers.utils.isAddress(contractAddress)) {
    throw new Error('Invalid TandaPay contract address');
  }
  if (!provider) {
    throw new Error('Invalid provider');
  }
  // this one shouldn't happen but will catch a programming mistake
  if (!TandaPayInfo.abi || !Array.isArray(TandaPayInfo.abi)) {
    throw new Error('Invalid TandaPay ABI');
  }

  return getTandaPayReadActions(provider, contractAddress);
}
