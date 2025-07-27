// @flow

// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

import type { TandaPayResult } from '../errors/types';
import type { BigNumber } from './types';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import { Erc20Abi } from './utils/Erc20Abi';
import { TandaPayInfo } from './utils/TandaPay';
import { getWalletInstance } from '../wallet/WalletManager';
import { getProvider } from '../web3';
import store from '../../boot/store';
import { getTandaPaySelectedNetwork, getCurrentTandaPayContractAddress } from '../redux/selectors';
import { tryGetActiveAccountState } from '../../account/accountsSelectors';

/**
 * Internal helper to get user wallet address
 */
async function getWalletAddress(): Promise<TandaPayResult<string>> {
  const walletResult = await getWalletInstance();
  if (!walletResult.success) {
    return { success: false, error: walletResult.error };
  }

  return { success: true, data: walletResult.data.address };
}

/**
 * Internal helper to get current Redux state and contract info
 */
function getCurrentStateAndContract(): TandaPayResult<{|
  network: string,
  contractAddress: string,
  paymentTokenAddress: string
|}> {
  try {
    const globalState = store.getState();
    const perAccountState = tryGetActiveAccountState(globalState);

    if (!perAccountState) {
      return {
        success: false,
        error: TandaPayErrorHandler.createError(
          'CONTRACT_ERROR',
          'Redux state not available',
          { userMessage: 'Unable to access application state. Please try again.' }
        )
      };
    }

    const network = getTandaPaySelectedNetwork(perAccountState);
    const contractAddress = getCurrentTandaPayContractAddress(perAccountState);

    if (!network) {
      return {
        success: false,
        error: TandaPayErrorHandler.createError(
          'CONTRACT_ERROR',
          'Network not configured',
          { userMessage: 'Please configure a network in TandaPay settings.' }
        )
      };
    }

    if (!contractAddress || contractAddress.trim() === '') {
      return {
        success: false,
        error: TandaPayErrorHandler.createError(
          'CONTRACT_ERROR',
          'TandaPay contract address not configured',
          { userMessage: 'Please configure a TandaPay contract address in network settings.' }
        )
      };
    }

    // For now, we'll need to get the payment token address from the contract
    // This is a simplification - in a real implementation, this might be cached or retrieved differently
    return {
      success: true,
      data: {
        network,
        contractAddress,
        paymentTokenAddress: '' // Will be retrieved from contract
      }
    };
  } catch (error) {
    return {
      success: false,
      error: TandaPayErrorHandler.createError(
        'CONTRACT_ERROR',
        'Failed to get current state',
        { userMessage: 'Unable to access application state. Please try again.' }
      )
    };
  }
}

/**
 * Internal helper to get payment token address from TandaPay contract
 */
async function getPaymentTokenAddress(contractAddress: string): Promise<TandaPayResult<string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const provider = await getProvider();
      const contract = new ethers.Contract(contractAddress, TandaPayInfo.abi, provider);
      const tokenAddress = await contract.getPaymentTokenAddress();

      if (!tokenAddress || tokenAddress === ethers.constants.AddressZero) {
        throw TandaPayErrorHandler.createError(
          'CONTRACT_ERROR',
          'Invalid payment token address from contract',
          { userMessage: 'Contract has no valid payment token configured.' }
        );
      }

      return tokenAddress;
    },
    'CONTRACT_ERROR',
    'Failed to get payment token address from TandaPay contract.',
    'PAYMENT_TOKEN_FETCH'
  );
}

/**
 * Internal helper to manage ERC20 allowance operations
 */
async function manageAllowance(
  tokenAddress: string,
  spenderAddress: string,
  userAddress: string,
  newAllowance: string
): Promise<TandaPayResult<string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const provider = await getProvider();
      const walletResult = await getWalletInstance(provider);

      if (!walletResult.success) {
        throw walletResult.error;
      }

      const signer = walletResult.data;
      const tokenContract = new ethers.Contract(tokenAddress, Erc20Abi, signer);

      // Execute approve transaction
      const tx = await tokenContract.approve(spenderAddress, newAllowance);

      // Wait for transaction receipt
      const receipt = await tx.wait();

      if (!receipt || receipt.status !== 1) {
        throw TandaPayErrorHandler.createError(
          'CONTRACT_ERROR',
          'Allowance transaction failed',
          { userMessage: 'Failed to update token allowance. Please try again.' }
        );
      }

      return receipt.transactionHash;
    },
    'CONTRACT_ERROR',
    'Failed to manage token allowance.',
    'ALLOWANCE_MANAGEMENT'
  );
}

