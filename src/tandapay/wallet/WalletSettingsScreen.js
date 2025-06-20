// @flow strict-local

import React, { useState, useEffect, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View, ScrollView } from 'react-native';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import { IconPrivate } from '../../common/Icons';
import { ThemeContext } from '../../styles';
import { TandaPayTypography, TandaPayLayout } from '../styles';
import { BRAND_COLOR, HIGHLIGHT_COLOR, HALF_COLOR } from '../../styles/constants';
import {
  hasEtherscanApiKey,
  storeEtherscanApiKey,
  getEtherscanApiKey,
  deleteEtherscanApiKey,
} from './WalletManager';
import Card from '../components/Card';
import ApiKeyCard from './components/ApiKeyCard';

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
  const [loading, setLoading] = useState(true);

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

  // Create API key methods object for the reusable component
  const etherscanApiKeyMethods = {
    hasApiKey: hasEtherscanApiKey,
    getApiKey: getEtherscanApiKey,
    storeApiKey: storeEtherscanApiKey,
    deleteApiKey: deleteEtherscanApiKey,
  };

  // Callback to update the status card when API key changes
  const handleApiKeyChange = useCallback((hasKey: boolean) => {
    setHasApiKey(hasKey);
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
            <ApiKeyCard
              title="Etherscan API Key"
              description="Configure your Etherscan API key to enable transaction history and enhanced blockchain data features."
              inputLabel={hasApiKey ? 'Update API Key' : 'Etherscan API Key'}
              inputPlaceholder="Enter your Etherscan API key"
              updateInputPlaceholder="Enter new Etherscan API key"
              saveButtonText="Save API Key"
              updateButtonText="Update API Key"
              apiKeyMethods={etherscanApiKeyMethods}
              onApiKeyChange={handleApiKeyChange}
            />
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
