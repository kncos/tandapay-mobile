// @flow strict-local

import React, { useState, useEffect, useCallback } from 'react';
import type { Node } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import TandaPayStyles, { TandaPayColors, TandaPayLayout } from '../styles';
import {
  hasAlchemyApiKey,
  storeAlchemyApiKey,
  getAlchemyApiKey,
  deleteAlchemyApiKey,
  deleteWallet,
} from './WalletManager';
import ApiKeyCard from './components/ApiKeyCard';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet-settings'>,
  route: RouteProp<'wallet-settings', void>,
|}>;

export default function WalletSettingsScreen(props: Props): Node {
  const [loading, setLoading] = useState(true);

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
