// @flow strict-local

import React, { useState, useContext } from 'react';
import type { Node } from 'react';
import { View, Alert, StyleSheet } from 'react-native';

// $FlowIgnore[untyped-import] ethers doesn't have types
import { ethers } from 'ethers';
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
import ZulipTextButton from '../../common/ZulipTextButton';
import Input from '../../common/Input';
import { ScrollableTextBox } from '../components';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import type { RouteProp } from '../../react-navigation';

function ErrorText({ children }: { children: string }): Node {
  return (
    <ZulipText style={{ color: TandaPayColors.error, fontSize: 12, marginTop: 4, marginBottom: 8 }}>
      {children}
    </ZulipText>
  );
}

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

    const validation = validateCustomToken(tokenData, selectedNetwork);
    if (!validation.isValid) {
      Alert.alert(
        'Invalid Token',
        validation.error != null ? validation.error : 'Please check that all fields are filled correctly.',
      );
      return;
    }

    // Check if token already exists on the current network only
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

  const symbolValid = symbol.trim().length > 0;
  const addressValid = ethers.utils.isAddress(address.trim());
  const nameValid = name.length > 0;
  const decimalsValid = Number.isInteger(parseInt(decimals, 10)) && parseInt(decimals, 10) >= 0;

  const isFormValid = symbolValid && addressValid && nameValid && decimalsValid;

  return (
    <Screen title="Manage Tokens" canGoBack>
      <View style={customStyles.container}>
        {/* Add Custom Token Section */}
        <View style={customStyles.section}>
          <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Add Custom Token (Network:
            {' '}
            {selectedNetwork}
            )
          </ZulipText>

          <Input
            style={customStyles.input}
            placeholder="Token Symbol (e.g., USDT)"
            value={symbol}
            onChangeText={setSymbol}
            autoCapitalize="characters"
          />
          {symbol.length > 0 && !symbolValid && (
            <ErrorText>Symbol is required and cannot be empty</ErrorText>
          )}

          <Input
            style={customStyles.input}
            placeholder="Contract Address (0x...)"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
          />
          {address.length > 0 && !addressValid && (
            <ErrorText>Please enter a valid Ethereum address</ErrorText>
          )}

          <Input
            style={customStyles.input}
            placeholder="Token Name (e.g., Tether USD)"
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
          />
          {name.length > 0 && !nameValid && (
            <ErrorText>Token name is required</ErrorText>
          )}

          <Input
            style={customStyles.input}
            placeholder="Decimals (usually 18)"
            value={decimals}
            onChangeText={setDecimals}
            keyboardType="numeric"
          />
          {decimals.length > 0 && !decimalsValid && (
            <ErrorText>Please enter a valid number (0 or greater)</ErrorText>
          )}

          <ZulipButton
            disabled={!isFormValid}
            text="Add Token"
            onPress={handleAddToken}
          />
        </View>

        {/* Token List Section */}
        <View style={customStyles.section}>
          <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Available Tokens (
            {availableTokens.length}
            )
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
                  <ZulipTextButton
                    label="Remove"
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
