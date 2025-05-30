/* @flow strict-local */
import type {
  TandaPayWalletState,
  TandaPaySettingsState,
  TandaPayTransactionState,
  TandaPayPoolState
} from './tandaPayReducer';
import {
  TANDAPAY_WALLET_SET,
  TANDAPAY_SETTINGS_UPDATE,
  TANDAPAY_TRANSACTION_ADD,
  TANDAPAY_POOL_DATA_UPDATE,
} from '../actionConstants';

export type TandaPayWalletSetAction = {|
  type: typeof TANDAPAY_WALLET_SET,
  walletData: $Shape<TandaPayWalletState>,
|};

export type TandaPaySettingsUpdateAction = {|
  type: typeof TANDAPAY_SETTINGS_UPDATE,
  settings: $Shape<TandaPaySettingsState>,
|};

export type TandaPayTransactionAddAction = {|
  type: typeof TANDAPAY_TRANSACTION_ADD,
  transaction: TandaPayTransactionState,
|};

export type TandaPayPoolDataUpdateAction = {|
  type: typeof TANDAPAY_POOL_DATA_UPDATE,
  poolData: TandaPayPoolState,
|};

export const setTandaPayWallet = (walletData: $Shape<TandaPayWalletState>): TandaPayWalletSetAction => ({
  type: TANDAPAY_WALLET_SET,
  walletData,
});

export const updateTandaPaySettings = (settings: $Shape<TandaPaySettingsState>): TandaPaySettingsUpdateAction => ({
  type: TANDAPAY_SETTINGS_UPDATE,
  settings,
});

export const addTandaPayTransaction = (transaction: TandaPayTransactionState): TandaPayTransactionAddAction => ({
  type: TANDAPAY_TRANSACTION_ADD,
  transaction,
});

export const updateTandaPayPoolData = (poolData: TandaPayPoolState): TandaPayPoolDataUpdateAction => ({
  type: TANDAPAY_POOL_DATA_UPDATE,
  poolData,
});