/**
 * Internal helper to get current allowance
 */
async function getCurrentAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string
): Promise<TandaPayResult<string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const provider = await getProvider();
      const tokenContract = new ethers.Contract(tokenAddress, Erc20Abi, provider);

      const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
      return allowance.toString();
    },
    'CONTRACT_ERROR',
    'Failed to get current token allowance.',
    'ALLOWANCE_FETCH'
  );
}

/**
 * Internal helper to parse PaymentTokenTransferFailed or ERC20InsufficientAllowance errors
 */
function parsePaymentTokenTransferFailedError(error: mixed): ?string {
  try {
    // Use the TandaPay ABI directly to parse errors
    const tandaPayInterface = new ethers.utils.Interface(TandaPayInfo.abi);
    
    // Also create interface for standard ERC20 errors
    const erc20ErrorInterface = new ethers.utils.Interface([
      'error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)'
    ]);

    let errorData = null;
    let errorMessage = '';

    if (error != null && typeof error === 'object') {
      // Extract error data and message from various possible properties
      // $FlowFixMe[prop-missing] - error might have data property
      errorData = error.data;
      if (errorData == null && error.error != null && typeof error.error === 'object') {
        // $FlowFixMe[prop-missing] - error.error might have data property
        errorData = error.error.data;
      }

      // $FlowFixMe[prop-missing] - error might have message/reason properties
      const message = error.message;
      const reason = error.reason;
      errorMessage = (message != null ? message : '') || (reason != null ? reason : '') || String(error);
    } else {
      errorMessage = String(error);
    }

    // Method 1: Try to parse error data directly (most reliable)
    if (errorData != null && typeof errorData === 'string' && errorData.startsWith('0x')) {
      // Try TandaPay PaymentTokenTransferFailed error first
      try {
        const decoded = tandaPayInterface.parseError(errorData);
        if (decoded && decoded.name === 'PaymentTokenTransferFailed' && decoded.args && decoded.args[0]) {
          return decoded.args[0].toString();
        }
      } catch (decodeError) {
        // Continue to ERC20 error parsing
      }

      // Try ERC20InsufficientAllowance error
      try {
        const decoded = erc20ErrorInterface.parseError(errorData);
        if (decoded && decoded.name === 'ERC20InsufficientAllowance' && decoded.args && decoded.args[2]) {
          // The third argument (index 2) is the 'needed' amount
          return decoded.args[2].toString();
        }
      } catch (decodeError) {
        // Continue to next method
      }
    }

    // Method 2: Extract hex data from error message and parse it
    if (typeof errorMessage === 'string') {
      const hexMatches = errorMessage.match(/0x[a-fA-F0-9]{8,}/g);
      if (hexMatches) {
        for (const hexData of hexMatches) {
          // Try TandaPay PaymentTokenTransferFailed error first
          try {
            const decoded = tandaPayInterface.parseError(hexData);
            if (decoded && decoded.name === 'PaymentTokenTransferFailed' && decoded.args && decoded.args[0]) {
              return decoded.args[0].toString();
            }
          } catch (decodeError) {
            // Continue to ERC20 error parsing
          }

          // Try ERC20InsufficientAllowance error
          try {
            const decoded = erc20ErrorInterface.parseError(hexData);
            if (decoded && decoded.name === 'ERC20InsufficientAllowance' && decoded.args && decoded.args[2]) {
              // The third argument (index 2) is the 'needed' amount
              return decoded.args[2].toString();
            }
          } catch (decodeError) {
            // Try next hex string
            continue;
          }
        }
      }
    }

    return null;
  } catch (parseError) {
    return null;
  }
}

/**
 * First simulation: Intentionally create insufficient allowance to extract required amount
 * This temporarily sets allowance to 0, simulates to get the error, then restores allowance
 */
