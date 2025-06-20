// @flow strict-local

import React, { useCallback, useState } from 'react';
import type { Node } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import NavRow from '../common/NavRow';
// $FlowFixMe - importing from untyped module
import { getAllWriteTransactions } from './contract/writeTransactionObjects';
import type { WriteTransaction } from './contract/writeTransactionObjects';
import TransactionModal from './components/TransactionModal';
import { TandaRibbon } from './components';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-actions'>,
  route: RouteProp<'tandapay-actions', void>,
|}>;

export default function TandaPayActionsScreen(props: Props): Node {
  const [selectedTransaction, setSelectedTransaction] = useState<?WriteTransaction>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Get all write transactions with metadata
  // For production use with actual signer and contract:
  // import { getAllWriteMethodsWithMetadata } from './contract/write';
  // const writeTransactions = getAllWriteMethodsWithMetadata(signer, contractAddress);
  const writeTransactions = getAllWriteTransactions();

  // Helper function to handle transaction button press
  const handleTransactionPress = useCallback((transaction: WriteTransaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  }, []);

  // Helper function to handle modal close
  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedTransaction(null);
  }, []);

  // Helper function to handle transaction completion
  const handleTransactionComplete = useCallback(
    (result: { success: boolean, hash?: string }) => {
      // Here you could update the UI state, refresh data, etc.
      // For now, we just close the modal
      handleModalClose();
    },
    [handleModalClose],
  );

  return (
    <Screen title="TandaPay Actions">
      <TandaRibbon label="Member Actions" marginTop={0}>
        {writeTransactions
          .filter(transaction => transaction.role !== 'secretary')
          .map(transaction => (
            <NavRow
              key={transaction.functionName}
              leftElement={{ type: 'icon', Component: transaction.icon }}
              title={transaction.displayName}
              onPress={() => handleTransactionPress(transaction)}
              subtitle={transaction.description}
            />
          ))}
      </TandaRibbon>
      <TandaRibbon label="Secretary Actions" marginTop={0}>
        {writeTransactions
          .filter(transaction => transaction.role === 'secretary')
          .map(transaction => (
            <NavRow
              key={transaction.functionName}
              leftElement={{ type: 'icon', Component: transaction.icon }}
              title={transaction.displayName}
              onPress={() => handleTransactionPress(transaction)}
              subtitle={transaction.description}
            />
          ))}
      </TandaRibbon>

      {/* Dynamic Transaction Modal */}
      <TransactionModal
        visible={modalVisible}
        transaction={selectedTransaction}
        onClose={handleModalClose}
        onTransactionComplete={handleTransactionComplete}
      />
    </Screen>
  );
}
