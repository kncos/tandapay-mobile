/* @flow strict-local */

import React, { useState, useEffect, useCallback } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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
import { useNavigation } from '../../react-navigation';
import TandaPayStyles from '../styles';

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
});

function SendReceiveButtonRow() {
  const navigation = useNavigation();
  return (
    <View style={TandaPayStyles.buttonRow}>
      <ZulipButton style={TandaPayStyles.button} secondary text="Send" onPress={() => {}} />
      <ZulipButton
        style={TandaPayStyles.button}
        secondary
        text="Receive"
        onPress={() => {
          navigation.push('wallet-receive');
        }}
      />
    </View>
  );
}

function SetupWalletButtonRow() {
  const navigation = useNavigation();
  return (
    <View style={TandaPayStyles.buttonRow}>
      <ZulipButton
        style={TandaPayStyles.button}
        secondary
        text="Set Up Wallet"
        onPress={() => {
          navigation.push('wallet-setup');
        }}
      />
    </View>
  );
}

function WalletLoading() {
  return (
    <Screen title="Wallet Loading">
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
        <ZulipText text="Loading wallet..." style={{ marginTop: 16, textAlign: 'center' }} />
      </View>
    </Screen>
  );
}

function WalletSetupScreen() {
  return (
    <Screen title="Wallet Setup">
      <View style={styles.container}>
        <ZulipText
          style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}
          text="No Wallet Found"
        />
        <ZulipText
          style={{ fontSize: 16, marginBottom: 32, textAlign: 'center', lineHeight: 24 }}
          text="You need to create or import a wallet to use TandaPay's features."
        />
        <SetupWalletButtonRow />
      </View>
    </Screen>
  );
}

export default function WalletScreen(props: Props): Node {
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
    }, [checkWallet]),
  );

  if (loading) {
    return <WalletLoading />;
  }

  if (!walletExists || walletAddress == null || walletAddress === '') {
    return <WalletSetupScreen />;
  }

  return (
    <Screen title="Wallet">
      <View style={styles.container}>
        <WalletBalanceCard walletAddress={walletAddress} />
        <SendReceiveButtonRow />
        <TandaRibbon label="Transactions" backgroundColor={BRAND_COLOR}>
          <TandaPayBanner
            visible
            text="All Caught Up!"
            backgroundColor={QUARTER_COLOR}
            buttons={[
              {
                id: 'view-explorer',
                label: 'View on Explorer',
                onPress: () => {},
              },
            ]}
          />
        </TandaRibbon>
      </View>
    </Screen>
  );
}
