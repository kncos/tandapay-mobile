/* @flow strict-local */

import React, { useState, useEffect, useCallback } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';

import ZulipButton from '../../common/ZulipButton';
import WalletBalanceCard from './WalletBalanceCard';
import ZulipText from '../../common/ZulipText';
import { TandaRibbon } from '../components';
import { BRAND_COLOR } from '../../styles';
import { hasWallet, getWalletAddress, hasEtherscanApiKey } from './WalletManager';
import { useNavigation } from '../../react-navigation';
import TandaPayStyles from '../styles';
import { getExplorerAddressUrl, getExplorerTransactionUrl } from './ExplorerUtils';
import useTransactionHistory from './useTransactionHistory';
import TransactionList from './TransactionList';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet'>,
  route: RouteProp<'wallet', void>,
|}>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function SendReceiveButtonRow() {
  const navigation = useNavigation();
  return (
    <View style={TandaPayStyles.buttonRow}>
      <ZulipButton
        style={TandaPayStyles.button}
        secondary
        text="Send"
        onPress={() => {
          navigation.push('wallet-send');
        }}
      />
      <ZulipButton
        style={TandaPayStyles.button}
        secondary
        text="Receive"
        onPress={() => {
          navigation.push('wallet-receive');
        }}
      />
    </View>
  );
}

function SetupWalletButtonRow() {
  const navigation = useNavigation();
  return (
    <View style={TandaPayStyles.buttonRow}>
      <ZulipButton
        style={TandaPayStyles.button}
        secondary
        text="Set Up Wallet"
        onPress={() => {
          navigation.push('wallet-setup');
        }}
      />
    </View>
  );
}

function WalletLoading() {
  return (
    <Screen title="Wallet Loading">
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
        <ZulipText text="Loading wallet..." style={{ marginTop: 16, textAlign: 'center' }} />
      </View>
    </Screen>
  );
}

function WalletSetupScreen() {
  return (
    <Screen title="Wallet Setup">
      <View style={styles.container}>
        <ZulipText
          style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}
          text="No Wallet Found"
        />
        <ZulipText
          style={{ fontSize: 16, marginBottom: 32, textAlign: 'center', lineHeight: 24 }}
          text="You need to create or import a wallet to use TandaPay's features."
        />
        <SetupWalletButtonRow />
      </View>
    </Screen>
  );
}

export default function WalletScreen(props: Props): Node {
  const [walletAddress, setWalletAddress] = useState<?string>(null);
  const [loading, setLoading] = useState(true);
  const [walletExists, setWalletExists] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  const navigation = useNavigation();

  // Use the custom hook for transaction management
  const { transactionState, loadMoreState, loadMore, refresh } = useTransactionHistory({
    walletAddress,
    apiKeyConfigured,
  });

  const checkWallet = useCallback(async () => {
    try {
      setLoading(true);
      const exists = await hasWallet();
      setWalletExists(exists);

      if (exists) {
        const address = await getWalletAddress();
        setWalletAddress(address);

        // Check if API key is configured
        const hasApiKey = await hasEtherscanApiKey();
        setApiKeyConfigured(hasApiKey);

        // Refresh the transaction history when wallet changes
        if (address != null && address !== '' && hasApiKey) {
          refresh();
        }
      } else {
        setWalletAddress(null);
        setApiKeyConfigured(false);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error checking wallet:', error);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    checkWallet();
  }, [checkWallet]);

  // Refresh wallet state when screen comes into focus (e.g., returning from setup)
  useFocusEffect(
    useCallback(() => {
      checkWallet();
    }, [checkWallet]),
  );

  const handleViewExplorer = useCallback(() => {
    if (walletAddress == null || walletAddress === '') {
      return;
    }

    const explorerUrl = getExplorerAddressUrl(walletAddress);
    if (explorerUrl != null && explorerUrl !== '') {
      Linking.openURL(explorerUrl).catch(() => {
        // Handle error silently
      });
    }
  }, [walletAddress]);

  const handleGoToSettings = useCallback(() => {
    navigation.push('wallet-settings');
  }, [navigation]);

  const handleViewTransactionInExplorer = useCallback((txHash: string) => {
    const explorerUrl = getExplorerTransactionUrl(txHash);
    if (explorerUrl != null && explorerUrl !== '') {
      Linking.openURL(explorerUrl).catch(() => {
        // Handle error silently
      });
    }
  }, []);

  const renderTransactionContent = () =>
    // TransactionList handles all the transaction display logic including API key check
     (
       <TransactionList
         walletAddress={walletAddress || ''}
         apiKeyConfigured={apiKeyConfigured}
         transactionState={transactionState}
         loadMoreState={loadMoreState}
         onLoadMore={() => {
          loadMore();
        }}
         onGoToSettings={handleGoToSettings}
         onViewExplorer={handleViewExplorer}
         onViewTransactionInExplorer={handleViewTransactionInExplorer}
       />
    );
if (loading) {
    return (
      <WalletLoading />
    );
  }

  if (!walletExists || walletAddress == null || walletAddress === '') {
    return (
      <WalletSetupScreen />
    );
  }

  return (
    <Screen title="Wallet">
      <View style={styles.container}>
        <WalletBalanceCard walletAddress={walletAddress} />
        <SendReceiveButtonRow />
        <TandaRibbon label="Transactions" backgroundColor={BRAND_COLOR}>
          {renderTransactionContent()}
        </TandaRibbon>
      </View>
    </Screen>
  );
}
