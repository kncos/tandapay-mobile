// @flow strict-local

import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View, Modal, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import Card from './Card';
import CloseButton from './CloseButton';
import TandaPayStyles from '../styles';
import ModalStyles from '../styles/modals';
import { QUARTER_COLOR } from '../../styles/constants';
import { ThemeContext } from '../../styles';

type MacroInfo = {|
  id: string,
  name: string,
  description: string,
  icon?: string,
|};

type Props = $ReadOnly<{|
  visible: boolean,
  macroInfo: ?MacroInfo,
  transactionCount?: number,
  isRefreshing?: boolean,
  onClose: () => void,
  onRefresh: () => void | Promise<void>,
  onContinue: () => void | Promise<void>,
|}>;

const styles = StyleSheet.create({
  transactionInfo: {
    ...TandaPayStyles.caption,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  loadingText: {
    ...TandaPayStyles.caption,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 16,
  },
});

export default function MacroIntroModal(props: Props): Node {
  const { visible, macroInfo, transactionCount, isRefreshing, onClose, onRefresh, onContinue } = props;
  const themeData = useContext(ThemeContext);

  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  if (!macroInfo) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={ModalStyles.overlay}>
        <Card style={[ModalStyles.modalCard, { backgroundColor: themeData.cardColor }]}>
          <View style={[ModalStyles.header, { borderBottomColor: QUARTER_COLOR }]}>
            <ZulipText style={[ModalStyles.title, { color: themeData.color }]} text={macroInfo.name} />
            <CloseButton onPress={onClose} />
          </View>

          <ZulipText
            style={[TandaPayStyles.body, { color: themeData.color, marginBottom: 24 }]}
            text={macroInfo.description}
          />

          {transactionCount !== undefined && transactionCount > 0 && (
            <ZulipText
              style={styles.transactionInfo}
              text={`This macro will execute ${transactionCount} transaction${transactionCount === 1 ? '' : 's'}.`}
            />
          )}

          {transactionCount !== undefined && transactionCount === 0 && isRefreshing !== true && (
            <ZulipText
              style={styles.transactionInfo}
              text="No transactions needed - the community is already in the desired state."
            />
          )}

          {isRefreshing === true && (
            <ZulipText
              style={styles.loadingText}
              text="Loading macro data..."
            />
          )}

          <View style={styles.buttonContainer}>
            <View style={TandaPayStyles.buttonRow}>
              <ZulipButton
                style={TandaPayStyles.button}
                text="Refresh Data"
                onPress={handleRefresh}
              />
            </View>
            <View style={TandaPayStyles.buttonRow}>
              <ZulipButton
                style={TandaPayStyles.button}
                text="Continue"
                onPress={handleContinue}
              />
            </View>
          </View>
        </Card>
      </View>
    </Modal>
  );
}
