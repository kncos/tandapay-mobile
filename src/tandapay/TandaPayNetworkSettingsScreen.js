/* @flow strict-local */

import React, { useState, useContext, useCallback } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Screen from '../common/Screen';
import ZulipButton from '../common/ZulipButton';
import ZulipText from '../common/ZulipText';
import Input from '../common/Input';
import { ThemeContext } from '../styles';
import { useSelector, useDispatch } from '../react-redux';
import { getTandaPaySelectedNetwork, getTandaPayCustomRpcConfig } from './tandaPaySelectors';
import { switchNetwork, setCustomRpc, clearCustomRpc } from './tandaPayActions';
import { getNetworkConfig, getSupportedNetworks, validateCustomRpcConfig } from './providers/ProviderManager';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-network-settings'>,
  route: RouteProp<'tandapay-network-settings', void>,
|}>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  networkOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  networkOptionLoading: {
    opacity: 0.6,
  },
  networkText: {
    fontSize: 16,
    marginLeft: 12,
  },
  networkDetail: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 12,
    marginTop: 2,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  unselectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
  },
  customSection: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
  },
});

export default function TandaPayNetworkSettingsScreen(props: Props): Node {
  const themeData = useContext(ThemeContext);
  const dispatch = useDispatch();

  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const customRpcConfig = useSelector(getTandaPayCustomRpcConfig);

  // Custom RPC form state
  const [customName, setCustomName] = useState(customRpcConfig?.name || '');
  const [customRpcUrl, setCustomRpcUrl] = useState(customRpcConfig?.rpcUrl || '');
  const [customChainId, setCustomChainId] = useState(customRpcConfig?.chainId.toString() || '');
  const [customExplorerUrl, setCustomExplorerUrl] = useState(customRpcConfig?.blockExplorerUrl || '');

  const [loading, setLoading] = useState(false);
  const [switchingNetwork, setSwitchingNetwork] = useState(null); // Track which network is being switched to

  const handleNetworkSwitch = useCallback(async (network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom') => {
    if (network === selectedNetwork || switchingNetwork) {
      return; // Prevent multiple switches or switching to the same network
    }

    setSwitchingNetwork(network);

    try {
      // Add a small delay to ensure UI updates before heavy operations
      await new Promise(resolve => setTimeout(resolve, 100));

      dispatch(switchNetwork(network));

      // Show confirmation
      const networkConfig = network === 'custom' ? customRpcConfig : getNetworkConfig(network);
      const networkName = networkConfig?.name || network;

      // Wait a bit more for the state to update
      await new Promise(resolve => setTimeout(resolve, 200));

      Alert.alert('Network Switched', `Successfully switched to ${networkName}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to switch network. Please try again.');
    } finally {
      setSwitchingNetwork(null);
    }
  }, [selectedNetwork, customRpcConfig, dispatch, switchingNetwork]);

  const handleSaveCustomRpc = useCallback(() => {
    setLoading(true);

    // Use setTimeout to ensure state update happens before async operation
    setTimeout(async () => {
      if (!customName.trim() || !customRpcUrl.trim() || !customChainId.trim()) {
        Alert.alert('Missing Information', 'Please fill in all required fields (Name, RPC URL, Chain ID)');
        return;
      }

      const chainId = parseInt(customChainId, 10);
      if (Number.isNaN(chainId) || chainId <= 0) {
        Alert.alert('Invalid Chain ID', 'Chain ID must be a positive number');
        return;
      }

      const config = {
        name: customName.trim(),
        rpcUrl: customRpcUrl.trim(),
        chainId,
        blockExplorerUrl: customExplorerUrl.trim() || undefined,
      };

      try {
        // Validate the configuration
        const validatedConfig = validateCustomRpcConfig(config);

        // Save the custom RPC configuration
        dispatch(setCustomRpc(validatedConfig));

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
    }, 0);
  }, [customName, customRpcUrl, customChainId, customExplorerUrl, dispatch, handleNetworkSwitch]);

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
            // Switch to sepolia if currently on custom
            if (selectedNetwork === 'custom') {
              await handleNetworkSwitch('sepolia');
            }
            // Clear form
            setCustomName('');
            setCustomRpcUrl('');
            setCustomChainId('');
            setCustomExplorerUrl('');
            // Alert.alert('Cleared', 'Custom RPC configuration has been cleared');
          },
        },
      ]
    );
  }, [dispatch, selectedNetwork, handleNetworkSwitch]);

  const supportedNetworks = getSupportedNetworks();

  return (
    <Screen title="Network Settings" canGoBack>
      <ScrollView style={styles.container}>
        {/* Network Selection */}
        <View style={styles.section}>
          <ZulipText style={styles.sectionTitle}>Select Network</ZulipText>

          {supportedNetworks.map((network) => {
            const config = getNetworkConfig(network);
            const isSelected = selectedNetwork === network;
            const isSwitching = switchingNetwork === network;

            return (
              <TouchableOpacity
                key={network}
                style={[
                  styles.networkOption,
                  { backgroundColor: themeData.cardColor },
                  isSwitching && styles.networkOptionLoading
                ]}
                onPress={() => handleNetworkSwitch(network)}
                disabled={isSwitching || switchingNetwork != null}
                activeOpacity={0.7}
              >
                <View style={isSelected ? styles.selectedIndicator : styles.unselectedIndicator} />
                <View style={{ flex: 1 }}>
                  <ZulipText style={styles.networkText}>
                    {config.name}
                  </ZulipText>
                  <ZulipText style={styles.networkDetail}>
                    {'Chain ID: '}
                    {config.chainId}
                    {' • '}
                    {config.rpcUrl}
                  </ZulipText>
                </View>
                {isSwitching && (
                  <ActivityIndicator size="small" color={themeData.color} style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>
            );
          })}

          {/* Custom Network Option */}
          <TouchableOpacity
            style={[
              styles.networkOption,
              { backgroundColor: themeData.cardColor },
              switchingNetwork === 'custom' && styles.networkOptionLoading
            ]}
            onPress={() => customRpcConfig && handleNetworkSwitch('custom')}
            disabled={!customRpcConfig || switchingNetwork != null}
            activeOpacity={customRpcConfig ? 0.7 : 1}
          >
            <View style={selectedNetwork === 'custom' ? styles.selectedIndicator : styles.unselectedIndicator} />
            <View style={{ flex: 1 }}>
              <ZulipText
                style={[
                  styles.networkText,
                  { opacity: customRpcConfig ? 1 : 0.5 }
                ]}
              >
                Custom Network
              </ZulipText>
              <ZulipText style={styles.networkDetail}>
                {customRpcConfig
                  ? `${customRpcConfig.name} • Chain ID: ${customRpcConfig.chainId}`
                  : 'Configure custom RPC below'
                }
              </ZulipText>
            </View>
            {switchingNetwork === 'custom' && (
              <ActivityIndicator size="small" color="#007AFF" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
        </View>

        {/* Custom RPC Configuration */}
        <View style={styles.section}>
          <ZulipText style={styles.sectionTitle}>Custom RPC Configuration</ZulipText>

          <View style={[styles.customSection, { backgroundColor: themeData.cardColor }]}>
            <Input
              style={styles.input}
              placeholder="Network Name (e.g., Local Ganache)"
              value={customName}
              onChangeText={setCustomName}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              style={styles.input}
              placeholder="RPC URL (e.g., http://localhost:8545)"
              value={customRpcUrl}
              onChangeText={setCustomRpcUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              style={styles.input}
              placeholder="Chain ID (e.g., 1337)"
              value={customChainId}
              onChangeText={setCustomChainId}
              keyboardType="numeric"
              autoCorrect={false}
            />

            <Input
              style={styles.input}
              placeholder="Block Explorer URL (optional)"
              value={customExplorerUrl}
              onChangeText={setCustomExplorerUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.buttonRow}>
              <ZulipButton
                style={styles.button}
                disabled={loading}
                text="Save Custom RPC"
                progress={loading}
                onPress={handleSaveCustomRpc}
              />

              {customRpcConfig && (
                <ZulipButton
                  style={styles.button}
                  disabled={switchingNetwork != null}
                  text="Clear"
                  onPress={handleClearCustomRpc}
                />
              )}
            </View>
          </View>
        </View>

        {/* Network Information */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ZulipText style={styles.sectionTitle}>Current Network Info</ZulipText>
            {switchingNetwork && (
              <ActivityIndicator size="small" color="#007AFF" style={{ marginLeft: 8 }} />
            )}
          </View>
          <View style={[styles.customSection, { backgroundColor: themeData.cardColor }]}>
            {selectedNetwork === 'custom' && customRpcConfig ? (
              <>
                <ZulipText style={{ fontWeight: 'bold' }}>
                  {'Name: '}
                  {customRpcConfig.name}
                </ZulipText>
                <ZulipText>
                  {'RPC URL: '}
                  {customRpcConfig.rpcUrl}
                </ZulipText>
                <ZulipText>
                  {'Chain ID: '}
                  {customRpcConfig.chainId}
                </ZulipText>
                {customRpcConfig.blockExplorerUrl != null && customRpcConfig.blockExplorerUrl !== '' && (
                  <ZulipText>
                    {'Explorer: '}
                    {customRpcConfig.blockExplorerUrl}
                  </ZulipText>
                )}
              </>
            ) : (
              (() => {
                if (selectedNetwork === 'custom') {
                  return (
                    <ZulipText>No custom network configured</ZulipText>
                  );
                }
                if (!selectedNetwork) {
                  return (
                    <ZulipText>Loading network information...</ZulipText>
                  );
                }
                const config = getNetworkConfig(selectedNetwork);
                return (
                  <>
                    <ZulipText style={{ fontWeight: 'bold' }}>
                      {'Name: '}
                      {config.name}
                    </ZulipText>
                    <ZulipText>
                      {'RPC URL: '}
                      {config.rpcUrl}
                    </ZulipText>
                    <ZulipText>
                      {'Chain ID: '}
                      {config.chainId}
                    </ZulipText>
                    {config.blockExplorerUrl != null && config.blockExplorerUrl !== '' && (
                      <ZulipText>
                        {'Explorer: '}
                        {config.blockExplorerUrl}
                      </ZulipText>
                    )}
                  </>
                );
              })()
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
