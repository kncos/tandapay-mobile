/* flow */

import { ethers } from 'ethers';

/**
 * Simulation methods for secretary write functions
 * These methods use callStatic to simulate transactions without executing them on-chain
 */

/**
 * Simulate adding member to community
 */
export const simulateAddMemberToCommunity = async (contract, memberWalletAddress) => {
  try {
    const result = await contract.callStatic.addMemberToCommunity(memberWalletAddress);
    const gasEstimate = await contract.estimateGas.addMemberToCommunity(memberWalletAddress);

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};

/**
 * Simulate creating subgroup
 */
export const simulateCreateSubgroup = async (contract) => {
  try {
    const result = await contract.callStatic.createSubgroup();
    const gasEstimate = await contract.estimateGas.createSubgroup();

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};

/**
 * Simulate assigning member to subgroup
 */
export const simulateAssignMemberToSubgroup = async (contract, memberWalletAddress, subgroupId, isReorging = false) => {
  try {
    const result = await contract.callStatic.assignMemberToSubgroup(
      memberWalletAddress,
      ethers.BigNumber.from(subgroupId),
      isReorging
    );
    const gasEstimate = await contract.estimateGas.assignMemberToSubgroup(
      memberWalletAddress,
      ethers.BigNumber.from(subgroupId),
      isReorging
    );

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};

/**
 * Simulate initiating default state
 */
export const simulateInitiateDefaultState = async (contract, totalCoverage) => {
  try {
    const result = await contract.callStatic.initiateDefaultState(totalCoverage);
    const gasEstimate = await contract.estimateGas.initiateDefaultState(totalCoverage);

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};

/**
 * Simulate whitelisting claim
 */
export const simulateWhitelistClaim = async (contract, claimId) => {
  try {
    const result = await contract.callStatic.whitelistClaim(ethers.BigNumber.from(claimId));
    const gasEstimate = await contract.estimateGas.whitelistClaim(ethers.BigNumber.from(claimId));

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};

/**
 * Simulate updating coverage amount
 */
export const simulateUpdateCoverageAmount = async (contract, totalCoverage) => {
  try {
    const result = await contract.callStatic.updateCoverageAmount(totalCoverage);
    const gasEstimate = await contract.estimateGas.updateCoverageAmount(totalCoverage);

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};

/**
 * Simulate defining secretary successor list
 */
export const simulateDefineSecretarySuccessorList = async (contract, successorListWalletAddresses) => {
  try {
    const result = await contract.callStatic.defineSecretarySuccessorList(successorListWalletAddresses);
    const gasEstimate = await contract.estimateGas.defineSecretarySuccessorList(successorListWalletAddresses);

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};

/**
 * Simulate handing over secretary role to successor
 */
export const simulateHandoverSecretaryRoleToSuccessor = async (contract, successorWalletAddress) => {
  try {
    const result = await contract.callStatic.handoverSecretaryRoleToSuccessor(successorWalletAddress);
    const gasEstimate = await contract.estimateGas.handoverSecretaryRoleToSuccessor(successorWalletAddress);

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};

/**
 * Simulate injecting funds
 */
export const simulateInjectFunds = async (contract) => {
  try {
    const result = await contract.callStatic.injectFunds();
    const gasEstimate = await contract.estimateGas.injectFunds();

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};

/**
 * Simulate dividing shortfall
 */
export const simulateDivideShortfall = async (contract) => {
  try {
    const result = await contract.callStatic.divideShortfall();
    const gasEstimate = await contract.estimateGas.divideShortfall();

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};

/**
 * Simulate extending period by one day
 */
export const simulateExtendPeriodByOneDay = async (contract) => {
  try {
    const result = await contract.callStatic.extendPeriodByOneDay();
    const gasEstimate = await contract.estimateGas.extendPeriodByOneDay();

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};

/**
 * Simulate advancing period
 */
export const simulateAdvancePeriod = async (contract) => {
  try {
    const result = await contract.callStatic.advancePeriod();
    const gasEstimate = await contract.estimateGas.advancePeriod();

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};
