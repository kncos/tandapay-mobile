/* @flow strict-local */

import React, { useContext, useState, useEffect } from 'react';
import type { Node } from 'react';
import { Modal, View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import { IconCaretDown } from '../../common/Icons';
import { Card, ScrollableTextBox, CloseButton } from '../components';
import { ThemeContext } from '../../styles';
import TandaPayStyles, { TandaPayColors } from '../styles';
import ModalStyles from '../styles/modals';
import type { FullTransaction, GasInfo } from './FullTransaction';

type Props = {|
  visible: boolean,
  transaction: ?FullTransaction,
  onClose: () => void,
  onViewInExplorer: (txHash: string) => void,
|};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  fieldRow: {
    marginBottom: 8,
  },
  horizontalFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 2,
  },
  horizontalFieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
    flex: 1,
  },
  fieldValue: {
    fontSize: 14,
  },
  horizontalFieldValue: {
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
  },
  argumentRow: {
    marginLeft: 16,
    marginBottom: 4,
  },
  netChangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: TandaPayColors.whiteOverlay10,
    borderRadius: 4,
  },
  netChangeAsset: {
    fontSize: 14,
    fontWeight: '500',
  },
  netChangeValue: {
    fontSize: 14,
  },
  scrollContainer: {
    position: 'relative',
    flex: 1,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  scrollArrowIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
});

