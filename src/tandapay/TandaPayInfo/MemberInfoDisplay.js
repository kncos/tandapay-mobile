/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

// $FlowIgnore[untyped-import] -- ethers does not have flow types
import { ethers } from 'ethers';
import ZulipText from '../../common/ZulipText';
import { HALF_COLOR } from '../../styles/constants';
import TandaPayColors from '../styles/colors';
import ScrollableTextBox from '../components/ScrollableTextBox';

import type { MemberInfo } from '../contract/types';
import {
  formatBigNumber,
  getMemberStatusDisplayName,
  getAssignmentStatusDisplayName,
} from './utils';
import { getTandaPaySelectedNetwork } from '../redux/selectors';
import { useSelector } from '../../react-redux';
import { findTokenByAddress, formatTokenAmount } from '../definitions';
import { getAvailableTokens } from '../tokens/tokenSelectors';

type Props = $ReadOnly<{|
  member: MemberInfo,
  paymentTokenAddress?: string | null,
  showMemberId?: boolean,
  showAddress?: boolean,
  showAssignmentStatus?: boolean,
  showSubgroupId?: boolean,
  showRole?: boolean,
  secretaryAddress?: ?string,
  subgroupId?: ?number,
  compact?: boolean,
|}>;

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoRowCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    color: HALF_COLOR,
  },
  infoValue: {
    fontWeight: 'bold',
  },
  infoValueSmall: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusTextBase: {
    fontWeight: 'bold',
  },
});

function MemberInfoEscrowAndRefunds(props: $ReadOnly<{|
  member: MemberInfo,
  paymentTokenAddress?: string | null,
|}>) {
  const { member, paymentTokenAddress } = props;

  const selectedNetwork = useSelector(state => getTandaPaySelectedNetwork(state));
  const availableTokens = useSelector(state => getAvailableTokens(state));

  // Find the payment token information using the unified utility
  const paymentTokenInfo = (() => {
    if (ethers.utils.isAddress(paymentTokenAddress)) {
      return findTokenByAddress(selectedNetwork, paymentTokenAddress, availableTokens);
    }
    return null;
  })();

  const formattedAmounts = (() => {
    if (paymentTokenInfo) {
      const communityEscrowAmount = formatTokenAmount(
        paymentTokenInfo,
        formatBigNumber(member.communityEscrowAmount) || 'N/A'
      );
      const savingsEscrowAmount = formatTokenAmount(
        paymentTokenInfo,
        formatBigNumber(member.savingsEscrowAmount) || 'N/A'
      );
      const pendingRefundAmount = formatTokenAmount(
        paymentTokenInfo,
        formatBigNumber(member.pendingRefundAmount) || 'N/A'
      );
      const availableToWithdrawAmount = formatTokenAmount(
        paymentTokenInfo,
        formatBigNumber(member.availableToWithdrawAmount) || 'N/A'
      );
      return {
        formattedCommunityEscrowAmount: communityEscrowAmount.formattedDisplay,
        formattedSavingsEscrowAmount: savingsEscrowAmount.formattedDisplay,
        formattedPendingRefundAmount: pendingRefundAmount.formattedDisplay,
        formattedAvailableToWithdrawAmount: availableToWithdrawAmount.formattedDisplay,
      };
    } else {
      return null;
    }
  })();

  const placeholderValue = 'N/A';

  return (
    <>
      <View style={styles.infoRow}>
        <ZulipText style={styles.infoLabel}>Community: </ZulipText>
        <ZulipText style={styles.infoValue}>
          {formattedAmounts ? formattedAmounts.formattedCommunityEscrowAmount : placeholderValue}
        </ZulipText>
      </View>
      <View style={styles.infoRow}>
        <ZulipText style={styles.infoLabel}>Savings: </ZulipText>
        <ZulipText style={styles.infoValue}>
          {formattedAmounts ? formattedAmounts.formattedSavingsEscrowAmount : placeholderValue}
        </ZulipText>
      </View>
      <View style={styles.infoRow}>
        <ZulipText style={styles.infoLabel}>Pending Refunds: </ZulipText>
        <ZulipText style={styles.infoValue}>
          {formattedAmounts ? formattedAmounts.formattedPendingRefundAmount : placeholderValue}
        </ZulipText>
      </View>
      <View style={styles.infoRow}>
        <ZulipText style={styles.infoLabel}>Available To Withdraw: </ZulipText>
        <ZulipText style={styles.infoValue}>
          {formattedAmounts ? formattedAmounts.formattedAvailableToWithdrawAmount : placeholderValue}
        </ZulipText>
      </View>
    </>
  );
}

