/* @flow strict-local */
// Enhanced web3 utilities for TandaPay with ERC20 transfer support

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

import type { Token } from './tokens/tokenTypes';
import type { TandaPayResult, GasEstimateData, TokenInfo } from './errors/types';
import type { NetworkIdentifier } from './definitions/types';
import TandaPayErrorHandler from './errors/ErrorHandler';
import { createProvider } from './providers/ProviderManager';

// Redux store import for getting current network
import store from '../boot/store';
import { getTandaPaySelectedNetwork } from './redux/selectors';
import { tryGetActiveAccountState } from '../account/accountsSelectors';

/**
 * Standard ERC20 ABI for balance, transfer, and other common functions
 */
const ERC20_ABI = [
  // Read-only functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function totalSupply() view returns (uint256)',

  // State-changing functions
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

/**
 * Get provider instance using Redux state for network selection
 * Falls back to parameter or default if Redux state is unavailable
 */
// $FlowFixMe[unclear-type] - ethers provider type is complex
export async function getProvider(networkOverride?: NetworkIdentifier): Promise<any> {
  // Try to get network from Redux state first
  let network: NetworkIdentifier = 'sepolia'; // default fallback
  let customConfig = null;

  try {
    if (store) {
      const globalState = store.getState();
      const perAccountState = tryGetActiveAccountState(globalState);
      if (perAccountState) {
        const selectedNetwork = getTandaPaySelectedNetwork(perAccountState);
        const customRpcConfig = perAccountState.tandaPay.settings.customRpcConfig;

        if (selectedNetwork) {
          network = selectedNetwork;
          customConfig = customRpcConfig;
        }
      }
    }
  } catch (error) {
    // Fallback to default if Redux state is not accessible
    // Using default network due to Redux state access error
  }

  // Allow override parameter to take precedence
  if (networkOverride) {
    network = networkOverride;
    // If overriding with custom, we need the custom config from Redux
    if (networkOverride === 'custom' && !customConfig) {
      throw new Error('Custom network override requires customRpcConfig in Redux state');
    }
  }

  // Handle custom network requirement
  if (network === 'custom') {
    if (!customConfig) {
      throw new Error('Custom network requires customRpcConfig in Redux state');
    }
    const providerResult = await createProvider(network, customConfig);
    if (!providerResult.success) {
      throw providerResult.error;
    }
    return providerResult.data;
  } else {
    const providerResult = await createProvider(network);
    if (!providerResult.success) {
      throw providerResult.error;
    }
    return providerResult.data;
  }
}

/**
 * Fetches the balance for a given token and address with comprehensive error handling.
 * If token.address is null, fetches ETH balance. Otherwise, fetches ERC20 balance.
 * Returns a TandaPayResult with either the balance string or structured error information.
 */
export async function fetchBalance(
  token: Token,
  address: string,
  network?: NetworkIdentifier,
): Promise<TandaPayResult<string>> {
  return TandaPayErrorHandler.withEthersErrorHandling(
    async () => {
      // Input validation
      if (!ethers.utils.isAddress(address)) {
        throw TandaPayErrorHandler.createValidationError(
          'Invalid address format',
          'Please provide a valid Ethereum address',
        );
      }

      if (!token || !token.symbol) {
        throw TandaPayErrorHandler.createValidationError(
          'Invalid token',
          'Token information is missing',
        );
      }

      const provider = await getProvider(network);

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            TandaPayErrorHandler.createError('TIMEOUT_ERROR', 'Balance fetch timed out', {
              userMessage: 'Network request timed out. Please try again.',
              retryable: true,
            }),
          );
        }, 10000); // 10 second timeout
      });

      let balancePromise: Promise<string>;

      if (token.address == null) {
        // ETH balance
        balancePromise = provider.getBalance(address).then(bal => ethers.utils.formatEther(bal));
      } else {
        // ERC20 balance
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
          balancePromise = contract
            .balanceOf(address)
            .then(balance => ethers.utils.formatUnits(balance, token.decimals));
        } catch (contractError) {
          throw TandaPayErrorHandler.createContractError('Failed to create token contract', {
            tokenAddress: token.address,
            contractError,
          });
        }
      }

      // Race between balance fetch and timeout
      const balance = await Promise.race([balancePromise, timeoutPromise]);

      // Validate the result
      if (typeof balance !== 'string' || Number.isNaN(parseFloat(balance))) {
        throw TandaPayErrorHandler.createError('PARSING_ERROR', 'Invalid balance format received', {
          userMessage: 'Received invalid balance data. Please try again.',
          details: { balance, token: token.symbol },
        });
      }

      return balance;
    },
    'Unable to fetch balance. Please check your network connection or token configuration and try again.',
    'BALANCE_FETCH_FAILED',
  );
}

