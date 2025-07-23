/* @flow strict-local */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useSelector, useDispatch } from '../../react-redux';
import { getTandaPaySelectedNetwork, getTandaPayCustomRpcConfig } from '../redux/selectors';
import { switchNetwork, clearCustomRpc, saveCustomRpcConfig } from '../redux/actions';
import { validateCustomRpcConfig } from '../providers/ProviderManager';
import { useBalanceInvalidation } from './useBalanceInvalidation';
import type { NetworkIdentifier } from '../definitions/types';

type NetworkHookReturn = {|
  selectedNetwork: NetworkIdentifier,
  customRpcConfig: ?{|
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
  loading: boolean,
  switchingNetwork: ?string,
  handleNetworkSwitch: (network: NetworkIdentifier) => Promise<void>,
  handleSaveCustomRpc: (config: {|
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
  handleClearCustomRpc: () => void,
|};

/**
 * Custom hook for managing network settings state and actions
 * Extracts network-related logic from components for better reusability
 */
export function useNetworkSettings(): NetworkHookReturn {
  const dispatch = useDispatch();
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const customRpcConfig = useSelector(getTandaPayCustomRpcConfig);
  const { invalidateAllTokens } = useBalanceInvalidation();

  const [loading, setLoading] = useState(false);
  const [switchingNetwork, setSwitchingNetwork] = useState(null);

  const handleNetworkSwitch = useCallback(async (network: NetworkIdentifier) => {
    if (network === selectedNetwork || switchingNetwork) {
      return;
    }

    setSwitchingNetwork(network);

    try {
      // Add delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 100));

      dispatch(switchNetwork(network));

      const networkName = network === 'custom' ? customRpcConfig?.name || 'Custom' : network;

      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 200));

      // Invalidate all token balances since they are different on different networks
      invalidateAllTokens();

      Alert.alert('Network Switched', `Successfully switched to ${networkName}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to switch network. Please try again.');
    } finally {
      setSwitchingNetwork(null);
    }
  }, [selectedNetwork, customRpcConfig, dispatch, switchingNetwork, invalidateAllTokens]);

  const handleSaveCustomRpc = useCallback(async (config) => {
    console.log('🔧 handleSaveCustomRpc called with config:', config);
    setLoading(true);

    try {
      console.log('🔧 Validating custom RPC config...');
      const validationResult = validateCustomRpcConfig(config);
      console.log('🔧 Validation result:', validationResult);

      if (!validationResult.success) {
        console.log('🔧 Validation failed:', validationResult.error);
        // Don't show alert here - let the form validation handle it
        // The action will be dispatched but Redux validation will reject it
        // and the form should show the error messages
      }

      // The validation ensures multicall3Address is present, so we can safely cast
      const validatedConfig = {
        name: validationResult.success ? validationResult.data.name : config.name,
        rpcUrl: validationResult.success ? validationResult.data.rpcUrl : config.rpcUrl,
        chainId: validationResult.success ? validationResult.data.chainId : config.chainId,
        blockExplorerUrl: validationResult.success ? validationResult.data.blockExplorerUrl : config.blockExplorerUrl,
        multicall3Address: validationResult.success ? (validationResult.data.multicall3Address || '') : config.multicall3Address,
        nativeToken: validationResult.success ? validationResult.data.nativeToken : config.nativeToken,
      };

      console.log('🔧 Config to save:', validatedConfig);
      console.log('🔧 Dispatching saveCustomRpcConfig action...');

      dispatch(saveCustomRpcConfig(validatedConfig));

      // Only show success alert if initial validation passed
      if (validationResult.success) {
        console.log('🔧 Action dispatched, showing success alert...');

        Alert.alert(
          'Custom RPC Saved',
          'Your custom RPC configuration has been saved. You can now select "Custom" as your network.',
          [
            {
              text: 'Switch to Custom',
              onPress: async () => {
                await handleNetworkSwitch('custom');
              },
            },
            { text: 'OK' },
          ]
        );
      } else {
        console.log('🔧 Action dispatched but validation failed - no alert shown');
      }
    } catch (error) {
      console.log('🔧 Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dispatch, handleNetworkSwitch]);

  const handleClearCustomRpc = useCallback(() => {
    Alert.alert(
      'Clear Custom RPC',
      'Are you sure you want to clear your custom RPC configuration? This will switch you to Sepolia if you are currently using custom network.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            dispatch(clearCustomRpc());
            if (selectedNetwork === 'custom') {
              await handleNetworkSwitch('sepolia');
            }
          },
        },
      ]
    );
  }, [dispatch, selectedNetwork, handleNetworkSwitch]);

  return {
    selectedNetwork,
    customRpcConfig,
    loading,
    switchingNetwork,
    handleNetworkSwitch,
    handleSaveCustomRpc,
    handleClearCustomRpc,
  };
}
