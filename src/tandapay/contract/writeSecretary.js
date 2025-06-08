/* flow */

import { ethers } from 'ethers';

/**
 * Add a member to the TandaPay community (as the secretary)
 * @param memberWalletAddress wallet address of the member to add
 * @returns A transaction response after the transaction has been included on a block
 */
export const addMemberToCommunity = async (contract, memberWalletAddress) =>
  contract.addMemberToCommunity(memberWalletAddress);

/**
 * This function is used to create a new subgroup for the TandaPay community.
 * @returns A transaction response after the transaction has been included on a block
 */
export const createSubgroup = async (contract) => contract.createSubgroup();

/**
 * This function is used to assign a member to a SubGroup.
 * @param memberWalletAddress wallet address of the member to assign
 * @param subgroupId ID of the subgroup to assign the member to
 * @param isReorging whether this is a re-organization assignment
 * @returns A transaction response after the transaction has been included on a block
 */
export const assignMemberToSubgroup = async (contract, memberWalletAddress, subgroupId, isReorging = false) => contract.assignMemberToSubgroup(
    memberWalletAddress,
    ethers.BigNumber.from(subgroupId),
    isReorging
  );

/**
 * This function is used to set the default coverage and initiate the default state of the community.
 * @param totalCoverage the total coverage amount to set
 * @returns A transaction response after the transaction has been included on a block
 */
export const initiateDefaultState = async (contract, totalCoverage) =>
  contract.initiateDefaultState(totalCoverage);

/**
 * This function is used to whitelist a claim submitted by the claimants.
 * @param claimId claim ID for the claim to whitelist
 * @returns A transaction response after the transaction has been included on a block
 */
export const whitelistClaim = async (contract, claimId) =>
  contract.whitelistClaim(ethers.BigNumber.from(claimId));

/**
 * This function is used to update the coverage amount for the TandaPay community. Can only be called when the
 * community is in the initialization or default state.
 * @param totalCoverage the new total coverage amount
 * @returns A transaction response after the transaction has been included on a block
 */
export const updateCoverageAmount = async (contract, totalCoverage) =>
  contract.updateCoverageAmount(totalCoverage);

/**
 * Defines a list of successor candidates for the Secretary role. If `12 <= (community size) <= 35`,
 * then at least 2 successors must be defined. If `35 < (community size)`, at least 6 successors must
 * be defined.
 * @param successorListWalletAddresses array of wallet addresses for secretary successors
 * @returns A transaction response after the transaction has been included on a block
 */
export const defineSecretarySuccessorList = async (contract, successorListWalletAddresses) =>
  contract.defineSecretarySuccessorList(successorListWalletAddresses);

/**
 * Allows the secretary to give their position to one of their successors
 * @param successorWalletAddress wallet address of the successor to hand over to
 * @returns A transaction response after the transaction has been included on a block
 */
export const handoverSecretaryRoleToSuccessor = async (contract, successorWalletAddress) =>
  contract.handoverSecretaryRoleToSuccessor(successorWalletAddress);

/**
 * This function is used to inject funds into the community by the secretary. Basically, this is a way
 * that the secretary can save their TandaPay community which may be on the verge of collapse, by
 * putting their own funds into the pot (i.e., the community escrow) to ensure that the coverage requirement
 * (i.e., community escrow amount = total coverage) is met.
 * @returns A transaction response after the transaction has been included on a block
 */
export const injectFunds = async (contract) => contract.injectFunds();

/**
 * If there is a shortfall in the coverage requirement, but every member of the community has enough
 * in their savings accounts that they can be equally debited to make up for the shortfall, then the
 * secretary may call this transaction to make that happen
 * @returns A transaction response after the transaction has been included on a block
 */
export const divideShortfall = async (contract) => contract.divideShortfall();

/**
 * Introduces an additional day before the period will end. This gives members more time to pay
 * their premiums and adds a delay before the secretary may advance the period
 * @returns A transaction response after the transaction has been included on a block
 */
export const extendPeriodByOneDay = async (contract) => contract.extendPeriodByOneDay();

/**
 * This method is used to advance to the next period. Must be called after the previous period has
 * ended.
 * @returns A transaction response after the transaction has been included on a block
 */
export const advancePeriod = async (contract) => contract.advancePeriod();