/**
 * Transfer ETH or ERC20 tokens to another address
 * @returns TandaPayResult<string> - Transaction hash on success
 */
export async function transferToken(
  token: Token,
  fromPrivateKey: string,
  toAddress: string,
  amount: string,
  network?: NetworkIdentifier,
): Promise<TandaPayResult<string>> {
  return TandaPayErrorHandler.withEthersErrorHandling(
    async () => {
      const provider = await getProvider(network);

      // Validate input parameters
      if (!token) {
        throw TandaPayErrorHandler.createError('VALIDATION_ERROR', 'Token parameter is required', {
          userMessage: 'Invalid token selection. Please select a valid token.',
        });
      }

      if (!fromPrivateKey || fromPrivateKey.trim() === '') {
        throw TandaPayErrorHandler.createError(
          'WALLET_ERROR',
          'Private key is required for transaction signing',
          { userMessage: 'Unable to access wallet. Please check your wallet setup.' },
        );
      }

      if (!toAddress || toAddress.trim() === '') {
        throw TandaPayErrorHandler.createError(
          'VALIDATION_ERROR',
          'Recipient address is required',
          { userMessage: 'Please enter a valid recipient address.' },
        );
      }

      if (!amount || amount.trim() === '' || parseFloat(amount) <= 0) {
        throw TandaPayErrorHandler.createError(
          'VALIDATION_ERROR',
          'Amount must be greater than zero',
          { userMessage: 'Please enter a valid amount to transfer.' },
        );
      }

      // Create wallet instance with timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            TandaPayErrorHandler.createError('TIMEOUT_ERROR', 'Transaction timed out', {
              userMessage: 'Transaction took too long to complete. Please try again.',
              retryable: true,
            }),
          );
        }, 60000); // 60 second timeout for transactions
      });

      let wallet;
      try {
        wallet = new ethers.Wallet(fromPrivateKey, provider);
      } catch (walletError) {
        throw TandaPayErrorHandler.createError('WALLET_ERROR', 'Failed to create wallet instance', {
          userMessage: 'Unable to access wallet. Please check your wallet configuration.',
          details: { walletError: walletError.message },
        });
      }

      // Validate and checksum addresses
      let checksummedToAddress;
      try {
        checksummedToAddress = ethers.utils.getAddress(toAddress.trim());
      } catch (addressError) {
        throw TandaPayErrorHandler.createError(
          'VALIDATION_ERROR',
          'Invalid recipient address format',
          {
            userMessage: 'The recipient address is not valid. Please check and try again.',
            details: { toAddress, addressError: addressError.message },
          },
        );
      }

      let transactionPromise: Promise<mixed>;

      if (token.address == null) {
        // ETH transfer
        try {
          const value = ethers.utils.parseEther(amount);
          transactionPromise = wallet.sendTransaction({
            to: checksummedToAddress,
            value,
          });
        } catch (parseError) {
          throw TandaPayErrorHandler.createError('VALIDATION_ERROR', 'Invalid ETH amount format', {
            userMessage: 'The amount entered is not valid. Please check and try again.',
            details: { amount, parseError: parseError.message },
          });
        }
      } else {
        // ERC20 transfer
        let checksummedTokenAddress;
        try {
          checksummedTokenAddress = ethers.utils.getAddress(token.address);
        } catch (tokenAddressError) {
          throw TandaPayErrorHandler.createError(
            'VALIDATION_ERROR',
            'Invalid token contract address',
            {
              userMessage: 'The selected token has an invalid contract address.',
              details: {
                tokenAddress: token.address,
                tokenAddressError: tokenAddressError.message,
              },
            },
          );
        }

        try {
          const contract = new ethers.Contract(checksummedTokenAddress, ERC20_ABI, wallet);
          const amountInWei = ethers.utils.parseUnits(amount, token.decimals);
          transactionPromise = contract.transfer(checksummedToAddress, amountInWei);
        } catch (contractError) {
          throw TandaPayErrorHandler.createContractError(
            'Failed to create token transfer transaction',
            {
              tokenAddress: checksummedTokenAddress,
              amount,
              decimals: token.decimals,
              contractError: contractError.message,
            },
          );
        }
      }

      // Race between transaction and timeout
      const tx = await Promise.race([transactionPromise, timeoutPromise]);

      // Validate transaction result
      if (!tx || !tx.hash || typeof tx.hash !== 'string') {
        throw TandaPayErrorHandler.createError(
          'UNKNOWN_ERROR',
          'Transaction completed but hash is invalid',
          {
            userMessage: 'Transaction may have failed. Please check your wallet and try again.',
            details: { tx },
          },
        );
      }

      return tx.hash;
    },
    'Transaction failed. Please check your network connection and try again.',
    'TRANSFER_FAILED',
  );
}

