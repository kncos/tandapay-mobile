/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, SafeAreaView, TouchableOpacity } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { TandaPayColors, TandaPayTypography } from '../styles';

type Props = $ReadOnly<{|
  children: Node,
  onClose: () => void,
  title?: string,
|}>;

const customStyles = {
  container: {
    flex: 1,
    backgroundColor: TandaPayColors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: TandaPayColors.subtle,
  },
  title: {
    ...TandaPayTypography.sectionTitle,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    ...TandaPayTypography.body,
    color: TandaPayColors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
};

export default function ModalContainer(props: Props): Node {
  const { children, onClose, title } = props;

  return (
    <SafeAreaView style={customStyles.container}>
      <View style={customStyles.header}>
        <View style={{ width: 60 }} />
        {(title != null && title !== '') && (
          <ZulipText style={customStyles.title}>
            {title}
          </ZulipText>
        )}
        <TouchableOpacity
          style={customStyles.closeButton}
          onPress={onClose}
        >
          <ZulipText style={customStyles.closeButtonText}>
            Close
          </ZulipText>
        </TouchableOpacity>
      </View>

      <View style={customStyles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}
