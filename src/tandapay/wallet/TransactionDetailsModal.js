/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import { ThemeContext } from '../../styles';
import { TandaPayColors, TandaPayTypography } from '../styles';
import Card from '../components/Card';
import ScrollableTextBox from '../components/ScrollableTextBox';
import { formatTimestamp } from './TransactionUtils';

type Props = {|
  visible: boolean,
  transaction: ?mixed, // EtherscanTransaction format from convertTransferToEtherscanFormat
  walletAddress: string,
  onClose: () => void,
  onViewInExplorer: (txHash: string) => void,
|};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: TandaPayColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...TandaPayTypography.subsectionTitle,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingVertical: 4,
  },
  label: {
    ...TandaPayTypography.label,
    flex: 1,
    marginRight: 12,
  },
  value: {
    ...TandaPayTypography.description,
    flex: 2,
    textAlign: 'right',
  },
  addressValue: {
    ...TandaPayTypography.monospace,
    fontSize: 12,
    flex: 2,
    textAlign: 'right',
  },
  hashValue: {
    ...TandaPayTypography.monospace,
    fontSize: 12,
    flex: 2,
    textAlign: 'right',
  },
  statusSuccess: {
    ...TandaPayTypography.description,
    color: TandaPayColors.success,
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  statusFailed: {
    ...TandaPayTypography.description,
    color: TandaPayColors.error,
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
  },
};

function showToast(message: string) {
  // Simple alert for now - can be replaced with proper toast if available
  Alert.alert('Success', message);
}

function copyToClipboard(text: string, label: string) {
  Clipboard.setString(text);
  showToast(`${label} copied to clipboard`);
}

export default function TransactionDetailsModal({
  visible,
  transaction,
  walletAddress,
  onClose,
  onViewInExplorer,
}: Props): Node {
  const themeData = useContext(ThemeContext);

  if (!visible || transaction == null) {
    return null;
  }

  // The transaction is already in EtherscanTransaction format from TransactionList
  // $FlowFixMe[unclear-type] - Transaction object structure is from converted format
  const etherscanTransaction = (transaction: any);

  // Format display values
  const blockNumber = etherscanTransaction.blockNumber && etherscanTransaction.blockNumber !== '0'
    ? etherscanTransaction.blockNumber
    : 'Unknown';
  const fullDate = etherscanTransaction.timeStamp && etherscanTransaction.timeStamp !== '0'
    ? formatTimestamp(etherscanTransaction.timeStamp)
    : 'Unknown';

  // Determine transaction type and direction
  const isTokenTransfer = etherscanTransaction.asset !== 'ETH';
  const direction = etherscanTransaction.direction === 'IN' ? 'received' : 'sent';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Card style={styles.modalCard}>
          <View style={[styles.header, { borderBottomColor: themeData.dividerColor }]}>
            <ZulipText style={TandaPayTypography.sectionTitle}>
              Transaction Details
            </ZulipText>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <ZulipText style={[styles.closeButtonText, { color: TandaPayColors.primary }]}>✕</ZulipText>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Transaction Summary */}
            <View style={styles.section}>
              <ZulipText style={styles.sectionTitle}>Summary</ZulipText>

              <View style={styles.row}>
                <ZulipText style={styles.label}>Type:</ZulipText>
                <ZulipText style={styles.value}>
                  {isTokenTransfer ? 'Token Transfer' : 'ETH Transfer'}
                </ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={styles.label}>Direction:</ZulipText>
                <ZulipText style={styles.value}>
                  {direction === 'sent' ? 'Sent' : 'Received'}
                </ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={styles.label}>Amount:</ZulipText>
                <ZulipText style={styles.value}>
                  {etherscanTransaction.formattedValue}
                </ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={styles.label}>Date:</ZulipText>
                <ZulipText style={styles.value}>{fullDate}</ZulipText>
              </View>
            </View>

            <View style={styles.section}>
              <ZulipText style={styles.sectionTitle}>Addresses</ZulipText>

              <View>
                <ZulipText style={styles.label}>From:</ZulipText>
                <ScrollableTextBox
                  text={etherscanTransaction.from}
                  label="From address"
                  size="small"
                  onCopy={copyToClipboard}
                />
              </View>

              <View>
                <ZulipText style={styles.label}>To:</ZulipText>
                <ScrollableTextBox
                  text={etherscanTransaction.to}
                  label="To address"
                  size="small"
                  onCopy={copyToClipboard}
                />
              </View>

              {isTokenTransfer && etherscanTransaction.contractAddress != null && etherscanTransaction.contractAddress !== '' && (
                <View>
                  <ZulipText style={styles.label}>Token Contract:</ZulipText>
                  <ScrollableTextBox
                    text={etherscanTransaction.contractAddress}
                    label="Token contract"
                    size="small"
                    onCopy={copyToClipboard}
                  />
                </View>
              )}
            </View>

            <View style={styles.section}>
              <ZulipText style={styles.sectionTitle}>Transaction Info</ZulipText>

              <View>
                <ZulipText style={styles.label}>Hash:</ZulipText>
                <ScrollableTextBox
                  text={etherscanTransaction.hash}
                  label="Transaction hash"
                  size="normal"
                  onCopy={copyToClipboard}
                />
              </View>

              <View style={styles.row}>
                <ZulipText style={styles.label}>Block:</ZulipText>
                <ZulipText style={styles.value}>{blockNumber}</ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={styles.label}>Asset:</ZulipText>
                <ZulipText style={styles.value}>
                  {etherscanTransaction.asset}
                </ZulipText>
              </View>
            </View>

            <View style={styles.section}>
              <ZulipText style={styles.sectionTitle}>Note</ZulipText>
              <ZulipText style={[styles.value, { fontStyle: 'italic' }]}>
                Gas and fee information not available for this transfer format.
                Use a blockchain explorer for detailed gas information.
              </ZulipText>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.buttonContainer, { borderTopColor: themeData.dividerColor }]}>
            <ZulipButton
              style={styles.button}
              text="View in Explorer"
              onPress={() => onViewInExplorer(etherscanTransaction.hash)}
              secondary
            />
            <ZulipButton
              style={styles.button}
              text="Close"
              onPress={onClose}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
}
