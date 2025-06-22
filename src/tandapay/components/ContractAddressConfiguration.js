/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

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
import { TandaPayColors, TandaPayTypography } from '../styles';

type Props = $ReadOnly<{|
  disabled?: boolean,
|}>;

const customStyles = {
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
  addressInputContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
  },
};

export default function ContractAddressConfiguration(props: Props): Node {
  const { disabled = false } = props;

  const dispatch = useDispatch();
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const contractAddresses = useSelector(getTandaPayContractAddresses);
  const currentAddress = useSelector(state => getTandaPayContractAddressForNetwork(state, selectedNetwork));

  const [addressInput, setAddressInput] = useState(currentAddress || '');
  const [saving, setSaving] = useState(false);

  // Update input when network changes
  React.useEffect(() => {
    setAddressInput(currentAddress || '');
  }, [currentAddress]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const newContractAddresses = { ...contractAddresses };

      // Use explicit assignment to avoid computed property issues
      if (selectedNetwork === 'mainnet') {
        newContractAddresses.mainnet = addressInput.trim() || null;
      } else if (selectedNetwork === 'sepolia') {
        newContractAddresses.sepolia = addressInput.trim() || null;
      } else if (selectedNetwork === 'arbitrum') {
        newContractAddresses.arbitrum = addressInput.trim() || null;
      } else if (selectedNetwork === 'polygon') {
        newContractAddresses.polygon = addressInput.trim() || null;
      } else if (selectedNetwork === 'custom') {
        newContractAddresses.custom = addressInput.trim() || null;
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

  const hasChanges = (addressInput.trim() || null) !== currentAddress;
  const isValidAddress = addressInput.trim() === '' || /^0x[a-fA-F0-9]{40}$/.test(addressInput.trim());

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

      <View style={customStyles.addressInputContainer}>
        <AddressInput
          value={addressInput}
          onChangeText={setAddressInput}
          placeholder="0x..."
          label="Contract Address"
          disabled={disabled || saving}
          showQRButton
        />
      </View>

      <View style={customStyles.buttonContainer}>
        <ZulipButton
          style={customStyles.button}
          text="Clear"
          onPress={handleClear}
          disabled={disabled || saving || addressInput.trim() === ''}
        />

        <ZulipButton
          style={customStyles.button}
          text={saving ? 'Saving...' : 'Save'}
          onPress={handleSave}
          disabled={disabled || saving || !hasChanges || !isValidAddress}
          progress={saving}
        />
      </View>
    </Card>
  );
}