/**
 * Get token information from contract (useful for validating custom tokens)
 * @returns TandaPayResult<TokenInfo> - Token information on success
 */
export async function getTokenInfo(
  contractAddress: string,
  network?: NetworkIdentifier,
): Promise<TandaPayResult<TokenInfo>> {
  return TandaPayErrorHandler.withEthersErrorHandling(
    async () => {
      // Input validation
      if (!contractAddress || contractAddress.trim() === '') {
        throw TandaPayErrorHandler.createValidationError(
          'Contract address is required',
          'Please provide a valid token contract address.',
        );
      }

      let checksummedAddress;
      try {
        checksummedAddress = ethers.utils.getAddress(contractAddress.trim());
      } catch (addressError) {
        throw TandaPayErrorHandler.createValidationError(
          'Invalid contract address format',
          'The contract address is not valid. Please check and try again.',
        );
      }

      const provider = await getProvider(network);

      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            TandaPayErrorHandler.createError('TIMEOUT_ERROR', 'Token info fetch timed out', {
              userMessage: 'Request took too long. Please try again.',
              retryable: true,
            }),
          );
        }, 10000); // 10 second timeout
      });

      let tokenInfoPromise: Promise<mixed>;
      try {
        const contract = new ethers.Contract(checksummedAddress, ERC20_ABI, provider);
        tokenInfoPromise = Promise.all([contract.symbol(), contract.name(), contract.decimals()]);
      } catch (contractError) {
        throw TandaPayErrorHandler.createContractError('Failed to create token contract instance', {
          contractAddress: checksummedAddress,
          contractError: contractError.message,
        });
      }

      // Race between token info fetch and timeout
      const [symbol, name, decimals] = await Promise.race([tokenInfoPromise, timeoutPromise]);

      // Validate results
      if (!symbol || !name || decimals == null) {
        throw TandaPayErrorHandler.createError(
          'PARSING_ERROR',
          'Token contract returned invalid information',
          {
            userMessage: 'Unable to read token information. This may not be a valid ERC20 token.',
            details: { symbol, name, decimals },
          },
        );
      }

      return {
        symbol: String(symbol),
        name: String(name),
        decimals: Number(decimals),
      };
    },
    'Unable to fetch token information. Please check your network connection and try again.',
    'TOKEN_INFO_FAILED',
  );
}

/**
 * Estimate gas cost for a token transfer
 * @returns TandaPayResult<GasEstimateData> - Gas estimation data on success
 */
