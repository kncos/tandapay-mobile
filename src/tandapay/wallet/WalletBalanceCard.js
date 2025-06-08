// @flow strict-local

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

// $FlowFixMe[untyped-import] - @react-native-picker/picker is a third-party library
import { Picker } from '@react-native-picker/picker';

import ZulipText from '../../common/ZulipText';
import Touchable from '../../common/Touchable';
import { IconRefresh } from '../../common/Icons';
import AnimatedRotateComponent from '../../animation/AnimatedRotateComponent';
import { ThemeContext } from '../../styles';
import { BRAND_COLOR, HIGHLIGHT_COLOR } from '../../styles/constants';
import { useSelector, useDispatch } from '../../react-redux';
import { selectToken } from '../redux/actions';
import { getSelectedToken, getAvailableTokens } from '../tokens/tokenSelectors';
import { useUpdateBalance } from './hooks/useUpdateBalance';

import type { Token } from '../tokens/tokenTypes';

type Props = {|
  walletAddress: ?string,
|};

type TokenPickerProps = {|
  selectedToken: Token | null,
  availableTokens: $ReadOnlyArray<Token>,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  refreshButton: {
    marginLeft: 12,
    marginTop: 18,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
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

function TokenPicker({ selectedToken, availableTokens, onSelect, themeData }: TokenPickerProps): Node {
  if (!selectedToken) {
    return null;
  }

  return (
    <View style={[styles.pickerChip, { backgroundColor: themeData.cardColor, borderColor: HIGHLIGHT_COLOR }]}>
      <Picker
        selectedValue={selectedToken.symbol}
        style={styles.picker}
        mode="dropdown"
        dropdownIconColor={BRAND_COLOR}
        onValueChange={symbol => {
          const token = availableTokens.find(t => t.symbol === symbol);
          if (token) {
            onSelect(token);
          }
        }}
        itemStyle={{ flexDirection: 'row', alignItems: 'center' }}
      >
        {availableTokens.map(token => (
          <Picker.Item
            key={token.symbol}
            label={`  ${token.symbol}`}
            value={token.symbol}
            style={{ color: themeData.color, backgroundColor: themeData.cardColor, flexDirection: 'row', alignItems: 'center' }}
          />
        ))}
      </Picker>
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
  const dispatch = useDispatch();
  const selectedToken = useSelector(getSelectedToken);
  const availableTokens = useSelector(getAvailableTokens);
  const themeData = useContext(ThemeContext);

  // Use the custom hook for balance management
  const { balance, loading, refreshBalance } = useUpdateBalance(selectedToken, walletAddress);

  const handleTokenSelect = (token: Token) => {
    dispatch(selectToken(token.symbol));
  };

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
              {balance !== null && balance !== undefined ? balance : '--'}
            </ZulipText>
          )}
        </View>
        <View style={styles.pickerContainer}>
          <TokenPicker
            selectedToken={selectedToken}
            availableTokens={availableTokens}
            onSelect={handleTokenSelect}
            themeData={themeData}
          />
          <Touchable
            style={styles.refreshButton}
            onPress={refreshBalance}
            accessibilityLabel="Refresh balance"
          >
            {loading ? (
              <AnimatedRotateComponent>
                <IconRefresh
                  size={20}
                  color={themeData.color}
                />
              </AnimatedRotateComponent>
            ) : (
              <IconRefresh
                size={20}
                color={BRAND_COLOR}
              />
            )}
          </Touchable>
        </View>
      </View>
    </View>
  );
}
