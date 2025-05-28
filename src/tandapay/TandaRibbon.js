import React, { useState } from 'react';
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
    padding: 8,
  },
});

/**
 * Props:
 * - label: string (required)
 * - backgroundColor: string (optional, default: '#eee')
 * - initiallyCollapsed: boolean (optional, default: false)
 * - children: React.ReactNode (content to show/hide)
 */
export default function TandaRibbon({
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
}) {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);

  return (
    <View
      style={[
        styles.ribbon,
        { marginTop, marginBottom, marginHorizontal },
        ribbonStyle,
      ]}
    >
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
        <View style={[styles.contentContainer, contentBackgroundColor ? { backgroundColor: contentBackgroundColor } : null]}>
          {children}
        </View>
      )}
    </View>
  );
}
