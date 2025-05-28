/* @flow strict-local */
/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Linking } from 'react-native';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';

import ZulipButton from '../../common/ZulipButton';
// $FlowFixMe[untyped-import] - Adding Flow types to this component
import WalletBalanceCard from './WalletBalanceCard';
import ZulipText from '../../common/ZulipText';
// $FlowFixMe[untyped-import] - Adding Flow types to this component
import TandaRibbon from '../TandaRibbon';
import TandaPayBanner from '../TandaPayBanner';
import { BRAND_COLOR, QUARTER_COLOR } from '../../styles';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet'>,
  route: RouteProp<'wallet', void>,
|}>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  button: {
    flex: 1,
    margin: 8,
  },
});

function WalletButtonRow({ onSend, onReceive }) {
  return (
    <View style={styles.buttonRow}>
      <ZulipButton
        style={styles.button}
        secondary
        text="Send"
        onPress={onSend}
      />
      <ZulipButton
        style={styles.button}
        secondary
        text="Receive"
        onPress={onReceive}
      />
    </View>
  );
}

export default function WalletScreen(props: Props): Node {
  const walletAddress = '0x195605c92F0C875a98c7c144CF817A23D779C310'; // Replace with actual address from state/secure store

  const handleSend = () => {
    // TODO: Implement send functionality
  };
  const handleReceive = () => {
    // TODO: Implement receive functionality
  };

  const handleViewOnExplorer = () => {
    const url = `https://etherscan.io/address/${walletAddress}`;
    Linking.openURL(url);
  };

  return (
    <Screen title="Wallet">
      <View style={styles.container}>
        <WalletBalanceCard walletAddress={walletAddress} />
        <WalletButtonRow onSend={handleSend} onReceive={handleReceive} />
        <TandaRibbon label="Transactions" backgroundColor={BRAND_COLOR}>
          <TandaPayBanner
            visible
            text="All Caught Up!"
            backgroundColor={QUARTER_COLOR}
            buttons={[{
              id: 'view-explorer',
              label: 'View on Explorer',
              onPress: handleViewOnExplorer,
            }]}
          />
          <ZulipText text="item1" />
          <ZulipText text="item2" />
          <ZulipText text="item3" />
        </TandaRibbon>
      </View>
    </Screen>
  );
}
