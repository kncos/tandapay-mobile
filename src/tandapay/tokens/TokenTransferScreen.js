// @flow strict-local

import React, { useState, useContext } from 'react';
import type { Node } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';

import { useSelector } from '../../react-redux';
import { ThemeContext, createStyleSheet } from '../../styles';
import { getSelectedToken } from './tokenSelectors';
import { transferToken, estimateTransferGas } from '../web3';
import Screen from '../../common/Screen';
import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import Input from '../../common/Input';

type Props = {|
  navigation: {|
    goBack: () => void,
  |},
  walletAddress: string,
  privateKey: string, // In real app, this should be securely managed
|};

const styles = createStyleSheet({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  gasEstimate: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
  },
});

export default function TokenTransferScreen({ navigation, walletAddress, privateKey }: Props): Node {
  const themeData = useContext(ThemeContext);
  const selectedToken = useSelector(getSelectedToken);

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [gasEstimate, setGasEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);

  // Return early if no token is selected
  if (!selectedToken) {
    return (
      <Screen title="Send Tokens" canGoBack>
        <View style={styles.container}>
          <ZulipText style={{ textAlign: 'center', marginTop: 50 }}>
            No token selected. Please select a token first.
          </ZulipText>
        </View>
      </Screen>
    );
  }

  const handleEstimateGas = async () => {
    if (!toAddress.trim() || !amount.trim()) {
      Alert.alert('Missing Information', 'Please enter recipient address and amount.');
      return;
    }

    setEstimating(true);
    try {
      const result = await estimateTransferGas(
        selectedToken,
        walletAddress,
        toAddress.trim(),
        amount.trim(),
        'sepolia', // In real app, this should be configurable
      );

      if (result.success && result.gasEstimate != null && result.gasPrice != null) {
        setGasEstimate({
          gasLimit: result.gasEstimate,
          gasPrice: result.gasPrice,
          estimatedCost: ((parseFloat(result.gasEstimate) * parseFloat(result.gasPrice)) / 1e9).toFixed(8),
        });
      } else {
        Alert.alert('Gas Estimation Failed', result.error ?? 'Unable to estimate gas costs.');
      }
    } catch (error) {
      Alert.alert('Gas Estimation Failed', error.message ?? 'Unable to estimate gas costs.');
    } finally {
      setEstimating(false);
    }
  };

  const handleTransfer = async () => {
    if (!toAddress.trim() || !amount.trim()) {
      Alert.alert('Missing Information', 'Please enter recipient address and amount.');
      return;
    }

    if (!gasEstimate) {
      Alert.alert('No Gas Estimate', 'Please estimate gas costs first.');
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Send ${amount} ${selectedToken.symbol} to ${toAddress}?

Estimated Gas: ${gasEstimate.gasLimit} units
Gas Price: ${gasEstimate.gasPrice} gwei`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await transferToken(
                selectedToken,
                privateKey,
                toAddress.trim(),
                amount.trim(),
                'sepolia',
              );

              if (result.success && result.txHash != null) {
                Alert.alert(
                  'Transfer Successful',
                  `Transaction hash: ${result.txHash}`,
                  [{ text: 'OK', onPress: () => navigation.goBack() }],
                );
              } else {
                Alert.alert('Transfer Failed', result.error ?? 'Unknown error occurred.');
              }
            } catch (error) {
              Alert.alert('Transfer Failed', error.message ?? 'An unexpected error occurred.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const isFormValid = toAddress.trim() && amount.trim() && !loading;

  return (
    <Screen title="Send Tokens" canGoBack>
      <View style={styles.container}>
        {/* Token Info */}
        <View style={styles.section}>
          <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            Sending
            {' '}
            {selectedToken.symbol}
          </ZulipText>
          <ZulipText style={{ opacity: 0.7 }}>
            {selectedToken.name}
          </ZulipText>
        </View>

        {/* Transfer Form */}
        <View style={styles.section}>
          <Input
            style={styles.input}
            placeholder="Recipient Address (0x...)"
            value={toAddress}
            onChangeText={setToAddress}
            autoCapitalize="none"
          />

          <Input
            style={styles.input}
            placeholder={`Amount in ${selectedToken.symbol}`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <ZulipButton
            disabled={!isFormValid || estimating}
            text={estimating ? 'Estimating...' : 'Estimate Gas'}
            onPress={handleEstimateGas}
          />
        </View>

        {/* Gas Estimate */}
        {gasEstimate && (
          <View style={[styles.gasEstimate, { backgroundColor: themeData.cardColor }]}>
            <ZulipText style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              Gas Estimate
            </ZulipText>

            <View style={styles.row}>
              <ZulipText style={styles.label}>Gas Limit:</ZulipText>
              <ZulipText>
                {gasEstimate.gasLimit}
                {' '}
                units
              </ZulipText>
            </View>

            <View style={styles.row}>
              <ZulipText style={styles.label}>Gas Price:</ZulipText>
              <ZulipText>
                {gasEstimate.gasPrice}
                {' '}
                gwei
              </ZulipText>
            </View>

            <View style={styles.row}>
              <ZulipText style={styles.label}>Estimated Cost:</ZulipText>
              <ZulipText>
                {gasEstimate.estimatedCost}
                {' '}
                ETH
              </ZulipText>
            </View>
          </View>
        )}

        {/* Transfer Button */}
        {gasEstimate && (
          <ZulipButton
            disabled={!isFormValid}
            text={loading ? 'Sending...' : `Send ${selectedToken.symbol}`}
            onPress={handleTransfer}
            style={{ backgroundColor: loading ? '#999' : '#4CAF50' }}
          />
        )}

        {loading && (
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <ActivityIndicator size="large" />
            <ZulipText style={{ marginTop: 8, textAlign: 'center' }}>
              Processing transaction...
            </ZulipText>
          </View>
        )}
      </View>
    </Screen>
  );
}
