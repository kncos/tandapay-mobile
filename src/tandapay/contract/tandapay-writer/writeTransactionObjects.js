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
} from '../../../common/Icons';

import TandaPayErrorHandler from '../../errors/ErrorHandler';
import { estimateContractTransactionGas } from '../../web3';
import { createErc20AwareSimulation } from '../queryErc20Spending';

/**
 * Parameter metadata for dynamic form generation
 */
export type WriteTransactionParameter = {|
  name: string,
  type: 'address' | 'uint256' | 'bool' | 'address[]',
  label: string,
  description: string,
  placeholder?: string,
  isCurrency?: boolean,
  validation: {|
    required?: boolean,
    min?: number,
    max?: number,
  |},
|};

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
  parameters?: WriteTransactionParameter[],
  prefilledParams?: {| [paramName: string]: string | boolean |},
  writeFunction: (contract: any, ...args: any[]) => Promise<any>,
  simulateFunction: (
    contract: any,
    ...args: any[]
  ) => Promise<{|
    success: boolean,
    result: any,
    gasEstimate: ?string,
    error: ?string,
    originalError?: string,
  |}>,
  estimateGasFunction?: (contract: any, ...args: any[]) => Promise<any>,
|};

// =============================================================================
// SIMULATION HELPER FUNCTIONS
// =============================================================================

/**
 * Creates a simulation function that only does callStatic (no gas estimation)
 * This is cleaner and more focused than the previous implementation
 */
