// @flow strict-local

/**
 * TransactionList component that works with the new transfer system
 *
 * This component handles the new transfer format while maintaining compatibility
 * with the existing UI components.
 */

import React, { useState, useContext } from 'react';
import type { Node } from 'react';
import { View, ActivityIndicator } from 'react-native';

import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import Touchable from '../../common/Touchable';
import { QUARTER_COLOR, ThemeContext } from '../../styles';
import { convertTransferToEtherscanFormat } from './TransactionFormatter';
import TransactionDetailsModal from './TransactionDetailsModal';
import type { LoadMoreState } from './useTransactionHistory';
import type { TandaPayError } from '../errors/types';

// $FlowFixMe[unclear-type] - Transfer objects have complex structure from Alchemy
type Transfer = mixed;

export type TransactionState =
  | {| status: 'idle' |}
  | {| status: 'loading' |}
  | {| status: 'success', transfers: $ReadOnlyArray<Transfer>, hasMore: boolean |}
  | {| status: 'error', error: TandaPayError |};

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
  // $FlowFixMe[unclear-type] - Complex transaction object structure
  const [selectedTransaction, setSelectedTransaction] = useState<?mixed>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const themeData = useContext(ThemeContext);

  const showTransactionDetails = (transfer: Transfer) => {
    // Convert transfer to etherscan format for the modal
    const etherscanTransaction = convertTransferToEtherscanFormat(transfer, walletAddress);
    setSelectedTransaction(etherscanTransaction);
    setModalVisible(true);
  };

  const hideTransactionDetails = () => {
    setModalVisible(false);
    setSelectedTransaction(null);
  };

  // Handle API key not configured state
  if (!apiKeyConfigured) {
    return (
      <View style={{ padding: 20, alignItems: 'center', backgroundColor: themeData.backgroundColor }}>
        <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: themeData.color }}>
          🔑 API Key Required
        </ZulipText>
        <ZulipText style={{ textAlign: 'center', marginBottom: 15, color: themeData.color }}>
          Configure an Alchemy API key in wallet settings to view transaction history.
        </ZulipText>
        <ZulipButton
          text="Configure API Key"
          onPress={onGoToSettings}
        />
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
        <ZulipButton
          text="Connect Wallet"
          onPress={onGoToSettings}
        />
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
        <ZulipButton
          text="Try Again"
          onPress={onRefresh}
        />
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
  if (transactionState.status === 'success' && transactionState.transfers.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center', backgroundColor: themeData.backgroundColor }}>
        <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: themeData.color }}>
          📭 No Transactions Found
        </ZulipText>
        <ZulipText style={{ textAlign: 'center', marginBottom: 15, color: themeData.color }}>
          This wallet has no transaction history yet.
        </ZulipText>
        <ZulipButton
          text="View in Explorer"
          onPress={onViewExplorer}
        />
      </View>
    );
  }

  // Handle success state with transactions
  if (transactionState.status === 'success') {
    const { transfers, hasMore } = transactionState;

    return (
      <View style={{ backgroundColor: themeData.backgroundColor }}>
        {/* Transaction List */}
        {transfers.map((transfer, index) => {
          // Convert transfer for display
          const etherscanTransaction = convertTransferToEtherscanFormat(transfer, walletAddress);

          return (
            <Touchable
              key={etherscanTransaction.hash || `transfer-${index}`}
              style={{ padding: 12, marginVertical: 2, backgroundColor: themeData.cardColor, borderRadius: 8 }}
              onPress={() => showTransactionDetails(transfer)}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <ZulipText style={{ fontSize: 16, fontWeight: 'bold', color: themeData.color }}>
                    {etherscanTransaction.direction === 'IN' ? '📥 Received' : '📤 Sent'}
                  </ZulipText>
                  <ZulipText style={{ fontSize: 14, color: themeData.dividerColor }}>
                    {etherscanTransaction.formattedValue}
                  </ZulipText>
                  <ZulipText style={{ fontSize: 12, color: themeData.dividerColor }}>
                    Block
                    {' '}
                    {etherscanTransaction.blockNumber}
                  </ZulipText>
                </View>
                <ZulipButton
                  text="View"
                  style={{ padding: 8 }}
                  secondary
                  onPress={() => onViewTransactionInExplorer(etherscanTransaction.hash)}
                />
              </View>
            </Touchable>
          );
        })}

        {/* Load More Button */}
        {hasMore && (
          <View style={{ padding: 16, alignItems: 'center', backgroundColor: themeData.backgroundColor }}>
            {loadMoreState.status === 'loading' ? (
              <ActivityIndicator size="small" color={QUARTER_COLOR} />
            ) : (
              <ZulipButton
                text="Load More"
                onPress={onLoadMore}
                disabled={loadMoreState.status === 'complete'}
              />
            )}
          </View>
        )}

        {/* Transaction Details Modal */}
        {selectedTransaction != null && (
          <TransactionDetailsModal
            visible={modalVisible}
            onClose={hideTransactionDetails}
            // $FlowFixMe[incompatible-type] - selectedTransaction is guaranteed to be valid
            transaction={selectedTransaction}
            walletAddress={walletAddress}
            onViewInExplorer={onViewTransactionInExplorer}
          />
        )}
      </View>
    );
  }

  // Default loading state
  return (
    <View style={{ padding: 20, alignItems: 'center', backgroundColor: themeData.backgroundColor }}>
      <ActivityIndicator size="large" color={QUARTER_COLOR} />
    </View>
  );
}
