/* @flow strict-local */

import React, { useState, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View, TouchableOpacity, Alert, StyleSheet } from 'react-native';

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import { TandaPayTypography } from '../styles';
import FormStyles from '../styles/forms';
import { ThemeContext } from '../../styles';
import AddressInput from './AddressInput';
import Card from './Card';
import ScrollableTextBox from './ScrollableTextBox';
import { ExpectedSuccessorCounts } from '../contract/constants';

type Props = $ReadOnly<{|
  addresses: string[],
  onAddressesChange: (addresses: string[]) => void,
  label: string,
  description?: string,
  maxAddresses?: number,
  minAddresses?: number,
  disabled?: boolean,
  style?: ?{},
|}>;

const customStyles = StyleSheet.create({
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align to top since ScrollableTextBox has its own height
    marginBottom: 8,
  },
});

/**
 * A component for managing an array of Ethereum addresses with validation.
 * Allows users to add, remove, and validate multiple Ethereum addresses with min/max limits.
 */
export default function AddressArrayInput(props: Props): Node {
  const {
    addresses,
    onAddressesChange,
    label,
    description,
    maxAddresses = ExpectedSuccessorCounts.communityLargerThan35,
    minAddresses = 0,
    disabled = false,
    style,
  } = props;

  const [newAddress, setNewAddress] = useState('');
  const themeData = useContext(ThemeContext);

  // Create dynamic styles that use theme context
  const dynamicStyles = {
    emptyState: {
      ...FormStyles.emptyState,
      borderColor: themeData.dividerColor,
    },
    emptyText: {
      ...FormStyles.emptyText,
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

  return (
    <View style={[FormStyles.container, style]}>
      <View style={FormStyles.header}>
        <ZulipText style={FormStyles.label}>{label}</ZulipText>
        <ZulipText style={TandaPayTypography.description}>
          {addresses.length}
          /
          {maxAddresses}
        </ZulipText>
      </View>

      {description != null && description !== '' && (
        <ZulipText style={FormStyles.description}>
          {description}
        </ZulipText>
      )}

      {/* Validation feedback for minimum requirement */}
      {minAddresses > 0 && addresses.length < minAddresses && (
        <ZulipText style={[TandaPayTypography.description, { color: '#ff4444', marginTop: 4, marginBottom: 8 }]}>
          At least
          {' '}
          {minAddresses}
          {' '}
          address
          {minAddresses === 1 ? ' is' : 'es are'}
          {' '}
          required
        </ZulipText>
      )}

      <Card style={disabled ? FormStyles.disabledContainer : null}>
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
              <View style={{ flex: 1, marginRight: 8 }}>
                <ScrollableTextBox
                  text={address}
                  label={`Address ${index + 1}`}
                />
              </View>
              {!disabled && (
                <TouchableOpacity
                  style={[FormStyles.removeButton, { marginTop: 12 }]} // Align with middle of ScrollableTextBox
                  onPress={() => handleRemoveAddress(index)}
                >
                  <Icon name="remove" size={16} style={FormStyles.removeIcon} />
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
              style={FormStyles.addButton}
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
