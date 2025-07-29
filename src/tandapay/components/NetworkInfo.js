/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, ActivityIndicator } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { getNetworkDisplayInfo } from '../providers/ProviderManager';
import { TandaPayColors, TandaPayTypography } from '../styles';
import Card from './Card';
import type { NetworkIdentifier } from '../definitions/types';

type Props = $ReadOnly<{|
  selectedNetwork: NetworkIdentifier,
  customRpcConfig?: ?{|
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
  switchingNetwork?: ?string,
|}>;

/**
 * A component for displaying current network information and connection status.
 * Shows network details including name, chain ID, and native currency information.
 */
export default function NetworkInfo(props: Props): Node {
  const { selectedNetwork, customRpcConfig, switchingNetwork } = props;

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

    const config = getNetworkDisplayInfo(selectedNetwork);
    return (
      <>
        <ZulipText style={{ fontWeight: 'bold' }}>
          {`Name: ${config.name}`}
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
      <Card>
        {renderNetworkDetails()}
      </Card>
    </View>
  );
}
