/* @flow strict-local */
// Enhanced web3 utilities for TandaPay with ERC20 transfer support

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

// $FlowFixMe[untyped-import] - env is a local module without flow types
import { alchemy_sepolia_url } from './env';
import type { Token } from './tokens/tokenTypes';

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
 * Get provider instance (could be enhanced to support multiple networks)
 */
// $FlowFixMe[unclear-type] - ethers provider type is complex
function getProvider(network: 'mainnet' | 'sepolia' = 'sepolia'): any {
  // For now, we only support sepolia testnet
  // In production, you'd want to support mainnet and other networks
  return new ethers.providers.JsonRpcProvider(alchemy_sepolia_url);
}

/**
 * Fetches the balance for a given token and address.
 * If token.address is null, fetches ETH balance. Otherwise, fetches ERC20 balance.
 * Returns a string representing the balance (in human-readable units).
 */
export async function fetchBalance(
  token: Token,
  address: string,
  network: 'mainnet' | 'sepolia' = 'sepolia'
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
  network: 'mainnet' | 'sepolia' = 'sepolia'
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
  network: 'mainnet' | 'sepolia' = 'sepolia'
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
  network: 'mainnet' | 'sepolia' = 'sepolia'
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
  network: 'mainnet' | 'sepolia' = 'sepolia'
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
