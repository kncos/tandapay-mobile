// @flow strict-local

import React from 'react';
import type { Node } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

import { BRAND_COLOR, QUARTER_COLOR } from '../../styles/constants';

type Props = {|
  +onPress: () => void,
  +style?: $PropertyType<React$ElementConfig<typeof TouchableOpacity>, 'style'>,
  +textStyle?: $PropertyType<React$ElementConfig<typeof Text>, 'style'>,
|};

const styles = StyleSheet.create({
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: QUARTER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_COLOR,
  },
});

/**
 * Reusable close button component used across modals and overlays.
 * Provides consistent styling and behavior for close actions.
 */
export default function CloseButton(props: Props): Node {
  const { onPress, style, textStyle } = props;

  return (
    <TouchableOpacity
      style={[styles.closeButton, style]}
      onPress={onPress}
      accessibilityLabel="Close"
      accessibilityRole="button"
    >
      <Text style={[styles.closeButtonText, textStyle]}>×</Text>
    </TouchableOpacity>
  );
}
