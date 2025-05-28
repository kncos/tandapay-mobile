// @flow strict-local
// Centralized web3 logic for TandaPay

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

// $FlowFixMe[untyped-import] - env is a local module without flow types
import { alchemy_sepolia_url } from './env';

/**
 * Fetches the balance for a given token and address.
 * If token.address is null, fetches ETH balance. Otherwise, fetches ERC20 balance.
 * Returns a string representing the balance (in human-readable units).
 */
export async function fetchBalance(
  token: {| symbol: string, address: ?string, name: string |},
  address: string,
): Promise<string> {
  // You can change this provider as needed
  const provider = new ethers.providers.JsonRpcProvider(alchemy_sepolia_url);

  try {
    if (address == null || address === '') {
      return '0';
    }
    if (token.address == null || token.address === '') {
      // ETH balance
      const bal = await provider.getBalance(address);
      return ethers.utils.formatEther(bal);
    } else {
      // ERC20 balance
      const abi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ];
      const contract = new ethers.Contract(token.address, abi, provider);
      const [bal, decimals] = await Promise.all([contract.balanceOf(address), contract.decimals()]);
      return ethers.utils.formatUnits(bal, decimals);
    }
  } catch (e) {
    // Error fetching balance
    return '0';
  }
}
