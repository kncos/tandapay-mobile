/* @flow strict-local */
// Enhanced web3 utilities for TandaPay with ERC20 transfer support

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

import type { Token } from './tokens/tokenTypes';
import { createProvider } from './providers/ProviderManager';

// Redux store import for getting current network
import store from '../boot/store';
import { getTandaPaySelectedNetwork } from './tandaPaySelectors';
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
function getProvider(networkOverride?: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom'): any {
  // Try to get network from Redux state first
  let network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom' = 'sepolia'; // default fallback
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
    return createProvider(network, customConfig);
  } else {
    return createProvider(network);
  }
}

/**
 * Fetches the balance for a given token and address.
 * If token.address is null, fetches ETH balance. Otherwise, fetches ERC20 balance.
 * Returns a string representing the balance (in human-readable units).
 */
export async function fetchBalance(
  token: Token,
  address: string,
  network?: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom'
): Promise<string> {
  const provider = getProvider(network);

  try {
    if (!address || address === '') {
      return '0';
    }

    if (token.address == null) {
      // ETH balance
      const bal = await provider.getBalance(address);
      return ethers.utils.formatEther(bal);
    } else {
      // ERC20 balance
      const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
      const balance = await contract.balanceOf(address);
      return ethers.utils.formatUnits(balance, token.decimals);
    }
  } catch (e) {
    // Error fetching balance
    // Error fetching balance for token, returning 0
    return '0';
  }
}

/**
 * Transfer ETH or ERC20 tokens to another address
 */
export async function transferToken(
  token: Token,
  fromPrivateKey: string,
  toAddress: string,
  amount: string,
  network?: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom'
): Promise<{| success: boolean, txHash?: string, error?: string |}> {
  try {
    const provider = getProvider(network);
    const wallet = new ethers.Wallet(fromPrivateKey, provider);

    if (token.address == null) {
      // ETH transfer
      const tx = await wallet.sendTransaction({
        to: toAddress,
        value: ethers.utils.parseEther(amount),
      });

      return { success: true, txHash: tx.hash };
    } else {
      // ERC20 transfer
      const contract = new ethers.Contract(token.address, ERC20_ABI, wallet);
      const amountInWei = ethers.utils.parseUnits(amount, token.decimals);

      const tx = await contract.transfer(toAddress, amountInWei);

      return { success: true, txHash: tx.hash };
    }
  } catch (error) {
    // Transfer error occurred
    return {
      success: false,
      error: error.message || 'Transfer failed'
    };
  }
}

/**
 * Get token information from contract (useful for validating custom tokens)
 */
export async function getTokenInfo(
  contractAddress: string,
  network?: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom'
): Promise<{|
  success: boolean,
  tokenInfo?: {| symbol: string, name: string, decimals: number |},
  error?: string
|}> {
  try {
    const provider = getProvider(network);
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);

    const [symbol, name, decimals] = await Promise.all([
      contract.symbol(),
      contract.name(),
      contract.decimals(),
    ]);

    return {
      success: true,
      tokenInfo: { symbol, name, decimals },
    };
  } catch (error) {
    // Error fetching token info
    return {
      success: false,
      error: error.message || 'Failed to fetch token information',
    };
  }
}

/**
 * Estimate gas cost for a token transfer
 */
export async function estimateTransferGas(
  token: Token,
  fromAddress: string,
  toAddress: string,
  amount: string,
  network?: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom'
): Promise<{| success: boolean, gasEstimate?: string, gasPrice?: string, error?: string |}> {
  try {
    const provider = getProvider(network);

    if (token.address == null) {
      // ETH transfer
      const gasEstimate = await provider.estimateGas({
        from: fromAddress,
        to: toAddress,
        value: ethers.utils.parseEther(amount),
      });

      const gasPrice = await provider.getGasPrice();

      return {
        success: true,
        gasEstimate: gasEstimate.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
      };
    } else {
      // ERC20 transfer
      const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
      const amountInWei = ethers.utils.parseUnits(amount, token.decimals);

      const gasEstimate = await contract.estimateGas.transfer(toAddress, amountInWei);
      const gasPrice = await provider.getGasPrice();

      return {
        success: true,
        gasEstimate: gasEstimate.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
      };
    }
  } catch (error) {
    // Gas estimation error
    return {
      success: false,
      error: error.message || 'Failed to estimate gas',
    };
  }
}

/**
 * Get current network gas price
 */
export async function getGasPrice(
  network?: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom'
): Promise<string> {
  try {
    const provider = getProvider(network);
    const gasPrice = await provider.getGasPrice();
    return ethers.utils.formatUnits(gasPrice, 'gwei');
  } catch (error) {
    // Error fetching gas price
    return '0';
  }
}
