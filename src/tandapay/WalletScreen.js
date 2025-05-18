/* eslint-disable import/no-extraneous-dependencies */
// @flow strict-local

import React, { useState, useEffect } from 'react';
import type { Node } from 'react';

import { View, Text, StyleSheet } from 'react-native';

// $FlowFixMe untyped import of expo-secure-store
import * as SecureStore from 'expo-secure-store';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import ZulipButton from '../common/ZulipButton';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet'>,
  route: RouteProp<'wallet', void>,
|}>;

const MNEMONIC_KEY = 'mnemonic';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#888',
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

function CreateWalletButton(props: {||}) {
  const [isLoading, setIsLoading] = useState(false);

  const createMnemonic = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd generate a secure mnemonic here!
      const mnemonic = 'example mnemonic words...'; // Replace!
      await SecureStore.setItemAsync(
        MNEMONIC_KEY,
        mnemonic,
        {
          requireAuthentication: true,
        }
      );
    } catch (error) {
      console.error('Error creating wallet:', error);
      // Handle the error appropriately (e.g., show an alert)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Create Wallet"
      onPress={createMnemonic}
    />
  );
}

function DeleteWalletButton(props: {||}) {
  const [isLoading, setIsLoading] = useState(false);

  const deleteMnemonic = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync(MNEMONIC_KEY);
    } catch (error) {
      console.error('Error deleting wallet:', error);
      // Handle the error appropriately (e.g., show an alert)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Delete Wallet"
      onPress={deleteMnemonic}
    />
  );
}

export default function WalletScreen(props: Props): Node {
  const [walletExists, setWalletExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkWallet = async () => {
      setIsLoading(true);
      try {
        const mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY);
        setWalletExists(mnemonic !== null);
      } catch (error) {
        console.error('Error checking wallet:', error);
        // Handle the error appropriately (e.g., show an alert)
      } finally {
        setIsLoading(false);
      }
    };

    checkWallet();
  }, []);

  let statusText;
  if (isLoading) {
    statusText = 'Checking Wallet...';
  } else {
    statusText = walletExists ? 'Wallet Detected' : 'Wallet Not Detected';
  }

  return (
    <Screen title="Wallet">
      <CreateWalletButton />
      <DeleteWalletButton />
      <View style={styles.container}>
        <Text style={styles.placeholderText}>{statusText}</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.placeholderText}>asdf</Text>
      </View>
    </Screen>
  );
}