export default function TransactionDetailsModal({
  visible,
  transaction,
  onClose,
  onViewInExplorer,
}: Props): Node {
  const themeData = useContext(ThemeContext);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [lastContentHeight, setLastContentHeight] = useState(0);
  const [gasInfo, setGasInfo] = useState<?GasInfo>(null);
  const [isLoadingGasInfo, setIsLoadingGasInfo] = useState(false);

  // Reset scroll indicator state when transaction changes or modal opens
  useEffect(() => {
    if (visible && transaction) {
      // Reset to false when new transaction is shown, will be updated by scroll events
      setShowScrollIndicator(false);
      setLastContentHeight(0);
      setContainerHeight(0);
    }
  }, [visible, transaction]);

  // Fetch gas info when transaction changes
  useEffect(() => {
    if (visible && transaction) {
      setIsLoadingGasInfo(true);
      setGasInfo(null);

      transaction.fetchGasInfo()
        .then((gasData) => {
          setGasInfo(gasData);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.warn('Failed to fetch gas info:', error);
          setGasInfo(null);
        })
        .finally(() => {
          setIsLoadingGasInfo(false);
        });
    }
  }, [visible, transaction]);

  if (!visible || !transaction) {
    return null;
  }

  // Handle scroll events to show/hide scroll indicator
  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 5;
    const hasScrollableContent = contentSize.height > layoutMeasurement.height;
    setShowScrollIndicator(hasScrollableContent && !isAtBottom);
  };

  const handleContentSizeChange = (contentWidth, contentHeight) => {
    // Store the latest content height for comparison when container height becomes available
    setLastContentHeight(contentHeight);

    // When content size changes, check if it's larger than the container
    // Add a small delay to ensure container layout has been measured
    setTimeout(() => {
      if (containerHeight > 0 && contentHeight > containerHeight) {
        setShowScrollIndicator(true);
      } else if (containerHeight === 0) {
        // Container height not yet available, use a more conservative estimate
        // Only show indicator if content is definitely large (600px+ suggests scrollable content)
        const conservativeEstimatedHeight = 600; // Higher threshold for initial detection
        if (contentHeight > conservativeEstimatedHeight) {
          setShowScrollIndicator(true);
        }
        // For smaller content, wait for precise container measurement
      }
    }, 150);
  };

  const handleScrollContainerLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setContainerHeight(height);

    // Now that we have the actual container height, re-evaluate if content is scrollable
    if (height > 0 && lastContentHeight > 0) {
      if (lastContentHeight > height) {
        setShowScrollIndicator(true);
      } else {
        // Content fits in container, hide indicator
        setShowScrollIndicator(false);
      }
    }
  };

  // Helper function to convert hex block number to decimal
  const formatBlockNumber = (blockNum) => {
    if (blockNum == null || blockNum === '') {
      return 'N/A';
    }

    // If it's already a number, return it as is
    if (typeof blockNum === 'number') {
      return blockNum.toString();
    }

    // If it's a hex string, convert to decimal
    if (typeof blockNum === 'string' && blockNum.startsWith('0x')) {
      return parseInt(blockNum, 16).toString();
    }

    // Otherwise return as string
    return String(blockNum);
  };

  const renderBasicInfo = () => (
    <View>
      <View style={styles.fieldRow}>
        <ZulipText style={[styles.fieldLabel, { color: themeData.color }]}>
          Transaction Hash
        </ZulipText>
        {transaction.hash != null && transaction.hash !== '' ? (
          <ScrollableTextBox
            label="Transaction Hash"
            text={transaction.hash}
          />
        ) : (
          <ZulipText style={[styles.fieldValue, { color: themeData.color }]}>
            N/A
          </ZulipText>
        )}
      </View>

      <View style={styles.horizontalFieldRow}>
        <ZulipText style={[styles.horizontalFieldLabel, { color: themeData.color }]}>
          Block Number
        </ZulipText>
        <ZulipText style={[styles.horizontalFieldValue, { color: themeData.color }]}>
          {formatBlockNumber(transaction.blockNum)}
        </ZulipText>
      </View>

      <View style={styles.horizontalFieldRow}>
        <ZulipText style={[styles.horizontalFieldLabel, { color: themeData.color }]}>
          Transaction Type
        </ZulipText>
        <ZulipText style={[styles.horizontalFieldValue, { color: themeData.color }]}>
          {transaction.type.toUpperCase()}
        </ZulipText>
      </View>

      <View style={styles.horizontalFieldRow}>
        <ZulipText style={[styles.horizontalFieldLabel, { color: themeData.color }]}>
          Self Transaction
        </ZulipText>
        <ZulipText style={[styles.horizontalFieldValue, { color: themeData.color }]}>
          {transaction.isSelfTransaction ? 'Yes' : 'No'}
        </ZulipText>
      </View>

      {transaction.isSelfTransaction && (
        <>
          <View style={styles.horizontalFieldRow}>
            <ZulipText style={[styles.horizontalFieldLabel, { color: themeData.color }]}>
              Self Transfer Amount
            </ZulipText>
            <ZulipText style={[styles.horizontalFieldValue, { color: themeData.color }]}>
              {transaction.selfTransferAmount != null ? String(transaction.selfTransferAmount) : '0'}
            </ZulipText>
          </View>

          <View style={styles.horizontalFieldRow}>
            <ZulipText style={[styles.horizontalFieldLabel, { color: themeData.color }]}>
              Self Transfer Asset
            </ZulipText>
            <ZulipText style={[styles.horizontalFieldValue, { color: themeData.color }]}>
              {transaction.selfTransferAsset ?? 'N/A'}
            </ZulipText>
          </View>
        </>
      )}

      <View style={styles.horizontalFieldRow}>
        <ZulipText style={[styles.horizontalFieldLabel, { color: themeData.color }]}>
          ERC20 Transferred
        </ZulipText>
        <ZulipText style={[styles.horizontalFieldValue, { color: themeData.color }]}>
          {transaction.isErc20Transferred ? 'Yes' : 'No'}
        </ZulipText>
      </View>
    </View>
  );

  const renderNetValueChanges = () => {
    if (!transaction.netValueChanges || transaction.netValueChanges.size === 0) {
      return (
        <ZulipText style={[styles.fieldValue, { color: themeData.color }]}>
          None (0)
        </ZulipText>
      );
    }

    const changes = [];
    // $FlowIgnore[incompatible-use] - we already checked that this is a Map
    for (const [asset, value] of transaction.netValueChanges.entries()) {
      const displayValue = value > 0 ? `+${value}` : String(value);
      changes.push(
        <View key={asset} style={styles.netChangeRow}>
          <ZulipText style={[styles.netChangeAsset, { color: themeData.color }]}>
            {asset}
          </ZulipText>
          <ZulipText style={[styles.netChangeValue, { color: themeData.color }]}>
            {displayValue}
          </ZulipText>
        </View>
      );
    }

    return <View>{changes}</View>;
  };

  const renderDecodedInput = () => {
    const decoded = transaction.additionalDetails?.decodedInput;
    if (!decoded) {
      return (
        <ZulipText style={[styles.fieldValue, { color: themeData.color }]}>
          None
        </ZulipText>
      );
    }

    return (
      <View>
        <View style={styles.horizontalFieldRow}>
          <ZulipText style={[styles.horizontalFieldLabel, { color: themeData.color }]}>
            Function Name
          </ZulipText>
          <ZulipText style={[styles.horizontalFieldValue, { color: themeData.color }]}>
            {decoded.functionName}
          </ZulipText>
        </View>

        <View style={styles.fieldRow}>
          <ZulipText style={[styles.fieldLabel, { color: themeData.color }]}>
            Function Signature
          </ZulipText>
          <ScrollableTextBox
            label="Function Signature"
            text={decoded.functionSignature}
          />
        </View>

        {decoded.arguments.length > 0 && (
          <View style={styles.fieldRow}>
            <ZulipText style={[styles.fieldLabel, { color: themeData.color }]}>
              Arguments
            </ZulipText>
            {decoded.arguments.map((arg) => (
              <View key={`${arg.name}-${arg.type}`} style={styles.argumentRow}>
                <ZulipText style={[styles.fieldValue, { color: themeData.color }]}>
                  {arg.name}
                  {' '}
                  (
                  {arg.type}
                  )
                  {' '}
                  =
                  {' '}
                  {String(arg.value)}
                </ZulipText>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderGasInfo = () => {
    if (isLoadingGasInfo) {
      return (
        <View style={styles.horizontalFieldRow}>
          <ZulipText style={[styles.horizontalFieldLabel, { color: themeData.color }]}>
            Total Gas Cost
          </ZulipText>
          <ActivityIndicator size="small" color={themeData.color} />
        </View>
      );
    }

    if (!gasInfo) {
      return (
        <ZulipText style={[styles.fieldValue, { color: themeData.color }]}>
          Gas information unavailable
        </ZulipText>
      );
    }

    // Convert hex gas values to decimal for display
    const gasUsedDecimal = gasInfo.gasUsed;
    const gasPriceGwei = gasInfo.gasPricePerUnit;

    return (
      <View>
        <View style={styles.horizontalFieldRow}>
          <ZulipText style={[styles.horizontalFieldLabel, { color: themeData.color }]}>
            Gas Used
          </ZulipText>
          <ZulipText style={[styles.horizontalFieldValue, { color: themeData.color }]}>
            {gasUsedDecimal}
          </ZulipText>
        </View>

        <View style={styles.horizontalFieldRow}>
          <ZulipText style={[styles.horizontalFieldLabel, { color: themeData.color }]}>
            Gas Price
          </ZulipText>
          <ZulipText style={[styles.horizontalFieldValue, { color: themeData.color }]}>
            {gasPriceGwei}
            {' '}
            gwei
          </ZulipText>
        </View>

        <View style={styles.horizontalFieldRow}>
          <ZulipText style={[styles.horizontalFieldLabel, { color: themeData.color }]}>
            Total Gas Cost
          </ZulipText>
          <ZulipText style={[styles.horizontalFieldValue, { color: themeData.color }]}>
            {gasInfo.totalCostDisplay}
            {' '}
            ETH
          </ZulipText>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={ModalStyles.overlay}>
        <Card style={ModalStyles.modalCard}>
          <View style={[ModalStyles.header, { borderBottomColor: themeData.dividerColor }]}>
            <ZulipText style={[ModalStyles.title, { color: themeData.color }]}>
              Transaction Details
            </ZulipText>
            <CloseButton onPress={onClose} />
          </View>

          <View style={styles.scrollContainer} onLayout={handleScrollContainerLayout}>
            <ScrollView
              style={ModalStyles.content}
              showsVerticalScrollIndicator
              contentContainerStyle={{
                paddingBottom: 10,
                minHeight: 200,
                flexGrow: 1
              }}
              onScroll={handleScroll}
              onContentSizeChange={handleContentSizeChange}
              scrollEventThrottle={16}
            >
              {/* Basic Transaction Information */}
              {renderBasicInfo()}

              {/* Net Value Changes */}
              <ZulipText style={[styles.sectionTitle, { color: themeData.color }]}>
                Net Value Changes
              </ZulipText>
              {renderNetValueChanges()}

              {/* Decoded Function Input */}
              <ZulipText style={[styles.sectionTitle, { color: themeData.color }]}>
                Decoded Function Input
              </ZulipText>
              {renderDecodedInput()}

              {/* Gas Information */}
              <ZulipText style={[styles.sectionTitle, { color: themeData.color }]}>
                Gas Information
              </ZulipText>
              {renderGasInfo()}
            </ScrollView>

            {/* Scroll indicator overlay */}
            {showScrollIndicator && (
              <View style={styles.scrollIndicator}>
                <View style={styles.scrollArrowIcon}>
                  <IconCaretDown size={16} color="white" />
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={[TandaPayStyles.buttonRow, ModalStyles.footer, { borderTopColor: themeData.dividerColor, borderTopWidth: 1 }]}>
            <ZulipButton
              style={TandaPayStyles.button}
              secondary
              text="Close"
              onPress={onClose}
            />
            {transaction.hash != null && transaction.hash !== '' && (
              <ZulipButton
                style={TandaPayStyles.button}
                text="View in Explorer"
                onPress={() => onViewInExplorer(transaction.hash || '')}
              />
            )}
          </View>
        </Card>
      </View>
    </Modal>
  );
}
