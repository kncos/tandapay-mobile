// @flow strict-local

import React, { useState, useEffect, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View, Alert, TextInput, ScrollView } from 'react-native';
// $FlowFixMe[untyped-import]
import Clipboard from '@react-native-clipboard/clipboard';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import { IconPrivate } from '../../common/Icons';
import { ThemeContext } from '../../styles';
import TandaPayStyles, { TandaPayTypography, TandaPayLayout } from '../styles';
import { BRAND_COLOR, HIGHLIGHT_COLOR, HALF_COLOR } from '../../styles/constants';
import {
  hasEtherscanApiKey,
  storeEtherscanApiKey,
  getEtherscanApiKey,
  deleteEtherscanApiKey,
} from './WalletManager';
import Card from '../components/Card';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet-settings'>,
  route: RouteProp<'wallet-settings', void>,
|}>;

// Only minimal custom styles that truly can't be centralized
const customStyles = {
  statusIcon: {
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
};

export default function WalletSettingsScreen(props: Props): Node {
  const { navigation } = props;
  const themeData = useContext(ThemeContext);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [revealedApiKey, setRevealedApiKey] = useState<?string>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check if API key exists on component mount
  useEffect(() => {
    const checkApiKey = async () => {
      const result = await hasEtherscanApiKey();
      if (result.success) {
        setHasApiKey(result.data);
      } else {
        // Error checking API key - default to false
        setHasApiKey(false);
      }
      setLoading(false);
    };

    checkApiKey();
  }, []);

  const handleSetApiKey = useCallback(async () => {
    if (!apiKeyInput.trim()) {
      Alert.alert('Invalid Input', 'Please enter a valid Etherscan API key.');
      return;
    }

    setSaving(true);

    // Use setTimeout to ensure state update happens before async operation
    setTimeout(async () => {
      const result = await storeEtherscanApiKey(apiKeyInput.trim());
      if (result.success) {
        setHasApiKey(true);
        setApiKeyInput('');
        setRevealedApiKey(null);
        Alert.alert('Success', 'Etherscan API key has been saved successfully.');
      } else {
        Alert.alert('Error', result.error.userMessage != null ? result.error.userMessage : 'Failed to save API key. Please try again.');
      }
      setSaving(false);
    }, 0);
  }, [apiKeyInput]);

  const handleRevealApiKey = useCallback(async () => {
    const result = await getEtherscanApiKey();
    if (result.success) {
      const apiKey = result.data;
      if (apiKey != null && apiKey !== '') {
        setRevealedApiKey(apiKey);
      } else {
        Alert.alert('Error', 'No API key found.');
      }
    } else {
      Alert.alert('Error', result.error.userMessage != null ? result.error.userMessage : 'Failed to retrieve API key.');
    }
  }, []);

  const handleDeleteApiKey = useCallback(async () => {
    Alert.alert(
      'Delete API Key',
      'Are you sure you want to delete your Etherscan API key? This will affect transaction history and blockchain data features.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteEtherscanApiKey();
            if (result.success) {
              setHasApiKey(false);
              setRevealedApiKey(null);
              Alert.alert('Success', 'Etherscan API key has been deleted.');
            } else {
              Alert.alert('Error', result.error.userMessage != null ? result.error.userMessage : 'Failed to delete API key. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  const handleHideApiKey = useCallback(() => {
    setRevealedApiKey(null);
  }, []);

  const handleCopyApiKey = useCallback(() => {
    if (revealedApiKey != null && revealedApiKey !== '') {
      Clipboard.setString(revealedApiKey);
      Alert.alert('Copied', 'API key copied to clipboard');
    }
  }, [revealedApiKey]);

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
          {/* Etherscan API Configuration Section */}
          <View style={TandaPayLayout.section}>
            <ZulipText style={[TandaPayTypography.sectionTitle, { color: themeData.color }]}>
              Etherscan API Configuration
            </ZulipText>
            <ZulipText style={[TandaPayTypography.description, { color: themeData.color }]}>
              Configure your Etherscan API key to enable transaction history and enhanced blockchain data features.
            </ZulipText>

            {/* Status Card */}
            <Card
              style={[
                { flexDirection: 'row', alignItems: 'center' },
                { borderWidth: 2, borderColor: hasApiKey ? BRAND_COLOR : HIGHLIGHT_COLOR },
              ]}
            >
              <View style={customStyles.statusIcon}>
                <IconPrivate size={24} color={hasApiKey ? BRAND_COLOR : HALF_COLOR} />
              </View>
              <View style={customStyles.statusContent}>
                <ZulipText style={[TandaPayTypography.subsectionTitle, { color: themeData.color }]}>
                  {hasApiKey ? 'API Key Configured' : 'No API Key Set'}
                </ZulipText>
                <ZulipText style={[TandaPayTypography.description, { color: themeData.color }]}>
                  {hasApiKey
                    ? 'Etherscan API key is set and active'
                    : 'Add an Etherscan API key to enhance functionality'}
                </ZulipText>
              </View>
            </Card>

            {/* API Key Management */}
            {hasApiKey && (
              <>
                {/* Reveal/Delete buttons */}
                <View style={[TandaPayStyles.buttonRow, { marginTop: 16 }]}>
                  <ZulipButton
                    style={TandaPayStyles.button}
                    text="Reveal Key"
                    onPress={handleRevealApiKey}
                    secondary
                  />
                  <ZulipButton
                    style={TandaPayStyles.button}
                    text="Delete Key"
                    onPress={handleDeleteApiKey}
                    secondary
                  />
                </View>

                {/* Revealed API Key */}
                {revealedApiKey != null && revealedApiKey !== '' && (
                  <Card style={{ borderWidth: 1, borderColor: HIGHLIGHT_COLOR, marginTop: 16 }}>
                    <ZulipText style={[TandaPayTypography.inputLabel, { color: themeData.color, marginBottom: 8 }]}>
                      Your API Key:
                    </ZulipText>
                    <ZulipText style={[TandaPayTypography.monospace, { color: themeData.color, marginBottom: 16 }]}>
                      {revealedApiKey}
                    </ZulipText>
                    <View style={TandaPayStyles.buttonRow}>
                      <ZulipButton
                        style={TandaPayStyles.button}
                        text="Copy to Clipboard"
                        onPress={handleCopyApiKey}
                        secondary
                      />
                      <ZulipButton
                        style={TandaPayStyles.button}
                        text="Hide"
                        onPress={handleHideApiKey}
                        secondary
                      />
                    </View>
                  </Card>
                )}
              </>
            )}

            {/* Input Card */}
            <Card style={{ marginTop: 16 }}>
              <View style={TandaPayLayout.inputContainer}>
                <ZulipText style={[TandaPayTypography.inputLabel, { color: themeData.color }]}>
                  {hasApiKey ? 'Update API Key' : 'Etherscan API Key'}
                </ZulipText>
                <TextInput
                  style={[
                    TandaPayStyles.base,
                    {
                      borderColor: themeData.dividerColor,
                      backgroundColor: themeData.backgroundColor,
                      color: themeData.color,
                    },
                  ]}
                  value={apiKeyInput}
                  onChangeText={setApiKeyInput}
                  placeholder={hasApiKey ? 'Enter new Etherscan API key' : 'Enter your Etherscan API key'}
                  placeholderTextColor={HALF_COLOR}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <ZulipButton
                  text={saving ? 'Saving...' : (hasApiKey ? 'Update API Key' : 'Save API Key')}
                  onPress={handleSetApiKey}
                  disabled={!apiKeyInput.trim() || saving}
                  progress={saving}
                />
              </View>
            </Card>
          </View>

          {/* Back to Wallet Button */}
          <ZulipButton
            style={{ marginTop: 16 }}
            text="Back to Wallet"
            onPress={() => navigation.push('wallet')}
            secondary
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
