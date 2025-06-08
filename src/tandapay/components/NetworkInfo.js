/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';
import { getNetworkConfig } from '../providers/ProviderManager';

type Props = $ReadOnly<{|
  selectedNetwork: 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'custom',
  customRpcConfig?: ?{|
    name: string,
    rpcUrl: string,
    chainId: number,
    blockExplorerUrl?: string,
  |},
  switchingNetwork?: ?string,
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
  infoSection: {
    padding: 16,
    borderRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
});

export default function NetworkInfo(props: Props): Node {
  const { selectedNetwork, customRpcConfig, switchingNetwork } = props;
  const themeData = useContext(ThemeContext);

  const renderNetworkDetails = () => {
    if (selectedNetwork === 'custom' && customRpcConfig) {
      return (
        <>
          <ZulipText style={{ fontWeight: 'bold' }}>
            {`Name: ${customRpcConfig.name}`}
          </ZulipText>
          <ZulipText>
            {`RPC URL: ${customRpcConfig.rpcUrl}`}
          </ZulipText>
          <ZulipText>
            {`Chain ID: ${customRpcConfig.chainId}`}
          </ZulipText>
          {customRpcConfig.blockExplorerUrl != null && customRpcConfig.blockExplorerUrl !== '' && (
            <ZulipText>
              {`Explorer: ${customRpcConfig.blockExplorerUrl}`}
            </ZulipText>
          )}
        </>
      );
    }

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

    if (selectedNetwork === 'custom') {
      return (
        <ZulipText>Custom network configuration not found.</ZulipText>
      );
    }

    const config = getNetworkConfig(selectedNetwork);
    return (
      <>
        <ZulipText style={{ fontWeight: 'bold' }}>
          {`Name: ${config.name}`}
        </ZulipText>
        <ZulipText>
          {`RPC URL: ${config.rpcUrl}`}
        </ZulipText>
        <ZulipText>
          {`Chain ID: ${config.chainId}`}
        </ZulipText>
        {config.blockExplorerUrl != null && config.blockExplorerUrl !== '' && (
          <ZulipText>
            {`Explorer: ${config.blockExplorerUrl}`}
          </ZulipText>
        )}
      </>
    );
  };  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <ZulipText style={styles.sectionTitle}>Current Network Info</ZulipText>
        {switchingNetwork != null && switchingNetwork !== '' && (
          <ActivityIndicator
            size="small"
            color="#007AFF"
            style={styles.loadingIndicator}
          />
        )}
      </View>
      <View style={[styles.infoSection, { backgroundColor: themeData.cardColor }]}>
        {renderNetworkDetails()}
      </View>
    </View>
  );
}
