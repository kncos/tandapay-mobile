/* @flow strict-local */

import React, { useState, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import { IconCaretDown } from '../../common/Icons';
import { TandaPayColors, TandaPayTypography } from '../styles';
import {
  HALF_COLOR,
  HIGHLIGHT_COLOR,
} from '../../styles/constants';
import { ThemeContext } from '../../styles';
import Card from './Card';
import type { Token } from '../tokens/tokenTypes';

type Props = $ReadOnly<{|
  tokens: $ReadOnlyArray<Token>,
  selectedToken: ?Token,
  onTokenSelect: (token: Token) => void,
  placeholder?: string,
  disabled?: boolean,
  erc20Only?: boolean,
|}>;

const customStyles = StyleSheet.create({
  pickerContainer: {
    marginBottom: 16,
  },
  cardContainer: {
    alignSelf: 'stretch',
    borderWidth: 2,
    borderColor: HIGHLIGHT_COLOR,
  },
  cardDisabled: {
    backgroundColor: TandaPayColors.disabled,
    opacity: 0.5,
    borderColor: TandaPayColors.subtle,
  },
  pickerButton: {
    padding: 12,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    ...TandaPayTypography.body,
  },
  pickerPlaceholder: {
    ...TandaPayTypography.body,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    ...TandaPayTypography.sectionTitle,
    marginBottom: 16,
    textAlign: 'center',
  },
  tokenItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: TandaPayColors.subtle,
  },
  tokenName: {
    ...TandaPayTypography.body,
    fontWeight: 'bold',
  },
  tokenSymbol: {
    ...TandaPayTypography.caption,
  },
  tokenAddress: {
    ...TandaPayTypography.caption,
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default function TokenPicker(props: Props): Node {
  const { tokens, selectedToken, onTokenSelect, placeholder = 'Select a token', disabled = false, erc20Only = false } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const themeData = useContext(ThemeContext);

  // Filter tokens based on erc20Only flag
  const filteredTokens = erc20Only
    ? tokens.filter(token => token.address != null && token.address !== '')
    : tokens;

  const handleOpenModal = useCallback(() => {
    if (!disabled) {
      setModalVisible(true);
    }
  }, [disabled]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleTokenSelect = useCallback((token: Token) => {
    onTokenSelect(token);
    setModalVisible(false);
  }, [onTokenSelect]);

  const renderTokenItem = useCallback(({ item, index, separators }) => (
    <TouchableOpacity
      style={customStyles.tokenItem}
      onPress={() => handleTokenSelect(item)}
    >
      <ZulipText style={[customStyles.tokenName, { color: themeData.color }]}>
        {item.name}
      </ZulipText>
      <ZulipText style={[customStyles.tokenSymbol, { color: themeData.color }]}>
        {item.symbol}
      </ZulipText>
      {(item.address != null && item.address !== '') && (
        <ZulipText style={[customStyles.tokenAddress, { color: themeData.color }]}>
          {item.address}
        </ZulipText>
      )}
    </TouchableOpacity>
  ), [handleTokenSelect, themeData.color]);

  const displayText = selectedToken
    ? `${selectedToken.name} (${selectedToken.symbol})`
    : placeholder;

  return (
    <View style={customStyles.pickerContainer}>
      <Card
        style={[
          customStyles.cardContainer,
          disabled && customStyles.cardDisabled,
        ]}
        borderRadius={16}
        padding={2}
        backgroundColor={themeData.cardColor}
      >
        <TouchableOpacity
          style={customStyles.pickerButton}
          onPress={handleOpenModal}
          disabled={disabled}
        >
          <ZulipText
            style={[
              selectedToken ? customStyles.pickerText : customStyles.pickerPlaceholder,
              { color: selectedToken ? themeData.color : TandaPayColors.disabled }
            ]}
          >
            {displayText}
          </ZulipText>
          <IconCaretDown
            size={16}
            color={HALF_COLOR}
          />
        </TouchableOpacity>
      </Card>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={customStyles.modalContainer}>
          <View style={[customStyles.modalContent, { backgroundColor: themeData.cardColor }]}>
            <ZulipText style={[customStyles.modalTitle, { color: themeData.color }]}>
              Select Token
            </ZulipText>

            <FlatList
              data={filteredTokens}
              renderItem={renderTokenItem}
              keyExtractor={(item, index) => (item.address != null && item.address !== '') ? item.address : `native-${index}`}
              showsVerticalScrollIndicator={false}
            />

            <View style={customStyles.buttonRow}>
              <ZulipButton
                style={customStyles.button}
                text="Cancel"
                onPress={handleCloseModal}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
