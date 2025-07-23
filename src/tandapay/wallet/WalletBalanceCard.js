// @flow strict-local

import React, { useContext, useEffect } from 'react';
import type { Node } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// $FlowFixMe[untyped-import] - @react-native-picker/picker is a third-party library
import { Picker } from '@react-native-picker/picker';

import ZulipText from '../../common/ZulipText';
import Touchable from '../../common/Touchable';
import { IconRefresh, IconAlertTriangle } from '../../common/Icons';
import AnimatedRotateComponent from '../../animation/AnimatedRotateComponent';
import { ThemeContext } from '../../styles';
import { BRAND_COLOR, HIGHLIGHT_COLOR, kErrorColor } from '../../styles/constants';
import { useSelector, useDispatch } from '../../react-redux';
import { selectToken } from '../redux/actions';
import { getSelectedToken, getAvailableTokens, getSelectedTokenSymbol } from '../tokens/tokenSelectors';
import { useUpdateBalance } from './hooks/useUpdateBalance';
import { TandaPayColors } from '../styles';
import Card from '../components/Card';

import type { TokenWithBalance } from '../tokens/tokenTypes';

type Props = {|
  walletAddress: ?string,
  onRefresh?: () => void,
|};

type TokenPickerProps = {|
  selectedToken: TokenWithBalance | null,
  availableTokens: $ReadOnlyArray<TokenWithBalance>,
  onSelect: (TokenWithBalance) => void,
  themeData: $ReadOnly<{|
    backgroundColor: string,
    cardColor: string,
    color: string,
    brandColor?: string,
    dividerColor: string,
    themeName: string,
  |}>,
|};

// Custom styles as plain objects
const styles = StyleSheet.create({
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
    backgroundColor: TandaPayColors.whiteOverlay10,
    borderWidth: 1,
    borderColor: TandaPayColors.whiteOverlay20,
    alignSelf: 'center',
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
  // Error display styles
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)', // Light red background
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: kErrorColor,
    marginLeft: 6,
  },
  errorMessage: {
    fontSize: 13,
    color: kErrorColor,
    lineHeight: 18,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: kErrorColor,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: TandaPayColors.white,
    fontSize: 13,
    fontWeight: '600',
  },
});

function TokenPicker({ selectedToken, availableTokens, onSelect, themeData }: TokenPickerProps): Node {
  if (!selectedToken) {
    return null;
  }

  return (
    <Card
      style={{
        alignSelf: 'center',
        minWidth: 150,
        maxWidth: 260,
        overflow: 'hidden',
        marginTop: 16,
        borderWidth: 2,
        borderColor: HIGHLIGHT_COLOR,
      }}
      borderRadius={16}
      padding={2}
    >
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
    </Card>
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

export default function WalletBalanceCard({ walletAddress, onRefresh }: Props): Node {
  const dispatch = useDispatch();
  const selectedToken = useSelector(getSelectedToken);
  const availableTokens = useSelector(getAvailableTokens);
  const selectedTokenSymbol = useSelector(getSelectedTokenSymbol);
  const themeData = useContext(ThemeContext);

  // Auto-select native token if current selection is invalid for this network
  useEffect(() => {
    if (availableTokens.length > 0) {
      // Check if the current selected token symbol exists in available tokens
      const tokenExists = availableTokens.some(token => token.symbol === selectedTokenSymbol);

      if (!tokenExists) {
        // Auto-select the native token (first in the list)
        const nativeToken = availableTokens[0];
        dispatch(selectToken(nativeToken.symbol));
      }
    }
  }, [availableTokens, selectedTokenSymbol, dispatch]);

  // Use the custom hook for balance management
  const { balance, loading, error, refreshBalance } = useUpdateBalance(selectedToken, walletAddress);

  const handleTokenSelect = (token: TokenWithBalance) => {
    dispatch(selectToken(token.symbol));
  };

  const handleRefresh = () => {
    // Refresh the balance
    refreshBalance();

    // Call the optional callback to refresh other components (e.g., transaction list)
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Card
      style={[
        {
          alignItems: 'stretch',
          marginVertical: 24,
          width: '90%',
          paddingVertical: 28,
          paddingHorizontal: 18,
          backgroundColor: themeData.backgroundColor,
          borderWidth: 2,
          borderColor: HIGHLIGHT_COLOR,
        }
      ]}
      borderRadius={18}
      backgroundColor={themeData.backgroundColor}
      padding={0}
    >
      <View style={styles.balanceColumn}>
        <ZulipText style={styles.label} text="Balance" />
        <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <ZulipText
              style={[styles.hugeBalanceText, { fontSize: getFontSizeForStringLength(error != null ? '--' : balance) }]}
              numberOfLines={2} // allow up to 2 lines, no ellipsis
            >
              {error != null ? '--' : (balance !== null && balance !== undefined ? balance : '--')}
            </ZulipText>
          )}
        </View>

        {/* Error Display Section */}
        {error != null && !loading && (
          <View style={styles.errorContainer}>
            <View style={styles.errorHeader}>
              <IconAlertTriangle size={18} color={kErrorColor} />
              <ZulipText style={styles.errorTitle}>Balance Update Failed</ZulipText>
            </View>
            <ZulipText style={styles.errorMessage}>
              {error.userMessage != null && error.userMessage.length > 0 ? error.userMessage : error.message}
            </ZulipText>
            {error.retryable === true && (
              <Touchable
                style={styles.retryButton}
                onPress={handleRefresh}
                accessibilityLabel="Retry balance fetch"
              >
                <ZulipText style={styles.retryButtonText}>Try Again</ZulipText>
              </Touchable>
            )}
          </View>
        )}
        <View style={styles.pickerContainer}>
          <TokenPicker
            selectedToken={selectedToken}
            availableTokens={availableTokens}
            onSelect={handleTokenSelect}
            themeData={themeData}
          />
          <Touchable
            style={styles.refreshButton}
            onPress={handleRefresh}
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
    </Card>
  );
}
