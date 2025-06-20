/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';
import { TandaPayColors, TandaPayTypography, TandaPayLayout, TandaPayComponents } from '../styles';
import { getSupportedNetworks, getNetworkDisplayInfo } from '../providers/ProviderManager';
import Card from './Card';

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

// Only custom styles for this component
const networkStyles = {
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
};

export default function NetworkSelector(props: Props): Node {
  const { selectedNetwork, onNetworkSelect, switchingNetwork, disabled, customRpcConfig } = props;
  const themeData = useContext(ThemeContext);
  const supportedNetworks = getSupportedNetworks();

  return (
    <View style={TandaPayLayout.section}>
      <ZulipText style={TandaPayTypography.sectionTitle}>Select Network</ZulipText>

      {supportedNetworks.map((network) => {
        const config = getNetworkDisplayInfo(network);
        const isSelected = selectedNetwork === network;
        const isSwitching = switchingNetwork === network;

        return (
          <TouchableOpacity
            key={network}
            onPress={() => onNetworkSelect(network)}
            disabled={Boolean(disabled) || isSwitching || switchingNetwork != null}
            activeOpacity={0.7}
          >
            <Card
              style={[
                { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
                isSwitching && networkStyles.networkOptionLoading
              ]}
            >
              <View style={isSelected ? TandaPayComponents.selected : TandaPayComponents.unselected} />
              <View style={{ flex: 1 }}>
                <ZulipText style={networkStyles.networkText}>
                  {config.name}
                </ZulipText>
                <ZulipText style={networkStyles.networkDetail}>
                  {`Chain ID: ${config.chainId}`}
                </ZulipText>
              </View>
              {isSwitching && (
                <ActivityIndicator size="small" color={themeData.color} style={{ marginLeft: 8 }} />
              )}
            </Card>
          </TouchableOpacity>
        );
      })}

      {/* Custom Network Option */}
      <TouchableOpacity
        onPress={() => customRpcConfig && onNetworkSelect('custom')}
        disabled={Boolean(disabled) || !customRpcConfig || switchingNetwork != null}
        activeOpacity={customRpcConfig ? 0.7 : 1}
      >
        <Card
          style={[
            { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
            switchingNetwork === 'custom' && networkStyles.networkOptionLoading
          ]}
        >
          <View style={selectedNetwork === 'custom' ? TandaPayComponents.selected : TandaPayComponents.unselected} />
          <View style={{ flex: 1 }}>
            <ZulipText
              style={[
                networkStyles.networkText,
                { opacity: customRpcConfig ? 1 : 0.5 }
              ]}
            >
              Custom Network
            </ZulipText>
            <ZulipText style={networkStyles.networkDetail}>
              {customRpcConfig
                ? `${customRpcConfig.name} • Chain ID: ${customRpcConfig.chainId}`
                : 'Configure custom RPC below'
              }
            </ZulipText>
          </View>
          {switchingNetwork === 'custom' && (
            <ActivityIndicator size="small" color={TandaPayColors.primary} style={{ marginLeft: 8 }} />
          )}
        </Card>
      </TouchableOpacity>
    </View>
  );
}
