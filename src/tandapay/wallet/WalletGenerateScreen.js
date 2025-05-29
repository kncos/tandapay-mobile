// @flow strict-local

import React, { useState } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import { generateWallet } from './WalletManager';
import type { WalletInfo } from './WalletManager';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet-generate'>,
  route: RouteProp<'wallet-generate', {| setupScreenCount?: number |} | void>,
|}>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  mnemonicContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  mnemonicText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 12,
  },
  buttonSpacing: {
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function WalletGenerateScreen(props: Props): Node {
  const { navigation, route } = props;
  const setupScreenCount = route.params?.setupScreenCount ?? 2;
  const [walletInfo, setWalletInfo] = useState<?WalletInfo>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateWallet = async () => {
    setIsGenerating(true);
    try {
      const newWallet = await generateWallet();
      setWalletInfo(newWallet);
      setHasGenerated(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate wallet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    if (walletInfo?.mnemonic != null && walletInfo.mnemonic.length > 0) {
      navigation.push('wallet-verify', {
        mnemonic: walletInfo.mnemonic,
        setupScreenCount: setupScreenCount + 1
      });
    }
  };

  const handleCopyMnemonic = () => {
    if (walletInfo?.mnemonic != null && walletInfo.mnemonic.length > 0) {
      Clipboard.setString(walletInfo.mnemonic);
      Alert.alert('Copied', 'Recovery phrase copied to clipboard');
    }
  };

  if (isGenerating) {
    return (
      <Screen title="Generate Wallet">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ZulipText text="Generating secure wallet..." style={{ marginTop: 16 }} />
        </View>
      </Screen>
    );
  }

  if (!hasGenerated) {
    return (
      <Screen title="Generate Wallet">
        <View style={styles.container}>
          <View style={styles.content}>
            <ZulipText style={styles.title} text="Create New Wallet" />
            <ZulipText
              style={styles.description}
              text="A new wallet will be generated with a 12-word recovery phrase. This phrase is the only way to recover your wallet if you lose access to this device."
            />
            <ZulipButton
              text="Generate Wallet"
              onPress={handleGenerateWallet}
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Generate Wallet">
      <View style={styles.container}>
        <ZulipText style={styles.title} text="Your Recovery Phrase" />
        <ZulipText
          style={styles.description}
          text="Write down these 12 words in order and store them safely. This is the only way to recover your wallet."
        />

        {walletInfo?.mnemonic != null && (
          <View style={styles.mnemonicContainer}>
            <ZulipText style={styles.mnemonicText} text={walletInfo.mnemonic} />
          </View>
        )}

        <ZulipText
          style={styles.warningText}
          text="⚠️ Never share your recovery phrase with anyone. Store it in a safe place offline."
        />

        <View style={styles.buttonContainer}>
          <View style={styles.buttonSpacing}>
            <ZulipButton
              secondary
              text="Copy to Clipboard"
              onPress={handleCopyMnemonic}
            />
          </View>
          <ZulipButton
            text="I've Written It Down"
            onPress={handleContinue}
          />
        </View>
      </View>
    </Screen>
  );
}