export async function estimateTransferGas(
  token: Token,
  fromAddress: string,
  toAddress: string,
  amount: string,
  network?: NetworkIdentifier,
): Promise<TandaPayResult<GasEstimateData>> {
  return TandaPayErrorHandler.withEthersErrorHandling(
    async () => {
      // Input validation
      if (!token) {
        throw TandaPayErrorHandler.createValidationError(
          'Token parameter is required',
          'Invalid token selection. Please select a valid token.',
        );
      }

      if (!fromAddress || fromAddress.trim() === '') {
        throw TandaPayErrorHandler.createValidationError(
          'From address is required',
          'Please provide a valid sender address.',
        );
      }

      if (!toAddress || toAddress.trim() === '') {
        throw TandaPayErrorHandler.createValidationError(
          'To address is required',
          'Please enter a valid recipient address.',
        );
      }

      if (!amount || amount.trim() === '' || parseFloat(amount) <= 0) {
        throw TandaPayErrorHandler.createValidationError(
          'Amount must be greater than zero',
          'Please enter a valid amount to transfer.',
        );
      }

      const provider = await getProvider(network);

      // Add timeout protection for gas estimation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            TandaPayErrorHandler.createError('TIMEOUT_ERROR', 'Gas estimation timed out', {
              userMessage: 'Gas estimation took too long. Please try again.',
              retryable: true,
            }),
          );
        }, 15000); // 15 second timeout
      });

      // Validate and checksum addresses
      let checksummedFromAddress;
      let checksummedToAddress;
      try {
        checksummedFromAddress = ethers.utils.getAddress(fromAddress.trim());
        checksummedToAddress = ethers.utils.getAddress(toAddress.trim());
      } catch (addressError) {
        throw TandaPayErrorHandler.createValidationError(
          'Invalid address format',
          'One or more addresses are not valid. Please check and try again.',
        );
      }

      let gasEstimationPromise: Promise<mixed>;

      if (token.address == null) {
        // ETH transfer
        try {
          const value = ethers.utils.parseEther(amount);
          gasEstimationPromise = Promise.all([
            provider.estimateGas({
              from: checksummedFromAddress,
              to: checksummedToAddress,
              value,
            }),
            provider.getGasPrice(),
          ]);
        } catch (parseError) {
          throw TandaPayErrorHandler.createValidationError(
            'Invalid ETH amount format',
            'The amount entered is not valid. Please check and try again.',
          );
        }
      } else {
        // ERC20 transfer
        let checksummedTokenAddress;
        try {
          checksummedTokenAddress = ethers.utils.getAddress(token.address);
        } catch (tokenAddressError) {
          throw TandaPayErrorHandler.createValidationError(
            'Invalid token contract address',
            'The selected token has an invalid contract address.',
          );
        }

        try {
          const contract = new ethers.Contract(checksummedTokenAddress, ERC20_ABI, provider);
          const amountInWei = ethers.utils.parseUnits(amount, token.decimals);

          gasEstimationPromise = Promise.all([
            contract.estimateGas.transfer(checksummedToAddress, amountInWei, {
              from: checksummedFromAddress,
            }),
            provider.getGasPrice(),
          ]);
        } catch (contractError) {
          throw TandaPayErrorHandler.createContractError(
            'Failed to estimate gas for token transfer',
            {
              tokenAddress: checksummedTokenAddress,
              amount,
              decimals: token.decimals,
              contractError: contractError.message,
            },
          );
        }
      }

      // Race between gas estimation and timeout
      const [gasEstimate, gasPrice] = await Promise.race([gasEstimationPromise, timeoutPromise]);

      // Validate results
      if (!gasEstimate || !gasPrice) {
        throw TandaPayErrorHandler.createError(
          'UNKNOWN_ERROR',
          'Gas estimation returned invalid results',
          { userMessage: 'Unable to estimate transaction cost. Please try again.' },
        );
      }

      // Calculate estimated cost
      const gasLimitValue = gasEstimate.toString();
      const gasPriceGwei = ethers.utils.formatUnits(gasPrice, 'gwei');
      const estimatedCost = ((parseFloat(gasLimitValue) * parseFloat(gasPriceGwei)) / 1e9).toFixed(
        8,
      );

      return {
        gasLimit: gasLimitValue,
        gasPrice: gasPriceGwei,
        estimatedCost,
      };
    },
    // No fallback user message - let ethers error parsing handle it
    undefined,
    'GAS_ESTIMATION_FAILED',
  );
}

/**
 * Comprehensive gas estimation result type
 */
export type GasEstimationResult = {
  gasLimit: string,
  maxFeePerGas: string, // in gwei
  maxPriorityFeePerGas: string, // in gwei
  baseFeePerGas: string | null, // in gwei, null if not available
  estimatedTotalCostETH: string, // maximum possible cost in ETH
  isEIP1559: boolean, // whether EIP-1559 is supported
  legacyGasPrice?: string, // in gwei, only for legacy networks
};

/**
 * Estimates gas for any ethers.js transaction with proper EIP-1559 support.
 * This function provides accurate gas estimates that account for the actual costs
 * your transaction will incur, not just the current base fee.
 *
 * @param wallet - The ethers wallet instance (must have provider)
 * @param tx - The transaction request object
 * @returns TandaPayResult<GasEstimationResult> - Comprehensive gas estimation data
 */
