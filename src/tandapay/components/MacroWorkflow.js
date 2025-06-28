// @flow strict-local

import React, { useState, useEffect, useCallback } from 'react';
import type { Node } from 'react';
import { Alert } from 'react-native';

import MacroIntroModal from './MacroIntroModal';
import TransactionModal from './TransactionModal';
import { invalidateCachedBatchData } from '../contract/tandapay-reader/communityInfoManager';

import type { WriteTransaction } from '../contract/tandapay-writer/writeTransactionObjects';

export type MacroDefinition = {|
  id: string,
  name: string,
  description: string,
  executeFunction: (data: mixed) => Promise<{|
    success: boolean,
    transactions?: WriteTransaction[],
    error?: string,
  |}>,
  validateFunction?: (data: mixed) => {|
    canExecute: boolean,
    reason?: string,
  |},
  dataFetcher: () => Promise<mixed>,
|};

type Props = $ReadOnly<{|
  macro: MacroDefinition,
  visible: boolean,
  onClose: () => void,
  onComplete: () => void,
|}>;

type WorkflowState =
  | 'intro'
  | 'loading'
  | 'executing'
  | 'completed'
  | 'aborted';

type TransactionState = {|
  transaction: WriteTransaction,
  status: 'pending' | 'executing' | 'completed' | 'failed',
  error?: string,
|};

