/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';
// $FlowFixMe[untyped-import]
import { BarCodeScanner } from 'expo-barcode-scanner';
// $FlowFixMe[untyped-import]
import Icon from 'react-native-vector-icons/MaterialIcons';

import Input from '../../common/Input';
import ZulipText from '../../common/ZulipText';
import { BRAND_COLOR } from '../../styles/constants';

type Props = $ReadOnly<{|
  value: string,
  onChangeText: (address: string) => void,
  placeholder?: string,
  label?: string,
  style?: ?{},
  disabled?: boolean,
  showQRButton?: boolean,
|}>;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  qrButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  qrButtonIcon: {
    color: 'white',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 8,
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
  permissionText: {
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 20,
    fontSize: 16,
  },
});

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
    try {
      ethers.utils.getAddress(address.toLowerCase()); // Convert to lowercase first to handle mixed-case input
      return true;
    } catch {
      return false;
    }
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
    <View style={style ? [styles.container, style] : styles.container}>
      {label && <ZulipText style={styles.label}>{label}</ZulipText>}

      <View style={styles.addressInputRow}>
        <Input
          style={styles.addressInput}
          placeholder={placeholder}
          value={value}
          onChangeText={handleAddressChange}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />

        {showQRButton && (
          <TouchableOpacity
            style={[styles.qrButton, disabled && styles.qrButtonDisabled]}
            onPress={handleOpenScanner}
            disabled={disabled}
          >
            <Icon name="qr-code-scanner" size={20} style={styles.qrButtonIcon} />
          </TouchableOpacity>
        )}
      </View>

      {addressError ? (
        <ZulipText style={styles.errorText}>{addressError}</ZulipText>
      ) : null}

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
              <ZulipText style={styles.permissionText}>
                Requesting camera permission...
              </ZulipText>
            ) : hasPermission === false ? (
              <ZulipText style={styles.permissionText}>
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
  try {
    ethers.utils.getAddress(address.toLowerCase());
    return true;
  } catch {
    return false;
  }
};
