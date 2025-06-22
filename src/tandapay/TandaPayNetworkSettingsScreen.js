/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { ScrollView } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Screen from '../common/Screen';
import { NetworkSelector, CustomRpcForm, NetworkInfo, NetworkPerformanceSettings, ContractAddressConfiguration } from './components';
import { useNetworkSettings } from './hooks/useNetworkSettings';
import { useNetworkPerformanceSettings } from './hooks/useNetworkPerformanceSettings';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-network-settings'>,
  route: RouteProp<'tandapay-network-settings', void>,
|}>;

export default function TandaPayNetworkSettingsScreen(props: Props): Node {
  const {
    selectedNetwork,
    customRpcConfig,
    loading,
    switchingNetwork,
    handleNetworkSwitch,
    handleSaveCustomRpc,
    handleClearCustomRpc,
  } = useNetworkSettings();

  const {
    cacheExpirationMs,
    rateLimitDelayMs,
    retryAttempts,
    handleUpdateCacheExpiration,
    handleUpdateRateLimitDelay,
    handleUpdateRetryAttempts,
    handleUpdateAll,
    handleResetToDefaults,
  } = useNetworkPerformanceSettings();

  return (
    <Screen title="Network Settings" canGoBack>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <NetworkSelector
          selectedNetwork={selectedNetwork}
          onNetworkSelect={handleNetworkSwitch}
          switchingNetwork={switchingNetwork}
          disabled={Boolean(loading)}
          customRpcConfig={customRpcConfig}
        />

        <CustomRpcForm
          initialConfig={customRpcConfig}
          onSave={handleSaveCustomRpc}
          onClear={handleClearCustomRpc}
          loading={loading}
          disabled={Boolean(switchingNetwork)}
        />

        <ContractAddressConfiguration
          disabled={Boolean(switchingNetwork)}
        />

        <NetworkPerformanceSettings
          cacheExpirationMs={cacheExpirationMs}
          rateLimitDelayMs={rateLimitDelayMs}
          retryAttempts={retryAttempts}
          onUpdateCacheExpiration={handleUpdateCacheExpiration}
          onUpdateRateLimitDelay={handleUpdateRateLimitDelay}
          onUpdateRetryAttempts={handleUpdateRetryAttempts}
          onUpdateAll={handleUpdateAll}
          onResetToDefaults={handleResetToDefaults}
          disabled={Boolean(switchingNetwork)}
        />

        <NetworkInfo
          selectedNetwork={selectedNetwork}
          customRpcConfig={customRpcConfig}
          switchingNetwork={switchingNetwork}
        />
      </ScrollView>
    </Screen>
  );
}
