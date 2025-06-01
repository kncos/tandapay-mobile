/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import type { RouteProp } from '../../../react-navigation';
import type { AppNavigationProp } from '../../../nav/AppNavigator';
import Screen from '../../../common/Screen';
import ZulipButton from '../../../common/ZulipButton';
import ZulipText from '../../../common/ZulipText';
import TandaPayStyles from '../../styles';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet-setup'>,
  route: RouteProp<'wallet-setup', void>,
|}>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    marginVertical: 16,
  },
});

export default function WalletSetupScreen(props: Props): Node {
  const { navigation } = props;

  const handleGenerateWallet = () => {
    navigation.push('wallet-generate', { setupScreenCount: 2 });
  };

  const handleImportWallet = () => {
    navigation.push('wallet-import', { setupScreenCount: 2 });
  };

  return (
    <Screen title="Set Up Wallet">
      <View style={styles.container}>
        <ZulipText style={styles.title} text="Welcome to TandaPay Wallet" />
        <ZulipText
          style={styles.subtitle}
          text="To get started, you'll need to create a new wallet or import an existing one. Your wallet will be stored securely on your device."
        />

        <View style={styles.buttonContainer}>
          <ZulipButton
            style={TandaPayStyles.button}
            text="Create New Wallet"
            onPress={handleGenerateWallet}
          />
          <ZulipButton
            style={TandaPayStyles.button}
            text="Import Existing Wallet"
            onPress={handleImportWallet}
            secondary
          />
        </View>
      </View>
    </Screen>
  );
}
