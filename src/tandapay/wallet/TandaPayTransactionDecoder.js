/* @flow strict-local */

/**
 * TandaPay Transaction Decoder
 *
 * This utility decodes TandaPay smart contract transactions to display
 * user-friendly method names and parameter information instead of just
 * showing "Sent 0 ETH" for contract interactions.
 */

// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';
// $FlowFixMe[untyped-import] - TandaPay contract import
import { TandaPayInfo } from '../contract/TandaPay';

export type DecodedTandaPayTransaction = {|
  methodName: string,
  friendlyName: string,
  parameters?: Array<{|
    name: string,
    type: string,
    value: string,
    displayValue: string,
  |}>,
  isSuccess: boolean,
  errorReason?: string,
|};

/**
 * Map of contract method names to user-friendly display names
 */
const METHOD_DISPLAY_NAMES = {
  // Member actions
  'joinCommunity': 'Join Community',
  'payPremiumToCommunity': 'Pay Premium',
  'leaveCommunity': 'Leave Community',
  'defectFromCommunity': 'Defect from Community',
  'withdrawRefund': 'Withdraw Refund',
  'withdrawClaimFund': 'Withdraw Claim Payment',

  // Subgroup actions
  'createSubgroup': 'Create Subgroup',
  'joinSubgroup': 'Join Subgroup',
  'leaveSubgroup': 'Leave Subgroup',
  'approveNewSubgroupMember': 'Approve Subgroup Member',

  // Claim actions
  'submitClaim': 'Submit Claim',
  'submitVoteForClaim': 'Vote on Claim',
  'whitelistClaim': 'Whitelist Claim',

  // Secretary actions
  'advancePeriod': 'Advance Period',
  'addMemberToCommunity': 'Add Member to Community',
  'emergencyAdvancePeriod': 'Emergency Advance Period',
  'acceptSecretaryRole': 'Accept Secretary Role',
  'initiateVoluntaryHandover': 'Initiate Secretary Handover',
  'cancelVoluntaryHandover': 'Cancel Secretary Handover',
  'acceptVoluntaryHandover': 'Accept Secretary Role',
  'emergencyHandover': 'Emergency Secretary Handover',

  // Payment actions
  'setBasePremium': 'Set Base Premium',
  'setCoverageAmount': 'Set Coverage Amount',
};

/**
 * Format parameter values for display
 */
function formatParameterValue(param: mixed, type: string): string {
  if (param == null) {
    return 'null';
  }

  try {
    switch (type) {
      case 'address':
        return String(param);

      case 'uint256':
      case 'uint':
        try {
          // Try to parse as BigNumber - if it works, format it appropriately
          const bigNum = ethers.BigNumber.from(param);
          // For large numbers, display in both wei and ETH format
          if (bigNum.gt(ethers.utils.parseEther('0.001'))) {
            const ethValue = ethers.utils.formatEther(bigNum);
            return `${bigNum.toString()} wei (${ethValue} ETH)`;
          }
          return bigNum.toString();
        } catch {
          // If BigNumber parsing fails, treat as regular string
          return String(param);
        }

      case 'bool':
        return param ? 'Yes' : 'No';

      case 'string':
        return String(param);

      case 'bytes':
      case 'bytes32':
        return String(param);

      default:
        // For arrays and complex types
        if (Array.isArray(param)) {
          return `[${param.map(item => String(item)).join(', ')}]`;
        }
        return String(param);
    }
  } catch (error) {
    return String(param);
  }
}

/**
 * Decode TandaPay transaction data
 */
export function decodeTandaPayTransaction(
  transactionData: string,
  transactionStatus?: 'success' | 'failed' | 'pending'
): ?DecodedTandaPayTransaction {
  try {
    if (!transactionData || transactionData === '0x') {
      return null;
    }

    // Create contract interface for decoding
    const contractInterface = new ethers.utils.Interface(TandaPayInfo.abi);

    // Decode the transaction data
    const decodedData = contractInterface.parseTransaction({ data: transactionData });

    if (!decodedData) {
      return null;
    }

    const methodName = decodedData.name;
    const friendlyName = METHOD_DISPLAY_NAMES[methodName] || methodName;

    // Decode parameters
    const parameters = [];
    if (decodedData.args && decodedData.functionFragment.inputs) {
      for (let i = 0; i < decodedData.functionFragment.inputs.length; i++) {
        const input = decodedData.functionFragment.inputs[i];
        const value = decodedData.args[i];

        parameters.push({
          name: input.name || `param${i}`,
          type: input.type,
          value: String(value),
          displayValue: formatParameterValue(value, input.type),
        });
      }
    }

    return {
      methodName,
      friendlyName,
      parameters: parameters.length > 0 ? parameters : undefined,
      isSuccess: transactionStatus === 'success',
      errorReason: transactionStatus === 'failed' ? 'Transaction failed' : undefined,
    };
  } catch (error) {
    // If decoding fails, it might not be a TandaPay transaction
    return null;
  }
}

/**
 * Check if a transaction is a TandaPay transaction by comparing the 'to' address
 * with the user's configured TandaPay contract address
 */
export function isTandaPayTransaction(
  transaction: mixed,
  tandaPayContractAddress: ?string
): boolean {
  if (tandaPayContractAddress == null || tandaPayContractAddress === '' || transaction == null) {
    return false;
  }

  try {
    // $FlowFixMe[unclear-type] - Transaction object structure is dynamic
    const txObj = (transaction: any);
    const toAddress = txObj?.to || txObj?.toAddress || '';

    if (!toAddress) {
      return false;
    }

    // Normalize addresses for comparison (checksum both)
    const normalizedTo = ethers.utils.getAddress(toAddress.toLowerCase());
    const normalizedContract = ethers.utils.getAddress(tandaPayContractAddress.toLowerCase());

    return normalizedTo === normalizedContract;
  } catch (error) {
    // If address validation fails, assume it's not a TandaPay transaction
    return false;
  }
}

/**
 * Get display summary for TandaPay transaction list item
 */
export function getTandaPayTransactionSummary(decodedTransaction: DecodedTandaPayTransaction): string {
  if (!decodedTransaction.isSuccess && decodedTransaction.errorReason != null && decodedTransaction.errorReason !== '') {
    return `Failed: ${decodedTransaction.friendlyName}`;
  }

  return decodedTransaction.friendlyName;
}
