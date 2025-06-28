// @flow strict-local

import React, { useCallback, useState } from 'react';
import type { Node } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import NavRow from '../common/NavRow';
// $FlowFixMe - importing from untyped module
import { getAllWriteTransactions } from './contract/tandapay-writer/writeTransactionObjects';
import type { WriteTransaction } from './contract/tandapay-writer/writeTransactionObjects';
import { getSuggestedMethods } from './contract/suggestedMethods';
import TransactionModal from './components/TransactionModal';
import MacroIntroModal from './components/MacroIntroModal';
import { TandaRibbon } from './components';
import { AUTO_REORG_MACRO } from './contract/macros/auto-reorg';
import { IconRefreshCw } from '../common/Icons';
import { invalidateCachedBatchData } from './contract/tandapay-reader/communityInfoManager';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-actions'>,
  route: RouteProp<'tandapay-actions', void>,
|}>;

export default function TandaPayActionsScreen(props: Props): Node {
  const [selectedTransaction, setSelectedTransaction] = useState<?WriteTransaction>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [macroIntroVisible, setMacroIntroVisible] = useState(false);

  // Get all write transactions with metadata
  // Note: The TransactionModal now integrates with real contract instances
  // via ContractInstanceManager when transactions are executed
  const writeTransactions = getAllWriteTransactions();

  // Get suggested transactions based on current community state and user context
  const suggestedTransactions = getSuggestedMethods();

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

  // Macro-related handlers
  const handleAutoReorgPress = useCallback(() => {
    setMacroIntroVisible(true);
  }, []);

  const handleMacroIntroClose = useCallback(() => {
    setMacroIntroVisible(false);
  }, []);

  const handleMacroRefresh = useCallback(() => {
    // Drop all cached data to force fresh fetch
    invalidateCachedBatchData();
  }, []);

  const handleMacroContinue = useCallback(() => {
    // For now, just close the modal - we'll implement the actual macro execution later
    setMacroIntroVisible(false);
    // TODO: Implement macro execution flow
  }, []);

  return (
    <Screen title="TandaPay Actions">
      {/* Macros Ribbon */}
      <TandaRibbon label="Macros" marginTop={0}>
        <NavRow
          leftElement={{ type: 'icon', Component: IconRefreshCw }}
          title={AUTO_REORG_MACRO.name}
          subtitle={AUTO_REORG_MACRO.description}
          onPress={handleAutoReorgPress}
        />
      </TandaRibbon>

      {/* Suggested Methods Ribbon */}
      {suggestedTransactions.length > 0 && (
        <TandaRibbon label="Suggested Actions" marginTop={0}>
          {suggestedTransactions.map(transaction => (
            <NavRow
              key={transaction.functionName}
              leftElement={{ type: 'icon', Component: transaction.icon }}
              title={transaction.displayName}
              onPress={() => handleTransactionPress(transaction)}
              subtitle={transaction.description}
            />
          ))}
        </TandaRibbon>
      )}

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

      {/* Macro Intro Modal */}
      <MacroIntroModal
        visible={macroIntroVisible}
        macroInfo={AUTO_REORG_MACRO}
        onClose={handleMacroIntroClose}
        onRefresh={handleMacroRefresh}
        onContinue={handleMacroContinue}
      />
    </Screen>
  );
}
