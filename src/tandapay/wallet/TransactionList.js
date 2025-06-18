/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, ActivityIndicator } from 'react-native';

import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import { TandaPayBanner } from '../components';
import { QUARTER_COLOR } from '../../styles';
import { formatTransactionValue, getTransactionInfo } from './TransactionService';
import type { TransactionState, LoadMoreState } from './useTransactionHistory';
import buttons from '../styles/buttons';

type Props = {|
  walletAddress: string,
  apiKeyConfigured: boolean,
  transactionState: TransactionState,
  loadMoreState: LoadMoreState,
  onLoadMore: () => void,
  onGoToSettings: () => void,
  onViewExplorer: () => void,
  onViewTransactionInExplorer: (txHash: string) => void,
|};

export default function TransactionList({
  walletAddress,
  apiKeyConfigured,
  transactionState,
  loadMoreState,
  onLoadMore,
  onGoToSettings,
  onViewExplorer,
  onViewTransactionInExplorer,
}: Props): Node {
  // No API key configured
  if (!apiKeyConfigured) {
    return (
      <TandaPayBanner
        visible
        text="Configure Etherscan API key to view transaction history"
        backgroundColor={QUARTER_COLOR}
        buttons={[
          {
            id: 'wallet-settings',
            label: 'Go to Settings',
            onPress: onGoToSettings,
          },
          {
            id: 'view-explorer',
            label: 'View on Explorer',
            onPress: onViewExplorer,
          },
        ]}
      />
    );
  }

  // Loading initial transactions
  if (transactionState.status === 'loading') {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <ActivityIndicator size="small" />
        <ZulipText text="Loading transactions..." style={{ marginTop: 8, textAlign: 'center' }} />
      </View>
    );
  }

  // Error loading transactions
  if (transactionState.status === 'error') {
    return (
      <TandaPayBanner
        visible
        text={`Failed to load transactions: ${transactionState.error}`}
        backgroundColor={QUARTER_COLOR}
        buttons={[
          {
            id: 'wallet-settings',
            label: 'Go to Settings',
            onPress: onGoToSettings,
          },
          {
            id: 'view-explorer',
            label: 'View on Explorer',
            onPress: onViewExplorer,
          },
        ]}
      />
    );
  }

  // Successful load with transactions
  if (transactionState.status === 'success' && transactionState.transactions.length > 0) {
    return (
      <>
        {transactionState.transactions.map((transaction) => {
          const { direction } = getTransactionInfo(transaction, walletAddress);
          const value = formatTransactionValue(transaction.value);
          const truncatedHash = `${transaction.hash.substring(0, 10)}...${transaction.hash.substring(transaction.hash.length - 8)}`;

          return (
            <TandaPayBanner
              key={transaction.hash}
              visible
              text={`${direction === 'sent' ? 'Sent' : 'Received'} ${value} • ${truncatedHash}`}
              backgroundColor={QUARTER_COLOR}
              buttons={[
                {
                  id: 'view-transaction',
                  label: 'View in Explorer',
                  onPress: () => onViewTransactionInExplorer(transaction.hash),
                },
              ]}
            />
          );
        })}

        {/* Load More Button */}
        <View style={buttons.buttonRow}>
          <ZulipButton
            style={buttons.button}
            text={
              loadMoreState.status === 'complete'
                ? 'All caught up!'
                : loadMoreState.status === 'loading'
                  ? 'Loading...'
                  : 'Load More Transactions'
            }
            onPress={onLoadMore}
            progress={loadMoreState.status === 'loading'}
            disabled={loadMoreState.status === 'loading' || loadMoreState.status === 'complete'}
            secondary
          />
        </View>
      </>
    );
  }

  // No transactions found
  return (
    <TandaPayBanner
      visible
      text="No transactions found"
      backgroundColor={QUARTER_COLOR}
      buttons={[
        {
          id: 'view-explorer',
          label: 'View on Explorer',
          onPress: onViewExplorer,
        },
      ]}
    />
  );
}
