// @flow

import { ethers } from 'ethers';
import {
  IconSettings,
  IconPlusCircle,
  IconDollarSign,
  IconUserCheck,
  IconUsers,
  IconShield,
  IconRefreshCw,
  IconLogOut,
  IconUserPlus,
  IconCalendar,
  IconTrendingUp,
} from '../../common/Icons';

/**
 * Standardized write transaction object
 */
export type WriteTransaction = {|
  functionName: string,
  displayName: string,
  description: string,
  role: 'public' | 'member' | 'secretary',
  requiresParams: boolean,
  icon: React$ComponentType<any>,
  writeFunction: (contract: any, ...args: any[]) => Promise<any>,
  simulateFunction: (contract: any, ...args: any[]) => Promise<{|
    success: boolean,
    result: any,
    gasEstimate: ?string,
    error: ?string,
  |}>,
|};

// =============================================================================
// SIMULATION HELPER FUNCTIONS
// =============================================================================

const createSimulation = (contractMethod: string, paramTransform?: (...args: any[]) => any[]) => async (contract: any, ...args: any[]) => {
    try {
      const transformedArgs = paramTransform ? paramTransform(...args) : args;
      const result = await contract.callStatic[contractMethod](...transformedArgs);
      const gasEstimate = await contract.estimateGas[contractMethod](...transformedArgs);

      return {
        success: true,
        result,
        gasEstimate: gasEstimate.toString(),
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        gasEstimate: null,
        error: error.message || 'Simulation failed',
      };
    }
  };

// =============================================================================
// WRITE TRANSACTION DEFINITIONS
// =============================================================================

