// @flow strict-local

import React, { useState, useEffect, useCallback } from 'react';
import type { Node } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { mn } from 'date-fns/esm/locale';
import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import TandaPayStyles, { TandaPayColors, TandaPayLayout, TandaPayTypography } from '../styles';
import { HALF_COLOR } from '../../styles/constants';
import Card from '../components/Card';
import { ScrollableTextBox } from '../components';
import {
  hasAlchemyApiKey,
  storeAlchemyApiKey,
  getAlchemyApiKey,
  deleteAlchemyApiKey,
  deleteWallet,
  getMnemonic,
} from './WalletManager';
import ApiKeyCard from './components/ApiKeyCard';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet-settings'>,
  route: RouteProp<'wallet-settings', void>,
|}>;

export default function WalletSettingsScreen(props: Props): Node {
  const [loading, setLoading] = useState(true);
  const [mnemonicVisible, setMnemonicVisible] = useState(false);
  const [mnemonic, setMnemonic] = useState<?string>(null);
  const [mnemonicLoading, setMnemonicLoading] = useState(false);

  const handleDeleteWallet = useCallback(async () => {
    Alert.alert(
      'Delete Wallet',
      'Are you sure you want to delete your wallet? This action cannot be undone. Make sure you have your recovery phrase saved.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteWallet();
            if (result.success) {
              Alert.alert(
                'Wallet Deleted',
                'Your wallet has been successfully deleted.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to wallet screen to show "no wallet" state
                      // navigation.push('wallet');
                    },
                  },
                ]
              );
            } else {
              Alert.alert('Error', result.error.userMessage != null ? result.error.userMessage : 'Failed to delete wallet. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  const handleRevealMnemonic = useCallback(async () => {
    Alert.alert(
      'Reveal Recovery Phrase',
      'Your recovery phrase is extremely sensitive. Anyone with access to it can control your wallet. Make sure you are in a private, secure location.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'I Understand',
          onPress: async () => {
            setMnemonicLoading(true);
            const result = await getMnemonic();
            setMnemonicLoading(false);

            if (result.success && result.data != null && result.data !== '') {
              setMnemonic(result.data);
              setMnemonicVisible(true);
            } else {
              Alert.alert(
                'Error',
                (result.error?.userMessage != null && result.error.userMessage !== '')
                  ? result.error.userMessage
                  : 'Failed to retrieve recovery phrase. Please try again.'
              );
            }
          },
        },
      ]
    );
  }, []);

  const handleCopyMnemonic = useCallback((text: string, label: string) => {
    Alert.alert('Copied', `${label} copied to clipboard.`);
  }, []);

  const handleHideMnemonic = useCallback(() => {
    setMnemonicVisible(false);
    setMnemonic(null);
  }, []);

  // Check if API key exists on component mount
  useEffect(() => {
    const checkApiKey = async () => {
      // Just simulate loading for consistency
      setLoading(false);
    };

    checkApiKey();
  }, []);

  if (loading) {
    return (
      <Screen title="Wallet Settings" canGoBack>
        <View style={TandaPayLayout.screen}>
          <ZulipText text="Loading..." style={{ textAlign: 'center', marginTop: 50 }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Wallet Settings" canGoBack>
      <ScrollView style={TandaPayLayout.screen}>
        <View style={TandaPayLayout.scrollPadded}>
          {/* Mnemonic Reveal Section */}
          <View style={TandaPayLayout.section}>
            <Card>
              <ZulipText text="Recovery Phrase" style={TandaPayTypography.sectionTitle} />
              <ZulipText
                text="Your recovery phrase is the master key to your wallet. Keep it safe and never share it with anyone."
                style={TandaPayTypography.description}
              />

              {mnemonicVisible ? (
                <View>
                  <ScrollableTextBox
                    text={mnemonic || ''}
                    label="Recovery Phrase"
                    onCopySuccess={handleCopyMnemonic}
                  />

                  <View style={TandaPayLayout.buttonRow}>
                    <ZulipButton
                      text="Hide Recovery Phrase"
                      onPress={handleHideMnemonic}
                      style={TandaPayStyles.button}
                      secondary
                    />
                  </View>
                </View>
              ) : (
                <View style={TandaPayLayout.buttonRow}>
                  <ZulipButton
                    text="Reveal Recovery Phrase"
                    onPress={handleRevealMnemonic}
                    disabled={mnemonicLoading}
                    progress={mnemonicLoading}
                    style={TandaPayStyles.button}
                    secondary
                  />
                </View>
              )}
            </Card>
          </View>

          <View style={TandaPayLayout.section}>
            <ApiKeyCard
              title="Alchemy API Key"
              description="Configure your Alchemy API key for transaction history and enhanced blockchain data features."
              inputLabel="Alchemy API Key"
              inputPlaceholder="Enter your Alchemy API key"
              updateInputPlaceholder="Enter new Alchemy API key"
              apiKeyMethods={{
                hasApiKey: hasAlchemyApiKey,
                getApiKey: getAlchemyApiKey,
                storeApiKey: storeAlchemyApiKey,
                deleteApiKey: deleteAlchemyApiKey,
              }}
            />
          </View>

          {/* Delete Wallet Button */}
          <View style={TandaPayLayout.buttonRow}>
            <ZulipButton
              text="Delete Wallet"
              onPress={handleDeleteWallet}
              style={{
                ...TandaPayStyles.button,
                backgroundColor: TandaPayColors.error
              }}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
