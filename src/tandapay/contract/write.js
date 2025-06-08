/* flow */

import { ethers } from 'ethers';
import { TandaPayInfo } from './TandaPay';
import * as publicMethods from './writePublic';
import * as memberMethods from './writeMember';
import * as secretaryMethods from './writeSecretary';
import { getWriteSimulations } from './writeSim';

/**
 * Get public write methods bound to a contract instance
 * @param client An ethers.js Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns An object with all public write methods
 */
export function getPublicWriteMethods(client, contractAddress) {
  const contract = new ethers.Contract(contractAddress, TandaPayInfo.abi, client);

  return {
    issueRefund: () => publicMethods.issueRefund(contract),
  };
}

/**
 * Get member write methods bound to a contract instance
 * @param client An ethers.js Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns An object with all member write methods
 */
export function getMemberWriteMethods(client, contractAddress) {
  const contract = new ethers.Contract(contractAddress, TandaPayInfo.abi, client);

  return {
    joinCommunity: () => memberMethods.joinCommunity(contract),
    approveSubgroupAssignment: (approve) => memberMethods.approveSubgroupAssignment(contract, approve),
    approveNewSubgroupMember: (subgroupId, newMemberId, approve) =>
      memberMethods.approveNewSubgroupMember(contract, subgroupId, newMemberId, approve),
    leaveSubgroup: () => memberMethods.leaveSubgroup(contract),
    defectFromCommunity: () => memberMethods.defectFromCommunity(contract),
    payPremium: (useAvailableBalance) => memberMethods.payPremium(contract, useAvailableBalance),
    acceptSecretaryRole: () => memberMethods.acceptSecretaryRole(contract),
    emergencySecretaryHandoff: (newSecretaryWalletAddress) =>
      memberMethods.emergencySecretaryHandoff(contract, newSecretaryWalletAddress),
    withdrawRefund: () => memberMethods.withdrawRefund(contract),
    submitClaim: () => memberMethods.submitClaim(contract),
    withdrawClaimFund: (forfeit) => memberMethods.withdrawClaimFund(contract, forfeit),
  };
}

/**
 * Get secretary write methods bound to a contract instance
 * @param client An ethers.js Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns An object with all secretary write methods
 */
export function getSecretaryWriteMethods(client, contractAddress) {
  const contract = new ethers.Contract(contractAddress, TandaPayInfo.abi, client);

  return {
    addMemberToCommunity: (memberWalletAddress) =>
      secretaryMethods.addMemberToCommunity(contract, memberWalletAddress),
    createSubgroup: () => secretaryMethods.createSubgroup(contract),
    assignMemberToSubgroup: (memberWalletAddress, subgroupId, isReorging) =>
      secretaryMethods.assignMemberToSubgroup(contract, memberWalletAddress, subgroupId, isReorging),
    initiateDefaultState: (totalCoverage) =>
      secretaryMethods.initiateDefaultState(contract, totalCoverage),
    whitelistClaim: (claimId) => secretaryMethods.whitelistClaim(contract, claimId),
    updateCoverageAmount: (totalCoverage) =>
      secretaryMethods.updateCoverageAmount(contract, totalCoverage),
    defineSecretarySuccessorList: (successorListWalletAddresses) =>
      secretaryMethods.defineSecretarySuccessorList(contract, successorListWalletAddresses),
    handoverSecretaryRoleToSuccessor: (successorWalletAddress) =>
      secretaryMethods.handoverSecretaryRoleToSuccessor(contract, successorWalletAddress),
    injectFunds: () => secretaryMethods.injectFunds(contract),
    divideShortfall: () => secretaryMethods.divideShortfall(contract),
    extendPeriodByOneDay: () => secretaryMethods.extendPeriodByOneDay(contract),
    advancePeriod: () => secretaryMethods.advancePeriod(contract),
  };
}

/**
 * Get all write methods organized by access level
 * @param client An ethers.js Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns An object with public, member, and secretary write methods
 */
export function getWriteMethods(client, contractAddress) {
  return {
    public: getPublicWriteMethods(client, contractAddress),
    member: getMemberWriteMethods(client, contractAddress),
    secretary: getSecretaryWriteMethods(client, contractAddress),
  };
}

/**
 * create a TandaPay contract writer, a thin wrapper around tandapay write methods.
 * All of the methods returned will simulate the transaction to catch errors before writing
 * to the blockchain.
 * @param contractAddress The address of the TandaPay contract
 * @param signer An ethers.js Signer instance
 * @param options Configuration options
 * @param options.includeSimulations Whether to include simulation methods (default: false)
 * @returns returns an object with all the TandaPay contract write methods organized by access level
 */
export default function getTandaPayWriter(contractAddress, signer, options = {}) {
  if (!ethers.utils.isAddress(contractAddress)) {
    throw new Error('Invalid TandaPay contract address');
  }
  if (!ethers.Signer.isSigner(signer)) {
    throw new Error('Invalid signer provided');
  }
  // this one shouldn't happen but will catch a programming mistake
  if (!TandaPayInfo.abi || !Array.isArray(TandaPayInfo.abi)) {
    throw new Error('Invalid TandaPay ABI');
  }

  const writeMethods = getWriteMethods(signer, contractAddress);

  // Optionally include simulation methods
  if (options.includeSimulations) {
    const simulations = getWriteSimulations(signer, contractAddress);
    return {
      ...writeMethods,
      simulations
    };
  }

  return writeMethods;
}
