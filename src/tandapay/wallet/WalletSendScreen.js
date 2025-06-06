/* @flow strict-local */

import React, { useState, useContext, useCallback, useMemo } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';
// $FlowFixMe[untyped-import]
import { BarCodeScanner } from 'expo-barcode-scanner';
// $FlowFixMe[untyped-import]
import Icon from 'react-native-vector-icons/MaterialIcons';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import Input from '../../common/Input';
import { ThemeContext } from '../../styles';
import { useSelector } from '../../react-redux';
import { getSelectedToken } from '../tokens/tokenSelectors';
import { getTandaPaySelectedNetwork } from '../tandaPaySelectors';
import { transferToken, estimateTransferGas } from '../web3';
import { getWalletInstance } from './WalletManager';
import { BRAND_COLOR } from '../../styles/constants';

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
  addressInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressInput: {
    flex: 1,
    marginRight: 8,
  },
  qrButton: {
    padding: 10,
    borderRadius: 4,
    backgroundColor: BRAND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButtonIcon: {
    color: 'white',
  },
  scannerModal: {
    flex: 1,
    backgroundColor: 'black',
  },
  scannerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  scannerCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    padding: 10,
    zIndex: 1,
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
  const [addressError, setAddressError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

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

  // Validate Ethereum address with proper checksumming
  const validateAddress = useCallback((address: string): boolean => {
    try {
      ethers.utils.getAddress(address.toLowerCase()); // Convert to lowercase first to handle mixed-case input
      return true;
    } catch {
      return false;
    }
  }, []);

  // Request camera permission and open QR scanner
  const handleOpenScanner = useCallback(async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status === 'granted') {
      setShowScanner(true);
    } else {
      Alert.alert('Camera Permission', 'Camera permission is required to scan QR codes.');
    }
  }, []);

  // Handle QR code scan result
  const handleBarCodeScanned = useCallback(({ type, data }) => {
    setShowScanner(false);

    // Extract address from QR code data
    let scannedAddress = data;

    // Handle ethereum: URI format
    if (data.startsWith('ethereum:')) {
      const match = data.match(/ethereum:([0-9a-fA-F]{40})/);
      if (match) {
        scannedAddress = `0x${match[1]}`;
      }
    }

    // Validate the scanned address
    if (validateAddress(scannedAddress)) {
      setToAddress(scannedAddress);
      setAddressError('');
    } else {
      Alert.alert('Invalid QR Code', 'The scanned QR code does not contain a valid Ethereum address.');
    }
  }, [validateAddress]);

  const handleAddressChange = useCallback((address: string) => {
    setToAddress(address);
    setAddressError('');

    if (address.length > 0 && !validateAddress(address)) {
      setAddressError('Invalid Ethereum address format');
    }
  }, [validateAddress]);

  // Validate amount format and value
  const validateAmount = useCallback((amountValue: string): string => {
    if (!amountValue.trim()) {
      return '';
    }

    const numericAmount = parseFloat(amountValue);
    if (Number.isNaN(numericAmount)) {
      return 'Please enter a valid number';
    }

    if (numericAmount <= 0) {
      return 'Amount must be greater than 0';
    }

    // Check decimal places
    const parts = amountValue.split('.');
    if (parts.length === 2 && selectedToken && parts[1].length > selectedToken.decimals) {
      return `Maximum ${selectedToken.decimals} decimal places allowed for ${selectedToken.symbol}`;
    }

    return '';
  }, [selectedToken]);

  const [amountError, setAmountError] = useState('');

  const handleAmountChange = useCallback((value: string) => {
    // Allow only numbers and one decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return; // Don't update if multiple decimal points
    }

    // Validate decimal places don't exceed token decimals
    if (parts.length === 2 && selectedToken && parts[1].length > selectedToken.decimals) {
      return; // Don't update if too many decimal places
    }

    setAmount(numericValue);
    setAmountError(validateAmount(numericValue));
  }, [selectedToken, validateAmount]);

  // Memoize form validation to prevent unnecessary re-renders
  const isFormValid = useMemo(() =>
    toAddress.trim() && amount.trim() && !loading && !addressError && !amountError,
  [toAddress, amount, loading, addressError, amountError]);

  const handleEstimateGas = useCallback(async () => {
    setEstimating(true);

    const estimate = async () => {
      if (!toAddress.trim() || !amount.trim()) {
        Alert.alert('Missing Information', 'Please enter recipient address and amount.');
        setEstimating(false);
        return;
      }

      if (!validateAddress(toAddress.trim())) {
        setAddressError('Please enter a valid Ethereum address');
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
  }, [toAddress, amount, validateAddress, getWallet, selectedToken, selectedNetwork]);

  const handleSend = useCallback(async () => {
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
  }, [toAddress, amount, gasEstimate, validateAddress, selectedToken, navigation, getWallet, selectedNetwork]);

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
          <ZulipText style={styles.label}>Recipient Address</ZulipText>
          <View style={styles.addressInputRow}>
            <Input
              style={[styles.input, styles.addressInput]}
              placeholder="0x..."
              value={toAddress}
              onChangeText={handleAddressChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.qrButton} onPress={handleOpenScanner}>
              <Icon name="qr-code-scanner" size={20} style={styles.qrButtonIcon} />
            </TouchableOpacity>
          </View>
          {addressError ? (
            <ZulipText style={styles.errorText}>{addressError}</ZulipText>
          ) : null}

          <ZulipText style={styles.label}>Amount</ZulipText>
          <Input
            style={styles.input}
            placeholder={`Amount in ${selectedToken.symbol} (max ${selectedToken.decimals} decimal places)`}
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
          />
          {amountError ? (
            <ZulipText style={styles.errorText}>{amountError}</ZulipText>
          ) : null}

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

        {/* QR Scanner Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showScanner}
          onRequestClose={() => setShowScanner(false)}
        >
          <View style={styles.scannerModal}>
            <TouchableOpacity
              style={styles.scannerCloseButton}
              onPress={() => setShowScanner(false)}
            >
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.scannerContainer}>
              {hasPermission === null ? (
                <ZulipText>Requesting camera permission...</ZulipText>
              ) : hasPermission === false ? (
                <ZulipText>No camera access. Please grant camera permission in settings.</ZulipText>
              ) : (
                <BarCodeScanner
                  onBarCodeScanned={handleBarCodeScanned}
                  style={{ flex: 1 }}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </Screen>
  );
}
