/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import CloseButton from './CloseButton';
import ModalStyles from '../styles/modals';
import { TandaPayColors } from '../styles';

type Props = $ReadOnly<{|
  children: Node,
  onClose: () => void,
  title?: string,
  contentPadding?: number,
|}>;

const customStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TandaPayColors.white,
  },
  header: {
    ...ModalStyles.header,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: TandaPayColors.subtle,
  },
  title: {
    ...ModalStyles.title,
    textAlign: 'center',
  },
  content: {
    ...ModalStyles.content,
    // padding will be set dynamically based on props
  },
});

export default function ModalContainer(props: Props): Node {
  const { children, onClose, title, contentPadding = 16 } = props;

  return (
    <SafeAreaView style={customStyles.container}>
      <View style={customStyles.header}>
        <View style={{ width: 60 }} />
        {(title != null && title !== '') && (
          <ZulipText style={customStyles.title}>
            {title}
          </ZulipText>
        )}
        <CloseButton onPress={onClose} />
      </View>

      <View style={[customStyles.content, { padding: contentPadding }]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
