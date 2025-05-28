// @flow strict-local

import React, { useState } from 'react';
import type { Node } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import ZulipText from '../common/ZulipText';

const styles = StyleSheet.create({
  ribbon: {
    width: '100%',
    paddingVertical: 0,
    paddingHorizontal: 0,
    // Optionally add shadow or border
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'left',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
  },
  contentContainer: {
    padding: 0,
  },
});

type Props = $ReadOnly<{|
  label: string,
  backgroundColor?: string,
  initiallyCollapsed?: boolean,
  marginTop?: number,
  marginBottom?: number,
  marginHorizontal?: number,
  labelStyle?: {||},
  ribbonStyle?: {||},
  contentBackgroundColor?: string,
  children: Node,
|}>;

/**
 * A collapsible ribbon component with customizable styling.
 */
export default function TandaRibbon(props: Props): Node {
  const {
    label,
    backgroundColor = '#eee',
    initiallyCollapsed = false,
    marginTop = 8,
    marginBottom = 8,
    marginHorizontal = 0,
    labelStyle = {},
    ribbonStyle = {},
    contentBackgroundColor = undefined,
    children,
  } = props;
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);

  return (
    <View style={[styles.ribbon, { marginTop, marginBottom, marginHorizontal }, ribbonStyle]}>
      <TouchableOpacity
        onPress={() => setCollapsed(c => !c)}
        activeOpacity={0.7}
        style={[styles.labelRow, { backgroundColor }]}
      >
        <ZulipText style={[styles.labelText, labelStyle]}>{label}</ZulipText>
        <ZulipText style={[styles.labelText, labelStyle, { textAlign: 'right' }]}>
          {collapsed ? '\u25BC' : '\u25B2'}
        </ZulipText>
      </TouchableOpacity>
      {!collapsed && (
        <View
          style={[
            styles.contentContainer,
            contentBackgroundColor != null ? { backgroundColor: contentBackgroundColor } : null,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}
