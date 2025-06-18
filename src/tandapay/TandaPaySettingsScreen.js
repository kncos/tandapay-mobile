// @flow strict-local

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { Alert } from 'react-native';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import NavRow from '../common/NavRow';
import TextRow from '../common/TextRow';
import ZulipButton from '../common/ZulipButton';
import { IconWallet, IconSmartphone, IconLanguage, IconPlusCircle } from '../common/Icons';
import { deleteWallet } from './wallet/WalletManager';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-settings'>,
  route: RouteProp<'tandapay-settings', void>,
|}>;

export default function TandaPaySettingsScreen(props: Props): Node {
  const { navigation } = props;

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
      <NavRow
        leftElement={{ type: 'icon', Component: IconWallet }}
        title="Wallet Settings"
        onPress={() => {
          navigation.push('wallet-settings');
        }}
        subtitle="Manage your crypto wallet preferences"
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconLanguage }}
        title="Network Settings"
        onPress={() => {
          navigation.push('tandapay-network-settings');
        }}
        subtitle="Configure blockchain network and RPC settings"
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconPlusCircle }}
        title="Manage Tokens"
        onPress={() => {
          navigation.push('token-management');
        }}
        subtitle="Add custom tokens and manage available tokens"
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
