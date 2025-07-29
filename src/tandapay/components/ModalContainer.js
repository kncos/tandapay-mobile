/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import CloseButton from './CloseButton';
import ModalStyles from '../styles/modals';
import { ThemeContext } from '../../styles/theme';

type Props = $ReadOnly<{|
  children: Node,
  onClose: () => void,
  title?: string,
  contentPadding?: number,
|}>;

const customStyles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically using theme
  },
  header: {
    ...ModalStyles.header,
    padding: 16,
    borderBottomWidth: 1,
    marginBottom: 0,
    // borderBottomColor and backgroundColor will be set dynamically
  },
  title: {
    ...ModalStyles.title,
    textAlign: 'center',
    // color will use ZulipText default (theme-based)
  },
  content: {
    ...ModalStyles.content,
    // padding will be set dynamically based on props
  },
});

/**
 * A modal container component providing consistent layout and styling for modals.
 * Includes header with title and close button, plus content area with configurable padding.
 */
export default function ModalContainer(props: Props): Node {
  const { children, onClose, title, contentPadding = 16 } = props;
  const themeData = useContext(ThemeContext);

  return (
    <SafeAreaView style={[customStyles.container, { backgroundColor: themeData.backgroundColor }]}>
      <View
        style={[
          customStyles.header,
          {
            backgroundColor: themeData.backgroundColor,
            borderBottomColor: themeData.dividerColor,
          },
        ]}
      >
        <View style={{ width: 60 }} />
        {(title != null && title !== '') && (
          <ZulipText style={customStyles.title}>
            {title}
          </ZulipText>
        )}
        <CloseButton onPress={onClose} />
      </View>

      <View
        style={[
          customStyles.content,
          {
            backgroundColor: themeData.backgroundColor,
            padding: contentPadding,
          },
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
