// @flow strict-local
// TandaPayMenuScreen.js
import React from 'react';
import type { Node } from 'react'; // Import Node type for component return

// Import the necessary types from React Navigation
// You might need to adjust the path based on your project structure
import type { RouteProp } from '@react-navigation/native';
// You might also need the navigation prop type, even if you don't use it yet
import Screen from '../common/Screen';

import type { AppNavigationProp } from '../nav/AppNavigator'; // Or whatever navigator type is appropriate
import NavRow from '../common/NavRow';
import { IconSettings, IconTandaPayActions, IconTandaPayInfo, IconWallet } from '../common/Icons';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-menu'>,
  route: RouteProp<'tandapay-menu', void>,
|}>;

export default function TandaPayMenuScreen(props: Props): Node {
  const { navigation } = props;

  return (
    <Screen title="Open Tribunals / TandaPay Menu">
      <NavRow
        leftElement={{ type: 'icon', Component: IconWallet }}
        title="Wallet"
        onPress={() => {
          navigation.push('wallet');
        }}
        subtitle="Manage your Ethereum Wallet"
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconTandaPayInfo }}
        title="Tribunal (TandaPay) Info"
        onPress={() => {
          navigation.push('tandapay-info');
        }}
        subtitle="Information about the TandaPay Community"
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconTandaPayActions }}
        title="Tribunal (TandaPay) Actions"
        onPress={() => {
          navigation.push('tandapay-actions');
        }}
        subtitle="Send Transactions to the TandaPay Smart Contract"
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconSettings }}
        title="Tribunal (TandaPay) Settings"
        onPress={() => {
          navigation.push('tandapay-settings');
        }}
        subtitle="Configure some stuff"
      />
    </Screen>
  );
}
