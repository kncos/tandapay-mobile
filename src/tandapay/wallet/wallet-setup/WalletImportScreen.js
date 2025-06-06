/* @flow strict-local */

import React, { useState, useCallback, useEffect } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';

import type { RouteProp } from '../../../react-navigation';
import type { AppNavigationProp } from '../../../nav/AppNavigator';
import Screen from '../../../common/Screen';
import ZulipButton from '../../../common/ZulipButton';
import ZulipText from '../../../common/ZulipText';
import { importWallet, validateMnemonic } from '../WalletManager';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet-import'>,
  route: RouteProp<'wallet-import', {| setupScreenCount?: number |} | void>,
|}>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  inputContainer: {
    marginBottom: 24,
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
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  validInput: {
    borderColor: '#4CAF50',
  },
  invalidInput: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 8,
  },
  buttonContainer: {
    marginBottom: 12,
  },
  buttonSpacing: {
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function WalletImportScreen(props: Props): Node {
  const { navigation, route } = props;
  const setupScreenCount = route.params?.setupScreenCount ?? 2;
  const [mnemonic, setMnemonic] = useState('');
  const [isValid, setIsValid] = useState<?boolean>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleMnemonicChange = useCallback((text: string) => {
    setMnemonic(text);
    // Reset validation state immediately when text changes
    if (text.trim().length === 0) {
      setIsValid(null);
    }
  }, []);

  // Debounced validation effect
  useEffect(() => {
    if (mnemonic.trim().length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsValid(validateMnemonic(mnemonic));
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [mnemonic]);

  const handleImport = useCallback(() => {
    if (isValid !== true || mnemonic.trim().length === 0) {
      Alert.alert('Invalid Phrase', 'Please enter a valid 12-word recovery phrase.');
      return;
    }

    setIsImporting(true);

    // Use setTimeout to ensure state update happens before async operation
    setTimeout(async () => {
      try {
        const walletInfo = await importWallet(mnemonic);
        Alert.alert(
          'Wallet Imported',
          `Successfully imported wallet: ${walletInfo.address.substring(0, 6)}...${walletInfo.address.substring(38)}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Pop the setup screens to return to the previous navigation state
                // This preserves the existing chat app navigation history
                navigation.pop(setupScreenCount);
              },
            },
          ]
        );
      } catch (error) {
        Alert.alert('Import Failed', error.message || 'Failed to import wallet. Please check your recovery phrase.');
      } finally {
        setIsImporting(false);
      }
    }, 0);
  }, [isValid, mnemonic, navigation, setupScreenCount]);

  const getInputStyle = () => {
    const baseStyle = [styles.textInput];
    if (isValid === true) {
      baseStyle.push(styles.validInput);
    } else if (isValid === false) {
      baseStyle.push(styles.invalidInput);
    }
    return baseStyle;
  };

  return (
    <Screen title="Import Wallet">
      <View style={styles.container}>
        <ZulipText style={styles.title} text="Import Existing Wallet" />
        <ZulipText
          style={styles.description}
          text="Enter your 12-word recovery phrase to restore your wallet. Make sure to enter the words in the correct order."
        />

        <View style={styles.inputContainer}>
          <ZulipText style={styles.label} text="Recovery Phrase" />
          <TextInput
            style={getInputStyle()}
            value={mnemonic}
            onChangeText={handleMnemonicChange}
            placeholder="Enter your 12-word recovery phrase..."
            placeholderTextColor="#999"
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />
          {isValid === false && (
            <ZulipText
              style={styles.errorText}
              text="Invalid recovery phrase. Please check the words and try again."
            />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonSpacing}>
            <ZulipButton
              text={isImporting ? 'Importing...' : 'Import Wallet'}
              disabled={isValid !== true || isImporting}
              progress={isImporting}
              onPress={handleImport}
            />
          </View>
          <ZulipButton
            secondary
            text="Cancel"
            onPress={() => navigation.goBack()}
            disabled={isImporting}
          />
        </View>
      </View>
    </Screen>
  );
}
