// @flow strict-local

/**
 * TransactionList component that works with the new TransactionManagerNew system
 *
 * This component displays transaction chips using FullTransaction data and
 * getFullTransactionChipInfo for display information.
 */

import React, { useState, useContext } from 'react';
import type { Node } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';

import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import { QUARTER_COLOR, ThemeContext } from '../../styles';
import TransactionDetailsModal from './TransactionDetailsModal';
import type { LoadMoreState, TransactionState } from './useTransactionHistory';
import TandaPayStyles, { TandaPayColors } from '../styles';
import type { NetworkIdentifier } from '../definitions/types';
import type { FullTransaction } from './FullTransaction';
import { getFullTransactionChipInfo, getTransactionDirection } from './FullTransaction';

type Props = {|
  walletAddress: string,
  apiKeyConfigured: boolean,
  network?: NetworkIdentifier,
  transactionState: TransactionState,
  loadMoreState: LoadMoreState,
  onLoadMore: () => void,
  onRefresh: () => void,
  onGoToSettings: () => void,
  onViewExplorer: () => void,
  onViewTransactionInExplorer: (txHash: string) => void,
|};

// Helper function to get color based on transaction type
const getTransactionChipColor = (transaction: FullTransaction, themeData: $ReadOnly<{|
  backgroundColor: string,
  cardColor: string,
  color: string,
  brandColor?: string,
  dividerColor: string,
  themeName: string,
|}>) => {
  const direction = getTransactionDirection(transaction);

  switch (direction) {
    case 'tandapay':
      return TandaPayColors.warning; // Gold/yellow for TandaPay
    case 'sent':
      return TandaPayColors.error; // Red for sent
    case 'received':
      return TandaPayColors.success; // Green for received
    default:
      return themeData.color; // Default color for other types
  }
};

