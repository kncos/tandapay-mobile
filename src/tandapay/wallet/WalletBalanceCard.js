// @flow strict-local

import React, { useState, useEffect, useContext } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

// eslint-disable-next-line import/no-extraneous-dependencies
// $FlowFixMe[untyped-import] - @react-native-picker/picker is a third-party library
import { Picker } from '@react-native-picker/picker';

import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';
import { HIGHLIGHT_COLOR } from '../../styles/constants';
import { fetchBalance } from '../web3';
import { IconEthereum, IconUSDC } from '../../common/Icons';

type Token = {|
  symbol: string,
  address: ?string,
  name: string,
|};

type Props = {|
  walletAddress: string,
|};

type TokenPickerProps = {|
  selectedToken: Token,
  onSelect: (Token) => void,
  themeData: $ReadOnly<{|
    backgroundColor: string,
    cardColor: string,
    color: string,
    brandColor?: string,
    dividerColor: string,
    themeName: string,
  |}>,
|};

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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

//! this is a temporary hardcoded list of tokens,
//! the addresses do not reflect the mainnet addresses
const TOKENS: Array<Token> = [
  { symbol: 'ETH', address: null, name: 'Ethereum' },
  { symbol: 'USDC', address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', name: 'USD Coin' },
];

function TokenPicker({ selectedToken, onSelect, themeData }: TokenPickerProps): Node {
  const getTokenIcon = symbol => {
    if (symbol === 'ETH') {
      return <IconEthereum size={20} color={themeData.color} style={{ marginRight: 6 }} />;
    }
    if (symbol === 'USDC') {
      return <IconUSDC size={20} color={themeData.color} style={{ marginRight: 6 }} />;
    }
    return null;
  };
  return (
    <View style={[styles.pickerChip, { backgroundColor: themeData.cardColor, borderColor: HIGHLIGHT_COLOR }]}>
      <Picker
        selectedValue={selectedToken.symbol}
        style={styles.picker}
        mode="dropdown"
        dropdownIconColor={themeData.brandColor ?? '#6492fd'}
        onValueChange={symbol => {
          const token = TOKENS.find(t => t.symbol === symbol);
          if (token) {
            onSelect(token);
          }
        }}
        itemStyle={{ flexDirection: 'row', alignItems: 'center' }}
      >
        {TOKENS.map(token => (
          <Picker.Item
            key={token.symbol}
            label={`  ${token.symbol}`}
            value={token.symbol}
            style={{ color: themeData.color, backgroundColor: themeData.cardColor, flexDirection: 'row', alignItems: 'center' }}
          />
        ))}
      </Picker>
      <View style={{ position: 'absolute', left: 12, top: 10, flexDirection: 'row', alignItems: 'center' }}>
        {getTokenIcon(selectedToken.symbol)}
      </View>
    </View>
  );
}

/**
 * Returns a font size that will fit the string in a single line,
 * based on the number of characters and a max font size.
 * You can tune the min/max/font scaling as needed.
 */
function getFontSizeForStringLength(str: ?string, {
  maxFontSize = 54,
  minFontSize = 18, // allow smaller font size
  maxChars = 10, // be more aggressive: reduce maxChars
} = {}): number {
  if (str == null || str.length === 0) {
    return maxFontSize;
  }
  if (str.length <= maxChars) {
    return maxFontSize;
  }
  // More aggressive scaling for longer strings
  const scaled = Math.floor(maxFontSize * ((maxChars / str.length) ** 1.15));
  return Math.max(minFontSize, Math.min(maxFontSize, scaled));
}

export default function WalletBalanceCard({ walletAddress }: Props): Node {
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]);
  const [balance, setBalance] = useState<?string>(null);
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
    <View style={[styles.balanceCard, { backgroundColor: themeData.backgroundColor, borderColor: HIGHLIGHT_COLOR }]}>
      <View style={styles.balanceColumn}>
        <ZulipText style={styles.label} text="Balance" />
        <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <ZulipText
              style={[styles.hugeBalanceText, { fontSize: getFontSizeForStringLength(balance) }]}
              numberOfLines={2} // allow up to 2 lines, no ellipsis
            >
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
