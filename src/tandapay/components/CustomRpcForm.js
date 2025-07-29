/* @flow strict-local */

import React, { useState, useEffect } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import Input from '../../common/Input';
import TandaPayStyles from '../styles';
import Card from './Card';
import ErrorText from './ErrorText';

type Props = $ReadOnly<{|
  initialConfig?: ?{|
    name: string,
    rpcUrl: string,
    chainId: number,
    blockExplorerUrl?: string,
    isAlchemyUrl?: boolean,
    multicall3Address: string,
    nativeToken?: ?{|
      name: string,
      symbol: string,
      decimals: number,
    |},
  |},
  onSave: (config: {|
    name: string,
    rpcUrl: string,
    chainId: number,
    blockExplorerUrl?: string,
    multicall3Address: string,
    nativeToken?: ?{|
      name: string,
      symbol: string,
      decimals: number,
    |},
  |}) => Promise<void>,
  onClear?: () => void,
  loading?: boolean,
  disabled?: boolean,
|}>;

// Validation helper functions
const validateUrl = (url: string): boolean => {
  if (!url.trim()) {
    return false;
  }
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

const validateExplorerUrl = (url: string): boolean => {
  if (!url.trim()) {
    return true; // Optional field
  }
  return validateUrl(url);
};

const validateEthereumAddress = (address: string): boolean => {
  if (!address.trim()) {
    return false;
  }
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const validateChainId = (chainId: string): boolean => {
  const parsed = parseInt(chainId, 10);
  return !Number.isNaN(parsed) && parsed > 0 && Number.isInteger(parsed);
};

const validateDecimals = (decimals: string): boolean => {
  const parsed = parseInt(decimals, 10);
  return !Number.isNaN(parsed) && parsed > 0 && parsed <= 77 && Number.isInteger(parsed);
};

/**
 * A form component for configuring custom RPC network settings.
 * Allows users to input and validate custom network parameters including RPC URL, chain ID, and currency details.
 */
export default function CustomRpcForm(props: Props): Node {
  const { initialConfig, onSave, onClear, loading, disabled } = props;

  const [customName, setCustomName] = useState(initialConfig?.name || '');
  const [customRpcUrl, setCustomRpcUrl] = useState(initialConfig?.rpcUrl || '');
  const [customChainId, setCustomChainId] = useState(initialConfig?.chainId.toString() || '');
  const [customExplorerUrl, setCustomExplorerUrl] = useState(initialConfig?.blockExplorerUrl || '');
  const [customMulticall3Address, setCustomMulticall3Address] = useState(initialConfig?.multicall3Address || '');

  // Native token fields - default to ETH if not provided
  const [nativeTokenName, setNativeTokenName] = useState(initialConfig?.nativeToken?.name || 'Ethereum');
  const [nativeTokenSymbol, setNativeTokenSymbol] = useState(initialConfig?.nativeToken?.symbol || 'ETH');
  const [nativeTokenDecimals, setNativeTokenDecimals] = useState(
    initialConfig?.nativeToken?.decimals != null ? initialConfig.nativeToken.decimals.toString() : '18'
  );

  // Validation errors state
  const [errors, setErrors] = useState<{[string]: string}>({});

  // Helper function to clear error for a specific field
  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      const newErrors = { ...errors };
      delete newErrors[fieldName];
      setErrors(newErrors);
    }
  };

  // Input handlers that clear errors when user starts typing
  const handleNameChange = (value: string) => {
    setCustomName(value);
    clearError('name');
  };

  const handleRpcUrlChange = (value: string) => {
    setCustomRpcUrl(value);
    clearError('rpcUrl');
  };

  const handleChainIdChange = (value: string) => {
    setCustomChainId(value);
    clearError('chainId');
  };

  const handleExplorerUrlChange = (value: string) => {
    setCustomExplorerUrl(value);
    clearError('explorerUrl');
  };

  const handleMulticall3AddressChange = (value: string) => {
    setCustomMulticall3Address(value);
    clearError('multicall3Address');
  };

  const handleNativeTokenDecimalsChange = (value: string) => {
    setNativeTokenDecimals(value);
    clearError('nativeTokenDecimals');
  };

  // Update form fields when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      setCustomName(initialConfig.name || '');
      setCustomRpcUrl(initialConfig.rpcUrl || '');
      setCustomChainId(initialConfig.chainId.toString() || '');
      setCustomExplorerUrl(initialConfig.blockExplorerUrl || '');
      setCustomMulticall3Address(initialConfig.multicall3Address || '');
      setNativeTokenName(initialConfig.nativeToken?.name || 'Ethereum');
      setNativeTokenSymbol(initialConfig.nativeToken?.symbol || 'ETH');
      setNativeTokenDecimals(
        initialConfig.nativeToken?.decimals != null ? initialConfig.nativeToken.decimals.toString() : '18'
      );
    } else {
      // Clear form when no initial config
      setCustomName('');
      setCustomRpcUrl('');
      setCustomChainId('');
      setCustomExplorerUrl('');
      setCustomMulticall3Address('');
      setNativeTokenName('Ethereum');
      setNativeTokenSymbol('ETH');
      setNativeTokenDecimals('18');
    }
  }, [initialConfig]);

  const handleSave = () => {
    // Validate all fields
    const newErrors: {[string]: string} = {};

    if (!customName.trim()) {
      newErrors.name = 'Network name is required';
    }

    if (!customRpcUrl.trim()) {
      newErrors.rpcUrl = 'RPC URL is required';
    } else if (!validateUrl(customRpcUrl)) {
      newErrors.rpcUrl = 'RPC URL must be a valid HTTP/HTTPS URL';
    }

    if (!customChainId.trim()) {
      newErrors.chainId = 'Chain ID is required';
    } else if (!validateChainId(customChainId)) {
      newErrors.chainId = 'Chain ID must be a positive integer';
    }

    if (customExplorerUrl.trim() && !validateExplorerUrl(customExplorerUrl)) {
      newErrors.explorerUrl = 'Block explorer URL must be a valid HTTP/HTTPS URL (include http:// or https://)';
    }

    if (!customMulticall3Address.trim()) {
      newErrors.multicall3Address = 'Multicall3 address is required for TandaPay functionality';
    } else if (!validateEthereumAddress(customMulticall3Address)) {
      newErrors.multicall3Address = 'Multicall3 address must be a valid Ethereum address';
    }

    if (!validateDecimals(nativeTokenDecimals)) {
      newErrors.nativeTokenDecimals = 'Token decimals must be a positive integer (1-77)';
    }

    // Update errors state
    setErrors(newErrors);

    // If there are validation errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const chainId = parseInt(customChainId, 10);
    const decimals = parseInt(nativeTokenDecimals, 10);

    // Build native token configuration - only include if user provided custom values
    let nativeToken = null;
    if (nativeTokenName.trim() !== 'Ethereum' || nativeTokenSymbol.trim() !== 'ETH' || decimals !== 18) {
      nativeToken = {
        name: nativeTokenName.trim(),
        symbol: nativeTokenSymbol.trim(),
        decimals,
      };
    }

    const config = {
      name: customName.trim(),
      rpcUrl: customRpcUrl.trim(),
      chainId,
      blockExplorerUrl: customExplorerUrl.trim() || undefined,
      multicall3Address: customMulticall3Address.trim(),
      nativeToken,
    };

    onSave(config);
  };

  const handleClear = () => {
    setCustomName('');
    setCustomRpcUrl('');
    setCustomChainId('');
    setCustomExplorerUrl('');
    setCustomMulticall3Address('');
    setNativeTokenName('Ethereum');
    setNativeTokenSymbol('ETH');
    setNativeTokenDecimals('18');
    setErrors({}); // Clear validation errors
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <ZulipText style={TandaPayStyles.sectionTitle}>Custom RPC Configuration</ZulipText>

      <Card style={{ marginTop: 12 }}>
        <Input
          placeholder="Network Name (e.g., Local Ganache)"
          value={customName}
          onChangeText={handleNameChange}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />
        {errors.name && <ErrorText>{errors.name}</ErrorText>}

        <Input
          placeholder="RPC URL (e.g., https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY)"
          value={customRpcUrl}
          onChangeText={handleRpcUrlChange}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />
        {errors.rpcUrl && <ErrorText>{errors.rpcUrl}</ErrorText>}

        <Input
          placeholder="Chain ID (e.g., 1337)"
          value={customChainId}
          onChangeText={handleChainIdChange}
          keyboardType="numeric"
          autoCorrect={false}
          editable={!disabled}
        />
        {errors.chainId && <ErrorText>{errors.chainId}</ErrorText>}

        <Input
          placeholder="Block Explorer URL (e.g., https://etherscan.io)"
          value={customExplorerUrl}
          onChangeText={handleExplorerUrlChange}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />
        {errors.explorerUrl && <ErrorText>{errors.explorerUrl}</ErrorText>}

        <Input
          placeholder="Multicall3 Contract Address (required for TandaPay)"
          value={customMulticall3Address}
          onChangeText={handleMulticall3AddressChange}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />
        {errors.multicall3Address && <ErrorText>{errors.multicall3Address}</ErrorText>}

        <ZulipText style={[TandaPayStyles.inputLabel, { marginTop: 12 }]}>
          Native Token Configuration (Optional)
        </ZulipText>
        <ZulipText style={TandaPayStyles.description}>
          Configure the native token for this network. Leave defaults if the network uses ETH.
        </ZulipText>

        <Input
          placeholder="Native Token Name (default: Ethereum)"
          value={nativeTokenName}
          onChangeText={setNativeTokenName}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!disabled}
        />

        <Input
          placeholder="Native Token Symbol (default: ETH)"
          value={nativeTokenSymbol}
          onChangeText={setNativeTokenSymbol}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!disabled}
        />

        <Input
          placeholder="Native Token Decimals (default: 18)"
          value={nativeTokenDecimals}
          onChangeText={handleNativeTokenDecimalsChange}
          keyboardType="numeric"
          autoCorrect={false}
          editable={!disabled}
        />
        {errors.nativeTokenDecimals && <ErrorText>{errors.nativeTokenDecimals}</ErrorText>}

        <View style={TandaPayStyles.buttonRow}>
          <ZulipButton
            style={TandaPayStyles.button}
            disabled={Boolean(disabled) || Boolean(loading)}
            text="Save Custom RPC"
            progress={Boolean(loading)}
            onPress={handleSave}
          />

          {(initialConfig && onClear) && (
            <ZulipButton
              style={TandaPayStyles.button}
              disabled={Boolean(disabled)}
              text="Clear"
              onPress={handleClear}
            />
          )}
        </View>
      </Card>
    </View>
  );
}
