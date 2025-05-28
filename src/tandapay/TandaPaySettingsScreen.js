// @flow strict-local

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import SwitchRow from '../common/SwitchRow';
import NavRow from '../common/NavRow';
import TextRow from '../common/TextRow';
import { IconWallet, IconNotifications, IconSmartphone } from '../common/Icons';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-settings'>,
  route: RouteProp<'tandapay-settings', void>,
|}>;

export default function TandaPaySettingsScreen(props: Props): Node {
  const { navigation } = props;

  // Example settings state - replace with actual state management
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleAutoSyncChange = useCallback((value: boolean) => {
    setAutoSyncEnabled(value);
    // TODO: Implement actual setting persistence
  }, []);

  const handleNotificationsChange = useCallback((value: boolean) => {
    setNotificationsEnabled(value);
    // TODO: Implement actual setting persistence
  }, []);

  return (
    <Screen title="TandaPay Settings">
      <SwitchRow
        label="Auto-sync with blockchain"
        value={autoSyncEnabled}
        onValueChange={handleAutoSyncChange}
      />
      <SwitchRow
        label="TandaPay notifications"
        value={notificationsEnabled}
        onValueChange={handleNotificationsChange}
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconWallet }}
        title="Wallet Settings"
        onPress={() => {
          navigation.push('wallet');
        }}
        subtitle="Manage your crypto wallet preferences"
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconNotifications }}
        title="Notification Preferences"
        onPress={() => {
          // TODO: Navigate to TandaPay-specific notification settings
          navigation.push('notifications');
        }}
        subtitle="Configure TandaPay alert settings"
      />
      <TextRow
        icon={{ Component: IconSmartphone }}
        title="TandaPay version"
        subtitle="v1.0.0 Beta"
      />
    </Screen>
  );
}
