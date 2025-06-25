// @flow strict-local

import React from 'react';
import type { Node } from 'react';
import { Text, StyleSheet } from 'react-native';

import { TandaPayColors, TandaPayTypography } from '../styles';

type Props = {|
  +children: string,
  +style?: $PropertyType<React$ElementConfig<typeof Text>, 'style'>,
|};

const styles = StyleSheet.create({
  errorText: {
    ...TandaPayTypography.error,
    color: TandaPayColors.error,
  },
});

/**
 * Reusable error text component for displaying validation errors
 * and other error messages with consistent styling.
 */
export default function ErrorText(props: Props): Node {
  const { children, style } = props;

  return (
    <Text style={[styles.errorText, style]}>
      {children}
    </Text>
  );
}
