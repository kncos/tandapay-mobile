/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import { useSelector, useDispatch } from '../../react-redux';
import {
  getTandaPaySelectedNetwork,
  getTandaPayContractAddressForNetwork,
  getTandaPayContractAddresses
} from '../redux/selectors';
import { updateTandaPaySettings } from '../redux/actions';
import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import AddressInput from './AddressInput';
import Card from './Card';
import ContractDeploymentModal from './ContractDeploymentModal';
import TandaPayStyles, { TandaPayColors, TandaPayTypography } from '../styles';

type Props = $ReadOnly<{|
  disabled?: boolean,
|}>;

const customStyles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    ...TandaPayTypography.sectionTitle,
    marginBottom: 8,
  },
  description: {
    ...TandaPayTypography.body,
    color: TandaPayColors.disabled,
    marginBottom: 16,
  },
  networkLabel: {
    ...TandaPayTypography.label,
    marginBottom: 8,
  },
});

/**
 * A component for configuring TandaPay contract addresses per network.
 * Allows users to set, update, and deploy contract addresses for different blockchain networks.
 */
export default function ContractAddressConfiguration(props: Props): Node {
  const { disabled = false } = props;

  const dispatch = useDispatch();
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const contractAddresses = useSelector(getTandaPayContractAddresses);
  const currentAddress = useSelector(state => getTandaPayContractAddressForNetwork(state, selectedNetwork));

  const [addressInput, setAddressInput] = useState(currentAddress || '');
  const [saving, setSaving] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);

  // Update input when network changes
  React.useEffect(() => {
    setAddressInput(currentAddress || '');
  }, [currentAddress]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const trimmedAddress = addressInput.trim() || null;
      const newContractAddresses = { ...contractAddresses };

      // Use explicit assignment to avoid computed property issues
      if (selectedNetwork === 'mainnet') {
        newContractAddresses.mainnet = trimmedAddress;
      } else if (selectedNetwork === 'sepolia') {
        newContractAddresses.sepolia = trimmedAddress;
      } else if (selectedNetwork === 'arbitrum') {
        newContractAddresses.arbitrum = trimmedAddress;
      } else if (selectedNetwork === 'polygon') {
        newContractAddresses.polygon = trimmedAddress;
      } else if (selectedNetwork === 'custom') {
        newContractAddresses.custom = trimmedAddress;
      }

      dispatch(updateTandaPaySettings({
        contractAddresses: newContractAddresses,
      }));
    } finally {
      setSaving(false);
    }
  }, [dispatch, addressInput, selectedNetwork, contractAddresses]);

  const handleClear = useCallback(() => {
    setAddressInput('');
  }, []);

  const handleShowDeploymentModal = useCallback(() => {
    setShowDeploymentModal(true);
  }, []);

  const handleCloseDeploymentModal = useCallback(() => {
    setShowDeploymentModal(false);
  }, []);

  const handleDeploymentComplete = useCallback((contractAddress: string) => {
    setAddressInput(contractAddress);
    setShowDeploymentModal(false);
    // Auto-save the deployed address after a short delay
    setTimeout(async () => {
      setSaving(true);
      try {
        const newContractAddresses = { ...contractAddresses };

        if (selectedNetwork === 'mainnet') {
          newContractAddresses.mainnet = contractAddress;
        } else if (selectedNetwork === 'sepolia') {
          newContractAddresses.sepolia = contractAddress;
        } else if (selectedNetwork === 'arbitrum') {
          newContractAddresses.arbitrum = contractAddress;
        } else if (selectedNetwork === 'polygon') {
          newContractAddresses.polygon = contractAddress;
        } else if (selectedNetwork === 'custom') {
          newContractAddresses.custom = contractAddress;
        }

        dispatch(updateTandaPaySettings({
          contractAddresses: newContractAddresses,
        }));
      } finally {
        setSaving(false);
      }
    }, 100);
  }, [dispatch, selectedNetwork, contractAddresses]);

  const hasChanges = (addressInput.trim() || null) !== currentAddress;
  const isValidAddress = addressInput.trim() === '' || /^0x[a-fA-F0-9]{40}$/.test(addressInput.trim());
  const isOperationInProgress = saving;

  return (
    <Card style={customStyles.card}>
      <ZulipText style={customStyles.title}>
        TandaPay Contract Address
      </ZulipText>

      <ZulipText style={customStyles.description}>
        Set the TandaPay contract address for your community on
        {' '}
        {selectedNetwork}
        .
        {' '}
        This is the address where your community&apos;s TandaPay contract is deployed.
      </ZulipText>

      <ZulipText style={customStyles.networkLabel}>
        Network:
        {' '}
        {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}
      </ZulipText>

      <AddressInput
        value={addressInput}
        onChangeText={setAddressInput}
        placeholder="0x..."
        label="Contract Address"
        disabled={disabled || isOperationInProgress}
        showQRButton
      />

      <View style={TandaPayStyles.buttonRow}>

        <ZulipButton
          style={TandaPayStyles.button}
          text="Clear"
          onPress={handleClear}
          disabled={disabled || isOperationInProgress || addressInput.trim() === ''}
        />

        <ZulipButton
          style={TandaPayStyles.button}
          text={isOperationInProgress ? 'Saving...' : 'Save'}
          onPress={handleSave}
          disabled={disabled || isOperationInProgress || !hasChanges || !isValidAddress}
          progress={isOperationInProgress}
        />
      </View>
      <View style={TandaPayStyles.buttonRow}>
        <ZulipButton
          style={TandaPayStyles.button}
          text="Deploy Contract"
          onPress={handleShowDeploymentModal}
          disabled={disabled || isOperationInProgress || !isValidAddress}
        />
      </View>

      <ContractDeploymentModal
        visible={showDeploymentModal}
        onClose={handleCloseDeploymentModal}
        onDeploymentComplete={handleDeploymentComplete}
      />
    </Card>
  );
}