const createSimulation =
  (contractMethod: string, paramTransform?: (...args: any[]) => any[]) =>
  async (contract: any, ...args: any[]) => {
    try {
      const transformedArgs = paramTransform ? paramTransform(...args) : args;
      const callResult = await contract.callStatic[contractMethod](...transformedArgs);

      return {
        success: true,
        result: callResult,
        gasEstimate: null, // Simulation doesn't provide gas estimates
        error: null,
      };
    } catch (error) {
      // Handle simulation errors with more specific messaging
      const parsedError = TandaPayErrorHandler.parseEthersError(error);

      // For simulation failures, be explicit that the transaction would revert
      let userMessage = parsedError.userMessage;

      // Clean up layered error messages and make them more user-friendly
      if (parsedError.type === 'CONTRACT_ERROR') {
        // If it's already a good user message, use it directly
        if (userMessage.includes('Premium has already been paid')
            || userMessage.includes('This action can only be performed')
            || userMessage.includes('community has collapsed')
            || userMessage.includes('already been added')
            || userMessage.includes('not valid for the current period')) {
          // Keep the specific message as-is
        } else if (userMessage.includes('Smart contract operation failed')
                   || userMessage.includes('execution reverted')
                   || userMessage.includes('transaction may fail')) {
          // Replace generic messages with clearer revert message
          userMessage = 'This transaction cannot be completed at this time. The contract state may not allow this operation right now.';
        }
      }

      return {
        success: false,
        result: null,
        gasEstimate: null,
        error: userMessage,
        // Preserve original error for debugging
        originalError: error?.message || String(error),
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
    writeFunction: contract => contract.issueRefund(true),
    // Simplified approach: just call the contract method directly
    simulateFunction: async (contract) => {
      try {
        const callResult = await contract.callStatic.issueRefund(true);
        return {
          success: true,
          result: callResult,
          gasEstimate: null,
          error: null,
        };
      } catch (error) {
        // Handle simulation errors with more specific messaging
        const parsedError = TandaPayErrorHandler.parseEthersError(error);

        // Use the clean error message from ErrorHandler without adding prefixes
        return {
          success: false,
          result: null,
          gasEstimate: null,
          error: parsedError.userMessage,
          originalError: error?.message || String(error),
        };
      }
    },
    estimateGasFunction: contract => estimateContractTransactionGas(contract, 'issueRefund', undefined, [true]),
  },

  // MEMBER TRANSACTIONS
  {
    functionName: 'joinCommunity',
    displayName: 'Join Community',
    description: 'Join the TandaPay community and transfer funds',
    role: 'member',
    requiresParams: false,
    icon: IconUserPlus,
    writeFunction: contract => contract.joinCommunity(),
    // ERC20-aware simulation for joinCommunity
    simulateFunction: createErc20AwareSimulation('joinCommunity'),
    estimateGasFunction: contract => estimateContractTransactionGas(contract, 'joinCommunity'),
  },

  {
    functionName: 'approveSubgroupAssignment',
    displayName: 'Approve Subgroup Assignment',
    description: 'Approve your subgroup assignment',
    role: 'member',
    requiresParams: true,
    icon: IconUserCheck,
    parameters: [
      {
        name: 'approve',
        type: 'bool',
        label: 'Approve Assignment',
        description: 'Choose whether to approve or reject your subgroup assignment',
        validation: { required: true },
      },
    ],
    writeFunction: (contract, approve = true) => contract.approveSubgroupAssignment(approve),
    simulateFunction: createSimulation('approveSubgroupAssignment'),
    estimateGasFunction: (contract, approve = true) =>
      estimateContractTransactionGas(contract, 'approveSubgroupAssignment', undefined, [approve]),
  },

  {
    functionName: 'approveNewSubgroupMember',
    displayName: 'Approve New Subgroup Member',
    description: 'Approve a new member joining your subgroup',
    role: 'member',
    requiresParams: true,
    icon: IconUsers,
    parameters: [
      {
        name: 'subgroupId',
        type: 'uint256',
        label: 'Subgroup ID',
        description: 'ID of the subgroup the member wants to join',
        validation: { required: true, min: 0 },
      },
      {
        name: 'newMemberId',
        type: 'uint256',
        label: 'New Member ID',
        description: 'ID of the member requesting to join',
        validation: { required: true, min: 0 },
      },
      {
        name: 'approve',
        type: 'bool',
        label: 'Approve Member',
        description: 'Choose whether to approve or reject the new member',
        validation: { required: true },
      },
    ],
    writeFunction: (contract, subgroupId, newMemberId, approve = true) =>
      contract.approveNewSubgroupMember(
        ethers.BigNumber.from(subgroupId),
        ethers.BigNumber.from(newMemberId),
        approve,
      ),
    simulateFunction: createSimulation(
      'approveNewSubgroupMember',
      (subgroupId, newMemberId, approve = true) => [
        ethers.BigNumber.from(subgroupId),
        ethers.BigNumber.from(newMemberId),
        approve,
      ],
    ),
    estimateGasFunction: (contract, subgroupId, newMemberId, approve = true) =>
      estimateContractTransactionGas(contract, 'approveNewSubgroupMember', undefined, [
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
    writeFunction: contract => contract.leaveSubgroup(),
    simulateFunction: createSimulation('leaveSubgroup'),
    estimateGasFunction: contract => estimateContractTransactionGas(contract, 'leaveSubgroup'),
  },

  {
    functionName: 'defectFromCommunity',
    displayName: 'Defect from Community',
    description: 'Leave the TandaPay community entirely',
    role: 'member',
    requiresParams: false,
    icon: IconLogOut,
    writeFunction: contract => contract.defectFromCommunity(),
    simulateFunction: createSimulation('defectFromCommunity'),
    estimateGasFunction: contract => estimateContractTransactionGas(contract, 'defectFromCommunity'),
  },

  {
    functionName: 'payPremium',
    displayName: 'Pay Premium',
    description: 'Pay your upcoming period premium',
    role: 'member',
    requiresParams: true,
    icon: IconDollarSign,
    parameters: [
      {
        name: 'useAvailableBalance',
        type: 'bool',
        label: 'Use Available Balance',
        description: 'Use your available balance to pay the premium',
        validation: { required: true },
      },
    ],
    writeFunction: (contract, useAvailableBalance = false) =>
      contract.payPremium(useAvailableBalance),
    simulateFunction: createErc20AwareSimulation('payPremium'),
    estimateGasFunction: (contract, useAvailableBalance = false) =>
      estimateContractTransactionGas(contract, 'payPremium', undefined, [useAvailableBalance]),
  },

  {
    functionName: 'acceptSecretaryRole',
    displayName: 'Accept Secretary Role',
    description: 'Accept the secretary position',
    role: 'member',
    requiresParams: false,
    icon: IconUserCheck,
    writeFunction: contract => contract.acceptSecretaryRole(),
    simulateFunction: createSimulation('acceptSecretaryRole'),
    estimateGasFunction: contract => estimateContractTransactionGas(contract, 'acceptSecretaryRole'),
  },

  {
    functionName: 'emergencySecretaryHandoff',
    displayName: 'Emergency Secretary Handoff',
    description: 'Set new secretary in emergency situations',
    role: 'member',
    requiresParams: true,
    icon: IconRefreshCw,
    parameters: [
      {
        name: 'newSecretaryWalletAddress',
        type: 'address',
        label: 'New Secretary Address',
        description: 'Ethereum address of the new secretary',
        placeholder: '0x...',
        validation: { required: true },
      },
    ],
    writeFunction: (contract, newSecretaryWalletAddress) =>
      contract.emergencySecretaryHandoff(newSecretaryWalletAddress),
    simulateFunction: createSimulation('emergencySecretaryHandoff'),
    estimateGasFunction: (contract, newSecretaryWalletAddress) =>
      estimateContractTransactionGas(contract, 'emergencySecretaryHandoff', undefined, [newSecretaryWalletAddress]),
  },

  {
    functionName: 'withdrawRefund',
    displayName: 'Withdraw Refund',
    description: 'Withdraw your available funds and refunds',
    role: 'member',
    requiresParams: false,
    icon: IconDollarSign,
    writeFunction: contract => contract.withdrawRefund(),
    simulateFunction: createSimulation('withdrawRefund'),
    estimateGasFunction: contract => estimateContractTransactionGas(contract, 'withdrawRefund'),
  },

  {
    functionName: 'submitClaim',
    displayName: 'Submit Claim',
    description: 'Submit an insurance claim to your group',
    role: 'member',
    requiresParams: false,
    icon: IconPlusCircle,
    writeFunction: contract => contract.submitClaim(),
    simulateFunction: createSimulation('submitClaim'),
    estimateGasFunction: contract => estimateContractTransactionGas(contract, 'submitClaim'),
  },

  {
    functionName: 'withdrawClaimFund',
    displayName: 'Withdraw Claim Fund',
    description: 'Withdraw your approved claim amount',
    role: 'member',
    requiresParams: true,
    icon: IconDollarSign,
    parameters: [
      {
        name: 'forfeit',
        type: 'bool',
        label: 'Forfeit Claim',
        description: 'Choose whether to forfeit the claim',
        validation: { required: true },
      },
    ],
    writeFunction: (contract, forfeit = false) => contract.withdrawClaimFund(forfeit),
    simulateFunction: createSimulation('withdrawClaimFund'),
    estimateGasFunction: (contract, forfeit = false) =>
      estimateContractTransactionGas(contract, 'withdrawClaimFund', undefined, [forfeit]),
  },

  // SECRETARY TRANSACTIONS
  {
    functionName: 'addMemberToCommunity',
    displayName: 'Add Member to Community',
    description: 'Add a new member to the community (Secretary only)',
    role: 'secretary',
    requiresParams: true,
    icon: IconUserPlus,
    parameters: [
      {
        name: 'memberWalletAddress',
        type: 'address',
        label: 'Member Wallet Address',
        description: 'Ethereum address of the new member to add',
        placeholder: '0x...',
        validation: { required: true },
      },
    ],
    writeFunction: (contract, memberWalletAddress) =>
      contract.addMemberToCommunity(memberWalletAddress),
    simulateFunction: createSimulation('addMemberToCommunity'),
    estimateGasFunction: (contract, memberWalletAddress) =>
      estimateContractTransactionGas(contract, 'addMemberToCommunity', undefined, [memberWalletAddress]),
  },

  {
    functionName: 'createSubgroup',
    displayName: 'Create Subgroup',
    description: 'Create a new subgroup within the community',
    role: 'secretary',
    requiresParams: false,
    icon: IconUsers,
    writeFunction: contract => contract.createSubgroup(),
    simulateFunction: createSimulation('createSubgroup'),
    estimateGasFunction: contract => estimateContractTransactionGas(contract, 'createSubgroup'),
  },

  {
    functionName: 'assignMemberToSubgroup',
    displayName: 'Assign Member to Subgroup',
    description: 'Assign a member to a specific subgroup',
    role: 'secretary',
    requiresParams: true,
    icon: IconUsers,
    parameters: [
      {
        name: 'memberWalletAddress',
        type: 'address',
        label: 'Member Wallet Address',
        description: 'Ethereum address of the member to assign',
        placeholder: '0x...',
        validation: { required: true },
      },
      {
        name: 'subgroupId',
        type: 'uint256',
        label: 'Subgroup ID',
        description: 'ID of the target subgroup',
        validation: { required: true, min: 0 },
      },
      {
        name: 'isReorging',
        type: 'bool',
        label: 'Is Reorganizing',
        description: 'Whether this assignment is part of a reorganization',
        validation: { required: true },
      },
    ],
    writeFunction: (contract, memberWalletAddress, subgroupId, isReorging = false) =>
      contract.assignMemberToSubgroup(
        memberWalletAddress,
        ethers.BigNumber.from(subgroupId),
        isReorging,
      ),
    simulateFunction: createSimulation(
      'assignMemberToSubgroup',
      (memberWalletAddress, subgroupId, isReorging = false) => [
        memberWalletAddress,
        ethers.BigNumber.from(subgroupId),
        isReorging,
      ],
    ),
    estimateGasFunction: (contract, memberWalletAddress, subgroupId, isReorging = false) =>
      estimateContractTransactionGas(contract, 'assignMemberToSubgroup', undefined, [
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
    parameters: [
      {
        name: 'totalCoverage',
        type: 'uint256',
        label: 'Total Coverage Amount',
        description: 'Total coverage amount for the community',
        placeholder: 'Enter coverage amount',
        isCurrency: true,
        validation: { required: true, min: 0 },
      },
    ],
    writeFunction: (contract, totalCoverage) => contract.initiateDefaultState(totalCoverage),
    simulateFunction: createSimulation('initiateDefaultState'),
    estimateGasFunction: (contract, totalCoverage) =>
      estimateContractTransactionGas(contract, 'initiateDefaultState', undefined, [totalCoverage]),
  },

  {
    functionName: 'whitelistClaim',
    displayName: 'Whitelist Claim',
    description: 'Approve a submitted insurance claim',
    role: 'secretary',
    requiresParams: true,
    icon: IconUserCheck,
    parameters: [
      {
        name: 'claimId',
        type: 'uint256',
        label: 'Claim ID',
        description: 'ID of the claim to whitelist',
        validation: { required: true, min: 0 },
      },
    ],
    writeFunction: (contract, claimId) => contract.whitelistClaim(ethers.BigNumber.from(claimId)),
    simulateFunction: createSimulation('whitelistClaim', claimId => [
      ethers.BigNumber.from(claimId),
    ]),
    estimateGasFunction: (contract, claimId) =>
      estimateContractTransactionGas(contract, 'whitelistClaim', undefined, [ethers.BigNumber.from(claimId)]),
  },

  {
    functionName: 'updateCoverageAmount',
    displayName: 'Update Coverage Amount',
    description: 'Update the total coverage amount for the community',
    role: 'secretary',
    requiresParams: true,
    icon: IconShield,
    parameters: [
      {
        name: 'totalCoverage',
        type: 'uint256',
        label: 'Total Coverage Amount',
        description: 'Total coverage amount in smallest token units (e.g., wei for ETH, base units for ERC20 tokens)',
        placeholder: 'Enter amount in smallest token units',
        isCurrency: false,
        validation: { required: true, min: 0 },
      },
    ],
    writeFunction: (contract, totalCoverage) => contract.updateCoverageAmount(totalCoverage),
    simulateFunction: createSimulation('updateCoverageAmount'),
    estimateGasFunction: (contract, totalCoverage) =>
      estimateContractTransactionGas(contract, 'updateCoverageAmount', undefined, [totalCoverage]),
  },

  {
    functionName: 'defineSecretarySuccessorList',
    displayName: 'Define Secretary Successor List',
    description: 'Set candidates for secretary succession',
    role: 'secretary',
    requiresParams: true,
    icon: IconSettings,
    parameters: [
      {
        name: 'successorListWalletAddresses',
        type: 'address[]',
        label: 'Successor Wallet Addresses',
        description: 'Array of Ethereum addresses for secretary successors',
        validation: { required: true },
      },
    ],
    writeFunction: (contract, successorListWalletAddresses) =>
      contract.defineSecretarySuccessorList(successorListWalletAddresses),
    simulateFunction: createSimulation('defineSecretarySuccessorList'),
    estimateGasFunction: (contract, successorListWalletAddresses) =>
      estimateContractTransactionGas(contract, 'defineSecretarySuccessorList', undefined, [successorListWalletAddresses]),
  },

  {
    functionName: 'handoverSecretaryRoleToSuccessor',
    displayName: 'Handover Secretary Role',
    description: 'Transfer secretary position to a successor',
    role: 'secretary',
    requiresParams: true,
    icon: IconRefreshCw,
    parameters: [
      {
        name: 'successorWalletAddress',
        type: 'address',
        label: 'Successor Wallet Address',
        description: 'Ethereum address of the successor to handover secretary role to',
        placeholder: '0x...',
        validation: { required: true },
      },
    ],
    writeFunction: (contract, successorWalletAddress) =>
      contract.handoverSecretaryRoleToSuccessor(successorWalletAddress),
    simulateFunction: createSimulation('handoverSecretaryRoleToSuccessor'),
    estimateGasFunction: (contract, successorWalletAddress) =>
      estimateContractTransactionGas(contract, 'handoverSecretaryRoleToSuccessor', undefined, [successorWalletAddress]),
  },

  {
    functionName: 'injectFunds',
    displayName: 'Inject Funds',
    description: 'Inject funds to save community from collapse',
    role: 'secretary',
    requiresParams: false,
    icon: IconDollarSign,
    writeFunction: contract => contract.injectFunds(),
    simulateFunction: createErc20AwareSimulation('injectFunds'),
    estimateGasFunction: contract => estimateContractTransactionGas(contract, 'injectFunds'),
  },

  {
    functionName: 'divideShortfall',
    displayName: 'Divide Shortfall',
    description: 'Divide coverage shortfall among all members',
    role: 'secretary',
    requiresParams: false,
    icon: IconTrendingUp,
    writeFunction: contract => contract.divideShortfall(),
    simulateFunction: createErc20AwareSimulation('divideShortfall'),
    estimateGasFunction: contract => estimateContractTransactionGas(contract, 'divideShortfall'),
  },

  {
    functionName: 'extendPeriodByOneDay',
    displayName: 'Extend Period by One Day',
    description: 'Add one day before period ends',
    role: 'secretary',
    requiresParams: false,
    icon: IconCalendar,
    writeFunction: contract => contract.extendPeriodByOneDay(),
    simulateFunction: createSimulation('extendPeriodByOneDay'),
    estimateGasFunction: contract => estimateContractTransactionGas(contract, 'extendPeriodByOneDay'),
  },

  {
    functionName: 'advancePeriod',
    displayName: 'Advance Period',
    description: 'Advance to the next period',
    role: 'secretary',
    requiresParams: false,
    icon: IconCalendar,
    writeFunction: contract => contract.advancePeriod(),
    simulateFunction: createSimulation('advancePeriod'),
    estimateGasFunction: contract => estimateContractTransactionGas(contract, 'advancePeriod'),
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
export function getWriteTransactionsByRole(
  role: 'public' | 'member' | 'secretary',
): WriteTransaction[] {
  return transactions.filter(transaction => transaction.role === role);
}

/**
 * Get write transactions that don't require parameters
 */
export function getParameterlessWriteTransactions(): WriteTransaction[] {
  return transactions.filter(transaction => !transaction.requiresParams);
}

/**
 * Get a specific write transaction by function name
 */
export function getWriteTransactionByName(functionName: string): ?WriteTransaction {
  return transactions.find(transaction => transaction.functionName === functionName);
}
