// @flow

import React, { useCallback, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert, ScrollView } from 'react-native';
import type { Node } from 'react';

import type { WriteTransaction } from '../contract/writeTransactionObjects';
import TransactionParameterForm from './TransactionParameterForm';
import { useTransactionForm } from '../hooks/useTransactionForm';
import { TandaPayColors } from '../styles';

type Props = $ReadOnly<{|
  visible: boolean,
  transaction: ?WriteTransaction,
  onClose: () => void,
  onTransactionComplete?: (result: any) => void,
|}>;

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: TandaPayColors.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TandaPayColors.gray900,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TandaPayColors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: TandaPayColors.gray600,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: TandaPayColors.gray700,
    marginBottom: 20,
    lineHeight: 20,
  },
  scrollView: {
    maxHeight: 300,
    marginBottom: 20,
  },
  noParamsMessage: {
    padding: 16,
    backgroundColor: TandaPayColors.gray100,
    borderRadius: 12,
  },
  noParamsText: {
    fontSize: 14,
    color: TandaPayColors.gray600,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: TandaPayColors.gray200,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: TandaPayColors.gray700,
  },
  submitButton: {
    backgroundColor: TandaPayColors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: TandaPayColors.gray400,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: TandaPayColors.white,
  },
};

export default function TransactionModal(props: Props): Node {
  const { visible, transaction, onClose, onTransactionComplete } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create a default transaction to avoid conditional hook usage
  const defaultTransaction = {
    functionName: '',
    displayName: '',
    description: '',
    role: 'public',
    requiresParams: false,
    icon: () => null,
    parameters: [],
    writeFunction: async () => ({}),
    simulateFunction: async () => ({
      success: false,
      result: null,
      gasEstimate: null,
      error: 'No transaction'
    }),
    estimateGasFunction: async () => 21000,
  };

  const activeTransaction = transaction || defaultTransaction;

  const {
    formState,
    updateParameter,
    validateForm,
  } = useTransactionForm(activeTransaction);

  const handleTransactionSubmit = useCallback(async () => {
    if (!transaction) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate form first
      const isValid = validateForm();
      if (!isValid) {
        Alert.alert('Validation Error', 'Please fix the form errors before submitting.');
        return;
      }

      // Get parameter values and execute transaction
      // const parameterValues = getParameterValues();

      // TODO: Replace with actual contract execution
      // const result = await transaction.writeFunction(contract, ...parameterValues);
      // For now, we acknowledge that we have the parameter values ready for execution

      // Simulate transaction for now
      const result = { success: true, hash: '0x...' };

      if (result.success) {
        Alert.alert(
          'Transaction Successful',
          `${transaction.displayName} transaction completed successfully!`,
          [{ text: 'OK', onPress: onClose }]
        );
        if (onTransactionComplete) {
          onTransactionComplete(result);
        }
      } else {
        Alert.alert(
          'Transaction Failed',
          'Transaction failed to execute',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Transaction Error',
        error.message || 'An unexpected error occurred',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [transaction, validateForm, onClose, onTransactionComplete]);

  if (!transaction) {
    return null;
  }

  const { isValid } = formState;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{transaction.displayName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>{transaction.description}</Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {transaction.requiresParams && transaction.parameters ? (
              <TransactionParameterForm
                transaction={transaction}
                formState={formState}
                onParameterChange={updateParameter}
              />
            ) : (
              <View style={styles.noParamsMessage}>
                <Text style={styles.noParamsText}>
                  This transaction requires no additional parameters.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (!isValid || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleTransactionSubmit}
              disabled={!isValid || isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Processing...' : 'Execute Transaction'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
