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
import MacroWorkflow from './components/MacroWorkflow';
import type { MacroDefinition } from './components/MacroWorkflow';
import { TandaRibbon } from './components';
import { AUTO_REORG_MACRO } from './contract/macros/auto-reorg';
import { IconRefreshCw } from '../common/Icons';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-actions'>,
  route: RouteProp<'tandapay-actions', void>,
|}>;

export default function TandaPayActionsScreen(props: Props): Node {
  const [selectedTransaction, setSelectedTransaction] = useState<?WriteTransaction>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [macroWorkflowVisible, setMacroWorkflowVisible] = useState(false);

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
    setMacroWorkflowVisible(true);
  }, []);

  const handleMacroWorkflowClose = useCallback(() => {
    setMacroWorkflowVisible(false);
  }, []);

  const handleMacroComplete = useCallback(() => {
    // Macro completed successfully
    setMacroWorkflowVisible(false);
  }, []);

  // Create macro definition for auto-reorg
  // For now, we'll use a simple mock data fetcher
  const autoReorgMacro: MacroDefinition = {
    id: AUTO_REORG_MACRO.id,
    name: AUTO_REORG_MACRO.name,
    description: AUTO_REORG_MACRO.description,
    
    dataFetcher: async () => [],
    
    validateFunction: (data: mixed) => ({
      canExecute: Array.isArray(data),
      reason: Array.isArray(data) ? undefined : 'Invalid data format',
    }),
    
    executeFunction: async (data: mixed) => ({
      success: true,
      transactions: [],
    }),
  };

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

      {/* Macro Workflow */}
      <MacroWorkflow
        visible={macroWorkflowVisible}
        macro={autoReorgMacro}
        onClose={handleMacroWorkflowClose}
        onComplete={handleMacroComplete}
      />
    </Screen>
  );
}
