import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

// eslint-disable-next-line import/no-extraneous-dependencies
import { Picker } from '@react-native-picker/picker';

import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';
import { HIGHLIGHT_COLOR } from '../../styles/constants';

const styles = StyleSheet.create({
  balanceCard: {
    alignItems: 'stretch',
    marginVertical: 24,
    width: '90%',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 18,
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
  },
  label: {
    fontSize: 16,
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pickerChip: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignSelf: 'center',
    minWidth: 150,
    maxWidth: 260,
    overflow: 'hidden',
    marginTop: 18,
    borderWidth: 2,
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  picker: {
    width: '100%',
    minWidth: 130,
    maxWidth: 240,
    height: 36,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  balanceColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  hugeBalanceText: {
    fontSize: 54,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const TOKENS = [
  { symbol: 'ETH', address: null, name: 'Ethereum' },
  { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin' },
  { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai Stablecoin' },
];

async function fetchBalance(token, address) {
  return new Promise(resolve => setTimeout(() => {
    if (token.symbol === 'ETH') {
      resolve('52.01');
    }
    if (token.symbol === 'USDC') {
      resolve('2,600.00');
    }
    if (token.symbol === 'DAI') {
      resolve('91,758.11');
    }
    resolve('0');
  }, 500));
}

function TokenPicker({ selectedToken, onSelect, themeData }) {
  return (
    <View style={[styles.pickerChip, { backgroundColor: themeData.cardColor, borderColor: HIGHLIGHT_COLOR, shadowColor: themeData.shadowColor }]}>
      <Picker
        selectedValue={selectedToken.symbol}
        style={styles.picker}
        mode="dropdown"
        dropdownIconColor={themeData.brandColor || '#6492fd'}
        onValueChange={symbol => {
          const token = TOKENS.find(t => t.symbol === symbol);
          onSelect(token);
        }}
      >
        {TOKENS.map(token => (
          <Picker.Item
            key={token.symbol}
            label={token.symbol}
            value={token.symbol}
            style={{ color: themeData.color, backgroundColor: themeData.cardColor }}
          />
        ))}
      </Picker>
    </View>
  );
}

export default function WalletBalanceCard({ walletAddress }) {
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
    <View style={[styles.balanceCard, { backgroundColor: themeData.backgroundColor, shadowColor: themeData.shadowColor, borderColor: HIGHLIGHT_COLOR }]}>
      <View style={styles.balanceColumn}>
        <ZulipText style={styles.label} text="Balance" />
        <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <ZulipText style={styles.hugeBalanceText}>
              {balance !== null ? balance : '--'}
            </ZulipText>
          )}
        </View>
        <View style={styles.pickerContainer}>
          <TokenPicker
            selectedToken={selectedToken}
            onSelect={setSelectedToken}
            themeData={themeData}
          />
        </View>
      </View>
    </View>
  );
}
