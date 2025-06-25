/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View , StyleSheet } from 'react-native';

import ZulipText from '../../../../common/ZulipText';
import Touchable from '../../../../common/Touchable';
import { TandaPayColors, TandaPayComponents } from '../../../styles';

type Props = $ReadOnly<{|
  word: string,
  isSelected: boolean,
  onPress: () => void,
|}>;

// Only create styles for the text since chips use centralized styles
const textStyles = StyleSheet.create({
  normal: {
    fontSize: 14,
  },
  selected: {
    fontSize: 14,
    color: TandaPayColors.white,
  },
});

export default function WordChip(props: Props): Node {
  const { word, isSelected, onPress } = props;

  const chipStyle = isSelected
    ? [TandaPayComponents.base, TandaPayComponents.selected]
    : TandaPayComponents.base;
  const textStyle = isSelected
    ? textStyles.selected
    : textStyles.normal;

  return (
    <Touchable onPress={onPress}>
      <View style={chipStyle}>
        <ZulipText style={textStyle} text={word} />
      </View>
    </Touchable>
  );
}
