/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View , StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';
import { getNetworkDisplayInfo } from '../providers/ProviderManager';
import type { NetworkIdentifier } from '../definitions/types';

type Props = $ReadOnly<{|
  selectedNetwork: NetworkIdentifier,
  customRpcConfig?: ?{|
    name: string,
    rpcUrl: string,
    chainId: number,
    blockExplorerUrl?: string,
  |},
|}>;

const customStyles = StyleSheet.create({
  networkName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  networkDetail: {
    fontSize: 12,
    opacity: 0.7,
  },
});

/**
 * A compact component for displaying wallet network information.
 * Shows the current network name and key details in a condensed format.
 */
export default function WalletNetworkInfo(props: Props): Node {
  const { selectedNetwork, customRpcConfig } = props;
  const themeData = useContext(ThemeContext);

  const renderNetworkDetails = () => {
    if (selectedNetwork === 'custom' && customRpcConfig) {
      return (
        <>
          <ZulipText style={customStyles.networkName}>
            {customRpcConfig.name}
          </ZulipText>
          <ZulipText style={customStyles.networkDetail}>
            {`Chain ID: ${customRpcConfig.chainId}`}
          </ZulipText>
        </>
      );
    }

    if (selectedNetwork === 'custom') {
      return (
        <ZulipText style={customStyles.networkName}>
          Custom Network (Not Configured)
        </ZulipText>
      );
    }    if (!selectedNetwork) {
      return (
        <ZulipText style={customStyles.networkName}>
          Loading network...
        </ZulipText>
      );
    }

    const config = getNetworkDisplayInfo(selectedNetwork);
    return (
      <>
        <ZulipText style={customStyles.networkName}>
          {config.name}
        </ZulipText>
        <ZulipText style={customStyles.networkDetail}>
          {`Chain ID: ${config.chainId}`}
        </ZulipText>
      </>
    );
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={[{ padding: 12, borderRadius: 8 }, { backgroundColor: themeData.cardColor }]}>
        {renderNetworkDetails()}
      </View>
    </View>
  );
}
