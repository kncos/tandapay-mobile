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
import type { TandaPayError } from '../errors/types';
import buttons from '../styles/buttons';

type Props = {|
  walletAddress: string,
  apiKeyConfigured: boolean,
  transactionState: TransactionState,
  loadMoreState: LoadMoreState,
  onLoadMore: () => void,
  onRefresh: () => void,
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
  onRefresh,
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
    const error: TandaPayError = transactionState.error;
    const errorMessage = error.userMessage != null && error.userMessage !== ''
      ? error.userMessage
      : error.message != null && error.message !== ''
        ? error.message
        : 'Failed to load transactions';

    // Build buttons array based on error type and retryability
    const errorButtons = [];

    // Always add retry button for retryable errors
    if (error.retryable === true) {
      errorButtons.push({
        id: 'retry-transactions',
        label: 'Retry',
        onPress: onRefresh,
      });
    }

    // Add settings button for API key related errors
    if (error.code === 'NO_API_KEY' || error.code === 'INVALID_API_KEY') {
      errorButtons.push({
        id: 'wallet-settings',
        label: 'Go to Settings',
        onPress: onGoToSettings,
      });
    }

    // Add specific actions for rate limiting
    if (error.code === 'ETHERSCAN_RATE_LIMIT') {
      // For rate limiting, only show retry (which is already added above if retryable)
      // and suggest viewing on explorer as alternative
      errorButtons.push({
        id: 'view-explorer',
        label: 'View on Explorer',
        onPress: onViewExplorer,
      });
    } else if (error.code === 'UNSUPPORTED_CHAIN_ID' || error.code === 'UNSUPPORTED_NETWORK') {
      // For unsupported networks, suggest viewing on explorer and settings
      errorButtons.push({
        id: 'view-explorer',
        label: 'View on Explorer',
        onPress: onViewExplorer,
      });
      errorButtons.push({
        id: 'wallet-settings',
        label: 'Network Settings',
        onPress: onGoToSettings,
      });
    } else {
      // Add explorer button as fallback for other errors
      errorButtons.push({
        id: 'view-explorer',
        label: 'View on Explorer',
        onPress: onViewExplorer,
      });
    }

    return (
      <TandaPayBanner
        visible
        text={errorMessage}
        backgroundColor={QUARTER_COLOR}
        buttons={errorButtons}
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
