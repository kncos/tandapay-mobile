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
import { hasWallet, getWalletAddress, hasEtherscanApiKey } from './WalletManager';
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

  // Filter out custom networks since Alchemy/Etherscan only support specific networks
  const supportedNetwork = selectedNetwork === 'custom' ? 'sepolia' : selectedNetwork;

  // Use the transaction management hook
  const { transactionState, loadMoreState, loadMore, refresh } = useTransactionHistory({
    walletAddress,
    apiKeyConfigured,
    network: supportedNetwork,
    tandaPayContractAddress,
  });

  const checkWallet = useCallback(async () => {
    try {
      if (!isMounted) {
        return;
      }
      setLoading(true);

      const walletExistsResult = await hasWallet();
      if (!walletExistsResult.success) {
        // Handle wallet check error - treat as no wallet for now
        if (isMounted) {
          setWalletExists(false);
        }
        return;
      }

      const exists = walletExistsResult.data;
      if (isMounted) {
        setWalletExists(exists);
      }

      if (exists) {
        const addressResult = await getWalletAddress();
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
        const apiKeyResult = await hasEtherscanApiKey();
        if (apiKeyResult.success) {
          const hasApiKey = apiKeyResult.data;
          if (isMounted) {
            setApiKeyConfigured(hasApiKey);
          }

          // Refresh the transaction history when wallet changes
          if (address != null && address !== '' && hasApiKey && isMounted) {
            refresh();
          }
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
  }, [refresh, isMounted]);

  useEffect(() => {
    checkWallet();
  }, [checkWallet]);

  // Cleanup effect to prevent state updates on unmounted component
  useEffect(() => () => {
    setIsMounted(false);
  }, []);

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
         network={supportedNetwork}
         transactionState={transactionState}
         loadMoreState={loadMoreState}
         onLoadMore={() => {
          loadMore();
        }}
         onRefresh={refresh}
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
        <WalletBalanceCard walletAddress={walletAddress} />
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