// $FlowFixMe[unclear-type] - ethers.js types are complex
export async function estimateGasForTransaction(
  // $FlowFixMe[unclear-type] - ethers.Wallet type is complex
  wallet: any,
  // $FlowFixMe[unclear-type] - ethers.providers.TransactionRequest type is complex
  tx: any,
): Promise<TandaPayResult<GasEstimationResult>> {
  return TandaPayErrorHandler.withEthersErrorHandling(
    async () => {
      const provider = wallet.provider;
      if (!provider) {
        throw TandaPayErrorHandler.createError('WALLET_ERROR', 'Wallet provider is not set', {
          userMessage: 'Unable to access network. Please check your wallet configuration.',
        });
      }

      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            TandaPayErrorHandler.createError('TIMEOUT_ERROR', 'Gas estimation timed out', {
              userMessage: 'Gas estimation took too long. Please try again.',
              retryable: true,
            }),
          );
        }, 15000); // 15 second timeout
      });

      // Get comprehensive fee data
      const feeDataPromise = provider.getFeeData();
      const feeData = await Promise.race([feeDataPromise, timeoutPromise]);

      let maxFeePerGas;
      let maxPriorityFeePerGas;
      let baseFeePerGas = null;
      let isEIP1559 = false;
      let legacyGasPrice;

      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        // EIP-1559 supported network
        isEIP1559 = true;
        maxFeePerGas = feeData.maxFeePerGas;
        maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        // In EIP-1559, gasPrice often represents the baseFeePerGas
        baseFeePerGas = feeData.gasPrice;
      } else {
        // Legacy network - use gasPrice with a reasonable buffer
        isEIP1559 = false;
        const gasPrice = feeData.gasPrice || (await provider.getGasPrice());
        legacyGasPrice = gasPrice;
        // For legacy networks, add a 20% buffer to account for network fluctuations
        maxFeePerGas = gasPrice.mul(120).div(100);
        maxPriorityFeePerGas = ethers.BigNumber.from(0); // No priority fee for legacy
      }

      // Prepare transaction for gas estimation
      const txForEstimation = { ...tx };

      if (isEIP1559) {
        txForEstimation.type = 2;
        txForEstimation.maxFeePerGas = maxFeePerGas;
        txForEstimation.maxPriorityFeePerGas = maxPriorityFeePerGas;
        // Remove conflicting legacy gasPrice if using EIP-1559
        if (tx.gasPrice) {
          delete txForEstimation.gasPrice;
        }
      }

      // Estimate gas limit
      const gasLimitPromise = wallet.estimateGas(txForEstimation);
      const gasLimit = await Promise.race([gasLimitPromise, timeoutPromise]);

      // Calculate maximum possible cost (what gets reserved from balance)
      const estimatedTotalCost = maxFeePerGas.mul(gasLimit);

      // Format results for easy consumption
      const result: GasEstimationResult = {
        gasLimit: gasLimit.toString(),
        maxFeePerGas: ethers.utils.formatUnits(maxFeePerGas, 'gwei'),
        maxPriorityFeePerGas: ethers.utils.formatUnits(maxPriorityFeePerGas, 'gwei'),
        baseFeePerGas: baseFeePerGas ? ethers.utils.formatUnits(baseFeePerGas, 'gwei') : null,
        estimatedTotalCostETH: ethers.utils.formatEther(estimatedTotalCost),
        isEIP1559,
        ...(legacyGasPrice && {
          legacyGasPrice: ethers.utils.formatUnits(legacyGasPrice, 'gwei'),
        }),
      };

      return result;
    },
    'Unable to estimate gas costs. Please check your network connection and try again.',
    'GAS_ESTIMATION_FAILED',
  );
}

/**
 * Helper function to estimate gas for ETH transfers
 */
export async function estimateETHTransferGas(
  // $FlowFixMe[unclear-type] - ethers.Wallet type is complex
  wallet: any,
  toAddress: string,
  amount: string,
): Promise<TandaPayResult<GasEstimationResult>> {
  try {
    const tx = {
      to: ethers.utils.getAddress(toAddress.trim()),
      value: ethers.utils.parseEther(amount),
    };
    return await estimateGasForTransaction(wallet, tx);
  } catch (error) {
    return {
      success: false,
      error: TandaPayErrorHandler.createValidationError(
        'Invalid ETH transfer parameters',
        'Please check the recipient address and amount.',
      ),
    };
  }
}

/**
 * Helper function to estimate gas for ERC20 token transfers
 */
