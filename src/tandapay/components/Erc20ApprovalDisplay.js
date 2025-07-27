/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import Card from './Card';
import ErrorText from './ErrorText';
import { TandaPayColors, TandaPayTypography } from '../styles';
import type { Erc20ApprovalState } from '../contract/erc20ApprovalUtils';

type Props = $ReadOnly<{|
  approvalState: Erc20ApprovalState,
  formattedAmount: ?string,
  onEstimateSpending: () => Promise<void>,
  onApproveSpending: () => Promise<void>,
  isFormValid?: boolean,
  disabled?: boolean,
  estimateButtonText?: string,
  approveButtonText?: string,
|}>;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    ...TandaPayTypography.sectionTitle,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
  },
  amount: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    marginTop: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  approvedContainer: {
    backgroundColor: `${TandaPayColors.success}20`,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  approvedText: {
    color: TandaPayColors.success,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default function Erc20ApprovalDisplay(props: Props): Node {
  const {
    approvalState,
    formattedAmount,
    onEstimateSpending,
    onApproveSpending,
    isFormValid = true,
    disabled = false,
    estimateButtonText = 'Calculate ERC20 Amount',
    approveButtonText = 'Approve ERC20 Spending',
  } = props;

  if (!approvalState.isRequired) {
    return null;
  }

  return (
    <Card style={styles.container}>
      <ZulipText style={styles.title}>
        ERC20 Token Approval
      </ZulipText>

      {/* Estimated Amount Display */}
      {formattedAmount != null && (
        <View style={styles.row}>
          <ZulipText style={styles.label}>Required Amount:</ZulipText>
          <ZulipText style={styles.amount}>
            {formattedAmount}
            {' '}
            tokens
          </ZulipText>
        </View>
      )}

      {/* Status Display */}
      {approvalState.isApproved && (
        <View style={styles.approvedContainer}>
          <ZulipText style={styles.approvedText}>
            ✓ ERC20 spending approved
          </ZulipText>
        </View>
      )}

      {/* Error Display */}
      {approvalState.error != null && (
        <ErrorText>{approvalState.error}</ErrorText>
      )}

      {/* Estimate Button */}
      {approvalState.estimatedAmount == null && !approvalState.isApproved && (
        <ZulipButton
          disabled={!isFormValid || approvalState.isEstimating || disabled}
          progress={approvalState.isEstimating}
          text={estimateButtonText}
          onPress={onEstimateSpending}
          style={styles.button}
        />
      )}

      {/* Loading indicator for estimation */}
      {approvalState.isEstimating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
          <ZulipText style={styles.loadingText}>
            Calculating required amount...
          </ZulipText>
        </View>
      )}

      {/* Approve Button */}
      {approvalState.estimatedAmount != null && !approvalState.isApproved && (
        <ZulipButton
          disabled={approvalState.isApproving || disabled}
          progress={approvalState.isApproving}
          text={approveButtonText}
          onPress={onApproveSpending}
          style={{
            ...styles.button,
            backgroundColor: approvalState.isApproving ? TandaPayColors.disabled : TandaPayColors.warning,
          }}
        />
      )}

      {/* Loading indicator for approval */}
      {approvalState.isApproving && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
          <ZulipText style={styles.loadingText}>
            Approving ERC20 spending...
          </ZulipText>
        </View>
      )}
    </Card>
  );
}
