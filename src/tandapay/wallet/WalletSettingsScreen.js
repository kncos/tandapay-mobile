// @flow strict-local

import React, { useState, useEffect, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import { IconPrivate } from '../../common/Icons';
import { ThemeContext } from '../../styles';
import { BRAND_COLOR, HIGHLIGHT_COLOR, HALF_COLOR } from '../../styles/constants';
import {
  hasEtherscanApiKey,
  storeEtherscanApiKey,
  getEtherscanApiKey,
  deleteEtherscanApiKey,
} from './WalletManager';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet-settings'>,
  route: RouteProp<'wallet-settings', void>,
|}>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
  },
  statusIcon: {
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  apiKeyContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  apiKeyText: {
    fontFamily: 'monospace',
    fontSize: 14,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

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
      try {
        const exists = await hasEtherscanApiKey();
        setHasApiKey(exists);
      } catch (error) {
        // Error checking API key
      } finally {
        setLoading(false);
      }
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
      try {
        await storeEtherscanApiKey(apiKeyInput.trim());
        setHasApiKey(true);
        setApiKeyInput('');
        setRevealedApiKey(null);
        Alert.alert('Success', 'Etherscan API key has been saved successfully.');
      } catch (error) {
        Alert.alert('Error', 'Failed to save API key. Please try again.');
      } finally {
        setSaving(false);
      }
    }, 0);
  }, [apiKeyInput]);

  const handleRevealApiKey = useCallback(async () => {
    try {
      const apiKey = await getEtherscanApiKey();
      if (apiKey != null && apiKey !== '') {
        setRevealedApiKey(apiKey);
      } else {
        Alert.alert('Error', 'No API key found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to retrieve API key.');
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
            try {
              await deleteEtherscanApiKey();
              setHasApiKey(false);
              setRevealedApiKey(null);
              Alert.alert('Success', 'Etherscan API key has been deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete API key. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  const handleHideApiKey = useCallback(() => {
    setRevealedApiKey(null);
  }, []);

  if (loading) {
    return (
      <Screen title="Wallet Settings" canGoBack>
        <View style={styles.container}>
          <ZulipText text="Loading..." style={{ textAlign: 'center', marginTop: 50 }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Wallet Settings" canGoBack>
      <ScrollView style={styles.container}>
        <View style={styles.scrollContainer}>
          {/* Etherscan API Configuration Section */}
          <View style={styles.section}>
            <ZulipText style={[styles.sectionTitle, { color: themeData.color }]}>
              Etherscan API Configuration
            </ZulipText>
            <ZulipText style={[styles.sectionDescription, { color: themeData.color }]}>
              Configure your Etherscan API key to enable transaction history and enhanced blockchain data features.
            </ZulipText>

            {/* Status Card */}
            <View
              style={[
                styles.statusCard,
                {
                  backgroundColor: themeData.cardColor,
                  borderColor: hasApiKey ? BRAND_COLOR : HIGHLIGHT_COLOR,
                },
              ]}
            >
              <View style={styles.statusIcon}>
                <IconPrivate size={24} color={hasApiKey ? BRAND_COLOR : HALF_COLOR} />
              </View>
              <View style={styles.statusContent}>
                <ZulipText style={[styles.statusTitle, { color: themeData.color }]}>
                  {hasApiKey ? 'API Key Configured' : 'No API Key Set'}
                </ZulipText>
                <ZulipText style={[styles.statusSubtitle, { color: themeData.color }]}>
                  {hasApiKey
                    ? 'Etherscan API key is set and active'
                    : 'Add an Etherscan API key to enhance functionality'}
                </ZulipText>
              </View>
            </View>

            {/* API Key Management */}
            {hasApiKey && (
              <>
                {/* Reveal/Delete buttons */}
                <View style={styles.buttonRow}>
                  <ZulipButton
                    style={styles.button}
                    text="Reveal Key"
                    onPress={handleRevealApiKey}
                    secondary
                  />
                  <ZulipButton
                    style={styles.button}
                    text="Delete Key"
                    onPress={handleDeleteApiKey}
                    secondary
                  />
                </View>

                {/* Revealed API Key */}
                {revealedApiKey != null && revealedApiKey !== '' && (
                  <View
                    style={[
                      styles.apiKeyContainer,
                      {
                        backgroundColor: themeData.cardColor,
                        borderColor: HIGHLIGHT_COLOR,
                      },
                    ]}
                  >
                    <ZulipText style={[styles.inputLabel, { color: themeData.color }]}>
                      Your API Key:
                    </ZulipText>
                    <ZulipText style={[styles.apiKeyText, { color: themeData.color }]}>
                      {revealedApiKey}
                    </ZulipText>
                    <ZulipButton text="Hide" onPress={handleHideApiKey} secondary />
                  </View>
                )}
              </>
            )}

            {/* Input Card */}
            <View style={[styles.card, { backgroundColor: themeData.cardColor }]}>
              <View style={styles.inputContainer}>
                <ZulipText style={[styles.inputLabel, { color: themeData.color }]}>
                  {hasApiKey ? 'Update API Key' : 'Etherscan API Key'}
                </ZulipText>
                <TextInput
                  style={[
                    styles.textInput,
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
            </View>
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
