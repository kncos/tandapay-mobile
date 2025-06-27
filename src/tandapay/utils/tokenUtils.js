/* @flow strict-local */
// $FlowIgnore[untyped-import]
import { ethers } from 'ethers';
import { getChainByNetwork } from '../definitions';
import type { NetworkIdentifier } from '../definitions/types';

// Type for token information that we'll display
export type TokenDisplayInfo = {|
  +symbol: string,
  +name: string,
  +address: string,
  +isKnown: boolean,
|};

/**
 * Safely get a string property from an object
 */
function getStringProperty(obj: mixed, property: string): ?string {
  if (obj != null && typeof obj === 'object' && !Array.isArray(obj)) {
    // Use computed property access to safely get the value
    const value = obj[property];
    if (typeof value === 'string') {
      return value;
    }
  }
  return null;
}

/**
 * Find a token by address across default tokens (from chain definitions) and custom tokens (from Redux)
 * @param tokenAddress The token address to search for
 * @param network The current network
 * @param defaultTokens Default tokens from Redux (though we'll primarily use chain definitions)
 * @param customTokens Custom tokens from Redux
 * @returns TokenDisplayInfo if found, null if not found
 */
export function findTokenByAddress(
  tokenAddress: string,
  network: NetworkIdentifier,
  defaultTokens: $ReadOnlyArray<mixed>,
  customTokens: $ReadOnlyArray<mixed>
): ?TokenDisplayInfo {
  if (!tokenAddress || !ethers.utils.isAddress(tokenAddress)) {
    return null;
  }

  // Normalize the address to checksum format for comparison
  const checksumAddress = ethers.utils.getAddress(tokenAddress);

  // First, check tokens from the chain definitions (these are the "real" default tokens)
  // Only check if the network is a supported network (not 'custom')
  if (network !== 'custom') {
    try {
      const chainConfig = getChainByNetwork(network);
      if (chainConfig.tokens) {
        // Iterate through all tokens in the chain definition
        for (const [, tokenConfig] of Object.entries(chainConfig.tokens)) {
          const address = getStringProperty(tokenConfig, 'address');
          const symbol = getStringProperty(tokenConfig, 'symbol');
          const name = getStringProperty(tokenConfig, 'name');

          if (address != null && symbol != null && name != null) {
            try {
              const configAddress = ethers.utils.getAddress(address);
              if (configAddress === checksumAddress) {
                return {
                  symbol,
                  name,
                  address: checksumAddress,
                  isKnown: true,
                };
              }
            } catch (addressError) {
              // Skip invalid addresses
              continue;
            }
          }
        }
      }
    } catch (error) {
      // If we can't get the chain config, continue with other sources
    }
  }

  // Next, check custom tokens from Redux
  for (const token of customTokens) {
    const address = getStringProperty(token, 'address');
    const symbol = getStringProperty(token, 'symbol');
    const name = getStringProperty(token, 'name');

    if (address != null && symbol != null && name != null) {
      try {
        const customAddress = ethers.utils.getAddress(address);
        if (customAddress === checksumAddress) {
          return {
            symbol,
            name,
            address: checksumAddress,
            isKnown: true,
          };
        }
      } catch (addressError) {
        // Skip invalid addresses in custom tokens
        continue;
      }
    }
  }

  // If not found in any known tokens, return unknown token info
  return {
    symbol: 'UNKNOWN',
    name: 'Unknown Token',
    address: checksumAddress,
    isKnown: false,
  };
}

/**
 * Get display text for a payment token
 * @param tokenInfo The token display info
 * @returns A user-friendly display string
 */
export function getTokenDisplayText(tokenInfo: ?TokenDisplayInfo): string {
  if (!tokenInfo) {
    return 'Unknown token';
  }

  if (tokenInfo.isKnown) {
    return tokenInfo.symbol;
  }

  return 'Unknown token';
}
