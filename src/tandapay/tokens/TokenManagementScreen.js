// @flow strict-local

import React, { useState, useContext } from 'react';
import type { Node } from 'react';
import { View, Alert, StyleSheet } from 'react-native';

import { useSelector, useDispatch } from '../../react-redux';
import { ThemeContext } from '../../styles';
import { TandaPayColors } from '../styles';
import { getAvailableTokens } from './tokenSelectors';
import { getTandaPaySelectedNetwork } from '../redux/selectors';
import { addCustomToken, removeCustomToken } from '../redux/actions';
import { validateCustomToken } from './tokenConfig';
import type { TokenWithBalance } from './tokenTypes';
import Screen from '../../common/Screen';
import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import Input from '../../common/Input';
import { ScrollableTextBox } from '../components';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import type { RouteProp } from '../../react-navigation';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'token-management'>,
  route: RouteProp<'token-management', void>,
|}>;

// Custom styles for this component
const customStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  tokenItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenName: {
    fontSize: 14,
    opacity: 0.7,
  },
  defaultBadge: {
    backgroundColor: TandaPayColors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: TandaPayColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default function TokenManagementScreen(props: Props): Node {
  const dispatch = useDispatch();
  const themeData = useContext(ThemeContext);
  const availableTokens = useSelector(getAvailableTokens);
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);

  const [symbol, setSymbol] = useState('');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [decimals, setDecimals] = useState('18');

  const handleAddToken = () => {
    const tokenData = {
      symbol: symbol.toUpperCase().trim(),
      address: address.trim(),
      name: name.trim(),
      decimals: parseInt(decimals, 10) || 18,
    };

    const validation = validateCustomToken(tokenData);
    if (!validation.isValid) {
      Alert.alert(
        'Invalid Token',
        validation.error != null ? validation.error : 'Please check that all fields are filled correctly.',
      );
      return;
    }

    // Check if token already exists
    const existingToken = availableTokens.find(t =>
      t.symbol === tokenData.symbol || t.address === tokenData.address
    );

    if (existingToken) {
      Alert.alert(
        'Token Already Exists',
        `A token with this ${existingToken.symbol === tokenData.symbol ? 'symbol' : 'address'} already exists.`,
      );
      return;
    }

    dispatch(addCustomToken(tokenData, selectedNetwork));

    // Clear form
    setSymbol('');
    setAddress('');
    setName('');
    setDecimals('18');

    Alert.alert('Success', `${tokenData.symbol} token added successfully!`);
  };

  const handleRemoveToken = (token: TokenWithBalance) => {
    if (!token.isCustom) {
      Alert.alert('Cannot Remove', 'Default tokens cannot be removed.');
      return;
    }

    Alert.alert(
      'Remove Token',
      `Are you sure you want to remove ${token.symbol}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removeCustomToken(token.symbol, selectedNetwork)),
        },
      ],
    );
  };

  const isFormValid = symbol.trim() && address.trim() && name.trim() && decimals.trim();

  return (
    <Screen title="Manage Tokens" canGoBack>
      <View style={customStyles.container}>
        {/* Add Custom Token Section */}
        <View style={customStyles.section}>
          <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Add Custom Token
          </ZulipText>

          <Input
            style={customStyles.input}
            placeholder="Token Symbol (e.g., USDT)"
            value={symbol}
            onChangeText={setSymbol}
            autoCapitalize="characters"
          />

          <Input
            style={customStyles.input}
            placeholder="Contract Address (0x...)"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
          />

          <Input
            style={customStyles.input}
            placeholder="Token Name (e.g., Tether USD)"
            value={name}
            onChangeText={setName}
          />

          <Input
            style={customStyles.input}
            placeholder="Decimals (usually 18)"
            value={decimals}
            onChangeText={setDecimals}
            keyboardType="numeric"
          />

          <ZulipButton
            disabled={!isFormValid}
            text="Add Token"
            onPress={handleAddToken}
          />
        </View>

        {/* Token List Section */}
        <View style={customStyles.section}>
          <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Available Tokens
          </ZulipText>

          {availableTokens.map(token => (
            <View
              key={token.symbol}
              style={[
                customStyles.tokenItem,
                {
                  backgroundColor: themeData.cardColor,
                  borderColor: themeData.dividerColor,
                  flexDirection: 'column', // Change to column layout
                  alignItems: 'stretch', // Stretch to full width
                },
              ]}
            >
              {/* First row: Token info and badge/button */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={customStyles.tokenInfo}>
                  <ZulipText style={[customStyles.tokenSymbol, { color: themeData.color }]}>
                    {token.symbol}
                  </ZulipText>
                  <ZulipText style={[customStyles.tokenName, { color: themeData.color }]}>
                    {token.name}
                  </ZulipText>
                </View>

                {!token.isCustom ? (
                  <View style={customStyles.defaultBadge}>
                    <ZulipText style={customStyles.badgeText}>DEFAULT</ZulipText>
                  </View>
                ) : (
                  <ZulipButton
                    style={{ backgroundColor: TandaPayColors.error }}
                    text="Remove"
                    onPress={() => handleRemoveToken(token)}
                  />
                )}
              </View>

              {/* Second row: Address ScrollableTextBox (if address exists) */}
              {token.address != null && token.address !== '' && (
                <View style={{ marginTop: 12 }}>
                  <ScrollableTextBox
                    text={token.address}
                    label={`${token.symbol} Address`}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