export async function estimateERC20TransferGas(
  // $FlowFixMe[unclear-type] - ethers.Wallet type is complex
  wallet: any,
  tokenAddress: string,
  toAddress: string,
  amount: string,
  decimals: number,
): Promise<TandaPayResult<GasEstimationResult>> {
  try {
    const erc20Interface = new ethers.utils.Interface(ERC20_ABI);
    const data = erc20Interface.encodeFunctionData('transfer', [
      ethers.utils.getAddress(toAddress.trim()),
      ethers.utils.parseUnits(amount, decimals),
    ]);

    const tx = {
      to: ethers.utils.getAddress(tokenAddress.trim()),
      data,
      value: 0, // ERC20 transfers don't send ETH
    };

    return await estimateGasForTransaction(wallet, tx);
  } catch (error) {
    return {
      success: false,
      error: TandaPayErrorHandler.createValidationError(
        'Invalid ERC20 transfer parameters',
        'Please check the token address, recipient address, and amount.',
      ),
    };
  }
}

/**
 * Get current network gas price
 */
export async function getGasPrice(network?: NetworkIdentifier): Promise<string> {
  try {
    const provider = await getProvider(network);
    const gasPrice = await provider.getGasPrice();
    return ethers.utils.formatUnits(gasPrice, 'gwei');
  } catch (error) {
    // Error fetching gas price
    return '0';
  }
}

/**
 * Estimate gas for TandaPay contract transactions using our comprehensive EIP-1559-aware system
 * This provides accurate gas estimates for any contract method call
 */
export async function estimateContractTransactionGas(
  contract: mixed,
  methodName: string,
  network?: NetworkIdentifier,
  args?: mixed[],
): Promise<TandaPayResult<GasEstimationResult>> {
  return TandaPayErrorHandler.withEthersErrorHandling(
    async () => {
      const callArgs = args || [];

      if (contract == null) {
        throw TandaPayErrorHandler.createError('CONTRACT_ERROR', 'No contract instance provided', {
          userMessage: 'Contract not available. Please check your network connection.',
        });
      }

      // $FlowFixMe[incompatible-use] - contract is validated above
      const provider = contract.provider;
      if (!provider) {
        throw TandaPayErrorHandler.createError('WALLET_ERROR', 'Contract provider is not set', {
          userMessage: 'Unable to access network. Please check your connection.',
        });
      }

      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            TandaPayErrorHandler.createError('TIMEOUT_ERROR', 'Gas estimation timed out', {
              userMessage: 'Gas estimation took too long. Please try again.',
              retryable: true,
            }),
          );
        }, 15000); // 15 second timeout
      });

      // Get comprehensive fee data
      const feeDataPromise = provider.getFeeData();
      const feeData = await Promise.race([feeDataPromise, timeoutPromise]);

      let maxFeePerGas;
      let maxPriorityFeePerGas;
      let baseFeePerGas = null;
      let isEIP1559 = false;

      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        // EIP-1559 supported network
        isEIP1559 = true;
        maxFeePerGas = feeData.maxFeePerGas;
        maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        // In EIP-1559, gasPrice often represents the baseFeePerGas
        baseFeePerGas = feeData.gasPrice;
      } else {
        // Legacy network - use gasPrice with a reasonable buffer
        isEIP1559 = false;
        const gasPrice = feeData.gasPrice || (await provider.getGasPrice());
        // Add 20% buffer for legacy networks to account for price volatility
        maxFeePerGas = gasPrice.mul(120).div(100);
        maxPriorityFeePerGas = ethers.BigNumber.from(0); // No priority fee for legacy
      }

      // Estimate gas limit for the contract method
      // $FlowFixMe[incompatible-use] - contract is validated above
      const gasLimitPromise = contract.estimateGas[methodName](...callArgs);
      const gasLimit = await Promise.race([gasLimitPromise, timeoutPromise]);

      // Calculate maximum possible cost (what gets reserved from balance)
      const estimatedTotalCost = maxFeePerGas.mul(gasLimit);

      // Format results for easy consumption
      const result: GasEstimationResult = {
        gasLimit: gasLimit.toString(),
        maxFeePerGas: ethers.utils.formatUnits(maxFeePerGas, 'gwei'),
        maxPriorityFeePerGas: ethers.utils.formatUnits(maxPriorityFeePerGas, 'gwei'),
        estimatedTotalCostETH: ethers.utils.formatEther(estimatedTotalCost),
        isEIP1559,
        baseFeePerGas: baseFeePerGas ? ethers.utils.formatUnits(baseFeePerGas, 'gwei') : null,
      };

      return result;
    },
    'CONTRACT_ERROR',
  );
}
