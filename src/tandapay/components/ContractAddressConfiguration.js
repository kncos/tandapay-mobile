/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

import { useSelector, useDispatch } from '../../react-redux';
import {
  getTandaPaySelectedNetwork,
  getTandaPayContractAddressForNetwork,
  getTandaPayContractAddresses
} from '../redux/selectors';
import { updateTandaPaySettings, updateCommunityInfo } from '../redux/actions';
import { fetchCommunityInfo } from '../contract/tandapay-reader/communityInfoManager';
import { getWalletAddress } from '../wallet/WalletManager';
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

export default function ContractAddressConfiguration(props: Props): Node {
  const { disabled = false } = props;

  const dispatch = useDispatch();
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const contractAddresses = useSelector(getTandaPayContractAddresses);
  const currentAddress = useSelector(state => getTandaPayContractAddressForNetwork(state, selectedNetwork));

  const [addressInput, setAddressInput] = useState(currentAddress || '');
  const [saving, setSaving] = useState(false);
  const [fetchingCommunityInfo, setFetchingCommunityInfo] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);

  // Update input when network changes
  React.useEffect(() => {
    setAddressInput(currentAddress || '');
  }, [currentAddress]);

  // Helper function to attempt fetching community info for a new address
  const fetchCommunityInfoForAddress = useCallback(async (contractAddress: string) => {
    if (!contractAddress.trim()) {
      return;
    }

    setFetchingCommunityInfo(true);
    try {
      // Get user wallet address first
      const walletResult = await getWalletAddress();
      const userWalletAddress = walletResult.success ? walletResult.data : null;

      // Attempt to fetch community info
      const result = await fetchCommunityInfo(contractAddress, userWalletAddress);

      if (result.success) {
        // Update Redux store with the fetched community info
        dispatch(updateCommunityInfo(
          result.data,
          contractAddress,
          userWalletAddress,
        ));
      } else {
        // Show warning alert for failed fetch
        Alert.alert(
          'Warning',
          'WARN: Could not fetch community info! Address may be incorrect or there may be a network configuration issue!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      // Show warning alert for any error
      Alert.alert(
        'Warning',
        'WARN: Could not fetch community info! Address may be incorrect or there may be a network configuration issue!',
        [{ text: 'OK' }]
      );
    } finally {
      setFetchingCommunityInfo(false);
    }
  }, [dispatch]);

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

      // If we have a new valid address, attempt to fetch community info
      if (trimmedAddress && trimmedAddress !== currentAddress) {
        await fetchCommunityInfoForAddress(trimmedAddress);
      }
    } finally {
      setSaving(false);
    }
  }, [dispatch, addressInput, selectedNetwork, contractAddresses, currentAddress, fetchCommunityInfoForAddress]);

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

        // Fetch community info for the newly deployed contract
        await fetchCommunityInfoForAddress(contractAddress);
      } finally {
        setSaving(false);
      }
    }, 100);
  }, [dispatch, selectedNetwork, contractAddresses, fetchCommunityInfoForAddress]);

  const hasChanges = (addressInput.trim() || null) !== currentAddress;
  const isValidAddress = addressInput.trim() === '' || /^0x[a-fA-F0-9]{40}$/.test(addressInput.trim());
  const isOperationInProgress = saving || fetchingCommunityInfo;

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
          text={isOperationInProgress ? (fetchingCommunityInfo ? 'Fetching info...' : 'Saving...') : 'Save'}
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
