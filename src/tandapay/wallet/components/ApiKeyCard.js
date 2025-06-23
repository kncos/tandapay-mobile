// @flow strict-local

import React, { useState, useEffect, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View, Alert, TextInput } from 'react-native';

import ZulipButton from '../../../common/ZulipButton';
import ZulipText from '../../../common/ZulipText';
import { ThemeContext } from '../../../styles';
import TandaPayStyles, { TandaPayTypography, TandaPayLayout } from '../../styles';
import { HALF_COLOR } from '../../../styles/constants';
import Card from '../../components/Card';
import { ScrollableTextBox } from '../../components';
import type { TandaPayResult } from '../../errors/types';

type ApiKeyMethods = {|
  hasApiKey: () => Promise<TandaPayResult<boolean>>,
  getApiKey: () => Promise<TandaPayResult<?string>>,
  storeApiKey: (key: string) => Promise<TandaPayResult<void>>,
  deleteApiKey: () => Promise<TandaPayResult<void>>,
|};

type Props = $ReadOnly<{|
  title: string,
  description: string,
  inputLabel: string,
  inputPlaceholder: string,
  updateInputPlaceholder?: string,
  saveButtonText?: string,
  updateButtonText?: string,
  apiKeyMethods: ApiKeyMethods,
  onApiKeyChange?: (hasKey: boolean) => void,
|}>;

export default function ApiKeyCard(props: Props): Node {
  const {
    title,
    description,
    inputLabel,
    inputPlaceholder,
    updateInputPlaceholder,
    saveButtonText = 'Save API Key',
    updateButtonText = 'Update API Key',
    apiKeyMethods,
    onApiKeyChange,
  } = props;

  const themeData = useContext(ThemeContext);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [revealedApiKey, setRevealedApiKey] = useState<?string>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check if API key exists on component mount
  useEffect(() => {
    const checkApiKey = async () => {
      const result = await apiKeyMethods.hasApiKey();
      if (result.success) {
        setHasApiKey(result.data);
      } else {
        // Error checking API key - default to false
        setHasApiKey(false);
      }
      setLoading(false);
    };

    checkApiKey();
  }, [apiKeyMethods]);

  const handleSetApiKey = useCallback(async () => {
    if (!apiKeyInput.trim()) {
      Alert.alert('Invalid Input', 'Please enter a valid API key.');
      return;
    }

    setSaving(true);

    // Use setTimeout to ensure state update happens before async operation
    setTimeout(async () => {
      const result = await apiKeyMethods.storeApiKey(apiKeyInput.trim());
      if (result.success) {
        setHasApiKey(true);
        setApiKeyInput('');
        setRevealedApiKey(null);
        Alert.alert('Success', 'API key has been saved successfully.');
        if (onApiKeyChange) {
          onApiKeyChange(true);
        }
      } else {
        Alert.alert('Error', result.error.userMessage != null ? result.error.userMessage : 'Failed to save API key. Please try again.');
      }
      setSaving(false);
    }, 0);
  }, [apiKeyInput, apiKeyMethods, onApiKeyChange]);

  const handleRevealApiKey = useCallback(async () => {
    const result = await apiKeyMethods.getApiKey();
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
  }, [apiKeyMethods]);

  const handleDeleteApiKey = useCallback(async () => {
    Alert.alert(
      'Delete API Key',
      'Are you sure you want to delete your API key? This may affect app functionality.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await apiKeyMethods.deleteApiKey();
            if (result.success) {
              setHasApiKey(false);
              setRevealedApiKey(null);
              setApiKeyInput('');
              Alert.alert('Success', 'API key has been deleted.');
              if (onApiKeyChange) {
                onApiKeyChange(false);
              }
            } else {
              Alert.alert('Error', result.error.userMessage != null ? result.error.userMessage : 'Failed to delete API key. Please try again.');
            }
          },
        },
      ]
    );
  }, [apiKeyMethods, onApiKeyChange]);

  const handleHideApiKey = useCallback(() => {
    setRevealedApiKey(null);
  }, []);

  if (loading) {
    return (
      <Card>
        <ZulipText text="Loading..." style={{ textAlign: 'center' }} />
      </Card>
    );
  }

  return (
    <Card>
      {/* Header */}
      <ZulipText style={[TandaPayTypography.subsectionTitle, { color: themeData.color, marginBottom: 8 }]}>
        {title}
      </ZulipText>
      <ZulipText style={[TandaPayTypography.description, { color: themeData.color, marginBottom: 16 }]}>
        {description}
      </ZulipText>

      {/* API Key Input */}
      <View style={TandaPayLayout.inputContainer}>
        <ZulipText style={[TandaPayTypography.inputLabel, { color: themeData.color }]}>
          {inputLabel}
        </ZulipText>
        <TextInput
          style={[
            TandaPayStyles.base,
            {
              borderColor: themeData.dividerColor,
              backgroundColor: themeData.backgroundColor,
              color: themeData.color,
              marginBottom: 16,
            },
          ]}
          value={apiKeyInput}
          onChangeText={setApiKeyInput}
          placeholder={hasApiKey ? (updateInputPlaceholder != null ? updateInputPlaceholder : inputPlaceholder) : inputPlaceholder}
          placeholderTextColor={HALF_COLOR}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Main Action Buttons */}
      <View style={[TandaPayStyles.buttonRow, { marginBottom: hasApiKey ? 16 : 0 }]}>
        <ZulipButton
          style={TandaPayStyles.button}
          text={saving ? 'Saving...' : (hasApiKey ? updateButtonText : saveButtonText)}
          onPress={handleSetApiKey}
          disabled={!apiKeyInput.trim() || saving}
          progress={saving}
        />
        {hasApiKey && (
          <ZulipButton
            style={TandaPayStyles.button}
            text="Delete Key"
            onPress={handleDeleteApiKey}
            secondary
          />
        )}
      </View>

      {/* Secondary Action Buttons - Only show if API key exists */}
      {hasApiKey && (
        <View style={[TandaPayStyles.buttonRow, { marginBottom: (revealedApiKey != null && revealedApiKey !== '') ? 16 : 0 }]}>
          <ZulipButton
            style={TandaPayStyles.button}
            text={(revealedApiKey != null && revealedApiKey !== '') ? 'Hide Key' : 'Reveal Key'}
            onPress={(revealedApiKey != null && revealedApiKey !== '') ? handleHideApiKey : handleRevealApiKey}
            secondary
          />
        </View>
      )}

      {/* Revealed API Key */}
      {(revealedApiKey != null && revealedApiKey !== '') && (
        <ScrollableTextBox
          text={revealedApiKey}
          label="API Key"
          onCopy={(text, label) => Alert.alert('Copied', `${label} copied to clipboard`)}
        />
      )}
    </Card>
  );
}
