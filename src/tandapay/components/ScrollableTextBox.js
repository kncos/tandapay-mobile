/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, ScrollView, TouchableOpacity, Alert , StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';
import { TandaPayColors } from '../styles';
import { IconCopy } from '../../common/Icons';

type Props = {|
  text: string,
  label: string,
  size?: 'small' | 'normal',
  onCopy?: (text: string, label: string) => void,
|};

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
    width: '100%',
  },
  scrollContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingRight: 36, // Make room for copy icon
    height: 50, // Increased height for better visibility
    width: '100%',
  },
  scrollableText: {
    fontFamily: 'monospace', // Explicit monospace font
    fontSize: 12,
    padding: 12,
    lineHeight: 18,
    opacity: 0.9,
  },
  overlayButton: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});

function defaultOnCopy(text: string, label: string) {
  Clipboard.setString(text);
  Alert.alert('Success', `${label} copied to clipboard`);
}

export default function ScrollableTextBox({
  text,
  label,
  onCopy = defaultOnCopy,
}: Props): Node {
  const themeData = useContext(ThemeContext);

  const containerStyle = styles.scrollContainer;
  const textStyle = styles.scrollableText;

  return (
    <View style={styles.inputContainer}>
      <ScrollView
        horizontal
        style={[
          containerStyle,
          {
            borderColor: themeData.dividerColor,
            backgroundColor: themeData.cardColor,
          }
        ]}
        contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', minHeight: 50 }}
        showsHorizontalScrollIndicator={false}
      >
        <ZulipText
          style={[textStyle, { color: themeData.color }]}
          selectable
        >
          {text}
        </ZulipText>
      </ScrollView>
      <TouchableOpacity
        style={styles.overlayButton}
        onPress={() => onCopy(text, label)}
      >
        <IconCopy size={14} color={TandaPayColors.white} />
      </TouchableOpacity>
    </View>
  );
}
