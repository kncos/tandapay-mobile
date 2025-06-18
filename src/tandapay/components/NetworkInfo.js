/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, ActivityIndicator } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';
import { getNetworkConfig } from '../providers/ProviderManager';
import { TandaPayColors, TandaPayLayout, TandaPayTypography } from '../styles';

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
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ZulipText style={TandaPayTypography.sectionTitle}>Current Network Info</ZulipText>
        {switchingNetwork != null && switchingNetwork !== '' && (
          <ActivityIndicator
            size="small"
            color={TandaPayColors.primary}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
      <View style={[{ padding: 16, borderRadius: 8 }, { backgroundColor: themeData.cardColor }]}>
        {renderNetworkDetails()}
      </View>
    </View>
  );
}