async function simulateToExtractSpendingAmount(
  contractAddress: string,
  methodName: string,
  methodArgs: mixed[] = []
): Promise<TandaPayResult<string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const stateResult = getCurrentStateAndContract();
      if (!stateResult.success) {
        throw stateResult.error;
      }

      // Get payment token address
      const tokenAddressResult = await getPaymentTokenAddress(contractAddress);
      if (!tokenAddressResult.success) {
        throw tokenAddressResult.error;
      }

      const tokenAddress = tokenAddressResult.data;

      // Get user wallet address
      const walletAddressResult = await getWalletAddress();
      if (!walletAddressResult.success) {
        throw walletAddressResult.error;
      }

      const userAddress = walletAddressResult.data;

      // Step 1: Get current allowance to restore later
      const currentAllowanceResult = await getCurrentAllowance(tokenAddress, userAddress, contractAddress);
      if (!currentAllowanceResult.success) {
        throw currentAllowanceResult.error;
      }

      const originalAllowance = currentAllowanceResult.data;

      try {
        // Step 2: Temporarily set allowance to 0 to force PaymentTokenTransferFailed error
        const zeroAllowanceResult = await manageAllowance(tokenAddress, contractAddress, userAddress, '0');
        if (!zeroAllowanceResult.success) {
          throw zeroAllowanceResult.error;
        }

        // Step 3: Simulate the contract method (should fail with PaymentTokenTransferFailed)
        const provider = await getProvider();
        const walletResult = await getWalletInstance(provider);

        if (!walletResult.success) {
          throw walletResult.error;
        }

        const signer = walletResult.data;
        const tandaPayContract = new ethers.Contract(contractAddress, TandaPayInfo.abi, signer);

        let simulationError = null;
        try {
          await tandaPayContract.callStatic[methodName](...methodArgs);
          // If we get here without error, no tokens are needed
          return '0';
        } catch (error) {
          simulationError = error;
        }

        // Step 4: Parse the error to extract the required amount
        if (simulationError) {
          const amount = parsePaymentTokenTransferFailedError(simulationError);
          if (amount) {
            return amount;
          } else {
            // The error wasn't PaymentTokenTransferFailed - this means the method call failed for other reasons
            throw TandaPayErrorHandler.createError(
              'CONTRACT_ERROR',
              `Method call failed with unexpected error: ${String(simulationError)}`,
              { userMessage: `Unable to determine required token amount for ${methodName}. The contract may not be in the correct state or you may not have permission to call this method.` }
            );
          }
        }

        // This shouldn't be reached
        return '0';
      } finally {
        // Step 5: Always restore original allowance
        try {
          const restoreResult = await manageAllowance(tokenAddress, contractAddress, userAddress, originalAllowance);
          if (!restoreResult.success) {
            // Note: We don't throw here to avoid masking the main operation result
            // But this is a serious issue - the user's allowance couldn't be restored
          }
        } catch (restoreError) {
          // Note: We don't throw here to avoid masking the main operation result
          // But this is a serious issue - the user's allowance couldn't be restored
        }
      }
    },
    'CONTRACT_ERROR',
    `Failed to determine ERC20 spending amount for ${methodName}.`,
    'ERC20_SPENDING_ESTIMATION'
  );
}

/**
 * Second simulation: Normal gas estimation after ERC20 approval
 * This should be used for actual gas estimation in the transaction workflow
 */
export async function simulateTransactionForGasEstimation(
  contractAddress: string,
  methodName: string,
  methodArgs: mixed[] = []
): Promise<TandaPayResult<mixed>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const provider = await getProvider();
      const walletResult = await getWalletInstance(provider);

      if (!walletResult.success) {
        throw walletResult.error;
      }

      const signer = walletResult.data;
      const tandaPayContract = new ethers.Contract(contractAddress, TandaPayInfo.abi, signer);

      try {
        // Use callStatic to simulate the transaction
        // At this point, ERC20 approval should be sufficient, so this should succeed
        const result = await tandaPayContract.callStatic[methodName](...methodArgs);
        return result;
      } catch (error) {
        // If we get PaymentTokenTransferFailed here, it means the approval wasn't sufficient
        const amount = parsePaymentTokenTransferFailedError(error);
        if (amount) {
          throw TandaPayErrorHandler.createError(
            'CONTRACT_ERROR',
            `Insufficient ERC20 allowance for transaction. Required: ${amount}`,
            { userMessage: 'The ERC20 approval amount was insufficient. Please approve a higher amount and try again.' }
          );
        } else {
          // Some other error occurred during simulation
          throw TandaPayErrorHandler.createError(
            'CONTRACT_ERROR',
            `Transaction simulation failed: ${String(error)}`,
            { userMessage: 'Transaction simulation failed. The contract may not be in the correct state or you may not have permission to call this method.' }
          );
        }
      }
    },
    'CONTRACT_ERROR',
    `Failed to simulate transaction for gas estimation: ${methodName}`,
    'TRANSACTION_SIMULATION'
  );
}

