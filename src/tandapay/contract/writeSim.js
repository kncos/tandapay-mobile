/* flow */

import { ethers } from 'ethers';
import { TandaPayInfo } from './TandaPay';
import * as publicSimMethods from './writePublicSim';
import * as memberSimMethods from './writeMemberSim';
import * as secretarySimMethods from './writeSecretarySim';

/**
 * Get public write simulation methods bound to a contract instance
 * @param client An ethers.js Provider or Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns An object with all public write simulation methods
 */
export function getPublicWriteSimulations(client, contractAddress) {
  const contract = new ethers.Contract(contractAddress, TandaPayInfo.abi, client);

  return {
    issueRefund: () => publicSimMethods.simulateIssueRefund(contract),
  };
}

/**
 * Get member write simulation methods bound to a contract instance
 * @param client An ethers.js Provider or Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns An object with all member write simulation methods
 */
export function getMemberWriteSimulations(client, contractAddress) {
  const contract = new ethers.Contract(contractAddress, TandaPayInfo.abi, client);

  return {
    joinCommunity: () => memberSimMethods.simulateJoinCommunity(contract),
    approveSubgroupAssignment: (approve) => memberSimMethods.simulateApproveSubgroupAssignment(contract, approve),
    approveNewSubgroupMember: (subgroupId, newMemberId, approve) =>
      memberSimMethods.simulateApproveNewSubgroupMember(contract, subgroupId, newMemberId, approve),
    leaveSubgroup: () => memberSimMethods.simulateLeaveSubgroup(contract),
    defectFromCommunity: () => memberSimMethods.simulateDefectFromCommunity(contract),
    payPremium: (useAvailableBalance) => memberSimMethods.simulatePayPremium(contract, useAvailableBalance),
    acceptSecretaryRole: () => memberSimMethods.simulateAcceptSecretaryRole(contract),
    emergencySecretaryHandoff: (newSecretaryWalletAddress) =>
      memberSimMethods.simulateEmergencySecretaryHandoff(contract, newSecretaryWalletAddress),
    withdrawRefund: () => memberSimMethods.simulateWithdrawRefund(contract),
    submitClaim: () => memberSimMethods.simulateSubmitClaim(contract),
    withdrawClaimFund: (forfeit) => memberSimMethods.simulateWithdrawClaimFund(contract, forfeit),
  };
}

/**
 * Get secretary write simulation methods bound to a contract instance
 * @param client An ethers.js Provider or Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns An object with all secretary write simulation methods
 */
export function getSecretaryWriteSimulations(client, contractAddress) {
  const contract = new ethers.Contract(contractAddress, TandaPayInfo.abi, client);

  return {
    addMemberToCommunity: (memberWalletAddress) =>
      secretarySimMethods.simulateAddMemberToCommunity(contract, memberWalletAddress),
    createSubgroup: () => secretarySimMethods.simulateCreateSubgroup(contract),
    assignMemberToSubgroup: (memberWalletAddress, subgroupId, isReorging) =>
      secretarySimMethods.simulateAssignMemberToSubgroup(contract, memberWalletAddress, subgroupId, isReorging),
    initiateDefaultState: (totalCoverage) =>
      secretarySimMethods.simulateInitiateDefaultState(contract, totalCoverage),
    whitelistClaim: (claimId) => secretarySimMethods.simulateWhitelistClaim(contract, claimId),
    updateCoverageAmount: (totalCoverage) =>
      secretarySimMethods.simulateUpdateCoverageAmount(contract, totalCoverage),
    defineSecretarySuccessorList: (successorListWalletAddresses) =>
      secretarySimMethods.simulateDefineSecretarySuccessorList(contract, successorListWalletAddresses),
    handoverSecretaryRoleToSuccessor: (successorWalletAddress) =>
      secretarySimMethods.simulateHandoverSecretaryRoleToSuccessor(contract, successorWalletAddress),
    injectFunds: () => secretarySimMethods.simulateInjectFunds(contract),
    divideShortfall: () => secretarySimMethods.simulateDivideShortfall(contract),
    extendPeriodByOneDay: () => secretarySimMethods.simulateExtendPeriodByOneDay(contract),
    advancePeriod: () => secretarySimMethods.simulateAdvancePeriod(contract),
  };
}

/**
 * Get all write simulation methods organized by access level
 * @param client An ethers.js Provider or Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns An object with public, member, and secretary write simulation methods
 */
export function getWriteSimulations(client, contractAddress) {
  return {
    public: getPublicWriteSimulations(client, contractAddress),
    member: getMemberWriteSimulations(client, contractAddress),
    secretary: getSecretaryWriteSimulations(client, contractAddress),
  };
}

/**
 * Create a TandaPay contract simulation wrapper
 * All methods will simulate transactions using callStatic before execution
 * @param contractAddress The address of the TandaPay contract
 * @param clientOrSigner An ethers.js Provider or Signer instance
 * @returns An object with all TandaPay contract write simulation methods organized by access level
 */
export default function getTandaPaySimulator(contractAddress, clientOrSigner) {
  if (!ethers.utils.isAddress(contractAddress)) {
    throw new Error('Invalid TandaPay contract address');
  }
  if (!clientOrSigner.provider && !ethers.Signer.isSigner(clientOrSigner)) {
    throw new Error('Invalid provider or signer provided');
  }
  if (!TandaPayInfo.abi || !Array.isArray(TandaPayInfo.abi)) {
    throw new Error('Invalid TandaPay ABI');
  }

  return getWriteSimulations(clientOrSigner, contractAddress);
}
