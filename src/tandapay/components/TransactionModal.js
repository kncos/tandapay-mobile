// @flow

import React, { useCallback, useState, useContext, useMemo } from 'react';
import { View, Text, Modal, ScrollView, StyleSheet } from 'react-native';
import type { Node } from 'react';

import type { WriteTransaction } from '../contract/tandapay-writer/writeTransactionObjects';
import TransactionParameterForm from './TransactionParameterForm';
import TransactionEstimateAndSend from './TransactionEstimateAndSend';
import { useTransactionForm } from '../hooks/useTransactionForm';
import { createTandaPayContractWithSignerFromState, isTandaPayAvailable } from '../services/ContractInstanceManager';
import { ThemeContext } from '../../styles';
import { useSelector } from '../../react-redux';
import { getTandaPaySelectedNetwork } from '../redux/selectors';
import { getAvailableTokens } from '../tokens/tokenSelectors';
import { convertCurrencyParameters } from '../definitions';
import type {
  TransactionParams,
  EstimateGasCallback,
  SendTransactionCallback,
  GasEstimate,
} from './TransactionEstimateAndSend';
import { TandaPayColors } from '../styles';
import Card from './Card';
import ZulipText from '../../common/ZulipText';
import CloseButton from './CloseButton';

type Props = $ReadOnly<{|
  visible: boolean,
  transaction: ?WriteTransaction,
  onClose: () => void,
  onTransactionComplete?: (result: any) => void,
  workflowProgress?: ?{|
    current: number,
    total: number,
    macroName: string,
  |},
|}>;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: TandaPayColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 20,
  },
  workflowProgress: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  workflowText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  noParamsMessage: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  noParamsText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default function TransactionModal(props: Props): Node {
  const { visible, transaction, onClose, onTransactionComplete, workflowProgress } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const themeData = useContext(ThemeContext);
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const availableTokens = useSelector(getAvailableTokens);
  const reduxState = useSelector(state => state);

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
    estimateGasFunction: async () => ({
      success: true,
      data: {
        gasLimit: '21000',
        maxFeePerGas: '20',
        maxPriorityFeePerGas: '1.5',
        estimatedTotalCostETH: '0.00042',
        isEIP1559: true,
        baseFeePerGas: '18.5',
      },
    }),
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

    //! here
    try {
      // Check if contract is deployed on the selected network
      if (!isTandaPayAvailable(selectedNetwork, reduxState)) {
        return {
          success: false,
          error: `TandaPay contract not deployed on ${selectedNetwork}. Please check the network configuration or contact support.`,
        };
      }

      // Create contract instance with signer
      const contractResult = await createTandaPayContractWithSignerFromState(selectedNetwork, reduxState);
      if (!contractResult.success) {
        return {
          success: false,
          error: contractResult.error.userMessage || 'Failed to connect to TandaPay contract',
        };
      }

      const contract = contractResult.data;
      const paramValues = getParameterValues();

      // Convert currency parameters from human-readable to smallest units
      const convertedParams = convertCurrencyParameters(
        paramValues,
        // $FlowFixMe[incompatible-call] - transaction types are compatible for this function
        (transaction: any),
        selectedNetwork,
        availableTokens
      );

      // FIRST: Simulate the transaction to check if it would succeed
      // This prevents UNPREDICTABLE_GAS_LIMIT errors by checking transaction validity first
      const simulationResult = await transaction.simulateFunction(contract, ...convertedParams);
      if (!simulationResult.success) {
        // If simulation fails, the transaction would revert
        return {
          success: false,
          error: simulationResult.error || 'Transaction would revert - this operation is not valid at this time',
          originalError: simulationResult.originalError,
        };
      }

      // SECOND: Only estimate gas if simulation succeeds
      const gasEstimateFunction = transaction.estimateGasFunction;
      if (!gasEstimateFunction) {
        return {
          success: false,
          error: 'Gas estimation not available for this transaction',
          originalError: 'Gas estimation function not available for this transaction type',
        };
      }

      const gasEstimateResult = await gasEstimateFunction(contract, ...convertedParams);

      if (!gasEstimateResult.success) {
        return {
          success: false,
          error: gasEstimateResult.error?.userMessage || gasEstimateResult.error?.message || 'Failed to estimate gas',
          originalError: gasEstimateResult.error?.message || String(gasEstimateResult.error),
        };
      }

      const gasData = gasEstimateResult.data;
      return {
        success: true,
        gasEstimate: {
          gasLimit: gasData.gasLimit,
          gasPrice: gasData.maxFeePerGas, // Use maxFeePerGas for display
          estimatedCost: gasData.estimatedTotalCostETH, // Real maximum cost
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to estimate gas',
        originalError: error.message || String(error),
      };
    }
  }, [transaction, getParameterValues, selectedNetwork, reduxState, availableTokens]);

  // Transaction simulation and execution callback
  const handleSendTransaction: SendTransactionCallback = useCallback(async (params: TransactionParams, gasEstimate: GasEstimate) => {
    if (!transaction) {
      return {
        success: false,
        error: 'No transaction selected',
      };
    }

    //! here
    setIsSubmitting(true);
    try {
      // Check if contract is deployed on the selected network
      if (!isTandaPayAvailable(selectedNetwork, reduxState)) {
        return {
          success: false,
          error: `TandaPay contract not deployed on ${selectedNetwork}. Please check the network configuration or contact support.`,
        };
      }

      // Create contract instance with signer
      const contractResult = await createTandaPayContractWithSignerFromState(selectedNetwork, reduxState);
      if (!contractResult.success) {
        return {
          success: false,
          error: contractResult.error.userMessage || 'Failed to connect to TandaPay contract',
        };
      }

      const contract = contractResult.data;
      const paramValues = getParameterValues();

      // Convert currency parameters from human-readable to smallest units
      const convertedParams = convertCurrencyParameters(
        paramValues,
        // $FlowFixMe[incompatible-call] - transaction types are compatible for this function
        (transaction: any),
        selectedNetwork,
        availableTokens
      );

      // First, simulate the transaction
      const simulationResult = await transaction.simulateFunction(contract, ...convertedParams);
      if (!simulationResult.success) {
        return {
          success: false,
          error: simulationResult.error || 'Transaction simulation failed',
          originalError: simulationResult.originalError,
        };
      }

      // If simulation succeeds, execute the actual transaction
      const txResult = await transaction.writeFunction(contract, ...convertedParams);

      return {
        success: true,
        txHash: txResult.hash,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Transaction failed',
        originalError: error.message || String(error),
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [transaction, getParameterValues, selectedNetwork, reduxState, availableTokens]);

  // Transaction success callback
  const handleTransactionSuccess = useCallback((txHash: string) => {
    if (onTransactionComplete) {
      onTransactionComplete({ success: true, txHash });
    }

    // Only close the modal if we're NOT in a workflow (transaction chain)
    // If we're in a workflow, let the workflow logic handle modal state
    if (!workflowProgress) {
      onClose();
    }
  }, [onTransactionComplete, onClose, workflowProgress]);

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Card style={styles.modalCard}>
          <View style={[styles.header, { borderBottomColor: themeData.dividerColor }]}>
            <ZulipText style={[styles.title, { color: themeData.color }]}>
              {transaction.displayName}
            </ZulipText>
            <CloseButton onPress={onClose} />
          </View>

          {workflowProgress && (
            <View style={[styles.workflowProgress, { backgroundColor: themeData.backgroundColor }]}>
              <ZulipText style={[styles.workflowText, { color: themeData.color }]}>
                {`${workflowProgress.macroName} - Step ${workflowProgress.current} of ${workflowProgress.total}`}
              </ZulipText>
            </View>
          )}

          <Text style={[styles.description, { color: themeData.color }]}>{transaction.description}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {transaction.requiresParams && transaction.parameters ? (
              <TransactionParameterForm
                transaction={transaction}
                formState={formState}
                onParameterChange={updateParameter}
              />
            ) : (
              <View style={[styles.noParamsMessage, { backgroundColor: themeData.backgroundColor }]}>
                <Text style={[styles.noParamsText, { color: themeData.color }]}>
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
        </Card>
      </View>
    </Modal>
  );
}
