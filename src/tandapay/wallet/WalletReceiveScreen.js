/* @flow strict-local */

import React, { useState, useEffect } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Alert, Share } from 'react-native';

// suppress flow error for react-native-qrcode-svg
// $FlowFixMe[untyped-import]
import QRCode from 'react-native-qrcode-svg';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import { getWalletAddress } from './WalletManager';
import { TandaPayColors } from '../styles';
import { ScrollableTextBox } from '../components';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet-receive'>,
  route: RouteProp<'wallet-receive', void>,
|}>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 24,
  },
  warningText: {
    fontSize: 12,
    color: TandaPayColors.warning,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
});

// QRcode component for wallet address
function QRCodeComponent({ value }: { value: string }) {
  return (
    <View style={{ marginVertical: 20 }}>
      <QRCode
        value={value}
        size={200}
        backgroundColor="transparent"
        color={TandaPayColors.black}
      />
    </View>
  );
}

export default function WalletReceiveScreen(props: Props): Node {
  const { navigation } = props;
  const [walletAddress, setWalletAddress] = useState<?string>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWalletAddress = async () => {
      try {
        const addressResult = await getWalletAddress();
        if (addressResult.success) {
          setWalletAddress(addressResult.data);
        } else {
          Alert.alert('Error', addressResult.error.userMessage);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load wallet address');
      } finally {
        setLoading(false);
      }
    };

    loadWalletAddress();
  }, []);

  const handleShareAddress = async () => {
    if (walletAddress != null && walletAddress !== '') {
      try {
        await Share.share({
          message: `My wallet address: ${walletAddress}`,
          title: 'Wallet Address',
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to share wallet address');
      }
    }
  };

  if (loading) {
    return (
      <Screen title="Receive">
        <View style={styles.container}>
          <ZulipText text="Loading..." />
        </View>
      </Screen>
    );
  }

  if (walletAddress == null || walletAddress === '') {
    return (
      <Screen title="Receive">
        <View style={styles.container}>
          <ZulipText text="Unable to load wallet address" />
          <ZulipButton
            text="Go Back"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 20 }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Receive">
      <View style={styles.container}>
        <ZulipText
          style={styles.instructions}
          text="Share your wallet address to receive cryptocurrency payments."
        />

        <QRCodeComponent value={walletAddress} />

        <ScrollableTextBox
          text={walletAddress}
          label="Wallet Address"
          onCopy={(text, label) => Alert.alert('Copied', `${label} copied to clipboard`)}
        />

        <View style={styles.buttonContainer}>
          <ZulipButton
            text="Share"
            onPress={handleShareAddress}
          />
        </View>

        <ZulipText
          text="⚠️ Only send Ethereum and ERC-20 tokens to this address"
          style={styles.warningText}
        />
      </View>
    </Screen>
  );
}