export default function MemberInfoDisplay(props: Props): Node {
  const {
    member,
    paymentTokenAddress = null,
    showMemberId = false,
    showAddress = false,
    showAssignmentStatus = false,
    showSubgroupId = false,
    showRole = false,
    secretaryAddress,
    subgroupId,
    compact = false,
  } = props;

  const rowStyle = compact ? styles.infoRowCompact : styles.infoRow;

  // Determine member's role
  const getMemberRole = () => {
    if (secretaryAddress != null && secretaryAddress.trim() !== ''
        && member.walletAddress != null && member.walletAddress.trim() !== '') {
      if (member.walletAddress.toLowerCase() === secretaryAddress.toLowerCase()) {
        return 'Secretary';
      }
    }
    return 'Member';
  };

  return (
    <>
      {showMemberId && (
        <View style={rowStyle}>
          <ZulipText style={styles.infoLabel}>Member ID:</ZulipText>
          <ZulipText style={styles.infoValue}>
            #
            {formatBigNumber(member.id)}
          </ZulipText>
        </View>
      )}

      {showAddress && (
        <>
          <View style={rowStyle}>
            <ZulipText style={styles.infoLabel}>Address:</ZulipText>
          </View>
          <View style={rowStyle}>
            <ScrollableTextBox
              text={member.walletAddress}
              label="Member Address"
              size="small"
            />
          </View>
        </>
      )}

      {showRole && (
        <View style={rowStyle}>
          <ZulipText style={styles.infoLabel}>Role:</ZulipText>
          <ZulipText style={styles.infoValue}>{getMemberRole()}</ZulipText>
        </View>
      )}

      <View style={rowStyle}>
        <ZulipText style={styles.infoLabel}>Status:</ZulipText>
        <ZulipText style={styles.infoValue}>
          {getMemberStatusDisplayName(member.memberStatus || 0)}
        </ZulipText>
      </View>

      {showAssignmentStatus && (
        <View style={rowStyle}>
          <ZulipText style={styles.infoLabel}>Assignment:</ZulipText>
          <ZulipText style={styles.infoValue}>
            {getAssignmentStatusDisplayName(member.assignmentStatus || 0)}
          </ZulipText>
        </View>
      )}

      {showSubgroupId && (
        <View style={rowStyle}>
          <ZulipText style={styles.infoLabel}>Subgroup:</ZulipText>
          <ZulipText style={styles.infoValue}>
            {subgroupId != null && subgroupId > 0
              ? `#${subgroupId}`
              : 'Not in a Subgroup'}
          </ZulipText>
        </View>
      )}

      <View style={rowStyle}>
        <ZulipText style={styles.infoLabel}>Premium Paid:</ZulipText>
        <ZulipText
          style={[
            styles.statusTextBase,
            { color: member.isPremiumPaidThisPeriod ? TandaPayColors.success : TandaPayColors.error },
          ]}
        >
          {member.isPremiumPaidThisPeriod ? 'Yes' : 'No'}
        </ZulipText>
      </View>

      <View style={rowStyle}>
        <ZulipText style={styles.infoLabel}>Coverage Eligible:</ZulipText>
        <ZulipText
          style={[
            styles.statusTextBase,
            { color: member.isEligibleForCoverageThisPeriod ? TandaPayColors.success : TandaPayColors.error },
          ]}
        >
          {member.isEligibleForCoverageThisPeriod ? 'Yes' : 'No'}
        </ZulipText>
      </View>

      <MemberInfoEscrowAndRefunds
        member={member}
        paymentTokenAddress={paymentTokenAddress}
      />
    </>
  );
}
