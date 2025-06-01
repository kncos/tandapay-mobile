/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import ZulipText from '../../../../common/ZulipText';
import Touchable from '../../../../common/Touchable';
import {
  BRAND_COLOR,
  HIGHLIGHT_COLOR,
  QUARTER_COLOR,
} from '../../../../styles/constants';

type Props = $ReadOnly<{|
  word: string,
  isSelected: boolean,
  onPress: () => void,
|}>;

const styles = StyleSheet.create({
  wordChip: {
    backgroundColor: QUARTER_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND_COLOR,
    margin: 4,
  },
  selectedWordChip: {
    backgroundColor: HIGHLIGHT_COLOR,
    borderColor: BRAND_COLOR,
  },
  wordText: {
    fontSize: 14,
  },
  selectedWordText: {
    color: '#fff',
  },
});

export default function WordChip(props: Props): Node {
  const { word, isSelected, onPress } = props;
  
  const chipStyle = isSelected
    ? [styles.wordChip, styles.selectedWordChip]
    : styles.wordChip;
  const textStyle = isSelected
    ? styles.selectedWordText
    : styles.wordText;

  return (
    <Touchable onPress={onPress}>
      <View style={chipStyle}>
        <ZulipText style={textStyle} text={word} />
      </View>
    </Touchable>
  );
}
