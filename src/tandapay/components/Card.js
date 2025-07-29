// @flow strict-local

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { ThemeContext } from '../../styles';

type Props = $ReadOnly<{|
  children: Node,
  style?: ViewStyleProp,
  backgroundColor?: string,
  padding?: number,
  borderRadius?: number,
|}>;

/**
 * A reusable card container component with configurable styling.
 * Provides consistent card appearance with customizable padding, border radius, and background color.
 */
export default function Card(props: Props): Node {
  const {
    children,
    style,
    backgroundColor,
    padding = 16,
    borderRadius = 8,
  } = props;

  const themeData = useContext(ThemeContext);

  return (
    <View
      style={[
        {
          padding,
          borderRadius,
          backgroundColor: backgroundColor != null ? backgroundColor : themeData.cardColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
