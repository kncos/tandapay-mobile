/* @flow strict-local */

import type { PerAccountAction } from '../../types';
import {
  TANDAPAY_TOKEN_SELECT,
  TANDAPAY_TOKEN_ADD_CUSTOM,
  TANDAPAY_TOKEN_REMOVE_CUSTOM,
  TANDAPAY_TOKEN_UPDATE_BALANCE,
} from '../../actionConstants';

/**
 * Action to select a different token in the wallet
 */
export function selectToken(tokenSymbol: string): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_SELECT,
    tokenSymbol,
  };
}

/**
 * Action to add a custom token to the user's wallet
 */
export function addCustomToken(token: {|
  symbol: string,
  address: string,
  name: string,
  decimals?: number,
|}): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_ADD_CUSTOM,
    token,
  };
}

/**
 * Action to remove a custom token from the user's wallet
 */
export function removeCustomToken(tokenSymbol: string): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_REMOVE_CUSTOM,
    tokenSymbol,
  };
}

/**
 * Action to update the cached balance for a token
 */
export function updateTokenBalance(tokenSymbol: string, balance: string): PerAccountAction {
  return {
    type: TANDAPAY_TOKEN_UPDATE_BALANCE,
    tokenSymbol,
    balance,
  };
}
