// @flow strict-local

import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View, Modal, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import Card from './Card';
import CloseButton from './CloseButton';
import TandaPayStyles, { TandaPayColors } from '../styles';
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
  overlay: {
    flex: 1,
    backgroundColor: TandaPayColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: QUARTER_COLOR,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  transactionInfo: {
    fontSize: 12,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 12,
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
      <View style={styles.overlay}>
        <Card style={[styles.modalCard, { backgroundColor: themeData.cardColor }]}>
          <View style={styles.header}>
            <ZulipText style={[styles.title, { color: themeData.color }]} text={macroInfo.name} />
            <CloseButton onPress={onClose} />
          </View>

          <ZulipText
            style={[styles.description, { color: themeData.color }]}
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
