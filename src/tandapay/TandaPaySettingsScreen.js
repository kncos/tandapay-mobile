// @flow strict-local

import React from 'react';
import type { Node } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import NavRow from '../common/NavRow';
import TextRow from '../common/TextRow';
import { IconWallet, IconSmartphone, IconLanguage, IconPlusCircle } from '../common/Icons';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-settings'>,
  route: RouteProp<'tandapay-settings', void>,
|}>;

export default function TandaPaySettingsScreen(props: Props): Node {
  const { navigation } = props;

  return (
    <Screen title="Open Tribunals / TandaPay Settings">
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
        title="Open Tribunals / TandaPay version"
        subtitle="v1.0.0 Beta"
      />
    </Screen>
  );
}
