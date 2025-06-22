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
import { formatTransferForDisplay } from './TransactionFormatter';
import { formatTimestamp, formatAddress } from './TransactionUtils';

type Props = {|
  visible: boolean,
  transaction: ?mixed, // New transfer format from Alchemy
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
  copyableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
  },
  copyButtonText: {
    fontSize: 12,
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

  // Format the transfer using our new formatter
  const formattedTransfer = formatTransferForDisplay(transaction, walletAddress);

  // Format display values
  const blockNumber = formattedTransfer.blockNumber != null ? formattedTransfer.blockNumber : 'Unknown';
  const fullDate = formattedTransfer.timestamp != null
    ? formatTimestamp(formattedTransfer.timestamp)
    : 'Unknown';

  // Determine transaction type and direction
  const isTokenTransfer = formattedTransfer.category === 'erc20';
  const direction = formattedTransfer.direction === 'IN' ? 'received' : 'sent';

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
            <ZulipText style={[TandaPayTypography.sectionTitle, { color: themeData.color }]}>
              Transaction Details
            </ZulipText>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <ZulipText style={[styles.closeButtonText, { color: TandaPayColors.primary }]}>✕</ZulipText>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Transaction Summary */}
            <View style={styles.section}>
              <ZulipText style={[styles.sectionTitle, { color: themeData.color }]}>Summary</ZulipText>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Type:</ZulipText>
                <ZulipText style={[styles.value, { color: themeData.color }]}>
                  {isTokenTransfer ? 'Token Transfer' : 'ETH Transfer'}
                </ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Direction:</ZulipText>
                <ZulipText
                  style={[
                    styles.value,
                    {
                      color: direction === 'received'
                        ? TandaPayColors.success
                        : TandaPayColors.primary
                    }
                  ]}
                >
                  {direction === 'sent' ? 'Sent' : 'Received'}
                </ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Status:</ZulipText>
                <ZulipText style={styles.statusSuccess}>
                  ✅ Success
                </ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Amount:</ZulipText>
                <ZulipText style={[styles.value, { color: themeData.color }]}>
                  {formattedTransfer.formattedValue}
                </ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Date:</ZulipText>
                <ZulipText style={[styles.value, { color: themeData.color }]}>{fullDate}</ZulipText>
              </View>
            </View>

            <View style={styles.section}>
              <ZulipText style={[styles.sectionTitle, { color: themeData.color }]}>Addresses</ZulipText>

              <View style={styles.copyableRow}>
                <View style={{ flex: 1 }}>
                  <ZulipText style={[styles.label, { color: themeData.color }]}>From:</ZulipText>
                  <ZulipText style={[styles.addressValue, { color: themeData.color }]}>
                    {formatAddress(formattedTransfer.from)}
                  </ZulipText>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(formattedTransfer.from, 'From address')}
                >
                  <ZulipText style={[styles.copyButtonText, { color: TandaPayColors.primary }]}>Copy</ZulipText>
                </TouchableOpacity>
              </View>

              <View style={styles.copyableRow}>
                <View style={{ flex: 1 }}>
                  <ZulipText style={[styles.label, { color: themeData.color }]}>To:</ZulipText>
                  <ZulipText style={[styles.addressValue, { color: themeData.color }]}>
                    {formatAddress(formattedTransfer.to)}
                  </ZulipText>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(formattedTransfer.to, 'To address')}
                >
                  <ZulipText style={[styles.copyButtonText, { color: TandaPayColors.primary }]}>Copy</ZulipText>
                </TouchableOpacity>
              </View>

              {isTokenTransfer && formattedTransfer.contractAddress != null && (
                <View style={styles.copyableRow}>
                  <View style={{ flex: 1 }}>
                    <ZulipText style={[styles.label, { color: themeData.color }]}>Token Contract:</ZulipText>
                    <ZulipText style={[styles.addressValue, { color: themeData.color }]}>
                      {formatAddress(formattedTransfer.contractAddress)}
                    </ZulipText>
                  </View>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(formattedTransfer.contractAddress || '', 'Token contract')}
                  >
                    <ZulipText style={[styles.copyButtonText, { color: TandaPayColors.primary }]}>Copy</ZulipText>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <ZulipText style={[styles.sectionTitle, { color: themeData.color }]}>Transaction Info</ZulipText>

              <View style={styles.copyableRow}>
                <View style={{ flex: 1 }}>
                  <ZulipText style={[styles.label, { color: themeData.color }]}>Hash:</ZulipText>
                  <ZulipText style={[styles.hashValue, { color: TandaPayColors.primary }]}>
                    {formatAddress(formattedTransfer.hash)}
                  </ZulipText>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(formattedTransfer.hash, 'Transaction hash')}
                >
                  <ZulipText style={[styles.copyButtonText, { color: TandaPayColors.primary }]}>Copy</ZulipText>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Block:</ZulipText>
                <ZulipText style={[styles.value, { color: themeData.color }]}>{blockNumber}</ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Category:</ZulipText>
                <ZulipText style={[styles.value, { color: themeData.color }]}>
                  {formattedTransfer.category}
                </ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Asset:</ZulipText>
                <ZulipText style={[styles.value, { color: themeData.color }]}>
                  {formattedTransfer.asset}
                </ZulipText>
              </View>
            </View>

            <View style={styles.section}>
              <ZulipText style={[styles.sectionTitle, { color: themeData.color }]}>Note</ZulipText>
              <ZulipText style={[styles.value, { color: themeData.color, fontStyle: 'italic' }]}>
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
              onPress={() => onViewInExplorer(formattedTransfer.hash)}
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