export default function TransactionList({
  walletAddress,
  apiKeyConfigured,
  network = 'sepolia',
  transactionState,
  loadMoreState,
  onLoadMore,
  onRefresh,
  onGoToSettings,
  onViewExplorer,
  onViewTransactionInExplorer,
}: Props): Node {
  const [selectedTransaction, setSelectedTransaction] = useState<?FullTransaction>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const themeData = useContext(ThemeContext);

  const showTransactionDetails = (transaction: FullTransaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const hideTransactionDetails = () => {
    setModalVisible(false);
    setSelectedTransaction(null);
  };

  // Handle API key not configured state only for supported networks
  // Custom networks might have API key embedded in the URL
  if (!apiKeyConfigured && network !== 'custom') {
    return (
      <View style={{ padding: 20, alignItems: 'center', backgroundColor: themeData.backgroundColor }}>
        <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: themeData.color }}>
          🔑 API Key Required
        </ZulipText>
        <ZulipText style={{ textAlign: 'center', marginBottom: 15, color: themeData.color }}>
          Configure an Alchemy API key in wallet settings to view transaction history.
        </ZulipText>
        <View style={TandaPayStyles.buttonRow}>
          <ZulipButton
            text="Configure API Key"
            onPress={onGoToSettings}
            style={TandaPayStyles.button}
          />
        </View>
      </View>
    );
  }

  // Handle wallet address not set
  if (!walletAddress || walletAddress.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center', backgroundColor: themeData.backgroundColor }}>
        <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: themeData.color }}>
          💰 No Wallet Connected
        </ZulipText>
        <ZulipText style={{ textAlign: 'center', marginBottom: 15, color: themeData.color }}>
          Please connect a wallet to view transaction history.
        </ZulipText>
        <View style={TandaPayStyles.buttonRow}>
          <ZulipButton
            text="Connect Wallet"
            onPress={onGoToSettings}
            style={TandaPayStyles.button}
          />
        </View>
      </View>
    );
  }

  // Handle error state
  if (transactionState.status === 'error') {
    const error = transactionState.error;
    return (
      <View style={{ padding: 20, alignItems: 'center', backgroundColor: themeData.backgroundColor }}>
        <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: themeData.color }}>
          ❌ Failed to Load Transactions
        </ZulipText>
        <ZulipText style={{ textAlign: 'center', marginBottom: 15, color: themeData.color }}>
          {error.userMessage != null && error.userMessage !== '' ? error.userMessage : 'Unable to fetch transaction history.'}
        </ZulipText>
        <View style={TandaPayStyles.buttonRow}>
          <ZulipButton
            text="Try Again"
            onPress={() => {
              onRefresh(); // Reset the manager
              onLoadMore(); // Then load transactions
            }}
            style={TandaPayStyles.button}
          />
        </View>
      </View>
    );
  }

  // Handle loading state
  if (transactionState.status === 'loading') {
    return (
      <View style={{ padding: 20, alignItems: 'center', backgroundColor: themeData.backgroundColor }}>
        <ActivityIndicator size="large" color={QUARTER_COLOR} />
        <ZulipText style={{ marginTop: 10, textAlign: 'center', color: themeData.color }}>
          Loading transactions...
        </ZulipText>
      </View>
    );
  }

  // Handle success state with no transactions
  if (transactionState.status === 'success' && transactionState.transactions.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center', backgroundColor: themeData.backgroundColor }}>
        <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: themeData.color }}>
          📭 No Transactions Found
        </ZulipText>
        <ZulipText style={{ textAlign: 'center', marginBottom: 15, color: themeData.color }}>
          This wallet has no transaction history yet.
        </ZulipText>
      </View>
    );
  }

  // Handle success state with transactions
  if (transactionState.status === 'success') {
    const { hasMore, transactions } = transactionState;
    const isLoadingMore = loadMoreState.status === 'loading';

    return (
      <View style={{ backgroundColor: themeData.backgroundColor }}>
        {/* Transaction List */}
        {transactions.map((transaction, index) => {
          const chipInfo = getFullTransactionChipInfo(transaction);
          const chipColor = getTransactionChipColor(transaction, themeData);

          // Use only hash as key since it's unique for each FullTransaction
          const key = transaction.hash != null && transaction.hash !== '' ? transaction.hash : `tx-${index}`;

          return (
            <TouchableOpacity
              key={key}
              style={{
                backgroundColor: themeData.cardColor,
                marginHorizontal: 15,
                marginVertical: 5,
                padding: 15,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: chipColor,
              }}
              onPress={() => showTransactionDetails(transaction)}
            >
              {chipInfo.map((line) => (
                <ZulipText
                  key={line}
                  style={{
                    fontSize: line === chipInfo[0] ? 16 : 14,
                    fontWeight: line === chipInfo[0] ? 'bold' : 'normal',
                    color: line === chipInfo[0] ? chipColor : themeData.color,
                    marginBottom: line !== chipInfo[chipInfo.length - 1] ? 4 : 0,
                  }}
                >
                  {line}
                </ZulipText>
              ))}
            </TouchableOpacity>
          );
        })}

        {/* Load More Button */}
        {hasMore && (
          <View style={TandaPayStyles.buttonRow}>
            <ZulipButton
              text="Load More"
              onPress={onLoadMore}
              progress={isLoadingMore}
              style={TandaPayStyles.button}
            />
          </View>
        )}

        {/* Transaction Details Modal */}
        <TransactionDetailsModal
          visible={modalVisible}
          transaction={selectedTransaction}
          onClose={hideTransactionDetails}
          onViewInExplorer={(txHash) => {
            if (txHash) {
              onViewTransactionInExplorer(txHash);
            }
          }}
        />
      </View>
    );
  }

  // Fallback (should not reach here)
  return (
    <View style={{ padding: 20, alignItems: 'center', backgroundColor: themeData.backgroundColor }}>
      <ZulipText style={{ color: themeData.color }}>
        {transactionState.status}
      </ZulipText>
    </View>
  );
}
