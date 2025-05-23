/* eslint-disable import/no-extraneous-dependencies */

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Make sure to install this package
import Screen from '../../common/Screen';

import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#888',
  },
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  button: {
    flex: 1,
    margin: 8,
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: 24,
    width: '80%',
    // backgroundColor: '#f6f6f6',
    borderRadius: 8,
    padding: 16,
    // elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#c00',
    marginBottom: 4,
  },
  picker: {
    width: '100%',
  },
  pickerWrapper: {
    width: '50%',
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff', // fallback, will be overridden by theme
  },
  balanceText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

// Dummy token list and balances for illustration
const TOKENS = [
  { symbol: 'ETH', address: null, name: 'Ethereum' },
  { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin' },
  { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai Stablecoin' },
];

// Replace this with actual balance fetching logic using viem or ethers
async function fetchBalance(token, address) {
  // Simulate loading
  return new Promise(resolve => setTimeout(() => {
    if (token.symbol === 'ETH') {
      resolve('1.234');
    }
    if (token.symbol === 'USDC') {
      resolve('100.00');
    }
    if (token.symbol === 'DAI') {
      resolve('50.00');
    }

    resolve('0');
  }, 500));
}

function TokenPicker({ selectedToken, onSelect, themeData }) {
  return (
    <View style={[styles.pickerWrapper, { backgroundColor: themeData.cardColor }]}>
      <Picker
        selectedValue={selectedToken.symbol}
        style={[styles.picker, { backgroundColor: themeData.cardColor }]}
        dropdownIconColor={themeData.color}
        dropdownIconRippleColor={themeData.color}
        mode="dropdown"
        onValueChange={symbol => {
          const token = TOKENS.find(t => t.symbol === symbol);
          onSelect(token);
        }}
      >
        {TOKENS.map(token => (
          <Picker.Item
            key={token.symbol}
            label={token.name}
            value={token.symbol}
            style={{
              backgroundColor: themeData.cardColor,
              color: themeData.color,
            }}
          />
        ))}
      </Picker>
    </View>
  );
}

function TokenBalanceSelector({ walletAddress }) {
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const themeData = useContext(ThemeContext);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchBalance(selectedToken, walletAddress).then(bal => {
      if (isMounted) {
        setBalance(bal);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [selectedToken, walletAddress]);

  return (
    <View style={styles.balanceContainer}>
      <TokenPicker
        selectedToken={selectedToken}
        onSelect={setSelectedToken}
        themeData={themeData}
      />
      <ZulipText>Balance:</ZulipText>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <ZulipText style={styles.balanceText}>
          {balance !== null ? `${balance} ${selectedToken.symbol}` : '--'}
        </ZulipText>
      )}
    </View>
  );
}

export default function WalletScreen() {
  const walletAddress = '0xYourWalletAddressHere'; // Replace with actual address from state/secure store

  return (
    <Screen title="Wallet">
      <View style={styles.container}>
        <TokenBalanceSelector walletAddress={walletAddress} />
      </View>
    </Screen>
  );
}
