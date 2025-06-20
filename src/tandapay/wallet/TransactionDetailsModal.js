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
import type { EtherscanTransaction } from './EtherscanService';
import type { TransactionDetails } from './TransactionService';
import { getTransactionDetails } from './TransactionService';

type Props = {|
  visible: boolean,
  transaction: ?EtherscanTransaction,
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

function formatAddress(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export default function TransactionDetailsModal({
  visible,
  transaction,
  walletAddress,
  onClose,
  onViewInExplorer,
}: Props): Node {
  const themeData = useContext(ThemeContext);

  if (!visible || !transaction) {
    return null;
  }

  const details: TransactionDetails = getTransactionDetails(transaction, walletAddress);

  // Format gas information
  const gasUsed = transaction.gasUsed ? parseInt(transaction.gasUsed, 10).toLocaleString() : 'Unknown';
  const gasPrice = transaction.gasPrice ? `${(parseInt(transaction.gasPrice, 10) / 1e9).toFixed(2)} gwei` : 'Unknown';
  const txFee = transaction.gasUsed && transaction.gasPrice
    ? `${((parseInt(transaction.gasUsed, 10) * parseInt(transaction.gasPrice, 10)) / 1e18).toFixed(6)} ETH`
    : 'Unknown';

  // Format block information
  const blockNumber = transaction.blockNumber ? parseInt(transaction.blockNumber, 10).toLocaleString() : 'Unknown';
  const confirmations = transaction.confirmations ? parseInt(transaction.confirmations, 10).toLocaleString() : 'Unknown';

  // Format date and time
  const fullDate = transaction.timeStamp
    ? new Date(parseInt(transaction.timeStamp, 10) * 1000).toLocaleString()
    : 'Unknown';

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
                  {details.isERC20Transfer ? 'Token Transfer' : 'ETH Transfer'}
                </ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Direction:</ZulipText>
                <ZulipText
                  style={[
                    styles.value,
                    {
                      color: details.direction === 'received'
                        ? TandaPayColors.success
                        : TandaPayColors.primary
                    }
                  ]}
                >
                  {details.direction === 'sent' ? 'Sent' : 'Received'}
                </ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Status:</ZulipText>
                <ZulipText
                  style={details.status === 'success' ? styles.statusSuccess : styles.statusFailed}
                >
                  {details.status === 'success' ? '✅ Success' : '❌ Failed'}
                </ZulipText>
              </View>

              {details.isERC20Transfer && details.tokenInfo && (
                <View style={styles.row}>
                  <ZulipText style={[styles.label, { color: themeData.color }]}>Amount:</ZulipText>
                  <ZulipText style={[styles.value, { color: themeData.color }]}>{details.tokenInfo.amount}</ZulipText>
                </View>
              )}

              {!details.isERC20Transfer && (
                <View style={styles.row}>
                  <ZulipText style={[styles.label, { color: themeData.color }]}>Amount:</ZulipText>
                  <ZulipText style={[styles.value, { color: themeData.color }]}>{details.ethValue}</ZulipText>
                </View>
              )}

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
                  <ZulipText style={[styles.addressValue, { color: themeData.color }]}>{formatAddress(transaction.from)}</ZulipText>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(transaction.from, 'From address')}
                >
                  <ZulipText style={[styles.copyButtonText, { color: TandaPayColors.primary }]}>Copy</ZulipText>
                </TouchableOpacity>
              </View>

              <View style={styles.copyableRow}>
                <View style={{ flex: 1 }}>
                  <ZulipText style={[styles.label, { color: themeData.color }]}>To:</ZulipText>
                  <ZulipText style={[styles.addressValue, { color: themeData.color }]}>{formatAddress(transaction.to)}</ZulipText>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(transaction.to, 'To address')}
                >
                  <ZulipText style={[styles.copyButtonText, { color: TandaPayColors.primary }]}>Copy</ZulipText>
                </TouchableOpacity>
              </View>

              {details.isERC20Transfer && details.tokenInfo && (
                <View style={styles.copyableRow}>
                  <View style={{ flex: 1 }}>
                    <ZulipText style={[styles.label, { color: themeData.color }]}>Token Contract:</ZulipText>
                    <ZulipText style={[styles.addressValue, { color: themeData.color }]}>{formatAddress(details.tokenInfo.contractAddress)}</ZulipText>
                  </View>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(details.tokenInfo?.contractAddress || '', 'Token contract')}
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
                  <ZulipText style={[styles.hashValue, { color: TandaPayColors.primary }]}>{formatAddress(transaction.hash)}</ZulipText>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(transaction.hash, 'Transaction hash')}
                >
                  <ZulipText style={[styles.copyButtonText, { color: TandaPayColors.primary }]}>Copy</ZulipText>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Block:</ZulipText>
                <ZulipText style={[styles.value, { color: themeData.color }]}>{blockNumber}</ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Confirmations:</ZulipText>
                <ZulipText style={[styles.value, { color: themeData.color }]}>{confirmations}</ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Nonce:</ZulipText>
                <ZulipText style={[styles.value, { color: themeData.color }]}>{transaction.nonce}</ZulipText>
              </View>
            </View>

            <View style={styles.section}>
              <ZulipText style={[styles.sectionTitle, { color: themeData.color }]}>Gas & Fees</ZulipText>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Gas Used:</ZulipText>
                <ZulipText style={[styles.value, { color: themeData.color }]}>{gasUsed}</ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Gas Price:</ZulipText>
                <ZulipText style={[styles.value, { color: themeData.color }]}>{gasPrice}</ZulipText>
              </View>

              <View style={styles.row}>
                <ZulipText style={[styles.label, { color: themeData.color }]}>Transaction Fee:</ZulipText>
                <ZulipText style={[styles.value, { color: themeData.color }]}>{txFee}</ZulipText>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.buttonContainer, { borderTopColor: themeData.dividerColor }]}>
            <ZulipButton
              style={styles.button}
              text="View in Explorer"
              onPress={() => onViewInExplorer(transaction.hash)}
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
