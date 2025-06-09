/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';
import { getSupportedNetworks, getNetworkConfig } from '../providers/ProviderManager';

type Props = $ReadOnly<{|
  selectedNetwork: string,
  onNetworkSelect: (network: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom') => Promise<void>,
  switchingNetwork?: ?string,
  disabled?: boolean,
  customRpcConfig?: ?{|
    name: string,
    rpcUrl: string,
    chainId: number,
    blockExplorerUrl?: string,
  |},
|}>;

const styles = StyleSheet.create({
  container: {
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
});

export default function NetworkSelector(props: Props): Node {
  const { selectedNetwork, onNetworkSelect, switchingNetwork, disabled, customRpcConfig } = props;
  const themeData = useContext(ThemeContext);
  const supportedNetworks = getSupportedNetworks();

  return (
    <View style={styles.container}>
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
            onPress={() => onNetworkSelect(network)}
            disabled={Boolean(disabled) || isSwitching || switchingNetwork != null}
            activeOpacity={0.7}
          >
            <View style={isSelected ? styles.selectedIndicator : styles.unselectedIndicator} />
            <View style={{ flex: 1 }}>
              <ZulipText style={styles.networkText}>
                {config.name}
              </ZulipText>
              <ZulipText style={styles.networkDetail}>
                {`Chain ID: ${config.chainId} • ${config.rpcUrl}`}
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
        onPress={() => customRpcConfig && onNetworkSelect('custom')}
        disabled={Boolean(disabled) || !customRpcConfig || switchingNetwork != null}
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
  );
}
