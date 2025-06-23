/* @flow strict-local */

/**
 * Supported network identifiers
 */
export type SupportedNetwork = 'mainnet' | 'sepolia' | 'polygon' | 'arbitrum';

/**
 * All network identifiers including custom
 */
export type NetworkIdentifier = SupportedNetwork | 'custom';

/**
 * Token configuration in chain definitions
 */
export type TokenConfig = {|
  +address: string,
  +decimals: number,
  +symbol: string,
  +name: string,
|};

/**
 * Chain configuration structure
 */
export type ChainConfig = {|
  +id: number,
  +name: string,
  +nativeCurrency: {|
    +name: string,
    +symbol: string,
    +decimals: number,
  |},
  +rpcUrls: {|
    +default: {|
      +http: $ReadOnlyArray<string>,
    |},
  |},
  +blockExplorers: {|
    +default: {|
      +name: string,
      +url: string,
      +apiUrl: string,
    |},
  |},
  +contracts: {|
    +multicall3: {|
      +address: string,
      +blockCreated: number,
    |},
    +ensRegistry?: {|
      +address: string,
    |},
    +ensUniversalResolver?: {|
      +address: string,
    |},
  |},
  +tokens: { [string]: TokenConfig, ... },
|};