export default function MacroWorkflow(props: Props): Node {
  const { macro, visible, onClose, onComplete } = props;

  const [workflowState, setWorkflowState] = useState<WorkflowState>('intro');
  const [transactions, setTransactions] = useState<TransactionState[]>([]);
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState<number>(0);
  const [macroData, setMacroData] = useState<mixed>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [transactionCount, setTransactionCount] = useState<number>(0);

  // Reset state when macro changes or modal becomes visible
  useEffect(() => {
    if (visible) {
      setWorkflowState('intro');
      setTransactions([]);
      setCurrentTransactionIndex(0);
      setMacroData(null);
      setIsRefreshing(false);
      setTransactionCount(0);
    }
  }, [visible, macro.id]);

  /**
   * Handles successful completion of entire workflow
   */
  const handleComplete = useCallback((): void => {
    setWorkflowState('completed');
    onComplete();
    onClose();
  }, [onComplete, onClose]);

  /**
   * Handles refreshing the macro data (drops cache and refetches)
   */
  const handleRefresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      // Drop all community-related caches
      invalidateCachedBatchData();

      // Refetch the macro data
      const freshData = await macro.dataFetcher();
      setMacroData(freshData);

      // Re-calculate transaction count
      if (macro.executeFunction) {
        const result = await macro.executeFunction(freshData);
        if (result.success && result.transactions) {
          setTransactionCount(result.transactions.length);
        } else {
          setTransactionCount(0);
        }
      }
    } catch (error) {
      // Silently handle failed refresh
      setTransactionCount(0);
    } finally {
      setIsRefreshing(false);
    }
  }, [macro]);

  /**
   * Handles continuing from intro to transaction execution
   */
  const handleContinue = useCallback(async (): Promise<void> => {
    setWorkflowState('loading');

    try {
      // Fetch data if we don't have it yet
      let data = macroData;
      if (data == null) {
        data = await macro.dataFetcher();
        setMacroData(data);
      }

      // Validate if the macro can be executed
      if (macro.validateFunction) {
        const validation = macro.validateFunction(data);
        if (!validation.canExecute) {
          Alert.alert(
            'Cannot Execute Macro',
            validation.reason ?? 'Macro cannot be executed at this time.',
            [{ text: 'OK', onPress: () => setWorkflowState('intro') }]
          );
          return;
        }
      }

      // Execute the macro to get transactions
      const result = await macro.executeFunction(data);

      if (!result.success) {
        Alert.alert(
          'Macro Error',
          result.error ?? 'Failed to generate transactions.',
          [{ text: 'OK', onPress: () => setWorkflowState('intro') }]
        );
        return;
      }

      if (!result.transactions || result.transactions.length === 0) {
        Alert.alert(
          'No Transactions Required',
          'This macro has no transactions to execute at this time.',
          [{ text: 'OK', onPress: handleComplete }]
        );
        return;
      }

      // Set up transaction states
      const transactionStates = result.transactions.map(transaction => ({
        transaction,
        status: 'pending',
      }));

      setTransactions(transactionStates);
      setCurrentTransactionIndex(0);
      setWorkflowState('executing');
    } catch (error) {
      const errorMessage = error?.message || 'Failed to execute macro';
      Alert.alert(
        'Execution Error',
        errorMessage,
        [{ text: 'OK', onPress: () => setWorkflowState('intro') }]
      );
    }
  }, [macro, macroData, handleComplete]);

  /**
   * Handles when a transaction is completed successfully
   */
  const handleTransactionSuccess = useCallback((result: mixed): void => {
    // Mark current transaction as completed
    const updatedTransactions = [...transactions];
    updatedTransactions[currentTransactionIndex] = {
      ...updatedTransactions[currentTransactionIndex],
      status: 'completed',
    };
    setTransactions(updatedTransactions);

    // Move to next transaction or complete workflow
    const nextIndex = currentTransactionIndex + 1;
    if (nextIndex >= transactions.length) {
      // All transactions completed
      setWorkflowState('completed');
      Alert.alert(
        'Workflow Complete!',
        `${macro.name} has been completed successfully.`,
        [{ text: 'OK', onPress: handleComplete }]
      );
    } else {
      setCurrentTransactionIndex(nextIndex);
    }
  }, [transactions, currentTransactionIndex, macro.name, handleComplete]);

  /**
   * Handles successful completion of entire workflow
   */
  /**
   * Handles aborting the workflow early
   */
  const handleAbort = useCallback(async (): Promise<void> => {
    setWorkflowState('aborted');

    // Drop cache since workflow was started but not completed
    try {
      invalidateCachedBatchData();
    } catch (error) {
      // Silently handle cache invalidation errors
    }

    Alert.alert(
      'Aborted Workflow Early!',
      'The macro workflow was aborted. Community data has been refreshed.',
      [{ text: 'OK', onPress: onClose }]
    );
  }, [onClose]);

  /**
   * Handles when user closes a transaction modal (aborts workflow)
   */
  const handleTransactionClose = useCallback((): void => {
    handleAbort();
  }, [handleAbort]);

  /**
   * Handles closing the workflow from intro screen
   */
  const handleIntroClose = useCallback((): void => {
    onClose();
  }, [onClose]);

  // Fetch initial transaction count when visible
  useEffect(() => {
    if (visible && !isRefreshing && transactionCount === 0) {
      handleRefresh();
    }
  }, [visible, isRefreshing, transactionCount, handleRefresh]);

  // Don't render anything if not visible
  if (!visible) {
    return null;
  }

  // Show intro modal
  if (workflowState === 'intro' || workflowState === 'loading') {
    return (
      <MacroIntroModal
        visible
        macroInfo={{
          id: macro.id,
          name: macro.name,
          description: macro.description,
        }}
        transactionCount={transactionCount}
        isRefreshing={isRefreshing || workflowState === 'loading'}
        onRefresh={handleRefresh}
        onContinue={handleContinue}
        onClose={handleIntroClose}
      />
    );
  }

  // Show transaction modals during execution
  if (workflowState === 'executing' && transactions.length > 0) {
    const currentTransaction = transactions[currentTransactionIndex];
    if (currentTransaction) {
      return (
        <TransactionModal
          visible
          transaction={currentTransaction.transaction}
          onClose={handleTransactionClose}
          onTransactionComplete={handleTransactionSuccess}
          // Add workflow progress info if the modal supports it
          workflowProgress={{
            current: currentTransactionIndex + 1,
            total: transactions.length,
            macroName: macro.name,
          }}
        />
      );
    }
  }

  // For completed/aborted states, don't show anything
  // (alerts handle the user feedback)
  return null;
}
