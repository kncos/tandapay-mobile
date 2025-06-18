// @flow strict-local

import React, { useState, useEffect, useCallback } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Alert, TextInput } from 'react-native';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import NavRow from '../../common/NavRow';
import { IconPrivate, IconWallet } from '../../common/Icons';
import { TandaRibbon } from '../components';
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  inputContainer: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  apiKeyContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  apiKeyText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default function WalletSettingsScreen(props: Props): Node {
  const { navigation } = props;
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [revealedApiKey, setRevealedApiKey] = useState<?string>(null);
  const [loading, setLoading] = useState(true);

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

    try {
      await storeEtherscanApiKey(apiKeyInput.trim());
      setHasApiKey(true);
      setApiKeyInput('');
      setRevealedApiKey(null);
      Alert.alert('Success', 'Etherscan API key has been saved successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    }
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
      <View style={styles.container}>
        <TandaRibbon label="Etherscan API Configuration" marginTop={0}>
          <ZulipText
            text="Configure your Etherscan API key to enable transaction history and enhanced blockchain data features."
            style={{ marginBottom: 16, fontSize: 14, color: '#666' }}
          />

          {!hasApiKey ? (
            <>
              <NavRow
                leftElement={{ type: 'icon', Component: IconPrivate }}
                title="No API Key Set"
                subtitle="Add an Etherscan API key to enhance functionality"
                onPress={() => {}}
              />

              <View style={styles.inputContainer}>
                <ZulipText style={styles.label} text="Etherscan API Key" />
                <TextInput
                  style={styles.textInput}
                  value={apiKeyInput}
                  onChangeText={setApiKeyInput}
                  placeholder="Enter your Etherscan API key"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <ZulipButton
                text="Save API Key"
                onPress={handleSetApiKey}
                disabled={!apiKeyInput.trim()}
              />
            </>
          ) : (
            <>
              <NavRow
                leftElement={{ type: 'icon', Component: IconPrivate }}
                title="API Key Configured"
                subtitle="Etherscan API key is set and active"
                onPress={() => {}}
              />

              {revealedApiKey != null && revealedApiKey !== '' ? (
                <View style={styles.apiKeyContainer}>
                  <ZulipText style={styles.label} text="Your API Key:" />
                  <ZulipText style={styles.apiKeyText} text={revealedApiKey} />
                  <ZulipButton
                    text="Hide"
                    onPress={handleHideApiKey}
                    secondary
                    style={{ marginTop: 12 }}
                  />
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  <ZulipButton
                    style={styles.button}
                    text="Reveal"
                    onPress={handleRevealApiKey}
                    secondary
                  />
                  <ZulipButton
                    style={styles.button}
                    text="Delete"
                    onPress={handleDeleteApiKey}
                    secondary
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <ZulipText style={styles.label} text="Update API Key" />
                <TextInput
                  style={styles.textInput}
                  value={apiKeyInput}
                  onChangeText={setApiKeyInput}
                  placeholder="Enter new Etherscan API key"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <ZulipButton
                  text="Update API Key"
                  onPress={handleSetApiKey}
                  disabled={!apiKeyInput.trim()}
                  style={{ marginTop: 12 }}
                />
              </View>
            </>
          )}
        </TandaRibbon>

        <TandaRibbon label="General Settings">
          <NavRow
            leftElement={{ type: 'icon', Component: IconWallet }}
            title="Back to Wallet"
            onPress={() => navigation.push('wallet')}
            subtitle="Return to main wallet screen"
          />
        </TandaRibbon>
      </View>
    </Screen>
  );
}
