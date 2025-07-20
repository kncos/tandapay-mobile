/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import ZulipText from '../../../../common/ZulipText';
import WordChip from './WordChip';
import { TandaPayColors } from '../../../styles';

type Props = $ReadOnly<{|
  position: number,
  selectedWord: ?string,
  isSelected: boolean,
  onClear: (position: number) => void,
  onSelect: (position: number) => void,
|}>;

const customStyles = StyleSheet.create({
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  verificationRowSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: TandaPayColors.whiteOverlay10,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  positionText: {
    fontSize: 16,
    fontWeight: '500',
    width: 80,
  },
  selectedWordsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  placeholderText: {
    color: TandaPayColors.disabled,
    fontStyle: 'italic',
  },
});

export default function VerificationRow(props: Props): Node {
  const { position, selectedWord, isSelected, onClear, onSelect } = props;

  return (
    <View style={isSelected ? customStyles.verificationRowSelected : customStyles.verificationRow}>
      <ZulipText style={customStyles.positionText} text={`${position + 1}.`} />
      <View style={customStyles.selectedWordsContainer}>
        {selectedWord != null && selectedWord.length > 0 ? (
          <WordChip
            word={selectedWord}
            isSelected
            onPress={() => onClear(position)}
          />
        ) : (
          <ZulipText
            text={isSelected ? 'Select a word below' : 'Tap here to select'}
            style={customStyles.placeholderText}
            onPress={() => onSelect(position)}
          />
        )}
      </View>
    </View>
  );
}
