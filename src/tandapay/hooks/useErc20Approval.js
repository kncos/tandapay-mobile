/* @flow strict-local */

import { useState, useCallback, useEffect } from 'react';
import { useSelector } from '../../react-redux';
import { getTandaPaySelectedNetwork, getCommunityInfo } from '../redux/selectors';
import { getAvailableTokens } from '../tokens/tokenSelectors';
import { findTokenByAddress, formatTokenAmount } from '../definitions';
import {
  requiresErc20Approval,
  estimateErc20Spending,
  approveErc20Spending,
  checkErc20Allowance,
  type Erc20ApprovalState,
  type Erc20ApprovalResult
} from '../contract/erc20ApprovalUtils';

export type UseErc20ApprovalResult = {|
  approvalState: Erc20ApprovalState,
  estimateSpending: () => Promise<void>,
  approveSpending: () => Promise<void>,
  reset: () => void,
  formattedAmount: ?string,
|};

/**
 * React hook for managing ERC20 approval workflow for TandaPay transactions
 */
export function useErc20Approval(methodName: ?string): UseErc20ApprovalResult {
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const communityInfo = useSelector(getCommunityInfo);
  const availableTokens = useSelector(getAvailableTokens);

  const [approvalState, setApprovalState] = useState<Erc20ApprovalState>(() => ({
    isRequired: (methodName != null && methodName !== '') ? requiresErc20Approval(methodName) : false,
    isEstimating: false,
    estimatedAmount: null,
    isApproving: false,
    currentAllowance: null,
    isApproved: false,
    error: null,
  }));

  // Update requirement when method name changes
  useEffect(() => {
    setApprovalState(prev => ({
      ...prev,
      isRequired: (methodName != null && methodName !== '') ? requiresErc20Approval(methodName) : false,
      // Reset state when method changes
      isEstimating: false,
      estimatedAmount: null,
      isApproving: false,
      currentAllowance: null,
      isApproved: false,
      error: null,
    }));
  }, [methodName]);

  const estimateSpending = useCallback(async () => {
    if (methodName == null || methodName === '' || !requiresErc20Approval(methodName)) {
      return;
    }

    setApprovalState(prev => ({
      ...prev,
      isEstimating: true,
      error: null,
    }));

    try {
      const result: Erc20ApprovalResult = await estimateErc20Spending(methodName);

      if (result.success && result.estimatedAmount != null) {
        // After getting estimated amount, check current allowance
        const allowanceCheckResult = await checkErc20Allowance();

        let currentAllowance = null;
        let isAlreadyApproved = false;

        if (allowanceCheckResult.success && allowanceCheckResult.currentAllowance != null) {
          currentAllowance = allowanceCheckResult.currentAllowance;
          // Check if current allowance is already sufficient
          // $FlowFixMe[incompatible-use] - BigNumber comparison
          isAlreadyApproved = currentAllowance.gte(result.estimatedAmount);
        }

        setApprovalState(prev => ({
          ...prev,
          isEstimating: false,
          estimatedAmount: result.estimatedAmount,
          currentAllowance,
          isApproved: isAlreadyApproved,
          error: null,
        }));
      } else {
        setApprovalState(prev => ({
          ...prev,
          isEstimating: false,
          error: result.error != null && result.error !== '' ? result.error : 'Failed to estimate ERC20 spending',
        }));
      }
    } catch (error) {
      setApprovalState(prev => ({
        ...prev,
        isEstimating: false,
        error: error.message || 'Unexpected error during estimation',
      }));
    }
  }, [methodName]);

  const approveSpending = useCallback(async () => {
    if (approvalState.estimatedAmount == null) {
      setApprovalState(prev => ({
        ...prev,
        error: 'No estimated amount available. Please estimate spending first.',
      }));
      return;
    }

    setApprovalState(prev => ({
      ...prev,
      isApproving: true,
      error: null,
    }));

    try {
      const result: Erc20ApprovalResult = await approveErc20Spending(approvalState.estimatedAmount);

      if (result.success) {
        // After successful approval, verify the allowance is actually sufficient
        const allowanceCheckResult = await checkErc20Allowance();

        let isActuallyApproved = false;
        if (allowanceCheckResult.success && allowanceCheckResult.currentAllowance != null) {
          // Check if the current allowance is >= the estimated amount
          // $FlowFixMe[incompatible-use] - BigNumber comparison
          isActuallyApproved = allowanceCheckResult.currentAllowance.gte(approvalState.estimatedAmount);
        }

        if (isActuallyApproved) {
          setApprovalState(prev => ({
            ...prev,
            isApproving: false,
            isApproved: true,
            currentAllowance: allowanceCheckResult.currentAllowance,
            error: null,
          }));
        } else {
          setApprovalState(prev => ({
            ...prev,
            isApproving: false,
            isApproved: false,
            error: 'Approval transaction succeeded but allowance verification failed. Please try again.',
          }));
        }
      } else {
        setApprovalState(prev => ({
          ...prev,
          isApproving: false,
          error: result.error != null && result.error !== '' ? result.error : 'Failed to approve ERC20 spending',
        }));
      }
    } catch (error) {
      setApprovalState(prev => ({
        ...prev,
        isApproving: false,
        error: error.message || 'Unexpected error during approval',
      }));
    }
  }, [approvalState.estimatedAmount]);

  const reset = useCallback(() => {
    setApprovalState(prev => ({
      ...prev,
      isEstimating: false,
      estimatedAmount: null,
      isApproving: false,
      currentAllowance: null,
      isApproved: false,
      error: null,
    }));
  }, []);

  // Get the payment token info and format the amount with correct decimals
  const formattedAmount = (() => {
    if (approvalState.estimatedAmount == null) {
      return null;
    }

    // Get payment token address from community info
    const paymentTokenAddress = communityInfo?.paymentTokenAddress;

    // Find the token information with correct decimals
    const paymentTokenInfo = findTokenByAddress(
      selectedNetwork,
      paymentTokenAddress,
      availableTokens
    );

    // Convert BigNumber to string safely
    // $FlowFixMe[incompatible-use] - BigNumber has toString method
    const amountString = approvalState.estimatedAmount.toString();

    if (paymentTokenInfo) {
      // Use formatTokenAmount for proper token formatting with correct decimals
      const result = formatTokenAmount(
        paymentTokenInfo,
        amountString
      );
      return result.formattedDisplay;
    } else {
      // Fallback: display as raw units if token info is not available
      return `${amountString} units`;
    }
  })();

  return {
    approvalState,
    estimateSpending,
    approveSpending,
    reset,
    formattedAmount,
  };
}
