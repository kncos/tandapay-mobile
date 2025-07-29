/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, Alert, TouchableOpacity, Modal, StyleSheet } from 'react-native';

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';
// $FlowFixMe[untyped-import]
import { BarCodeScanner } from 'expo-barcode-scanner';
import Icon from 'react-native-vector-icons/MaterialIcons';

import TandaPayErrorHandler from '../errors/ErrorHandler';

import Input from '../../common/Input';
import ZulipText from '../../common/ZulipText';
import { TandaPayColors, TandaPayTypography, TandaPayComponents, TandaPayLayout } from '../styles';
import ErrorText from './ErrorText';

type Props = $ReadOnly<{|
  value: string,
  onChangeText: (address: string) => void,
  placeholder?: string,
  label?: string,
  style?: ?{},
  disabled?: boolean,
  showQRButton?: boolean,
|}>;

// Create only the styles that need customization beyond our centralized styles
const customStyles = StyleSheet.create({
  qrButtonIcon: {
    color: TandaPayColors.white,
  },
  scannerModal: {
    flex: 1,
    backgroundColor: TandaPayColors.black,
  },
  scannerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  permissionText: {
    color: TandaPayColors.white,
    textAlign: 'center',
    marginHorizontal: 20,
    fontSize: 16,
  },
});

/**
 * A component for inputting and validating Ethereum addresses with QR code scanning support.
 * Provides real-time validation and optional QR code scanner for easy address input.
 */
export default function AddressInput(props: Props): Node {
  const {
    value,
    onChangeText,
    placeholder = '0x...',
    label = 'Address',
    style,
    disabled = false,
    showQRButton = true,
  } = props;

  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [addressError, setAddressError] = useState('');

  // Validate Ethereum address with proper checksumming
  const validateAddress = useCallback((address: string): boolean => {
    const result = TandaPayErrorHandler.withSyncErrorHandling(() => {
      ethers.utils.getAddress(address.toLowerCase()); // Convert to lowercase first to handle mixed-case input
      return true;
    }, 'VALIDATION_ERROR');

    return result.success;
  }, []);

  // Handle address input change with validation
  const handleAddressChange = useCallback((address: string) => {
    onChangeText(address);
    setAddressError('');

    if (address.length > 0 && !validateAddress(address)) {
      setAddressError('Invalid Ethereum address format');
    }
  }, [onChangeText, validateAddress]);

  // Request camera permission and open QR scanner
  const handleOpenScanner = useCallback(async () => {
    if (disabled) {
      return;
    }

    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status === 'granted') {
      setShowScanner(true);
    } else {
      Alert.alert('Camera Permission', 'Camera permission is required to scan QR codes.');
    }
  }, [disabled]);

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
      onChangeText(scannedAddress);
      setAddressError('');
    } else {
      Alert.alert('Invalid QR Code', 'The scanned QR code does not contain a valid Ethereum address.');
    }
  }, [onChangeText, validateAddress]);

  return (
    <View style={style ? [TandaPayLayout.inputContainer, style] : TandaPayLayout.inputContainer}>
      {label && <ZulipText style={TandaPayTypography.label}>{label}</ZulipText>}

      <View style={TandaPayComponents.addressRow}>
        <Input
          style={TandaPayComponents.address}
          placeholder={placeholder}
          value={value}
          onChangeText={handleAddressChange}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />

        {showQRButton && (
          <TouchableOpacity
            style={[TandaPayComponents.qr, disabled && TandaPayComponents.qrDisabled]}
            onPress={handleOpenScanner}
            disabled={disabled}
          >
            <Icon name="qr-code-scanner" size={20} style={customStyles.qrButtonIcon} />
          </TouchableOpacity>
        )}
      </View>

      {addressError ? (
        <ErrorText>{addressError}</ErrorText>
      ) : null}

      {/* QR Scanner Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showScanner}
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={customStyles.scannerModal}>
          <TouchableOpacity
            style={TandaPayComponents.close}
            onPress={() => setShowScanner(false)}
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>

          <View style={customStyles.scannerContainer}>
            {hasPermission === null ? (
              <ZulipText style={customStyles.permissionText}>
                Requesting camera permission...
              </ZulipText>
            ) : hasPermission === false ? (
              <ZulipText style={customStyles.permissionText}>
                No camera access. Please grant camera permission in settings.
              </ZulipText>
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
  );
}

// Export validation function for external use
export const validateEthereumAddress = (address: string): boolean => {
  const result = TandaPayErrorHandler.withSyncErrorHandling(() => {
    ethers.utils.getAddress(address.toLowerCase());
    return true;
  }, 'VALIDATION_ERROR');

  return result.success;
};
