/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, TouchableOpacity, Modal, FlatList } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import { TandaPayColors, TandaPayTypography } from '../styles';
import type { Token } from '../tokens/tokenTypes';

type Props = $ReadOnly<{|
  tokens: $ReadOnlyArray<Token>,
  selectedToken: ?Token,
  onTokenSelect: (token: Token) => void,
  placeholder?: string,
  disabled?: boolean,
  erc20Only?: boolean,
|}>;

const customStyles = {
  pickerContainer: {
    marginBottom: 16,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: TandaPayColors.subtle,
    borderRadius: 8,
    padding: 12,
    backgroundColor: TandaPayColors.white,
  },
  pickerButtonDisabled: {
    backgroundColor: TandaPayColors.disabled,
    opacity: 0.5,
  },
  pickerText: {
    ...TandaPayTypography.body,
  },
  pickerPlaceholder: {
    ...TandaPayTypography.body,
    color: TandaPayColors.disabled,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: TandaPayColors.white,
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
    color: TandaPayColors.disabled,
  },
  tokenAddress: {
    ...TandaPayTypography.caption,
    color: TandaPayColors.disabled,
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
};

export default function TokenPicker(props: Props): Node {
  const { tokens, selectedToken, onTokenSelect, placeholder = 'Select a token', disabled = false, erc20Only = false } = props;
  const [modalVisible, setModalVisible] = useState(false);

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
      <ZulipText style={customStyles.tokenName}>
        {item.name}
      </ZulipText>
      <ZulipText style={customStyles.tokenSymbol}>
        {item.symbol}
      </ZulipText>
      {(item.address != null && item.address !== '') && (
        <ZulipText style={customStyles.tokenAddress}>
          {item.address}
        </ZulipText>
      )}
    </TouchableOpacity>
  ), [handleTokenSelect]);

  const displayText = selectedToken
    ? `${selectedToken.name} (${selectedToken.symbol})`
    : placeholder;

  return (
    <View style={customStyles.pickerContainer}>
      <TouchableOpacity
        style={[
          customStyles.pickerButton,
          disabled && customStyles.pickerButtonDisabled,
        ]}
        onPress={handleOpenModal}
        disabled={disabled}
      >
        <ZulipText
          style={selectedToken ? customStyles.pickerText : customStyles.pickerPlaceholder}
        >
          {displayText}
        </ZulipText>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={customStyles.modalContainer}>
          <View style={customStyles.modalContent}>
            <ZulipText style={customStyles.modalTitle}>
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
