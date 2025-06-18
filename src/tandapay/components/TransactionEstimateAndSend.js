/* @flow strict-local */

import React, { useState, useContext, useCallback } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';

import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';

export type GasEstimate = {|
  gasLimit: string,
  gasPrice: string,
  estimatedCost: string,
|};

export type TransactionParams = {|
  +[key: string]: mixed,
|};

export type EstimateGasCallback = (params: TransactionParams) => Promise<{|
  success: boolean,
  gasEstimate?: GasEstimate,
  error?: string,
|}>;

export type SendTransactionCallback = (params: TransactionParams, gasEstimate: GasEstimate) => Promise<{|
  success: boolean,
  txHash?: string,
  error?: string,
|}>;

type Props = $ReadOnly<{|
  // Transaction parameters to pass to callbacks
  transactionParams: TransactionParams,

  // Callbacks for gas estimation and transaction sending
  onEstimateGas: EstimateGasCallback,
  onSendTransaction: SendTransactionCallback,

  // UI Configuration
  estimateButtonText?: string,
  sendButtonText?: string,
  transactionDescription?: string,

  // Validation
  isFormValid: boolean,
  disabled?: boolean,

  // Optional custom gas estimate renderer
  renderGasEstimate?: (gasEstimate: GasEstimate) => Node,

  // Optional confirmation dialog customization
  confirmationTitle?: string,
  getConfirmationMessage?: (params: TransactionParams, gasEstimate: GasEstimate) => string,

  // Success/Error callbacks
  onTransactionSuccess?: (txHash: string) => void,
  onTransactionError?: (error: string) => void,
|}>;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  gasEstimate: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 16,
  },
  gasEstimateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
  },
  sendButton: {
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loadingText: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default function TransactionEstimateAndSend(props: Props): Node {
  const {
    transactionParams,
    onEstimateGas,
    onSendTransaction,
    estimateButtonText = 'Estimate Gas',
    sendButtonText = 'Send Transaction',
    transactionDescription = 'transaction',
    isFormValid,
    disabled = false,
    renderGasEstimate,
    confirmationTitle = 'Confirm Transaction',
    getConfirmationMessage,
    onTransactionSuccess,
    onTransactionError,
  } = props;

  const themeData = useContext(ThemeContext);
  const [gasEstimate, setGasEstimate] = useState<?GasEstimate>(null);
  const [estimating, setEstimating] = useState(false);
  const [sending, setSending] = useState(false);

  const handleEstimateGas = useCallback(async () => {
    if (!isFormValid) {
      Alert.alert('Form Invalid', 'Please complete all required fields before estimating gas.');
      return;
    }

    setEstimating(true);
    setGasEstimate(null);

    try {
      const result = await onEstimateGas(transactionParams);

      if (result.success && result.gasEstimate) {
        setGasEstimate(result.gasEstimate);
      } else {
        Alert.alert('Gas Estimation Failed', result.error ?? 'Unable to estimate gas costs.');
      }
    } catch (error) {
      Alert.alert('Gas Estimation Failed', error.message ?? 'An unexpected error occurred.');
    } finally {
      setEstimating(false);
    }
  }, [isFormValid, onEstimateGas, transactionParams]);

  const handleSendTransaction = useCallback(async () => {
    if (!gasEstimate) {
      Alert.alert('No Gas Estimate', 'Please estimate gas costs first.');
      return;
    }

    const defaultConfirmationMessage = `Are you sure you want to proceed with this ${transactionDescription}?\n\nEstimated Gas: ${gasEstimate.gasLimit} units\nGas Price: ${gasEstimate.gasPrice} gwei\nEstimated Cost: ${gasEstimate.estimatedCost} ETH`;

    const confirmationMessage = getConfirmationMessage
      ? getConfirmationMessage(transactionParams, gasEstimate)
      : defaultConfirmationMessage;

    Alert.alert(
      confirmationTitle,
      confirmationMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            setSending(true);
            try {
              const result = await onSendTransaction(transactionParams, gasEstimate);

              if (result.success && result.txHash != null && result.txHash !== '') {
                const successMessage = `Your ${transactionDescription} has been submitted to the network.\n\nTransaction Hash: ${result.txHash}\n\nIt may take a few minutes to confirm.`;

                Alert.alert(
                  'Transaction Sent!',
                  successMessage,
                  [{
                    text: 'OK',
                    onPress: () => {
                      if (result.txHash != null) {
                        onTransactionSuccess?.(result.txHash);
                      }
                    },
                  }],
                );
              } else {
                const errorMessage = result.error ?? 'Unknown error occurred.';
                Alert.alert('Transaction Failed', errorMessage);
                onTransactionError?.(errorMessage);
              }
            } catch (error) {
              const errorMessage = error.message ?? 'An unexpected error occurred.';
              Alert.alert('Transaction Failed', errorMessage);
              onTransactionError?.(errorMessage);
            } finally {
              setSending(false);
            }
          },
        },
      ],
    );
  }, [
    gasEstimate,
    transactionDescription,
    confirmationTitle,
    getConfirmationMessage,
    transactionParams,
    onSendTransaction,
    onTransactionSuccess,
    onTransactionError,
  ]);

  const renderDefaultGasEstimate = (estimate: GasEstimate): Node => (
    <View style={[styles.gasEstimate, { backgroundColor: themeData.cardColor }]}>
      <ZulipText style={styles.gasEstimateTitle}>
        Gas Estimate
      </ZulipText>

      <View style={styles.row}>
        <ZulipText style={styles.label}>Gas Limit:</ZulipText>
        <ZulipText>
          {estimate.gasLimit}
          {' '}
          units
        </ZulipText>
      </View>

      <View style={styles.row}>
        <ZulipText style={styles.label}>Gas Price:</ZulipText>
        <ZulipText>
          {estimate.gasPrice}
          {' '}
          gwei
        </ZulipText>
      </View>

      <View style={styles.row}>
        <ZulipText style={styles.label}>Estimated Cost:</ZulipText>
        <ZulipText>
          {estimate.estimatedCost}
          {' '}
          ETH
        </ZulipText>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Estimate Gas Button */}
      <ZulipButton
        disabled={!isFormValid || estimating || disabled}
        progress={estimating}
        text={estimateButtonText}
        onPress={handleEstimateGas}
      />

      {/* Gas Estimate Display */}
      {gasEstimate && (
        renderGasEstimate ? renderGasEstimate(gasEstimate) : renderDefaultGasEstimate(gasEstimate)
      )}

      {/* Send Transaction Button */}
      {gasEstimate && (
        <ZulipButton
          disabled={!isFormValid || sending || disabled}
          text={sending ? 'Processing...' : sendButtonText}
          onPress={handleSendTransaction}
          style={{
            ...styles.sendButton,
            backgroundColor: sending ? '#999' : '#4CAF50',
          }}
        />
      )}

      {/* Loading Indicator */}
      {sending && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ZulipText style={styles.loadingText}>
            Processing
            {' '}
            {transactionDescription}
            ...
          </ZulipText>
        </View>
      )}
    </View>
  );
}
