/* @flow strict-local */

import React, { useState, useContext, useCallback, useMemo } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';
import { useSelector } from '../../react-redux';
import { getSelectedToken } from '../tokens/tokenSelectors';
import { getTandaPaySelectedNetwork } from '../tandaPaySelectors';
import { transferToken, estimateTransferGas } from '../web3';
import { getWalletInstance } from './WalletManager';
import { AddressInput, AmountInput, validateEthereumAddress } from '../components';

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
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [gasEstimate, setGasEstimate] = useState<?{| gasLimit: string, gasPrice: string, estimatedCost: string |}>(null);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [walletInstance, setWalletInstance] = useState(null);

  // Load wallet instance lazily (only when needed)
  const getWallet = useCallback(async () => {
    if (walletInstance) {
      return walletInstance;
    }

    try {
      const wallet = await getWalletInstance();
      setWalletInstance(wallet);
      return wallet;
    } catch (error) {
      Alert.alert('Error', 'Failed to load wallet. Please try again.');
      navigation.goBack();
      return null;
    }
  }, [walletInstance, navigation]);

  // Memoize form validation to prevent unnecessary re-renders
  const isFormValid = useMemo(() =>
    toAddress.trim() && amount.trim() && !loading,
  [toAddress, amount, loading]);

  const handleEstimateGas = useCallback(async () => {
    setEstimating(true);

    const estimate = async () => {
      if (!toAddress.trim() || !amount.trim()) {
        Alert.alert('Missing Information', 'Please enter recipient address and amount.');
        setEstimating(false);
        return;
      }

      if (!validateEthereumAddress(toAddress.trim())) {
        Alert.alert('Invalid Address', 'Please enter a valid Ethereum address');
        setEstimating(false);
        return;
      }

      const wallet = await getWallet();
      if (!wallet?.address) {
        Alert.alert('Error', 'Wallet not loaded properly. Please try again.');
        setEstimating(false);
        return;
      }

      if (!selectedToken) {
        Alert.alert('Error', 'No token selected. Please select a token first.');
        setEstimating(false);
        return;
      }

      try {
        const result = await estimateTransferGas(
          selectedToken,
          ethers.utils.getAddress(wallet.address.toLowerCase()), // Ensure proper address checksumming
          ethers.utils.getAddress(toAddress.trim().toLowerCase()), // Convert to lowercase first to handle mixed-case input
          amount.trim(),
          selectedNetwork, // Use selected network from Redux
        );

        if (result.success && result.gasEstimate != null && result.gasPrice != null) {
          const gasLimitValue = result.gasEstimate;
          const gasPriceValue = result.gasPrice;
          const estimatedCost = ((parseFloat(gasLimitValue) * parseFloat(gasPriceValue)) / 1e9).toFixed(8);
          setGasEstimate({
            gasLimit: gasLimitValue,
            gasPrice: gasPriceValue,
            estimatedCost,
          });
        } else {
          Alert.alert('Gas Estimation Failed 1', result.error ?? 'Unable to estimate gas costs.');
        }
      } catch (error) {
        Alert.alert('Gas Estimation Failed', error.message ?? 'Unable to estimate gas costs.');
      } finally {
        setEstimating(false);
      }
    };

    setTimeout(estimate, 0); // Use setTimeout to ensure state updates are applied before async operation
  }, [toAddress, amount, getWallet, selectedToken, selectedNetwork]);

  const handleSend = useCallback(async () => {
    if (!toAddress.trim() || !amount.trim()) {
      Alert.alert('Missing Information', 'Please enter recipient address and amount.');
      return;
    }

    if (!gasEstimate) {
      Alert.alert('No Gas Estimate', 'Please estimate gas costs first.');
      return;
    }

    if (!validateEthereumAddress(toAddress.trim())) {
      Alert.alert('Invalid Address', 'Please enter a valid Ethereum address.');
      return;
    }

    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ${selectedToken?.symbol || 'tokens'} to ${toAddress}?\n\nEstimated Gas: ${gasEstimate.gasLimit} units\nGas Price: ${gasEstimate.gasPrice} gwei\nEstimated Cost: ${gasEstimate.estimatedCost} ETH`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Get wallet private key for transaction
              const wallet = await getWallet();
              if (!wallet?.privateKey) {
                throw new Error('Unable to access wallet private key');
              }

              if (!selectedToken) {
                throw new Error('No token selected');
              }

              const result = await transferToken(
                selectedToken,
                wallet.privateKey,
                ethers.utils.getAddress(toAddress.trim().toLowerCase()), // Convert to lowercase first to handle mixed-case input
                amount.trim(),
                selectedNetwork,
              );

              if (result.success && result.txHash != null) {
                Alert.alert(
                  'Transaction Sent!',
                  `Your transaction has been submitted to the network.\n\nTransaction Hash: ${result.txHash}\n\nIt may take a few minutes to confirm.`,
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
  }, [toAddress, amount, gasEstimate, selectedToken, navigation, getWallet, selectedNetwork]);

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

  return (
    <Screen title="Send" canGoBack>
      <View style={styles.container}>
        <ZulipText style={styles.warningText}>
          ⚠️ This transaction will be sent on Ethereum Sepolia testnet
        </ZulipText>

        {/* Token Info */}
        <View style={[styles.tokenInfo, { backgroundColor: themeData.cardColor }]}>
          <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
            Sending
            {' '}
            {selectedToken.symbol}
          </ZulipText>
          <ZulipText style={{ opacity: 0.7, fontSize: 14 }}>
            {selectedToken.name}
          </ZulipText>
        </View>

        {/* Send Form */}
        <View style={styles.section}>
          <AddressInput
            value={toAddress}
            onChangeText={setToAddress}
            label="Recipient Address"
            placeholder="0x..."
            disabled={loading || estimating}
          />

          <AmountInput
            value={amount}
            onChangeText={setAmount}
            tokenSymbol={selectedToken.symbol}
            tokenDecimals={selectedToken.decimals}
            label="Amount"
            disabled={loading || estimating}
          />

          <ZulipButton
            disabled={!isFormValid || estimating}
            progress={estimating}
            text="Estimate Gas"
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
