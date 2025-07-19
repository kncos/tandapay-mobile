// @flow strict-local
// TandaPayMenuScreen.js
import React from 'react';
import type { Node } from 'react'; // Import Node type for component return
// import { View, Text, StyleSheet } from 'react-native';

// Import the necessary types from React Navigation
// You might need to adjust the path based on your project structure
import type { RouteProp } from '@react-navigation/native';
// You might also need the navigation prop type, even if you don't use it yet
import Screen from '../common/Screen';

import type { AppNavigationProp } from '../nav/AppNavigator'; // Or whatever navigator type is appropriate
import NavRow from '../common/NavRow';
import { IconSettings, IconTandaPayActions, IconTandaPayInfo, IconWallet } from '../common/Icons';
import ZulipButton from '../common/ZulipButton';
import { TransactionManager } from './wallet/TransactionManagerNew';
import {
  getFullTransactionChipInfo,
  prettyPrintFullTransaction,
} from "./wallet/FullTransaction";

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-menu'>,
  route: RouteProp<'tandapay-menu', void>,
|}>;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   placeholderText: {
//     fontSize: 18,
//     color: '#888',
//   },
// });

export default function TandaPayMenuScreen(props: Props): Node {
  const { navigation } = props;
  const tm = new TransactionManager(
    'sepolia',
    '0xA726263b90717e431EE068230bA5623469a5D5D9',
    '0x02d93c46703e2447e1cC08b457982992763B9Cc0',
  );

  return (
    <Screen title="TandaPay Menu">
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
        title="TandaPay Info"
        onPress={() => {
          navigation.push('tandapay-info');
        }}
        subtitle="Information about the TandaPay Community"
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconTandaPayActions }}
        title="TandaPay Actions"
        onPress={() => {
          navigation.push('tandapay-actions');
        }}
        subtitle="Send Transactions to the TandaPay Smart Contract"
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconSettings }}
        title="TandaPay Settings"
        onPress={() => {
          navigation.push('tandapay-settings');
        }}
        subtitle="Configure some stuff"
      />
      <ZulipButton
        text="Test TransactionManager"
        onPress={async () => {
          try {
//            let i = 0;
//            while (!tm.isAtLastPage()) {
//              await tm.loadMore();
//              if (i > 25) {
//                console.warn('Loaded more than 25 pages, stopping to avoid infinite loop.');
//                break;
//              }
//              i++;
//            }
//            console.log('All transactions loaded successfully.');
            await tm.loadMore();
            console.log('Transactions fetched successfully.');
          } catch (error) {
            console.error('Error fetching transactions:', error);
          }
        }}
      />
      <ZulipButton
        text="Log Transactions"
        onPress={() => {
          const res = tm.getOrderedTransactions();
          for (const ft of res) {
            console.log(getFullTransactionChipInfo(ft).join('\n'));
            console.log('----------------------------------');
          }
        }}
      />
    </Screen>
  );
}