/**
 * Try to get the ERC20 spending amount for payPremium method
 */
export const tryGetPayPremiumErc20Spend = async (): Promise<TandaPayResult<BigNumber>> => TandaPayErrorHandler.withErrorHandling(
  async () => {
    const stateResult = getCurrentStateAndContract();
    if (!stateResult.success) {
      throw stateResult.error;
    }

    const { contractAddress } = stateResult.data;

    // PayPremium method takes a boolean parameter (_useFromATW)
    // We want to simulate with false to force token transfer
    const amountResult = await simulateToExtractSpendingAmount(contractAddress, 'payPremium', [false]);

    if (!amountResult.success) {
      throw amountResult.error;
    }

    // Convert string to BigNumber
    return ethers.BigNumber.from(amountResult.data);
  },
  'CONTRACT_ERROR',
  'Failed to determine required token amount for premium payment.',
  'PAY_PREMIUM_SPENDING_QUERY'
);

/**
 * Try to get the ERC20 spending amount for joinCommunity method
 */
export const tryGetJoinCommunityErc20Spend = async (): Promise<TandaPayResult<BigNumber>> => TandaPayErrorHandler.withErrorHandling(
  async () => {
    const stateResult = getCurrentStateAndContract();
    if (!stateResult.success) {
      throw stateResult.error;
    }

    const { contractAddress } = stateResult.data;

    // JoinCommunity method takes no parameters
    const amountResult = await simulateToExtractSpendingAmount(contractAddress, 'joinCommunity', []);

    if (!amountResult.success) {
      throw amountResult.error;
    }

    // Convert string to BigNumber
    return ethers.BigNumber.from(amountResult.data);
  },
  'CONTRACT_ERROR',
  'Failed to determine required token amount for joining community.',
  'JOIN_COMMUNITY_SPENDING_QUERY'
);

/**
 * Try to get the ERC20 spending amount for injectFunds method
 */
export const tryGetInjectFundsErc20Spend = async (): Promise<TandaPayResult<BigNumber>> => TandaPayErrorHandler.withErrorHandling(
  async () => {
    const stateResult = getCurrentStateAndContract();
    if (!stateResult.success) {
      throw stateResult.error;
    }

    const { contractAddress } = stateResult.data;

    // InjectFunds method takes no parameters
    const amountResult = await simulateToExtractSpendingAmount(contractAddress, 'injectFunds', []);

    if (!amountResult.success) {
      throw amountResult.error;
    }

    // Convert string to BigNumber
    return ethers.BigNumber.from(amountResult.data);
  },
  'CONTRACT_ERROR',
  'Failed to determine required token amount for injecting funds.',
  'INJECT_FUNDS_SPENDING_QUERY'
);

/**
 * Try to get the ERC20 spending amount for divideShortfall method
 */
export const tryGetDivideShortfallErc20Spend = async (): Promise<TandaPayResult<BigNumber>> => TandaPayErrorHandler.withErrorHandling(
  async () => {
    const stateResult = getCurrentStateAndContract();
    if (!stateResult.success) {
      throw stateResult.error;
    }

    const { contractAddress } = stateResult.data;

    // DivideShortfall method takes no parameters
    const amountResult = await simulateToExtractSpendingAmount(contractAddress, 'divideShortfall', []);

    if (!amountResult.success) {
      throw amountResult.error;
    }

    // Convert string to BigNumber
    return ethers.BigNumber.from(amountResult.data);
  },
  'CONTRACT_ERROR',
  'Failed to determine required token amount for dividing shortfall.',
  'DIVIDE_SHORTFALL_SPENDING_QUERY'
);

