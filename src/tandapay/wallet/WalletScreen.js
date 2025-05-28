/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Screen from '../../common/Screen';

import ZulipButton from '../../common/ZulipButton';
import WalletBalanceCard from './WalletBalanceCard';
import ZulipBanner from '../../common/ZulipBanner';
import ZulipText from '../../common/ZulipText';
import SectionHeader from '../../common/SectionHeader';
import TandaRibbon from '../TandaRibbon';
import { BRAND_COLOR } from '../../styles';

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

export default function WalletScreen() {
  const walletAddress = '0x195605c92F0C875a98c7c144CF817A23D779C310'; // Replace with actual address from state/secure store

  const handleSend = () => {
    // TODO: Implement send functionality
  };
  const handleReceive = () => {
    // TODO: Implement receive functionality
  };

  return (
    <Screen title="Wallet">
      <View style={styles.container}>
        <WalletBalanceCard walletAddress={walletAddress} />
        <ZulipBanner />
        <WalletButtonRow onSend={handleSend} onReceive={handleReceive} />
        <TandaRibbon label="Transactions" backgroundColor={BRAND_COLOR}>
          <ZulipText text="item1" />
          <ZulipText text="item2" />
          <ZulipText text="item3" />
        </TandaRibbon>
      </View>
    </Screen>
  );
}
