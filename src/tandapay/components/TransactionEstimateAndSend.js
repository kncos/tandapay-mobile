/* @flow strict-local */

import React, { useState, useCallback, useEffect } from 'react';
import type { Node } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import { TandaPayColors, TandaPayTypography } from '../styles';
import { useBalanceInvalidation } from '../hooks/useBalanceInvalidation';
import { useSelector, useGlobalSelector } from '../../react-redux';
import { getTandaPaySelectedNetwork, getTandaPayCustomRpcConfig } from '../redux/selectors';
import { getGlobalSettings } from '../../directSelectors';
import { getNetworkConfig } from '../providers/ProviderManager';
import { openLinkWithUserPreference } from '../../utils/openLink';
import { showToast } from '../../utils/info';
import Card from './Card';

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

// Encapsulated transaction function type
export type TransactionFunction = () => Promise<{|
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

// Custom styles for this component
const customStyles = {
  container: {
    marginTop: 16,
  },
  gasEstimateTitle: {
    ...TandaPayTypography.sectionTitle,
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
};

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

  const { invalidateAllTokens } = useBalanceInvalidation();
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const customRpcConfig = useSelector(getTandaPayCustomRpcConfig);
  const globalSettings = useGlobalSelector(getGlobalSettings);
  const [gasEstimate, setGasEstimate] = useState<?GasEstimate>(null);
  const [estimating, setEstimating] = useState(false);
  const [sending, setSending] = useState(false);
  const [showingConfirmation, setShowingConfirmation] = useState(false);
  // Store the transaction function created during gas estimation
  const [transactionFunction, setTransactionFunction] = useState<?TransactionFunction>(null);

  // Get explorer URL for the current network
  const getExplorerUrl = useCallback((txHash: string): string | null => {
    try {
      if (selectedNetwork === 'custom' && customRpcConfig?.blockExplorerUrl != null && customRpcConfig.blockExplorerUrl !== '') {
        return `${customRpcConfig.blockExplorerUrl}/tx/${txHash}`;
      } else if (selectedNetwork !== 'custom') {
        const networkConfig = getNetworkConfig(selectedNetwork);
        if (networkConfig.blockExplorerUrl != null && networkConfig.blockExplorerUrl !== '') {
          return `${networkConfig.blockExplorerUrl}/tx/${txHash}`;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }, [selectedNetwork, customRpcConfig]);

  const handleEstimateGas = useCallback(async () => {
    if (!isFormValid) {
      Alert.alert('Form Invalid', 'Please complete all required fields before estimating gas.');
      return;
    }

    // Prevent multiple estimation requests
    if (estimating) {
      return;
    }

    setEstimating(true);
    setGasEstimate(null);
    setTransactionFunction((): ?TransactionFunction => null);

    try {
      // Capture the current transaction parameters at estimation time
      const capturedParams = { ...transactionParams };

      const result = await onEstimateGas(capturedParams);

      if (result.success && result.gasEstimate) {
        const capturedGasEstimate = result.gasEstimate;
        setGasEstimate(capturedGasEstimate);

        // Create a transaction function that uses the captured parameters and gas estimate
        const txFunction: TransactionFunction = async () =>
          onSendTransaction(capturedParams, capturedGasEstimate);

        // Use function form of setState to avoid React treating the function as a state updater
        setTransactionFunction((): TransactionFunction => txFunction);
      } else {
        Alert.alert('Gas Estimation Failed', result.error ?? 'Unable to estimate gas costs.');
      }
    } catch (error) {
      Alert.alert('Gas Estimation Failed', error.message ?? 'An unexpected error occurred.');
    } finally {
      setEstimating(false);
    }
  }, [isFormValid, onEstimateGas, onSendTransaction, transactionParams, estimating]);

  const handleSendTransaction = useCallback(async () => {
    if (!gasEstimate || !transactionFunction) {
      Alert.alert('No Gas Estimate', 'Please estimate gas costs first.');
      return;
    }

    // Prevent multiple confirmation dialogs
    if (showingConfirmation || sending) {
      return;
    }

    setShowingConfirmation(true);

    const defaultConfirmationMessage = `Are you sure you want to proceed with this ${transactionDescription}?\n\nEstimated Gas: ${gasEstimate.gasLimit} units\nGas Price: ${gasEstimate.gasPrice} gwei\nEstimated Cost: ${gasEstimate.estimatedCost} ETH`;

    const confirmationMessage = getConfirmationMessage
      ? getConfirmationMessage(transactionParams, gasEstimate)
      : defaultConfirmationMessage;

    Alert.alert(
      confirmationTitle,
      confirmationMessage,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setShowingConfirmation(false);
          },
        },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            // Prevent multiple transactions by checking if already sending
            if (sending) {
              setShowingConfirmation(false);
              return;
            }

            setSending(true);
            try {
              // Use the stored transaction function with captured parameters
              const result = await transactionFunction();

              if (result.success && result.txHash != null && result.txHash !== '') {
                // ...existing success handling...
                const successMessage = `Your ${transactionDescription} has been submitted to the network.\n\nTransaction Hash: ${result.txHash}\n\nIt may take a few minutes to confirm.`;
                const explorerUrl = getExplorerUrl(result.txHash);

                // Create buttons array based on available features
                const buttons = [];

                // Copy to Clipboard button
                buttons.push({
                  text: 'Copy Hash',
                  onPress: () => {
                    if (result.txHash != null) {
                      Clipboard.setString(result.txHash);
                      showToast('Transaction hash copied to clipboard');
                    }
                  },
                });

                // View in Explorer button (only if explorer URL is available)
                if (explorerUrl != null) {
                  buttons.push({
                    text: 'View in Explorer',
                    onPress: () => {
                      const explorerUrlObj = new URL(explorerUrl);
                      openLinkWithUserPreference(explorerUrlObj, globalSettings);
                    },
                  });
                }

                // OK button
                buttons.push({
                  text: 'OK',
                  style: 'cancel',
                  onPress: () => {
                    // Invalidate all token balances to force refresh on next visit
                    invalidateAllTokens();

                    if (result.txHash != null) {
                      onTransactionSuccess?.(result.txHash);
                    }
                  },
                });

                Alert.alert(
                  'Transaction Sent!',
                  successMessage,
                  buttons,
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
              setShowingConfirmation(false);
            }
          },
        },
      ],
    );
  }, [
    gasEstimate,
    transactionFunction,
    transactionDescription,
    confirmationTitle,
    getConfirmationMessage,
    transactionParams,
    onTransactionSuccess,
    onTransactionError,
    getExplorerUrl,
    globalSettings,
    invalidateAllTokens,
    showingConfirmation,
    sending,
  ]);

  const renderDefaultGasEstimate = (estimate: GasEstimate): Node => (
    <Card style={{ marginBottom: 16, marginTop: 16 }}>
      <ZulipText style={customStyles.gasEstimateTitle}>
        Gas Estimate
      </ZulipText>

      <View style={customStyles.row}>
        <ZulipText style={customStyles.label}>Gas Limit:</ZulipText>
        <ZulipText>
          {estimate.gasLimit}
          {' '}
          units
        </ZulipText>
      </View>

      <View style={customStyles.row}>
        <ZulipText style={customStyles.label}>Gas Price:</ZulipText>
        <ZulipText>
          {estimate.gasPrice}
          {' '}
          gwei
        </ZulipText>
      </View>

      <View style={customStyles.row}>
        <ZulipText style={customStyles.label}>Estimated Cost:</ZulipText>
        <ZulipText>
          {estimate.estimatedCost}
          {' '}
          ETH
        </ZulipText>
      </View>
    </Card>
  );

  // Clear stored transaction function when transaction parameters change
  // This forces users to re-estimate gas if they change inputs
  useEffect(() => {
    setGasEstimate(null);
    setTransactionFunction((): ?TransactionFunction => null);
  }, [transactionParams]);

  return (
    <View style={customStyles.container}>
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
          disabled={!isFormValid || sending || showingConfirmation || disabled}
          text={sending ? 'Processing...' : sendButtonText}
          onPress={handleSendTransaction}
          style={{
            ...customStyles.sendButton,
            backgroundColor: (sending || showingConfirmation) ? TandaPayColors.disabled : TandaPayColors.success,
          }}
        />
      )}

      {/* Loading Indicator */}
      {sending && (
        <View style={customStyles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ZulipText style={customStyles.loadingText}>
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
