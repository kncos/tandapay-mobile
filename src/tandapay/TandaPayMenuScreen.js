// @flow strict-local
// TandaPayMenuScreen.js
import React from 'react';
import type { Node } from 'react'; // Import Node type for component return
import { View } from 'react-native';

// Import the necessary types from React Navigation
// You might need to adjust the path based on your project structure
import type { RouteProp } from '@react-navigation/native';
// You might also need the navigation prop type, even if you don't use it yet
import Screen from '../common/Screen';
import ZulipButton from '../common/ZulipButton';

import type { AppNavigationProp } from '../nav/AppNavigator'; // Or whatever navigator type is appropriate
import NavRow from '../common/NavRow';
import { IconSettings, IconTandaPayActions, IconTandaPayInfo, IconWallet } from '../common/Icons';
import TandaPayStyles from './styles';

// Import the ERC20 spending query functions
import {
  tryGetPayPremiumErc20Spend,
  tryGetJoinCommunityErc20Spend,
  tryGetInjectFundsErc20Spend,
  tryGetDivideShortfallErc20Spend
} from './contract/queryErc20Spending';

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

  // Test functions for ERC20 spending queries
  const testPayPremiumSpend = async () => {
    console.log('Testing tryGetPayPremiumErc20Spend...');
    try {
      const result = await tryGetPayPremiumErc20Spend();
      console.log('Pay Premium Result:', result);
    } catch (error) {
      console.log('Pay Premium Error:', error);
    }
  };

  const testJoinCommunitySpend = async () => {
    console.log('Testing tryGetJoinCommunityErc20Spend...');
    try {
      const result = await tryGetJoinCommunityErc20Spend();
      console.log('Join Community Result:', result);
    } catch (error) {
      console.log('Join Community Error:', error);
    }
  };

  const testInjectFundsSpend = async () => {
    console.log('Testing tryGetInjectFundsErc20Spend...');
    try {
      const result = await tryGetInjectFundsErc20Spend();
      console.log('Inject Funds Result:', result);
    } catch (error) {
      console.log('Inject Funds Error:', error);
    }
  };

  const testDivideShortfallSpend = async () => {
    console.log('Testing tryGetDivideShortfallErc20Spend...');
    try {
      const result = await tryGetDivideShortfallErc20Spend();
      console.log('Divide Shortfall Result:', result);
    } catch (error) {
      console.log('Divide Shortfall Error:', error);
    }
  };

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
      
      {/* Test buttons for ERC20 spending queries */}
      <View style={TandaPayStyles.buttonRow}>
        <ZulipButton
          style={TandaPayStyles.button}
          text="Test Pay Premium"
          onPress={testPayPremiumSpend}
        />
      </View>
      <View style={TandaPayStyles.buttonRow}>
        <ZulipButton
          style={TandaPayStyles.button}
          text="Test Join Community"
          onPress={testJoinCommunitySpend}
        />
      </View>
      <View style={TandaPayStyles.buttonRow}>
        <ZulipButton
          style={TandaPayStyles.button}
          text="Test Inject Funds"
          onPress={testInjectFundsSpend}
        />
      </View>
      <View style={TandaPayStyles.buttonRow}>
        <ZulipButton
          style={TandaPayStyles.button}
          text="Test Divide Shortfall"
          onPress={testDivideShortfallSpend}
        />
      </View>
    </Screen>
  );
}
