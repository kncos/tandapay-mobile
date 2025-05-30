/* @flow strict-local */
import type { PerAccountState } from '../reduxTypes';
import type {
  TandaPayState,
  TandaPayWalletState,
  TandaPaySettingsState,
  TandaPayTransactionState,
  TandaPayPoolState
} from './tandaPayReducer';

// Main TandaPay state selector
export const getTandaPayState = (state: PerAccountState): TandaPayState => state.tandaPay;

// Wallet selectors
export const getTandaPayWallet = (state: PerAccountState): TandaPayWalletState =>
  getTandaPayState(state).wallet;

export const getTandaPayWalletAddress = (state: PerAccountState): string | null =>
  getTandaPayWallet(state).address;

export const isTandaPayWalletImported = (state: PerAccountState): boolean =>
  getTandaPayWallet(state).isImported;

export const getTandaPayWalletCreatedAt = (state: PerAccountState): number | null =>
  getTandaPayWallet(state).createdAt;

// Settings selectors
export const getTandaPaySettings = (state: PerAccountState): TandaPaySettingsState =>
  getTandaPayState(state).settings;

export const getTandaPayDefaultNetwork = (state: PerAccountState): string =>
  getTandaPaySettings(state).defaultNetwork;

export const isTandaPayNotificationsEnabled = (state: PerAccountState): boolean =>
  getTandaPaySettings(state).notificationsEnabled;

export const isTandaPayBiometricAuthEnabled = (state: PerAccountState): boolean =>
  getTandaPaySettings(state).biometricAuthEnabled;

export const getTandaPayCurrency = (state: PerAccountState): string =>
  getTandaPaySettings(state).currency;

// Transaction selectors
export const getTandaPayTransactions = (state: PerAccountState): $ReadOnlyArray<TandaPayTransactionState> =>
  getTandaPayState(state).transactions;

export const getTandaPayPendingTransactions = (state: PerAccountState): $ReadOnlyArray<TandaPayTransactionState> =>
  getTandaPayTransactions(state).filter(tx => tx.status === 'pending');

export const getTandaPayConfirmedTransactions = (state: PerAccountState): $ReadOnlyArray<TandaPayTransactionState> =>
  getTandaPayTransactions(state).filter(tx => tx.status === 'confirmed');

export const getTandaPayTransactionById = (state: PerAccountState, transactionId: string): TandaPayTransactionState | null =>
  getTandaPayTransactions(state).find(tx => tx.id === transactionId) || null;

// Pool selectors
export const getTandaPayPools = (state: PerAccountState): $ReadOnlyArray<TandaPayPoolState> =>
  getTandaPayState(state).pools;

export const getTandaPayActivePools = (state: PerAccountState): $ReadOnlyArray<TandaPayPoolState> =>
  getTandaPayPools(state).filter(pool => pool.status === 'active');

export const getTandaPayPoolById = (state: PerAccountState, poolId: string): TandaPayPoolState | null =>
  getTandaPayPools(state).find(pool => pool.id === poolId) || null;

export const getTandaPayUserTotalContributions = (state: PerAccountState): string => {
  const pools = getTandaPayPools(state);
  return pools
    .filter(pool => pool.userContribution !== null)
    .reduce((total, pool) => {
      const contribution = parseFloat(pool.userContribution != null ? pool.userContribution : '0');
      return (parseFloat(total) + contribution).toString();
    }, '0');
};
