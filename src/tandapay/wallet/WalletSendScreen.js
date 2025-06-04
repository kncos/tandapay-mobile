/* @flow strict-local */

import React, { useState, useEffect, useContext } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import Input from '../../common/Input';
import { ThemeContext } from '../../styles';
import { useSelector } from '../../react-redux';
import { getSelectedToken } from '../tokens/tokenSelectors';
import { transferToken, estimateTransferGas } from '../web3';
import { getWalletInstance } from './WalletManager';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet-send'>,
  route: RouteProp<'wallet-send', void>,
|}>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  tokenInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  gasEstimate: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  warningText: {
    color: '#ff9800',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default function WalletSendScreen(props: Props): Node {
  const { navigation } = props;
  const themeData = useContext(ThemeContext);
  const selectedToken = useSelector(getSelectedToken);

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [gasEstimate, setGasEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [walletInstance, setWalletInstance] = useState(null);
  const [addressError, setAddressError] = useState('');

  // Load wallet instance on mount
  useEffect(() => {
    const loadWallet = async () => {
      try {
        const wallet = await getWalletInstance();
        setWalletInstance(wallet);
      } catch (error) {
        Alert.alert('Error', 'Failed to load wallet. Please try again.');
        navigation.goBack();
      }
    };
    loadWallet();
  }, [navigation]);

  // Validate Ethereum address
  const validateAddress = (address: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const handleAddressChange = (address: string) => {
    setToAddress(address);
    setAddressError('');
    
    if (address.length > 0 && !validateAddress(address)) {
      setAddressError('Invalid Ethereum address format');
    }
  };

  const handleEstimateGas = async () => {
    if (!toAddress.trim() || !amount.trim()) {
      Alert.alert('Missing Information', 'Please enter recipient address and amount.');
      return;
    }

    if (!validateAddress(toAddress.trim())) {
      setAddressError('Please enter a valid Ethereum address');
      return;
    }

    if (!walletInstance?.address) {
      Alert.alert('Error', 'Wallet not loaded properly. Please try again.');
      return;
    }

    if (!selectedToken) {
      Alert.alert('Error', 'No token selected. Please select a token first.');
      return;
    }

    setEstimating(true);
    try {
      const result = await estimateTransferGas(
        selectedToken,
        walletInstance.address,
        toAddress.trim(),
        amount.trim(),
        'sepolia', // Using testnet for now
      );

      if (result.success && result.gasEstimate != null && result.gasPrice != null) {
        const estimatedCost = ((parseFloat(result.gasEstimate) * parseFloat(result.gasPrice)) / 1e9).toFixed(8);
        setGasEstimate({
          gasLimit: result.gasEstimate,
          gasPrice: result.gasPrice,
          estimatedCost,
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

  const handleSend = async () => {
    if (!toAddress.trim() || !amount.trim()) {
      Alert.alert('Missing Information', 'Please enter recipient address and amount.');
      return;
    }

    if (!gasEstimate) {
      Alert.alert('No Gas Estimate', 'Please estimate gas costs first.');
      return;
    }

    if (!validateAddress(toAddress.trim())) {
      Alert.alert('Invalid Address', 'Please enter a valid Ethereum address.');
      return;
    }

    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ${selectedToken?.symbol || 'tokens'} to ${toAddress}?

Estimated Gas: ${gasEstimate.gasLimit} units
Gas Price: ${gasEstimate.gasPrice} gwei
Estimated Cost: ${gasEstimate.estimatedCost} ETH`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Get wallet private key for transaction
              const wallet = await getWalletInstance();
              if (!wallet?.privateKey) {
                throw new Error('Unable to access wallet private key');
              }

              const result = await transferToken(
                selectedToken,
                wallet.privateKey,
                toAddress.trim(),
                amount.trim(),
                'sepolia',
              );

              if (result.success && result.txHash != null) {
                Alert.alert(
                  'Transaction Sent!',
                  `Your transaction has been submitted to the network.
                  
Transaction Hash: ${result.txHash}

It may take a few minutes to confirm.`,
                  [{ text: 'OK', onPress: () => navigation.goBack() }],
                );
              } else {
                Alert.alert('Transaction Failed', result.error ?? 'Unknown error occurred.');
              }
            } catch (error) {
              Alert.alert('Transaction Failed', error.message ?? 'An unexpected error occurred.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // Return early if no token is selected
  if (!selectedToken) {
    return (
      <Screen title="Send" canGoBack>
        <View style={styles.container}>
          <ZulipText style={{ textAlign: 'center', marginTop: 50, fontSize: 16 }}>
            No token selected. Please select a token in your wallet first.
          </ZulipText>
          <ZulipButton
            text="Go Back"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 20 }}
          />
        </View>
      </Screen>
    );
  }

  const isFormValid = toAddress.trim() && amount.trim() && !loading && !addressError;

  return (
    <Screen title="Send" canGoBack>
      <View style={styles.container}>
        <ZulipText style={styles.warningText}>
          ⚠️ This transaction will be sent on Ethereum Sepolia testnet
        </ZulipText>

        {/* Token Info */}
        <View style={[styles.tokenInfo, { backgroundColor: themeData.cardColor }]}>
          <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
            Sending {selectedToken.symbol}
          </ZulipText>
          <ZulipText style={{ opacity: 0.7, fontSize: 14 }}>
            {selectedToken.name}
          </ZulipText>
        </View>

        {/* Send Form */}
        <View style={styles.section}>
          <ZulipText style={styles.label}>Recipient Address</ZulipText>
          <Input
            style={styles.input}
            placeholder="0x..."
            value={toAddress}
            onChangeText={handleAddressChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {addressError ? (
            <ZulipText style={styles.errorText}>{addressError}</ZulipText>
          ) : null}

          <ZulipText style={styles.label}>Amount</ZulipText>
          <Input
            style={styles.input}
            placeholder={`Amount in ${selectedToken.symbol}`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <ZulipButton
            disabled={!isFormValid || estimating}
            text={estimating ? 'Estimating Gas...' : 'Estimate Gas'}
            onPress={handleEstimateGas}
            style={{ marginTop: 16 }}
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
              <ZulipText>{gasEstimate.gasLimit} units</ZulipText>
            </View>

            <View style={styles.row}>
              <ZulipText style={styles.label}>Gas Price:</ZulipText>
              <ZulipText>{gasEstimate.gasPrice} gwei</ZulipText>
            </View>

            <View style={styles.row}>
              <ZulipText style={styles.label}>Estimated Cost:</ZulipText>
              <ZulipText>{gasEstimate.estimatedCost} ETH</ZulipText>
            </View>
          </View>
        )}

        {/* Send Button */}
        {gasEstimate && (
          <ZulipButton
            disabled={!isFormValid}
            text={loading ? 'Sending...' : `Send ${selectedToken.symbol}`}
            onPress={handleSend}
            style={{ 
              backgroundColor: loading ? '#999' : '#4CAF50',
              marginTop: 16,
            }}
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
