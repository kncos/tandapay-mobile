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
import { TandaRibbon } from './components';
import { AUTO_REORG_MACRO } from './contract/macros/auto-reorg';
import { IconRefreshCw, IconUserPlus, IconSettings } from '../common/Icons';
import { useAutoReorgMacro } from './contract/macros/auto-reorg/autoReorgMacroAdapter';
import { useAddRequiredMembersMacro } from './contract/macros/add-required-members/addRequiredMembersMacroAdapter';
import { useDefineSuccessorListAdapter } from './contract/macros/define-successor-list/defineSuccessorListAdapter';
import MacroWorkflow from './components/MacroWorkflow';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-actions'>,
  route: RouteProp<'tandapay-actions', void>,
|}>;

export default function TandaPayActionsScreen(props: Props): Node {
  const [selectedTransaction, setSelectedTransaction] = useState<?WriteTransaction>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [macroWorkflowVisible, setMacroWorkflowVisible] = useState(false);
  const [addMembersWorkflowVisible, setAddMembersWorkflowVisible] = useState(false);
  const [defineSuccessorWorkflowVisible, setDefineSuccessorWorkflowVisible] = useState(false);

  // Initialize auto-reorg macro hook
  const { macro: autoReorgMacro } = useAutoReorgMacro();

  // Initialize add required members macro hook
  const { macro: addRequiredMembersMacro } = useAddRequiredMembersMacro();

  // Initialize define successor list macro hook
  const { macro: defineSuccessorListMacro } = useDefineSuccessorListAdapter();

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

  // Auto-reorg handler - launches macro workflow
  const handleAutoReorgPress = useCallback(() => {
    setMacroWorkflowVisible(true);
  }, []);

  // Add required members handler - launches macro workflow
  const handleAddRequiredMembersPress = useCallback(() => {
    setAddMembersWorkflowVisible(true);
  }, []);

  // Define successor list handler - launches macro workflow
  const handleDefineSuccessorListPress = useCallback(() => {
    setDefineSuccessorWorkflowVisible(true);
  }, []);

  // Handle macro workflow completion
  const handleMacroWorkflowComplete = useCallback(() => {
    // The MacroWorkflow component will handle closing itself
    // We could add additional logic here if needed
  }, []);

  // Handle macro workflow close
  const handleMacroWorkflowClose = useCallback(() => {
    setMacroWorkflowVisible(false);
  }, []);

  // Handle add members workflow close
  const handleAddMembersWorkflowClose = useCallback(() => {
    setAddMembersWorkflowVisible(false);
  }, []);

  // Handle define successor workflow close
  const handleDefineSuccessorWorkflowClose = useCallback(() => {
    setDefineSuccessorWorkflowVisible(false);
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
        <NavRow
          leftElement={{ type: 'icon', Component: IconUserPlus }}
          title={addRequiredMembersMacro.name}
          subtitle={addRequiredMembersMacro.description}
          onPress={handleAddRequiredMembersPress}
        />
        <NavRow
          leftElement={{ type: 'icon', Component: IconSettings }}
          title={defineSuccessorListMacro.name}
          subtitle={defineSuccessorListMacro.description}
          onPress={handleDefineSuccessorListPress}
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

      <TransactionModal
        visible={modalVisible}
        transaction={selectedTransaction}
        onClose={handleModalClose}
        onTransactionComplete={handleTransactionComplete}
      />

      <MacroWorkflow
        macro={autoReorgMacro}
        visible={macroWorkflowVisible}
        onClose={handleMacroWorkflowClose}
        onComplete={handleMacroWorkflowComplete}
      />

      <MacroWorkflow
        macro={addRequiredMembersMacro}
        visible={addMembersWorkflowVisible}
        onClose={handleAddMembersWorkflowClose}
        onComplete={handleMacroWorkflowComplete}
      />

      <MacroWorkflow
        macro={defineSuccessorListMacro}
        visible={defineSuccessorWorkflowVisible}
        onClose={handleDefineSuccessorWorkflowClose}
        onComplete={handleMacroWorkflowComplete}
      />
    </Screen>
  );
}
