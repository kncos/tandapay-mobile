// @flow strict-local

import React, { useCallback, useContext, useState, useEffect } from 'react';
import type { Node } from 'react';
import { View, Modal, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import Card from './Card';
import CloseButton from './CloseButton';
import TandaPayStyles from '../styles';
import ModalStyles from '../styles/modals';
import { QUARTER_COLOR } from '../../styles/constants';
import { ThemeContext } from '../../styles';

import type { WriteTransaction } from '../contract/tandapay-writer/writeTransactionObjects';

/**
 * Macro definition for the new simplified system
 */
export type MacroDefinition = {|
  +id: string,
  +name: string,
  +description: string,
  +icon?: string,
  +generateTransactions: () => Promise<WriteTransaction[]>,
  +refresh: () => void | Promise<void>,
|};

/**
 * Macro chain configuration
 */
export type MacroChainConfig = {|
  +currentMacro: MacroDefinition,
  +nextMacros?: MacroDefinition[],
  +onChainComplete?: () => void | Promise<void>,
|};

type Props = $ReadOnly<{|
  visible: boolean,
  macroChainConfig: ?MacroChainConfig,
  onClose: () => void,
  onMacroChainAdvance?: (nextConfig: MacroChainConfig) => void,
  onStartTransactionChain: (transactions: WriteTransaction[], macroName: string, onComplete?: () => Promise<void>) => void,
|}>;

const styles = StyleSheet.create({
  transactionInfo: {
    ...TandaPayStyles.caption,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  loadingText: {
    ...TandaPayStyles.caption,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 16,
  },
});

/**
 * A modal component for introducing and managing macro transaction chains.
 * Displays macro information and provides controls for executing multi-transaction workflows.
 */
export default function MacroIntroModal(props: Props): Node {
  const { visible, macroChainConfig, onClose, onMacroChainAdvance, onStartTransactionChain } = props;
  const themeData = useContext(ThemeContext);
  const [transactionCount, setTransactionCount] = useState<?number>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const currentMacro = macroChainConfig?.currentMacro;

  const handleRefresh = useCallback(async () => {
    if (!currentMacro) {
      return;
    }

    setIsRefreshing(true);
    try {
      await currentMacro.refresh();
      // Re-generate transaction count
      const transactions = await currentMacro.generateTransactions();
      setTransactionCount(transactions.length);
    } catch (error) {
      setTransactionCount(0);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentMacro]);

  const handleMacroComplete = useCallback(async () => {
    if (!macroChainConfig) {
      return;
    }

    const { nextMacros, onChainComplete } = macroChainConfig;

    if (nextMacros && nextMacros.length > 0) {
      // Move to next macro in chain
      const [nextMacro, ...remainingMacros] = nextMacros;
      const nextChainConfig: MacroChainConfig = {
        currentMacro: nextMacro,
        nextMacros: remainingMacros,
        onChainComplete,
      };

      if (onMacroChainAdvance) {
        onMacroChainAdvance(nextChainConfig);
      }
    } else {
      // Chain complete
      if (onChainComplete) {
        await onChainComplete();
      }
      onClose();
    }
  }, [macroChainConfig, onClose, onMacroChainAdvance]);

  const handleContinue = useCallback(async () => {
    if (!currentMacro || !macroChainConfig) {
      return;
    }

    try {
      // Generate transactions for current macro
      const transactions = await currentMacro.generateTransactions();

      if (transactions.length === 0) {
        // No transactions needed, move to next macro immediately
        await handleMacroComplete();
        return;
      }

      // Start transaction chain for current macro
      // Note: handleMacroComplete should only be called when ALL transactions complete, not after each one
      onStartTransactionChain(transactions, currentMacro.name, handleMacroComplete);
    } catch (error) {
      // Handle error - could show an alert or refresh
      await handleRefresh();
    }
  }, [currentMacro, macroChainConfig, onStartTransactionChain, handleMacroComplete, handleRefresh]);

  // Load initial transaction count when visible
  useEffect(() => {
    if (currentMacro && visible && !isRefreshing && transactionCount === null) {
      const loadInitialData = async () => {
        setIsRefreshing(true);
        try {
          const transactions = await currentMacro.generateTransactions();
          setTransactionCount(transactions.length);
        } catch (error) {
          setTransactionCount(0);
        } finally {
          setIsRefreshing(false);
        }
      };

      loadInitialData();
    }
  }, [currentMacro, visible, isRefreshing, transactionCount]);

  // Reset transaction count when macro changes
  useEffect(() => {
    setTransactionCount(null);
  }, [currentMacro?.id]);

  if (!currentMacro) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={ModalStyles.overlay}>
        <Card style={[ModalStyles.modalCard, { backgroundColor: themeData.cardColor }]}>
          <View style={[ModalStyles.header, { borderBottomColor: QUARTER_COLOR }]}>
            <ZulipText style={[ModalStyles.title, { color: themeData.color }]} text={currentMacro.name} />
            <CloseButton onPress={onClose} />
          </View>

          <ZulipText
            style={[TandaPayStyles.body, { color: themeData.color, marginBottom: 24 }]}
            text={currentMacro.description}
          />

          {transactionCount != null && transactionCount > 0 && (
            <ZulipText
              style={styles.transactionInfo}
              text={`This macro will execute ${transactionCount} transaction${transactionCount === 1 ? '' : 's'}.`}
            />
          )}

          {transactionCount != null && transactionCount === 0 && !isRefreshing && (
            <ZulipText
              style={styles.transactionInfo}
              text="No transactions needed - the community is already in the desired state."
            />
          )}

          {isRefreshing && (
            <ZulipText
              style={styles.loadingText}
              text="Loading macro data..."
            />
          )}

          <View style={styles.buttonContainer}>
            <View style={TandaPayStyles.buttonRow}>
              <ZulipButton
                style={TandaPayStyles.button}
                text="Refresh Data"
                onPress={handleRefresh}
                secondary
                progress={isRefreshing}
                disabled={isRefreshing}
              />
            </View>
            <View style={TandaPayStyles.buttonRow}>
              <ZulipButton
                style={TandaPayStyles.button}
                text="Continue"
                onPress={handleContinue}
                progress={isRefreshing}
                disabled={isRefreshing}
              />
            </View>
          </View>
        </Card>
      </View>
    </Modal>
  );
}
