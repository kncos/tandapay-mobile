/* @flow strict-local */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useSelector, useDispatch } from '../../react-redux';
import { getTandaPaySelectedNetwork, getTandaPayCustomRpcConfig } from '../redux/selectors';
import { switchNetwork, setCustomRpc, clearCustomRpc } from '../redux/actions';
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
  |},
  loading: boolean,
  switchingNetwork: ?string,
  handleNetworkSwitch: (network: NetworkIdentifier) => Promise<void>,
  handleSaveCustomRpc: (config: {|
    name: string,
    rpcUrl: string,
    chainId: number,
    blockExplorerUrl?: string,
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
    setLoading(true);

    try {
      const validationResult = validateCustomRpcConfig(config);
      if (!validationResult.success) {
        Alert.alert('Invalid Configuration', validationResult.error.userMessage != null ? validationResult.error.userMessage : 'Please check your RPC configuration');
        return;
      }

      dispatch(setCustomRpc(validationResult.data));

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
    } catch (error) {
      Alert.alert('Invalid Configuration', error.message || 'Please check your RPC configuration');
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
