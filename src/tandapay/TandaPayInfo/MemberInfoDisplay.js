/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { HALF_COLOR } from '../../styles/constants';
import TandaPayColors from '../styles/colors';

import type { MemberInfo } from '../contract/types';
import {
  formatBigNumber,
  getMemberStatusDisplayName,
  getAssignmentStatusDisplayName,
} from './utils';

type Props = $ReadOnly<{|
  member: MemberInfo,
  showMemberId?: boolean,
  showAddress?: boolean,
  showAssignmentStatus?: boolean,
  showSubgroupId?: boolean,
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

export default function MemberInfoDisplay(props: Props): Node {
  const {
    member,
    showMemberId = false,
    showAddress = false,
    showAssignmentStatus = false,
    showSubgroupId = false,
    subgroupId,
    compact = false,
  } = props;

  const rowStyle = compact ? styles.infoRowCompact : styles.infoRow;

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
        <View style={rowStyle}>
          <ZulipText style={styles.infoLabel}>Address:</ZulipText>
          <ZulipText style={styles.infoValueSmall}>
            {member.walletAddress.slice(0, 6)}
            ...
            {member.walletAddress.slice(-4)}
          </ZulipText>
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
    </>
  );
}