/**
 * Public function to approve ERC20 tokens for TandaPay contract
 */
export async function approveErc20ForTandaPay(amount: BigNumber): Promise<TandaPayResult<string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const stateResult = getCurrentStateAndContract();
      if (!stateResult.success) {
        throw stateResult.error;
      }

      const { contractAddress } = stateResult.data;

      // Get payment token address
      const tokenAddressResult = await getPaymentTokenAddress(contractAddress);
      if (!tokenAddressResult.success) {
        throw tokenAddressResult.error;
      }

      const tokenAddress = tokenAddressResult.data;

      // Get user wallet address
      const walletAddressResult = await getWalletAddress();
      if (!walletAddressResult.success) {
        throw walletAddressResult.error;
      }

      const userAddress = walletAddressResult.data;

      // Approve the specified amount
      const approvalResult = await manageAllowance(
        tokenAddress,
        contractAddress,
        userAddress,
        // $FlowFixMe[incompatible-use] - BigNumber toString method
        amount.toString()
      );

      if (!approvalResult.success) {
        throw approvalResult.error;
      }

      return approvalResult.data;
    },
    'CONTRACT_ERROR',
    'Failed to approve ERC20 tokens for TandaPay contract.',
    'ERC20_APPROVAL'
  );
}

/**
 * Public function to check current ERC20 allowance for TandaPay contract
 */
export async function checkErc20AllowanceForTandaPay(): Promise<TandaPayResult<BigNumber>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const stateResult = getCurrentStateAndContract();
      if (!stateResult.success) {
        throw stateResult.error;
      }

      const { contractAddress } = stateResult.data;

      // Get payment token address
      const tokenAddressResult = await getPaymentTokenAddress(contractAddress);
      if (!tokenAddressResult.success) {
        throw tokenAddressResult.error;
      }

      const tokenAddress = tokenAddressResult.data;

      // Get user wallet address
      const walletAddressResult = await getWalletAddress();
      if (!walletAddressResult.success) {
        throw walletAddressResult.error;
      }

      const userAddress = walletAddressResult.data;

      // Get current allowance
      const allowanceResult = await getCurrentAllowance(tokenAddress, userAddress, contractAddress);
      if (!allowanceResult.success) {
        throw allowanceResult.error;
      }

      // Convert string to BigNumber
      return ethers.BigNumber.from(allowanceResult.data);
    },
    'CONTRACT_ERROR',
    'Failed to check ERC20 allowance for TandaPay contract.',
    'ERC20_ALLOWANCE_CHECK'
  );
}

/**
 * Enhanced simulation for ERC20-requiring methods that provides better error handling
 * Use this instead of the standard createSimulation for payPremium, joinCommunity, injectFunds, divideShortfall
 */
export function createErc20AwareSimulation(contractMethod: string, paramTransform?: (...args: any[]) => any[]): (contract: any, ...args: any[]) => Promise<{|success: boolean, result: any, gasEstimate: any, error: any, originalError?: any|}> {
  return async (contract: any, ...args: any[]) => {
    try {
      const transformedArgs = paramTransform ? paramTransform(...args) : args;
      
      // Use our enhanced simulation function that provides better ERC20 error handling
      const contractAddress = contract.address;
      const simulationResult = await simulateTransactionForGasEstimation(
        contractAddress,
        contractMethod,
        transformedArgs
      );

      if (simulationResult.success) {
        return {
          success: true,
          result: simulationResult.data,
          gasEstimate: null,
          error: null,
        };
      } else {
        return {
          success: false,
          result: null,
          gasEstimate: null,
          error: simulationResult.error && simulationResult.error.userMessage ? simulationResult.error.userMessage : 'Transaction simulation failed',
          originalError: simulationResult.error,
        };
      }
    } catch (error) {
      // Fallback to standard error handling
      const parsedError = TandaPayErrorHandler.parseEthersError(error);
      
      return {
        success: false,
        result: null,
        gasEstimate: null,
        error: parsedError.userMessage || 'Transaction simulation failed',
        originalError: error,
      };
    }
  };
}
