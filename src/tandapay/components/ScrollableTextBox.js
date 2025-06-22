/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
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

const styles = {
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  scrollContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingRight: 36, // Make room for copy icon
    height: 40, // Fixed height for bounded scrolling
  },
  scrollableText: {
    fontFamily: 'monospace', // Explicit monospace font
    fontSize: 11,
    padding: 10,
    lineHeight: 16,
    minWidth: '100%', // Ensure text doesn't wrap
    opacity: 0.9,
  },
  overlayButton: {
    position: 'absolute',
    right: 6,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
};

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
        contentContainerStyle={{ alignItems: 'center' }}
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
