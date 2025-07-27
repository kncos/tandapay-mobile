/* @flow strict-local */

import React, { useState, useEffect, useCallback } from 'react';
import type { Node } from 'react';
import { View, ActivityIndicator, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';

import ZulipButton from '../../common/ZulipButton';
import WalletBalanceCard from './WalletBalanceCard';
import ZulipText from '../../common/ZulipText';
import { TandaRibbon } from '../components';
import { BRAND_COLOR } from '../../styles';
import { hasWalletForUI, getWalletAddress, hasAlchemyApiKey } from './WalletManager';
import { useNavigation } from '../../react-navigation';
import { useSelector } from '../../react-redux';
import { getTandaPaySelectedNetwork, getCurrentTandaPayContractAddress } from '../redux/selectors';
import TandaPayStyles from '../styles';
import { getExplorerAddressUrl, getExplorerTransactionUrl } from './ExplorerUtils';
import useTransactionHistory from './useTransactionHistory';
import TransactionList from './TransactionList';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet'>,
  route: RouteProp<'wallet', void>,
|}>;

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
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
        <ZulipText text="Loading wallet..." style={{ marginTop: 16, textAlign: 'center' }} />
      </View>
    </Screen>
  );
}

function WalletSetupScreen() {
  return (
    <Screen title="Wallet Setup">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
  const [isMounted, setIsMounted] = useState(true);

  const navigation = useNavigation();
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const tandaPayContractAddress = useSelector(getCurrentTandaPayContractAddress);
  // Use the transaction management hook
  const { transactionState, loadMoreState, loadMore, refresh } = useTransactionHistory({
    walletAddress,
    apiKeyConfigured,
    network: selectedNetwork,
    tandaPayContractAddress,
  });

  const checkWallet = useCallback(async () => {
    try {
      if (!isMounted) {
        return;
      }
      // eslint-disable-next-line no-console
      console.log('[WalletScreen] Starting checkWallet...');
      setLoading(true);

      // eslint-disable-next-line no-console
      console.log('[WalletScreen] About to call hasWalletForUI()...');
      const exists = hasWalletForUI();
      // eslint-disable-next-line no-console
      console.log('[WalletScreen] hasWalletForUI() returned:', exists);

      // eslint-disable-next-line no-console
      console.log('[WalletScreen] Wallet exists data:', exists);
      if (isMounted) {
        setWalletExists(exists);
      }

      if (exists) {
        const addressResult = await getWalletAddress();
        // eslint-disable-next-line no-console
        console.log('[WalletScreen] Wallet address:', addressResult);
        if (!addressResult.success) {
          // Handle address fetch error - treat as no address
          if (isMounted) {
            setWalletAddress(null);
          }
          return;
        }

        const address = addressResult.data;
        if (isMounted) {
          setWalletAddress(address);
        }

        // Check if API key is configured
        const apiKeyResult = await hasAlchemyApiKey();
        // eslint-disable-next-line no-console
        console.log('[WalletScreen] API key configured:', apiKeyResult);
        if (apiKeyResult.success) {
          const hasApiKey = apiKeyResult.data;
          if (isMounted) {
            setApiKeyConfigured(hasApiKey);
          }

          // Don't call refresh here - this was causing infinite loops
          // The useTransactionHistory hook will initialize itself when dependencies change
        } else if (isMounted) {
          setApiKeyConfigured(false);
        }
      } else if (isMounted) {
        setWalletAddress(null);
        setApiKeyConfigured(false);
      }
    } catch (error) {
      // Handle unexpected errors silently
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [isMounted]); // Removed refresh from dependencies to prevent infinite loops

  useEffect(() => {
    checkWallet();
  }, [checkWallet]);

  // Cleanup effect to prevent state updates on unmounted component
  useEffect(() => () => {
    setIsMounted(false);
  }, []);

  // Trigger initial transaction load when wallet and API key are ready
  useEffect(() => {
    // For custom networks, we don't require apiKeyConfigured to be true
    // The useTransactionHistory hook handles Alchemy detection internally
    const shouldLoad = walletAddress != null && walletAddress !== ''
      && transactionState.status === 'idle'
      && (apiKeyConfigured || selectedNetwork === 'custom');

    if (shouldLoad) {
      loadMore();
    }
  }, [walletAddress, apiKeyConfigured, transactionState.status, loadMore, selectedNetwork]);

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

  const handleRefresh = useCallback(() => {
    // Call the async refresh function without waiting for it
    refresh().catch(() => {
      // Handle errors silently - the hook will set error state
    });
  }, [refresh]);

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
         network={selectedNetwork}
         transactionState={transactionState}
         loadMoreState={loadMoreState}
         onLoadMore={() => {
          loadMore();
        }}
         onRefresh={handleRefresh}
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <WalletBalanceCard walletAddress={walletAddress} onRefresh={handleRefresh} />
        <SendReceiveButtonRow />
        <View style={TandaPayStyles.buttonRow}>
          <ZulipButton
            style={TandaPayStyles.button}
            secondary
            text="Open Block Explorer"
            onPress={handleViewExplorer}
          />
        </View>
        <TandaRibbon label="Transactions" backgroundColor={BRAND_COLOR}>
          {renderTransactionContent()}
        </TandaRibbon>
      </View>
    </Screen>
  );
}
