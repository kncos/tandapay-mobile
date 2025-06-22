/* @flow strict-local */

import React, { useState, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import { TandaPayColors, TandaPayTypography } from '../styles';
import { ThemeContext } from '../../styles';
import AddressInput from './AddressInput';
import Card from './Card';

type Props = $ReadOnly<{|
  addresses: string[],
  onAddressesChange: (addresses: string[]) => void,
  label: string,
  description?: string,
  maxAddresses?: number,
  disabled?: boolean,
  style?: ?{},
|}>;

const customStyles = {
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    ...TandaPayTypography.label,
  },
  description: {
    ...TandaPayTypography.description,
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 12,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressContainer: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: TandaPayColors.error,
  },
  removeIcon: {
    color: TandaPayColors.white,
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 8,
  },
  emptyText: {
    ...TandaPayTypography.description,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 8,
  },
  disabledContainer: {
    opacity: 0.6,
  },
};

export default function AddressArrayInput(props: Props): Node {
  const {
    addresses,
    onAddressesChange,
    label,
    description,
    maxAddresses = 10,
    disabled = false,
    style,
  } = props;

  const [newAddress, setNewAddress] = useState('');
  const themeData = useContext(ThemeContext);

  // Create dynamic styles that use theme context
  const dynamicStyles = {
    ...customStyles,
    emptyState: {
      ...customStyles.emptyState,
      borderColor: themeData.dividerColor,
    },
    emptyText: {
      ...customStyles.emptyText,
      color: themeData.color,
      opacity: 0.6,
    },
  };

  // Validate Ethereum address
  const validateAddress = useCallback((address: string): boolean => {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  }, []);

  // Add a new address to the list
  const handleAddAddress = useCallback(() => {
    if (!newAddress.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    if (!validateAddress(newAddress)) {
      Alert.alert('Error', 'Please enter a valid Ethereum address');
      return;
    }

    // Check for duplicates
    const normalizedNewAddress = ethers.utils.getAddress(newAddress);
    const normalizedAddresses = addresses.map(addr => ethers.utils.getAddress(addr));

    if (normalizedAddresses.includes(normalizedNewAddress)) {
      Alert.alert('Error', 'This address is already in the list');
      return;
    }

    // Check max limit
    if (addresses.length >= maxAddresses) {
      Alert.alert('Error', `Maximum ${maxAddresses} addresses allowed`);
      return;
    }

    onAddressesChange([...addresses, normalizedNewAddress]);
    setNewAddress('');
  }, [newAddress, addresses, onAddressesChange, validateAddress, maxAddresses]);

  // Remove an address from the list
  const handleRemoveAddress = useCallback((index: number) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    onAddressesChange(newAddresses);
  }, [addresses, onAddressesChange]);

  // Format address for display (truncate middle)
  const formatAddress = useCallback((address: string): string => {
    if (address.length <= 42) {
      return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  return (
    <View style={[customStyles.container, style]}>
      <View style={customStyles.header}>
        <ZulipText style={customStyles.label}>{label}</ZulipText>
        <ZulipText style={TandaPayTypography.description}>
          {addresses.length}
          /
          {maxAddresses}
        </ZulipText>
      </View>

      {description != null && description !== '' && (
        <ZulipText style={customStyles.description}>
          {description}
        </ZulipText>
      )}

      <Card style={disabled ? customStyles.disabledContainer : null}>
        {/* Address List */}
        {addresses.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <ZulipText style={dynamicStyles.emptyText}>
              No addresses added yet
            </ZulipText>
          </View>
        ) : (
          addresses.map((address, index) => (
            <View key={address} style={customStyles.addressItem}>
              <View style={customStyles.addressContainer}>
                <ZulipText style={TandaPayTypography.body}>
                  {formatAddress(address)}
                </ZulipText>
                <ZulipText style={[TandaPayTypography.description, { fontSize: 10 }]}>
                  {address}
                </ZulipText>
              </View>
              {!disabled && (
                <TouchableOpacity
                  style={customStyles.removeButton}
                  onPress={() => handleRemoveAddress(index)}
                >
                  <Icon name="remove" size={16} style={customStyles.removeIcon} />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {/* Add New Address */}
        {!disabled && addresses.length < maxAddresses && (
          <>
            <AddressInput
              value={newAddress}
              onChangeText={setNewAddress}
              placeholder="Enter Ethereum address"
              showQRButton
            />
            <ZulipButton
              style={customStyles.addButton}
              text="Add Address"
              onPress={handleAddAddress}
              disabled={!newAddress.trim()}
            />
          </>
        )}
      </Card>
    </View>
  );
}
