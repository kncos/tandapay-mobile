/* @flow strict-local */

import React, { useState, useEffect, useCallback } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';

import ZulipButton from '../../common/ZulipButton';
import WalletBalanceCard from './WalletBalanceCard';
import ZulipText from '../../common/ZulipText';
import TandaRibbon from '../TandaRibbon';
import TandaPayBanner from '../TandaPayBanner';
import { BRAND_COLOR, QUARTER_COLOR } from '../../styles';
import { hasWallet, getWalletAddress } from './WalletManager';

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
  const { navigation } = props;
  const [walletAddress, setWalletAddress] = useState<?string>(null);
  const [loading, setLoading] = useState(true);
  const [walletExists, setWalletExists] = useState(false);

  const checkWallet = useCallback(async () => {
    try {
      setLoading(true);
      const exists = await hasWallet();
      setWalletExists(exists);

      if (exists) {
        const address = await getWalletAddress();
        setWalletAddress(address);
      } else {
        setWalletAddress(null);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error checking wallet:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkWallet();
  }, [checkWallet]);

  // Refresh wallet state when screen comes into focus (e.g., returning from setup)
  useFocusEffect(
    useCallback(() => {
      checkWallet();
    }, [checkWallet])
  );

  const handleSend = () => {
    // TODO: Implement send functionality
  };

  const handleReceive = () => {
    // TODO: Implement receive functionality
  };

  const handleViewOnExplorer = () => {
    if (walletAddress != null && walletAddress !== '') {
      const url = `https://etherscan.io/address/${walletAddress}`;
      Linking.openURL(url);
    }
  };

  const handleSetupWallet = () => {
    navigation.push('wallet-setup');
  };

  if (loading) {
    return (
      <Screen title="Wallet">
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" />
          <ZulipText text="Loading wallet..." style={{ marginTop: 16, textAlign: 'center' }} />
        </View>
      </Screen>
    );
  }

  if (!walletExists || walletAddress == null || walletAddress === '') {
    return (
      <Screen title="Wallet">
        <View style={styles.container}>
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <ZulipText
              style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}
              text="No Wallet Found"
            />
            <ZulipText
              style={{ fontSize: 16, marginBottom: 32, textAlign: 'center', lineHeight: 24 }}
              text="You need to create or import a wallet to use TandaPay's features."
            />
            <ZulipButton
              text="Set Up Wallet"
              onPress={handleSetupWallet}
            />
          </View>
        </View>
      </Screen>
    );
  }

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
