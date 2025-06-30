// @flow strict-local

import React, { useCallback, useState, useMemo } from 'react';
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
import type { MacroDefinition, MacroChainConfig } from './components/MacroIntroModal';
import { TandaRibbon } from './components';
import { IconRefreshCw, IconUserPlus, IconSettings } from '../common/Icons';
import { useAutoReorg } from './contract/macros/auto-reorg/useAutoReorg';
import { useAddRequiredMembers } from './contract/macros/add-required-members/useAddRequiredMembers';
import { useDefineSuccessorList } from './contract/macros/define-successor-list/useDefineSuccessorList';
import { useInitiateDefaultState } from './contract/macros/initiate-default-state/useInitiateDefaultState';
import { useTransactionChain } from './hooks/useTransactionChain';
import type { TransactionResult } from './hooks/useTransactionChain';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-actions'>,
  route: RouteProp<'tandapay-actions', void>,
|}>;

export default function TandaPayActionsScreen(props: Props): Node {
  const [selectedTransaction, setSelectedTransaction] = useState<?WriteTransaction>(null);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [macroChainConfig, setMacroChainConfig] = useState<?MacroChainConfig>(null);

  // Initialize macro hooks
  const autoReorg = useAutoReorg();
  const addRequiredMembers = useAddRequiredMembers();
  const defineSuccessorList = useDefineSuccessorList();
  const initiateDefaultState = useInitiateDefaultState();

  // Initialize transaction chain
  const transactionChain = useTransactionChain();

  // Get all write transactions with metadata
  const writeTransactions = getAllWriteTransactions();

  // Get suggested transactions based on current community state and user context
  const suggestedTransactions = getSuggestedMethods();

  // Create macro definitions
  const macroDefinitions = useMemo((): { [string]: MacroDefinition } => ({
    'auto-reorg': {
      id: 'auto-reorg',
      name: 'Auto Reorganization',
      description: 'Automatically reorganize subgroups to ensure all members are assigned to valid subgroups.',
      generateTransactions: autoReorg.getTransactions,
      refresh: autoReorg.refresh,
    },
    'add-required-members': {
      id: 'add-required-members',
      name: 'Add Required Members',
      description: 'Guide through adding members needed to meet minimum community requirements.',
      generateTransactions: addRequiredMembers.getTransactions,
      refresh: addRequiredMembers.refresh,
    },
    'define-successor-list': {
      id: 'define-successor-list',
      name: 'Define Expected Successor List',
      description: 'Set up successor assignments based on current community size requirements.',
      generateTransactions: defineSuccessorList.getTransactions,
      refresh: defineSuccessorList.refresh,
    },
    'initiate-default-state': {
      id: 'initiate-default-state',
      name: 'Initiate Default State',
      description: 'Analyze community readiness and initiate the default operational state if all conditions are met.',
      generateTransactions: initiateDefaultState.getTransactions,
      refresh: initiateDefaultState.refresh,
    },
  }), [autoReorg.getTransactions, autoReorg.refresh, addRequiredMembers.getTransactions, addRequiredMembers.refresh, defineSuccessorList.getTransactions, defineSuccessorList.refresh, initiateDefaultState.getTransactions, initiateDefaultState.refresh]);

  // Helper function to handle individual transaction button press
  const handleTransactionPress = useCallback((transaction: WriteTransaction) => {
    setSelectedTransaction(transaction);
    setTransactionModalVisible(true);
  }, []);

  // Helper function to handle transaction modal close
  const handleTransactionModalClose = useCallback(() => {
    setTransactionModalVisible(false);
    setSelectedTransaction(null);
  }, []);

  // Helper function to handle transaction completion
  const handleTransactionComplete = useCallback(
    (result: { success: boolean, hash?: string }) => {
      handleTransactionModalClose();
    },
    [handleTransactionModalClose],
  );

  // Handle starting individual macros
  const handleMacroPress = useCallback((macroId: string) => {
    const macro = macroDefinitions[macroId];
    if (macro) {
      const chainConfig: MacroChainConfig = {
        currentMacro: macro,
        onChainComplete: () => {
          // Macro completed successfully
        },
      };
      setMacroChainConfig(chainConfig);
    }
  }, [macroDefinitions]);

  // Handle starting macro chains (example: setup sequence)
  const handleCompleteSetupPress = useCallback(() => {
    const setupMacros = [
      macroDefinitions['add-required-members'],
      macroDefinitions['auto-reorg'],
      macroDefinitions['define-successor-list'],
      macroDefinitions['initiate-default-state'],
    ];

    const [firstMacro, ...remainingMacros] = setupMacros;

    const chainConfig: MacroChainConfig = {
      currentMacro: firstMacro,
      nextMacros: remainingMacros,
      onChainComplete: () => {
        // Complete community setup finished!
        // Could navigate somewhere or show success message
      },
    };

    setMacroChainConfig(chainConfig);
  }, [macroDefinitions]);

  // Handle advancing to next macro in chain
  const handleMacroChainAdvance = useCallback((nextConfig: MacroChainConfig) => {
    setMacroChainConfig(nextConfig);
  }, []);

  // Handle macro modal close
  const handleMacroModalClose = useCallback(() => {
    setMacroChainConfig(null);
  }, []);

  // Handle starting transaction chain from macro
  const handleStartTransactionChain = useCallback(
    (transactions: WriteTransaction[], macroName: string, onComplete?: () => Promise<void>) => {
      const chain = {
        id: `macro-${macroName.toLowerCase().replace(/\s+/g, '-')}`,
        name: macroName,
        transactions,
        onComplete,
        onError: async (error: string, transactionIndex: number) => {
          // Could show an error modal or refresh data
        },
      };

      transactionChain.startSingleChain(chain);
    },
    [transactionChain],
  );

  // Handle transaction chain completion
  const handleChainTransactionComplete = useCallback(
    (result: TransactionResult) => {
      // Don't await here - just call the async function
      transactionChain.handleTransactionComplete(result);
    },
    [transactionChain],
  );

  // Handle transaction chain close/cancel
  const handleChainTransactionClose = useCallback(
    () => {
      // Don't await here - just call the async function
      transactionChain.handleClose();
    },
    [transactionChain],
  );

  return (
    <Screen title="TandaPay Actions">
      {/* Complete Setup Macro Chain */}
      <TandaRibbon label="Complete Setup" marginTop={0}>
        <NavRow
          leftElement={{ type: 'icon', Component: IconSettings }}
          title="Complete Community Setup"
          subtitle="Run through all setup macros: Add Members → Auto-Reorg → Define Successors → Initiate Default State"
          onPress={handleCompleteSetupPress}
        />
      </TandaRibbon>

      {/* Individual Macros */}
      <TandaRibbon label="Individual Macros" marginTop={0}>
        <NavRow
          leftElement={{ type: 'icon', Component: IconUserPlus }}
          title={macroDefinitions['add-required-members'].name}
          subtitle={macroDefinitions['add-required-members'].description}
          onPress={() => handleMacroPress('add-required-members')}
        />
        <NavRow
          leftElement={{ type: 'icon', Component: IconRefreshCw }}
          title={macroDefinitions['auto-reorg'].name}
          subtitle={macroDefinitions['auto-reorg'].description}
          onPress={() => handleMacroPress('auto-reorg')}
        />
        <NavRow
          leftElement={{ type: 'icon', Component: IconSettings }}
          title={macroDefinitions['define-successor-list'].name}
          subtitle={macroDefinitions['define-successor-list'].description}
          onPress={() => handleMacroPress('define-successor-list')}
        />
        <NavRow
          leftElement={{ type: 'icon', Component: IconSettings }}
          title={macroDefinitions['initiate-default-state'].name}
          subtitle={macroDefinitions['initiate-default-state'].description}
          onPress={() => handleMacroPress('initiate-default-state')}
        />
      </TandaRibbon>

      {/* Suggested Methods */}
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

      {/* Member Actions */}
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

      {/* Secretary Actions */}
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

      {/* Individual Transaction Modal */}
      <TransactionModal
        key={`individual-${selectedTransaction?.functionName || 'no-transaction'}-${JSON.stringify(selectedTransaction?.prefilledParams || {})}`}
        visible={transactionModalVisible}
        transaction={selectedTransaction}
        onClose={handleTransactionModalClose}
        onTransactionComplete={handleTransactionComplete}
      />

      {/* Macro Introduction and Chain Management Modal */}
      <MacroIntroModal
        visible={!!macroChainConfig}
        macroChainConfig={macroChainConfig}
        onClose={handleMacroModalClose}
        onMacroChainAdvance={handleMacroChainAdvance}
        onStartTransactionChain={handleStartTransactionChain}
      />

      {/* Transaction Chain Modal */}
      <TransactionModal
        key={`chain-${transactionChain.currentTransaction?.functionName || 'no-transaction'}-${transactionChain.chainProgress?.current || 0}-${JSON.stringify(transactionChain.currentTransaction?.prefilledParams || {})}`}
        visible={transactionChain.isVisible}
        transaction={transactionChain.currentTransaction}
        onClose={handleChainTransactionClose}
        onTransactionComplete={handleChainTransactionComplete}
        workflowProgress={transactionChain.chainProgress}
      />
    </Screen>
  );
}
