/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import ZulipText from '../../../../common/ZulipText';
import WordChip from './WordChip';
import { TandaPayColors } from '../../../styles';

type Props = $ReadOnly<{|
  position: number,
  selectedWord: ?string,
  onClear: (position: number) => void,
|}>;

const customStyles = {
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
};

export default function VerificationRow(props: Props): Node {
  const { position, selectedWord, onClear } = props;

  return (
    <View style={customStyles.verificationRow}>
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
            text="Tap a word below"
            style={customStyles.placeholderText}
          />
        )}
      </View>
    </View>
  );
}
