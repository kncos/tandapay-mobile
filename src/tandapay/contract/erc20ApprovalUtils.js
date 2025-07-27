/* @flow strict-local */

// $FlowFixMe[untyped-import] - ethers.js imports
import { ethers } from 'ethers';
import type { TandaPayResult } from '../errors/types';
import type { BigNumber } from './types';
import {
  tryGetPayPremiumErc20Spend,
  tryGetJoinCommunityErc20Spend,
  tryGetInjectFundsErc20Spend,
  tryGetDivideShortfallErc20Spend,
  approveErc20ForTandaPay,
  checkErc20AllowanceForTandaPay
} from './queryErc20Spending';

/**
 * List of TandaPay contract methods that require ERC20 token spending
 */
export const ERC20_REQUIRING_METHODS: Set<string> = new Set([
  'payPremium',
  'joinCommunity',
  'injectFunds',
  'divideShortfall'
]);

/**
 * Check if a contract method requires ERC20 approval
 */
export function requiresErc20Approval(methodName: string): boolean {
  return ERC20_REQUIRING_METHODS.has(methodName);
}

/**
 * Get the ERC20 spending estimation function for a specific method
 */
export function getErc20SpendingEstimator(methodName: string): ?(() => Promise<TandaPayResult<BigNumber>>) {
  switch (methodName) {
    case 'payPremium':
      return tryGetPayPremiumErc20Spend;
    case 'joinCommunity':
      return tryGetJoinCommunityErc20Spend;
    case 'injectFunds':
      return tryGetInjectFundsErc20Spend;
    case 'divideShortfall':
      return tryGetDivideShortfallErc20Spend;
    default:
      return null;
  }
}

export type Erc20ApprovalState = {|
  isRequired: boolean,
  isEstimating: boolean,
  estimatedAmount: ?BigNumber,
  isApproving: boolean,
  currentAllowance: ?BigNumber,
  isApproved: boolean,
  error: ?string,
|};

export type Erc20ApprovalResult = {|
  success: boolean,
  estimatedAmount?: BigNumber,
  currentAllowance?: BigNumber,
  error?: string,
|};

/**
 * Estimate ERC20 spending amount for a transaction method
 */
export async function estimateErc20Spending(methodName: string): Promise<Erc20ApprovalResult> {
  const estimator = getErc20SpendingEstimator(methodName);
  
  if (!estimator) {
    return {
      success: false,
      error: `No ERC20 spending estimator found for method: ${methodName}`
    };
  }

  try {
    const result = await estimator();
    
    if (result.success && result.data != null) {
      return {
        success: true,
        estimatedAmount: result.data
      };
    } else {
      return {
        success: false,
        error: (result.error?.userMessage != null && result.error.userMessage !== '')
          ? result.error.userMessage
          : (result.error?.message != null && result.error.message !== '')
            ? result.error.message
            : 'Failed to estimate ERC20 spending'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unexpected error during ERC20 spending estimation'
    };
  }
}

/**
 * Format ERC20 amount for display (handles different decimal places)
 */
export function formatErc20Amount(amount: BigNumber, decimals: number = 18, maxDecimals: number = 6): string {
  try {
    // $FlowFixMe[incompatible-use] - BigNumber is from ethers
    const formatted = ethers.utils.formatUnits(amount, decimals);
    const num = parseFloat(formatted);
    
    if (num === 0) {
      return '0';
    }
    
    // For very small amounts, show more precision
    if (num < 0.000001) {
      return formatted;
    }
    
    // For normal amounts, limit decimal places
    return num.toFixed(Math.min(maxDecimals, decimals));
  } catch (error) {
    // $FlowFixMe[incompatible-use] - BigNumber toString method
    return amount.toString();
  }
}

/**
 * Check current ERC20 allowance for TandaPay contract
 */
export async function checkErc20Allowance(): Promise<Erc20ApprovalResult> {
  try {
    const allowanceResult = await checkErc20AllowanceForTandaPay();
    
    if (allowanceResult.success && allowanceResult.data != null) {
      return {
        success: true,
        currentAllowance: allowanceResult.data
      };
    } else {
      return {
        success: false,
        error: (allowanceResult.error?.userMessage != null && allowanceResult.error.userMessage !== '')
          ? allowanceResult.error.userMessage
          : (allowanceResult.error?.message != null && allowanceResult.error.message !== '')
            ? allowanceResult.error.message
            : 'Failed to check ERC20 allowance'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unexpected error checking ERC20 allowance'
    };
  }
}

/**
 * Approve ERC20 tokens for TandaPay contract
 */
export async function approveErc20Spending(amount: BigNumber): Promise<Erc20ApprovalResult> {
  try {
    const approvalResult = await approveErc20ForTandaPay(amount);
    
    if (approvalResult.success) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        error: (approvalResult.error != null && approvalResult.error.userMessage != null && approvalResult.error.userMessage !== '')
          ? approvalResult.error.userMessage
          : (approvalResult.error != null && approvalResult.error.message != null && approvalResult.error.message !== '')
            ? approvalResult.error.message
            : 'Failed to approve ERC20 spending'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unexpected error during ERC20 approval'
    };
  }
}
