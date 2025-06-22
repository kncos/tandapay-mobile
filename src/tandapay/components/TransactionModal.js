// @flow

import React, { useCallback, useState, useContext, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import type { Node } from 'react';

import type { WriteTransaction } from '../contract/writeTransactionObjects';
import TransactionParameterForm from './TransactionParameterForm';
import TransactionEstimateAndSend from './TransactionEstimateAndSend';
import { useTransactionForm } from '../hooks/useTransactionForm';
import { createTandaPayContractWithSigner } from '../services/ContractInstanceManager';
import { isContractDeployed } from '../config/TandaPayConfig';
import { ThemeContext } from '../../styles';
import { useSelector } from '../../react-redux';
import { getTandaPaySelectedNetwork } from '../redux/selectors';
import { HALF_COLOR, QUARTER_COLOR } from '../../styles/constants';
import type {
  TransactionParams,
  EstimateGasCallback,
  SendTransactionCallback,
  GasEstimate,
} from './TransactionEstimateAndSend';

type Props = $ReadOnly<{|
  visible: boolean,
  transaction: ?WriteTransaction,
  onClose: () => void,
  onTransactionComplete?: (result: any) => void,
|}>;

export default function TransactionModal(props: Props): Node {
  const { visible, transaction, onClose, onTransactionComplete } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const themeData = useContext(ThemeContext);
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);

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
    getParameterValues,
    isValidForGasEstimation,
  } = useTransactionForm(activeTransaction);

  // Prepare transaction parameters for the EstimateAndSend component
  const transactionParams: TransactionParams = useMemo(() => {
    const params = {};
    if (transaction?.parameters) {
      transaction.parameters.forEach((param) => {
        params[param.name] = formState.parameters[param.name];
      });
    }
    return params;
  }, [transaction, formState.parameters]);

  // Gas estimation callback
  const handleEstimateGas: EstimateGasCallback = useCallback(async (params: TransactionParams) => {
    if (!transaction?.estimateGasFunction) {
      return {
        success: false,
        error: 'Gas estimation not available for this transaction',
      };
    }

    try {
      // Check if network is supported
      if (selectedNetwork === 'custom') {
        return {
          success: false,
          error: 'TandaPay transactions are not supported on custom networks. Please switch to a supported network.',
        };
      }

      // Check if contract is deployed on the selected network
      if (!isContractDeployed(selectedNetwork)) {
        return {
          success: false,
          error: `TandaPay contract not deployed on ${selectedNetwork}. Please check the network configuration or contact support.`,
        };
      }

      // Create contract instance with signer
      const contractResult = await createTandaPayContractWithSigner(selectedNetwork);
      if (!contractResult.success) {
        return {
          success: false,
          error: contractResult.error.userMessage || 'Failed to connect to TandaPay contract',
        };
      }

      const contract = contractResult.data;
      const paramValues = getParameterValues();
      const gasEstimateFunction = transaction.estimateGasFunction;

      if (!gasEstimateFunction) {
        throw new Error('Gas estimation function not available');
      }

      const gasEstimate = await gasEstimateFunction(contract, ...paramValues);

      return {
        success: true,
        gasEstimate: {
          gasLimit: gasEstimate.toString(),
          gasPrice: '20', // TODO: Get actual gas price from network
          estimatedCost: '0.00042', // TODO: Calculate actual cost
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to estimate gas',
      };
    }
  }, [transaction, getParameterValues, selectedNetwork]);

  // Transaction simulation and execution callback
  const handleSendTransaction: SendTransactionCallback = useCallback(async (params: TransactionParams, gasEstimate: GasEstimate) => {
    if (!transaction) {
      return {
        success: false,
        error: 'No transaction selected',
      };
    }

    setIsSubmitting(true);
    try {
      // Check if network is supported
      if (selectedNetwork === 'custom') {
        return {
          success: false,
          error: 'TandaPay transactions are not supported on custom networks. Please switch to a supported network.',
        };
      }

      // Check if contract is deployed on the selected network
      if (!isContractDeployed(selectedNetwork)) {
        return {
          success: false,
          error: `TandaPay contract not deployed on ${selectedNetwork}. Please check the network configuration or contact support.`,
        };
      }

      // Create contract instance with signer
      const contractResult = await createTandaPayContractWithSigner(selectedNetwork);
      if (!contractResult.success) {
        return {
          success: false,
          error: contractResult.error.userMessage || 'Failed to connect to TandaPay contract',
        };
      }

      const contract = contractResult.data;
      const paramValues = getParameterValues();

      // First, simulate the transaction
      const simulationResult = await transaction.simulateFunction(contract, ...paramValues);
      if (!simulationResult.success) {
        return {
          success: false,
          error: simulationResult.error || 'Transaction simulation failed',
        };
      }

      // If simulation succeeds, execute the actual transaction
      const txResult = await transaction.writeFunction(contract, ...paramValues);

      return {
        success: true,
        txHash: txResult.hash,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Transaction failed',
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [transaction, getParameterValues, selectedNetwork]);

  // Transaction success callback
  const handleTransactionSuccess = useCallback((txHash: string) => {
    if (onTransactionComplete) {
      onTransactionComplete({ success: true, txHash });
    }
    onClose();
  }, [onTransactionComplete, onClose]);

  // Transaction error callback
  const handleTransactionError = useCallback((error: string) => {
    if (onTransactionComplete) {
      onTransactionComplete({ success: false, error });
    }
  }, [onTransactionComplete]);

  // Custom confirmation message
  const getConfirmationMessage = useCallback((params: TransactionParams, gasEstimate: GasEstimate) => {
    if (!transaction) {
      return '';
    }

    const paramText = transaction.parameters
      ? transaction.parameters.map(param =>
          `${param.label}: ${String(params[param.name] ?? 'N/A')}`
        ).join('\n')
      : 'No parameters required';

    return `Execute ${transaction.displayName}?\n\n${paramText}\n\nEstimated Gas: ${gasEstimate.gasLimit} units\nGas Price: ${gasEstimate.gasPrice} gwei\nEstimated Cost: ${gasEstimate.estimatedCost} ETH`;
  }, [transaction]);

  if (!transaction) {
    return null;
  }

  const styles = {
    overlay: {
      flex: 1,
      backgroundColor: HALF_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modal: {
      backgroundColor: themeData.cardColor,
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
      color: themeData.color,
      flex: 1,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: QUARTER_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 24,
      color: themeData.color,
      fontWeight: 'bold',
    },
    description: {
      fontSize: 14,
      color: themeData.color,
      opacity: 0.7,
      marginBottom: 20,
      lineHeight: 20,
    },
    scrollView: {
      maxHeight: 300,
      marginBottom: 20,
    },
    noParamsMessage: {
      padding: 16,
      backgroundColor: themeData.backgroundColor,
      borderRadius: 12,
      marginBottom: 16,
    },
    noParamsText: {
      fontSize: 14,
      color: themeData.color,
      opacity: 0.6,
      fontStyle: 'italic',
      textAlign: 'center',
    },
  };

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

            {/* Transaction Estimate and Send Component */}
            <TransactionEstimateAndSend
              transactionParams={transactionParams}
              onEstimateGas={handleEstimateGas}
              onSendTransaction={handleSendTransaction}
              estimateButtonText="Estimate Gas"
              sendButtonText={`Execute ${transaction.displayName}`}
              transactionDescription={transaction.displayName.toLowerCase()}
              isFormValid={isValidForGasEstimation}
              confirmationTitle="Confirm Transaction"
              getConfirmationMessage={getConfirmationMessage}
              onTransactionSuccess={handleTransactionSuccess}
              onTransactionError={handleTransactionError}
              disabled={isSubmitting}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
