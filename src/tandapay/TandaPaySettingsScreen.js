// @flow strict-local

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { Alert } from 'react-native';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import SwitchRow from '../common/SwitchRow';
import NavRow from '../common/NavRow';
import TextRow from '../common/TextRow';
import ZulipButton from '../common/ZulipButton';
import { IconWallet, IconNotifications, IconSmartphone, IconLanguage } from '../common/Icons';
import { deleteWallet } from './wallet/WalletManager';

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

  const handleDeleteWallet = useCallback(async () => {
    Alert.alert(
      'Delete Wallet',
      'Are you sure you want to delete your wallet? This action cannot be undone. Make sure you have your recovery phrase saved.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWallet();
              Alert.alert(
                'Wallet Deleted',
                'Your wallet has been successfully deleted.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to wallet screen to show "no wallet" state
                      // navigation.push('wallet');
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to delete wallet. Please try again.');
            }
          },
        },
      ]
    );
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
      <NavRow
        leftElement={{ type: 'icon', Component: IconLanguage }}
        title="Network Settings"
        onPress={() => {
          navigation.push('tandapay-network-settings');
        }}
        subtitle="Configure blockchain network and RPC settings"
      />
      <TextRow
        icon={{ Component: IconSmartphone }}
        title="TandaPay version"
        subtitle="v1.0.0 Beta"
      />
      <ZulipButton
        text="Delete Wallet"
        onPress={handleDeleteWallet}
        style={{
          marginTop: 32,
          marginHorizontal: 16,
          backgroundColor: '#f44336'
        }}
      />
    </Screen>
  );
}
