/* @flow strict-local */

import React, { useContext, useState, useEffect } from 'react';
import type { Node } from 'react';
import { View, Modal, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import { ThemeContext } from '../../styles';
import { TandaPayColors, TandaPayTypography } from '../styles';
import Card from '../components/Card';
import ScrollableTextBox from '../components/ScrollableTextBox';
import { formatTimestamp } from './TransactionUtils';
import { fetchTransactionDetails, formatGasInfoForDisplay } from './TransactionDetailsFetcher';
import type { TransactionDetails } from './TransactionDetailsFetcher';
import { getAlchemyApiKey } from './WalletManager';
import type { SupportedNetwork } from '../definitions/types';
import { QUARTER_COLOR } from '../../styles/constants';
import { CloseButton } from '../components';

type Props = {|
  visible: boolean,
  transaction: ?mixed, // EtherscanTransaction format from convertTransferToEtherscanFormat
  walletAddress: string,
  network?: SupportedNetwork,
  onClose: () => void,
  onViewInExplorer: (txHash: string) => void,
|};

const styles = StyleSheet.create({
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: QUARTER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
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
});

export default function TransactionDetailsModal({
  visible,
  transaction,
  walletAddress,
  network = 'sepolia',
  onClose,
  onViewInExplorer,
}: Props): Node {
  const themeData = useContext(ThemeContext);
  const [gasDetails, setGasDetails] = useState<?TransactionDetails>(null);
  const [isLoadingGas, setIsLoadingGas] = useState<boolean>(false);

  // Load gas details when modal opens and transaction changes
  useEffect(() => {
    if (visible && transaction != null) {
      // $FlowFixMe[unclear-type] - Transaction object structure is from converted format
      const etherscanTransaction = (transaction: any);
      if (etherscanTransaction.hash) {
        setIsLoadingGas(true);
        setGasDetails(null);

        // Get API key and fetch transaction details
        getAlchemyApiKey()
          .then((apiKeyResult) => {
            if (!apiKeyResult.success || apiKeyResult.data == null || apiKeyResult.data === '') {
              throw new Error('No API key available');
            }
            const apiKey = apiKeyResult.data;
            return fetchTransactionDetails(etherscanTransaction.hash, apiKey, network);
          })
          .then((details) => {
            setGasDetails(details);
          })
          .catch((error) => {
            // Silently fail - we'll show "Unknown" for gas info
            setGasDetails(null);
          })
          .finally(() => {
            setIsLoadingGas(false);
          });
      }
    }
  }, [visible, transaction, network]);

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
            <ZulipText style={{ ...TandaPayTypography.sectionTitle, marginBottom: 0 }}>
              Transaction Details
            </ZulipText>
            <CloseButton onPress={onClose} style={styles.closeButton} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Transaction Summary */}
            <View style={styles.section}>
              <ZulipText style={styles.sectionTitle}>Summary</ZulipText>

              <View style={styles.row}>
                <ZulipText style={styles.label}>Type:</ZulipText>
                <ZulipText style={styles.value}>
                  {etherscanTransaction.isTandaPayTransaction
                    ? 'TandaPay Action'
                    : (isTokenTransfer ? 'Token Transfer' : 'ETH Transfer')
                  }
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

            {/* TandaPay Action Details */}
            {etherscanTransaction.isTandaPayTransaction && etherscanTransaction.tandaPayDecoded != null && (
              <View style={styles.section}>
                <ZulipText style={styles.sectionTitle}>TandaPay Action</ZulipText>

                <View style={styles.row}>
                  <ZulipText style={styles.label}>Action:</ZulipText>
                  <ZulipText style={[styles.value, { color: TandaPayColors.warning, fontWeight: 'bold' }]}>
                    {etherscanTransaction.tandaPayDecoded.friendlyName}
                  </ZulipText>
                </View>

                <View style={styles.row}>
                  <ZulipText style={styles.label}>Method:</ZulipText>
                  <ZulipText style={[styles.value, { fontFamily: 'monospace', fontSize: 12 }]}>
                    {etherscanTransaction.tandaPayDecoded.methodName}
                  </ZulipText>
                </View>

                <View style={styles.row}>
                  <ZulipText style={styles.label}>Status:</ZulipText>
                  <ZulipText style={etherscanTransaction.tandaPayDecoded.isSuccess ? styles.statusSuccess : styles.statusFailed}>
                    {etherscanTransaction.tandaPayDecoded.isSuccess ? 'Success' : 'Failed'}
                  </ZulipText>
                </View>

                {etherscanTransaction.tandaPayDecoded.parameters != null && etherscanTransaction.tandaPayDecoded.parameters.length > 0 && (
                  <View>
                    <ZulipText style={[styles.label, { marginTop: 8, marginBottom: 8 }]}>Parameters:</ZulipText>
                    {etherscanTransaction.tandaPayDecoded.parameters.map((param) => (
                      <View key={`param-${param.name}-${param.type}`} style={{ marginLeft: 12, marginBottom: 4 }}>
                        <View style={styles.row}>
                          <ZulipText style={[styles.label, { fontSize: 12 }]}>
                            {param.name}
                            {' '}
                            (
                            {param.type}
                            ):
                          </ZulipText>
                          <ZulipText style={[styles.value, { fontFamily: 'monospace', fontSize: 10 }]}>
                            {param.displayValue}
                          </ZulipText>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={styles.section}>
              <ZulipText style={styles.sectionTitle}>Addresses</ZulipText>

              <View>
                <ZulipText style={styles.label}>From:</ZulipText>
                <ScrollableTextBox
                  text={etherscanTransaction.from}
                  label="From address"
                />
              </View>

              <View>
                <ZulipText style={styles.label}>To:</ZulipText>
                <ScrollableTextBox
                  text={etherscanTransaction.to}
                  label="To address"
                />
              </View>

              {isTokenTransfer && etherscanTransaction.contractAddress != null && etherscanTransaction.contractAddress !== '' && (
                <View>
                  <ZulipText style={styles.label}>Token Contract:</ZulipText>
                  <ScrollableTextBox
                    text={etherscanTransaction.contractAddress}
                    label="Token contract"
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
              <ZulipText style={styles.sectionTitle}>Gas & Fees</ZulipText>

              {isLoadingGas ? (
                <View style={[styles.row, { justifyContent: 'center' }]}>
                  <ActivityIndicator size="small" color={TandaPayColors.primary} />
                  <ZulipText style={[styles.value, { marginLeft: 8 }]}>Loading gas information...</ZulipText>
                </View>
              ) : gasDetails != null ? (
                (() => {
                  const gasInfo = formatGasInfoForDisplay(gasDetails);
                  return (
                    <>
                      {gasInfo.transactionFee != null && (
                        <View style={styles.row}>
                          <ZulipText style={styles.label}>Transaction Fee:</ZulipText>
                          <ZulipText style={[styles.value, { fontWeight: 'bold' }]}>{gasInfo.transactionFee}</ZulipText>
                        </View>
                      )}

                      {gasInfo.gasUsed != null && (
                        <View style={styles.row}>
                          <ZulipText style={styles.label}>Gas Used:</ZulipText>
                          <ZulipText style={styles.value}>{gasInfo.gasUsed}</ZulipText>
                        </View>
                      )}

                      {gasInfo.effectiveGasPrice != null && (
                        <View style={styles.row}>
                          <ZulipText style={styles.label}>Effective Gas Price:</ZulipText>
                          <ZulipText style={styles.value}>{gasInfo.effectiveGasPrice}</ZulipText>
                        </View>
                      )}

                      {gasDetails.confirmations != null && (
                        <View style={styles.row}>
                          <ZulipText style={styles.label}>Confirmations:</ZulipText>
                          <ZulipText style={styles.value}>{gasDetails.confirmations.toLocaleString()}</ZulipText>
                        </View>
                      )}
                    </>
                  );
                })()
              ) : (
                <ZulipText style={[styles.value, { fontStyle: 'italic' }]}>
                  Gas and fee information could not be loaded.
                  Use a blockchain explorer for detailed gas information.
                </ZulipText>
              )}
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
