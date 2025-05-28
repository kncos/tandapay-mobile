// @flow strict-local

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyleSheet, HALF_COLOR } from '../styles';
import type { LocalizableReactText } from '../types';
import ZulipText from '../common/ZulipText';
import ZulipTextButton from '../common/ZulipTextButton';

const styles = createStyleSheet({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: HALF_COLOR,
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
    paddingTop: 10,
  },
  textRow: {
    flexGrow: 1,
    flexDirection: 'row',
    marginBottom: 12,
  },
  text: {
    marginTop: 6,
    lineHeight: 20,
  },
  buttonsRow: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

type Button = $ReadOnly<{|
  id: string,
  label: LocalizableReactText,
  onPress: () => void,
|}>;

type Props = $ReadOnly<{|
  visible: boolean,
  text: LocalizableReactText,
  buttons: $ReadOnlyArray<Button>,
  backgroundColor?: string,
|}>;

/**
 * A banner for TandaPay, based on ZulipBanner but with customizable background color and ZulipText.
 */
export default function TandaPayBanner(props: Props): Node {
  const { visible, text, buttons, backgroundColor } = props;

  if (!visible) {
    return null;
  }

  return (
    <SafeAreaView
      mode="padding"
      edges={['right', 'left']}
      style={[styles.wrapper, backgroundColor != null ? { backgroundColor } : null]}
    >
      <View style={styles.textRow}>
        <ZulipText text={typeof text === 'string' ? text : String(text)} style={styles.text} />
      </View>
      <View style={styles.buttonsRow}>
        {buttons.map(({ id, label, onPress }, index) => (
          <ZulipTextButton
            key={id}
            leftMargin={index !== 0 || undefined}
            label={label}
            onPress={onPress}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}
