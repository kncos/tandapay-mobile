/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

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
|}>;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  infoSection: {
    padding: 12,
    borderRadius: 8,
  },
  networkName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  networkDetail: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default function WalletNetworkInfo(props: Props): Node {
  const { selectedNetwork, customRpcConfig } = props;
  const themeData = useContext(ThemeContext);

  const renderNetworkDetails = () => {
    if (selectedNetwork === 'custom' && customRpcConfig) {
      return (
        <>
          <ZulipText style={styles.networkName}>
            {customRpcConfig.name}
          </ZulipText>
          <ZulipText style={styles.networkDetail}>
            {`Chain ID: ${customRpcConfig.chainId}`}
          </ZulipText>
        </>
      );
    }

    if (selectedNetwork === 'custom') {
      return (
        <ZulipText style={styles.networkName}>
          Custom Network (Not Configured)
        </ZulipText>
      );
    }

    if (!selectedNetwork) {
      return (
        <ZulipText style={styles.networkName}>
          Loading network...
        </ZulipText>
      );
    }

    const config = getNetworkConfig(selectedNetwork);
    return (
      <>
        <ZulipText style={styles.networkName}>
          {config.name}
        </ZulipText>
        <ZulipText style={styles.networkDetail}>
          {`Chain ID: ${config.chainId}`}
        </ZulipText>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.infoSection, { backgroundColor: themeData.cardColor }]}>
        {renderNetworkDetails()}
      </View>
    </View>
  );
}