const transactions: WriteTransaction[] = [
  // PUBLIC TRANSACTIONS
  {
    functionName: 'issueRefund',
    displayName: 'Issue Refund',
    description: 'Issues due refunds within the community',
    role: 'public',
    requiresParams: false,
    icon: IconDollarSign,
    writeFunction: (contract) => contract.issueRefund(true),
    simulateFunction: createSimulation('issueRefund', () => [true]),
  },

  // MEMBER TRANSACTIONS
  {
    functionName: 'joinCommunity',
    displayName: 'Join Community',
    description: 'Join the TandaPay community and transfer funds',
    role: 'member',
    requiresParams: false,
    icon: IconUserPlus,
    writeFunction: (contract) => contract.joinCommunity(),
    simulateFunction: createSimulation('joinCommunity'),
  },

  {
    functionName: 'approveSubgroupAssignment',
    displayName: 'Approve Subgroup Assignment',
    description: 'Approve your subgroup assignment',
    role: 'member',
    requiresParams: true,
    icon: IconUserCheck,
    writeFunction: (contract, approve = true) => contract.approveSubgroupAssignment(approve),
    simulateFunction: createSimulation('approveSubgroupAssignment'),
  },

  {
    functionName: 'approveNewSubgroupMember',
    displayName: 'Approve New Subgroup Member',
    description: 'Approve a new member joining your subgroup',
    role: 'member',
    requiresParams: true,
    icon: IconUsers,
    writeFunction: (contract, subgroupId, newMemberId, approve = true) =>
      contract.approveNewSubgroupMember(
        ethers.BigNumber.from(subgroupId),
        ethers.BigNumber.from(newMemberId),
        approve
      ),
    simulateFunction: createSimulation('approveNewSubgroupMember', (subgroupId, newMemberId, approve = true) => [
      ethers.BigNumber.from(subgroupId),
      ethers.BigNumber.from(newMemberId),
      approve,
    ]),
  },

  {
    functionName: 'leaveSubgroup',
    displayName: 'Leave Subgroup',
    description: 'Exit from your current subgroup',
    role: 'member',
    requiresParams: false,
    icon: IconLogOut,
    writeFunction: (contract) => contract.leaveSubgroup(),
    simulateFunction: createSimulation('leaveSubgroup'),
  },

  {
    functionName: 'defectFromCommunity',
    displayName: 'Defect from Community',
    description: 'Leave the TandaPay community entirely',
    role: 'member',
    requiresParams: false,
    icon: IconLogOut,
    writeFunction: (contract) => contract.defectFromCommunity(),
    simulateFunction: createSimulation('defectFromCommunity'),
  },

  {
    functionName: 'payPremium',
    displayName: 'Pay Premium',
    description: 'Pay your upcoming period premium',
    role: 'member',
    requiresParams: true,
    icon: IconDollarSign,
    writeFunction: (contract, useAvailableBalance = false) => contract.payPremium(useAvailableBalance),
    simulateFunction: createSimulation('payPremium'),
  },

  {
    functionName: 'acceptSecretaryRole',
    displayName: 'Accept Secretary Role',
    description: 'Accept the secretary position',
    role: 'member',
    requiresParams: false,
    icon: IconUserCheck,
    writeFunction: (contract) => contract.acceptSecretaryRole(),
    simulateFunction: createSimulation('acceptSecretaryRole'),
  },

  {
    functionName: 'emergencySecretaryHandoff',
    displayName: 'Emergency Secretary Handoff',
    description: 'Set new secretary in emergency situations',
    role: 'member',
    requiresParams: true,
    icon: IconRefreshCw,
    writeFunction: (contract, newSecretaryWalletAddress) =>
      contract.emergencySecretaryHandoff(newSecretaryWalletAddress),
    simulateFunction: createSimulation('emergencySecretaryHandoff'),
  },

  {
    functionName: 'withdrawRefund',
    displayName: 'Withdraw Refund',
    description: 'Withdraw your available funds and refunds',
    role: 'member',
    requiresParams: false,
    icon: IconDollarSign,
    writeFunction: (contract) => contract.withdrawRefund(),
    simulateFunction: createSimulation('withdrawRefund'),
  },

  {
    functionName: 'submitClaim',
    displayName: 'Submit Claim',
    description: 'Submit an insurance claim to your group',
    role: 'member',
    requiresParams: false,
    icon: IconPlusCircle,
    writeFunction: (contract) => contract.submitClaim(),
    simulateFunction: createSimulation('submitClaim'),
  },

  {
    functionName: 'withdrawClaimFund',
    displayName: 'Withdraw Claim Fund',
    description: 'Withdraw your approved claim amount',
    role: 'member',
    requiresParams: true,
    icon: IconDollarSign,
    writeFunction: (contract, forfeit = false) => contract.withdrawClaimFund(forfeit),
    simulateFunction: createSimulation('withdrawClaimFund'),
  },

  // SECRETARY TRANSACTIONS
  {
    functionName: 'addMemberToCommunity',
    displayName: 'Add Member to Community',
    description: 'Add a new member to the community (Secretary only)',
    role: 'secretary',
    requiresParams: true,
    icon: IconUserPlus,
    writeFunction: (contract, memberWalletAddress) => contract.addMemberToCommunity(memberWalletAddress),
    simulateFunction: createSimulation('addMemberToCommunity'),
  },

  {
    functionName: 'createSubgroup',
    displayName: 'Create Subgroup',
    description: 'Create a new subgroup within the community',
    role: 'secretary',
    requiresParams: false,
    icon: IconUsers,
    writeFunction: (contract) => contract.createSubgroup(),
    simulateFunction: createSimulation('createSubgroup'),
  },

  {
    functionName: 'assignMemberToSubgroup',
    displayName: 'Assign Member to Subgroup',
    description: 'Assign a member to a specific subgroup',
    role: 'secretary',
    requiresParams: true,
    icon: IconUsers,
    writeFunction: (contract, memberWalletAddress, subgroupId, isReorging = false) =>
      contract.assignMemberToSubgroup(
        memberWalletAddress,
        ethers.BigNumber.from(subgroupId),
        isReorging
      ),
    simulateFunction: createSimulation('assignMemberToSubgroup', (memberWalletAddress, subgroupId, isReorging = false) => [
      memberWalletAddress,
      ethers.BigNumber.from(subgroupId),
      isReorging,
    ]),
  },

  {
    functionName: 'initiateDefaultState',
    displayName: 'Initiate Default State',
    description: 'Set default coverage and initiate community state',
    role: 'secretary',
    requiresParams: true,
    icon: IconShield,
    writeFunction: (contract, totalCoverage) => contract.initiateDefaultState(totalCoverage),
    simulateFunction: createSimulation('initiateDefaultState'),
  },

  {
    functionName: 'whitelistClaim',
    displayName: 'Whitelist Claim',
    description: 'Approve a submitted insurance claim',
    role: 'secretary',
    requiresParams: true,
    icon: IconUserCheck,
    writeFunction: (contract, claimId) => contract.whitelistClaim(ethers.BigNumber.from(claimId)),
    simulateFunction: createSimulation('whitelistClaim', (claimId) => [ethers.BigNumber.from(claimId)]),
  },

  {
    functionName: 'updateCoverageAmount',
    displayName: 'Update Coverage Amount',
    description: 'Update the total coverage amount for the community',
    role: 'secretary',
    requiresParams: true,
    icon: IconShield,
    writeFunction: (contract, totalCoverage) => contract.updateCoverageAmount(totalCoverage),
    simulateFunction: createSimulation('updateCoverageAmount'),
  },

  {
    functionName: 'defineSecretarySuccessorList',
    displayName: 'Define Secretary Successor List',
    description: 'Set candidates for secretary succession',
    role: 'secretary',
    requiresParams: true,
    icon: IconSettings,
    writeFunction: (contract, successorListWalletAddresses) =>
      contract.defineSecretarySuccessorList(successorListWalletAddresses),
    simulateFunction: createSimulation('defineSecretarySuccessorList'),
  },

  {
    functionName: 'handoverSecretaryRoleToSuccessor',
    displayName: 'Handover Secretary Role',
    description: 'Transfer secretary position to a successor',
    role: 'secretary',
    requiresParams: true,
    icon: IconRefreshCw,
    writeFunction: (contract, successorWalletAddress) =>
      contract.handoverSecretaryRoleToSuccessor(successorWalletAddress),
    simulateFunction: createSimulation('handoverSecretaryRoleToSuccessor'),
  },

  {
    functionName: 'injectFunds',
    displayName: 'Inject Funds',
    description: 'Inject funds to save community from collapse',
    role: 'secretary',
    requiresParams: false,
    icon: IconDollarSign,
    writeFunction: (contract) => contract.injectFunds(),
    simulateFunction: createSimulation('injectFunds'),
  },

  {
    functionName: 'divideShortfall',
    displayName: 'Divide Shortfall',
    description: 'Divide coverage shortfall among all members',
    role: 'secretary',
    requiresParams: false,
    icon: IconTrendingUp,
    writeFunction: (contract) => contract.divideShortfall(),
    simulateFunction: createSimulation('divideShortfall'),
  },

  {
    functionName: 'extendPeriodByOneDay',
    displayName: 'Extend Period by One Day',
    description: 'Add one day before period ends',
    role: 'secretary',
    requiresParams: false,
    icon: IconCalendar,
    writeFunction: (contract) => contract.extendPeriodByOneDay(),
    simulateFunction: createSimulation('extendPeriodByOneDay'),
  },

  {
    functionName: 'advancePeriod',
    displayName: 'Advance Period',
    description: 'Advance to the next period',
    role: 'secretary',
    requiresParams: false,
    icon: IconCalendar,
    writeFunction: (contract) => contract.advancePeriod(),
    simulateFunction: createSimulation('advancePeriod'),
  },
];

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

/**
 * Get all write transactions
 */
export function getAllWriteTransactions(): WriteTransaction[] {
  return transactions;
}

/**
 * Get write transactions filtered by role
 */
export function getWriteTransactionsByRole(role: 'public' | 'member' | 'secretary'): WriteTransaction[] {
  return transactions.filter((transaction) => transaction.role === role);
}

/**
 * Get write transactions that don't require parameters
 */
export function getParameterlessWriteTransactions(): WriteTransaction[] {
  return transactions.filter((transaction) => !transaction.requiresParams);
}

/**
 * Get a specific write transaction by function name
 */
export function getWriteTransactionByName(functionName: string): ?WriteTransaction {
  return transactions.find((transaction) => transaction.functionName === functionName);
}
