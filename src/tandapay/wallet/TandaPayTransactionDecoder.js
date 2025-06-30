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
import { TandaPayInfo } from '../contract/utils/TandaPay';
import { getAlchemyRpcUrl } from '../providers/ProviderManager';
import type { SupportedNetwork } from '../definitions';

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
  'payPremium': 'Pay Premium',
  'leaveCommunity': 'Leave Community',
  'defectFromCommunity': 'Defect from Community',
  'withdrawRefund': 'Withdraw Refund',
  'withdrawClaimFund': 'Withdraw Claim Payment',
  'updateMemberStatus': 'Update Member Status',

  // Subgroup actions
  'createSubgroup': 'Create Subgroup',
  'joinSubgroup': 'Join Subgroup',
  'leaveSubgroup': 'Leave Subgroup',
  'approveNewSubgroupMember': 'Approve Subgroup Member',
  'approveSubgroupAssignment': 'Approve Subgroup Assignment',

  // Claim actions
  'submitClaim': 'Submit Claim',
  'submitVoteForClaim': 'Vote on Claim',
  'whitelistClaim': 'Whitelist Claim',

  // Secretary actions
  'advancePeriod': 'Advance Period',
  'addMemberToCommunity': 'Add Member to Community',
  'assignMemberToSubgroup': 'Assign Member to Subgroup',
  'emergencyAdvancePeriod': 'Emergency Advance Period',
  'acceptSecretaryRole': 'Accept Secretary Role',
  'initiateVoluntaryHandover': 'Initiate Secretary Handover',
  'cancelVoluntaryHandover': 'Cancel Secretary Handover',
  'acceptVoluntaryHandover': 'Accept Secretary Role',
  'emergencyHandover': 'Emergency Secretary Handover',
  'defineSecretarySuccessorList': 'Define Secretary Successor List',
  'handoverSecretaryRoleToSuccessor': 'Handover to Successor',
  'emergencySecretaryHandoff': 'Emergency Secretary Handoff',

  // Period and timing actions
  'extendPeriodByOneDay': 'Extend Period by One Day',

  // Emergency actions
  'beginEmergency': 'Begin Emergency',
  'endEmergency': 'End Emergency',
  'emergencyRefund': 'Emergency Refund',
  'emergencyWithdraw': 'Emergency Withdraw',

  // Financial actions
  'setBasePremium': 'Set Base Premium',
  'setCoverageAmount': 'Set Coverage Amount',
  'updateCoverageAmount': 'Update Coverage Amount',
  'divideShortfall': 'Divide Shortfall',
  'issueRefund': 'Issue Refund',
  'injectFunds': 'Inject Funds',

  // System initialization and state
  'initiateDefaultState': 'Initialize Default State',

  // Read-only methods (for completeness)
  'EmergencyStartTime': 'Emergency Start Time',
  'getBasePremium': 'Get Base Premium',
  'getClaimIdsInPeriod': 'Get Claim IDs in Period',
  'getClaimInfo': 'Get Claim Information',
  'getCommunityState': 'Get Community State',
  'getCurrentClaimId': 'Get Current Claim ID',
  'getCurrentMemberCount': 'Get Current Member Count',
  'getCurrentPeriodId': 'Get Current Period ID',
  'getCurrentSubgroupCount': 'Get Current Subgroup Count',
  'getDefectorMemberIdsInPeriod': 'Get Defector Member IDs in Period',
  'getEmergencyHandOverStartedPeriod': 'Get Emergency Handover Started Period',
  'getEmergencyHandoverStartedAt': 'Get Emergency Handover Started Time',
  'getEmergencySecretaries': 'Get Emergency Secretaries',
  'getHandoverStartedAt': 'Get Handover Started Time',
  'getIsAMemberDefectedInPeriod': 'Check if Member Defected in Period',
  'getIsAllMemberNotPaidInPeriod': 'Check if All Members Paid in Period',
  'getIsHandingOver': 'Check if Handing Over',
  'getMemberIdFromAddress': 'Get Member ID from Address',
  'getMemberInfoFromAddress': 'Get Member Info from Address',
  'getMemberInfoFromId': 'Get Member Info from ID',
  'getPaymentTokenAddress': 'Get Payment Token Address',
  'getPeriodIdToPeriodInfo': 'Get Period Information',
  'getSecretaryAddress': 'Get Secretary Address',
  'getSecretarySuccessorList': 'Get Secretary Successor List',
  'getSubgroupInfo': 'Get Subgroup Information',
  'getTotalCoverageAmount': 'Get Total Coverage Amount',
  'getUpcomingSecretary': 'Get Upcoming Secretary',
  'getWhitelistedClaimIdsInPeriod': 'Get Whitelisted Claim IDs in Period',
};

/**
 * Fetch full transaction details including input data using Alchemy API
 */
async function fetchTransactionInputData(
  txHash: string,
  network?: string
): Promise<?string> {
  try {
    // Convert string network to SupportedNetwork, defaulting to sepolia
    const supportedNetwork: SupportedNetwork =
      (network === 'mainnet' || network === 'sepolia' || network === 'arbitrum' || network === 'polygon')
        ? network
        : 'sepolia';

    // Use the centralized helper to get the Alchemy RPC URL
    const alchemyUrl = await getAlchemyRpcUrl(supportedNetwork);
    if (alchemyUrl == null || alchemyUrl === '') {
      return null;
    }

    const response = await fetch(alchemyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
        id: 1,
      }),
    });

    const data = await response.json();
    if (data.error) {
      return null;
    }

    const transaction = data.result;
    if (!transaction || !transaction.input) {
      return null;
    }

    return transaction.input;
  } catch (error) {
    return null;
  }
}

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
export async function decodeTandaPayTransaction(
  transactionData: string,
  transactionHash?: string,
  network?: string,
  transactionStatus?: 'success' | 'failed' | 'pending'
): Promise<?DecodedTandaPayTransaction> {
  try {
    let inputData = transactionData;

    // If transaction data is empty but we have a hash, try to fetch full transaction details
    if ((inputData == null || inputData === '' || inputData === '0x') && transactionHash != null && transactionHash !== '') {
      const fetchedInputData = await fetchTransactionInputData(transactionHash, network);
      if (fetchedInputData != null && fetchedInputData !== '') {
        inputData = fetchedInputData;
      }
    }

    if (inputData == null || inputData === '' || inputData === '0x') {
      return null;
    }

    // Create contract interface for decoding
    const contractInterface = new ethers.utils.Interface(TandaPayInfo.abi);

    // Decode the transaction data
    const decodedData = contractInterface.parseTransaction({ data: inputData });

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
