/* flow */

import { ethers } from 'ethers';

/**
 * Use case -- The user will join the community and transfer the 11/12th of the individual savings amount's fund.
 */
export const joinCommunity = async (contract) => contract.joinCommunity();

/**
 * Use case -- This function will be used to approve the SubGroup assignment of the member
 * @param approve whether or not to approve the subgroup assignment
 */
export const approveSubgroupAssignment = async (contract, approve = true) =>
  contract.approveSubgroupAssignment(approve);

/**
 * Use case -- This function will be used to approve a new SubGroup member by the existing SubGroup member if the new member is being re-orged.
 * @param subgroupId subgroup Id of the subgroup you want to approve the assignment in
 * @param newMemberId member Id of the member you want to assign
 * @param approve boolean value indicating whether or not to approve the member
 */
export const approveNewSubgroupMember = async (contract, subgroupId, newMemberId, approve = true) => contract.approveNewSubgroupMember(
    ethers.BigNumber.from(subgroupId),
    ethers.BigNumber.from(newMemberId),
    approve
  );

/**
 * Use case -- Member will be able to exit from a SubGroup using this function.
 */
export const leaveSubgroup = async (contract) => contract.leaveSubgroup();

/**
 * Use case -- Member will be able to defects using this function.
 */
export const defectFromCommunity = async (contract) => contract.defectFromCommunity();

/**
 * Use case -- The Valid members will be able to pay the upcoming period's premium using this function
 * @param useAvailableBalance Use withdrawable balance to pay premium or not
 */
export const payPremium = async (contract, useAvailableBalance = false) =>
  contract.payPremium(useAvailableBalance);

/**
 * Use case -- The valid members who are in line of the secretary successors list and are being voted for the secretary can accept the secretary using this function.
 */
export const acceptSecretaryRole = async (contract) => contract.acceptSecretaryRole();

/**
 * Use case --  The valid members who are in the line of the secretary successors list can call this function and set up another valid member who is also in the line of the secretary successors list as a secretary in emergencies.
 * a successor can send this transaction and specify a new secretary to take over in the event of an
 * emergency. For it to actually work, multiple successors have to send this while specifying the same new secretary
 * @param newSecretaryWalletAddress wallet address of the new secretary
 */
export const emergencySecretaryHandoff = async (contract, newSecretaryWalletAddress) =>
  contract.emergencySecretaryHandoff(newSecretaryWalletAddress);

/**
 * Use case -- The member will be able to withdraw their available fund by calling this function.
 * allows a user to withdraw their available funds, i.e. refunds from periods in which no claim occurred
 */
export const withdrawRefund = async (contract) => contract.withdrawRefund();

/**
 * Use case -- The members who are eligible for the coverage will be able to submit for claim using this function.
 */
export const submitClaim = async (contract) => contract.submitClaim();

/**
 * Use case -- The whitelisted claimant will be able to withdraw the claim amount by calling this function
 * @param forfeit whether to forfeit the claim
 */
export const withdrawClaimFund = async (contract, forfeit = false) =>
  contract.withdrawClaimFund(forfeit);
