/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { Card } from '../components';
import { IconPerson } from '../../common/Icons';
import { BRAND_COLOR, HALF_COLOR } from '../../styles/constants';
import TandaPayColors from '../styles/colors';

import type { CommunityInfo } from '../contract/communityInfo';
import { formatBigNumber, getMemberStatusDisplayName, bigNumberToNumber } from './utils';

type Props = $ReadOnly<{|
  communityInfo: CommunityInfo,
|}>;

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: HALF_COLOR,
  },
  infoValue: {
    fontWeight: 'bold',
  },
  statusTextBase: {
    fontWeight: 'bold',
  },
});

export default function UserStatusCard(props: Props): Node {
  const { communityInfo } = props;

  const userMemberInfo = communityInfo.userMemberInfo;
  const userSubgroupInfo = communityInfo.userSubgroupInfo;
  const isValidMember = userMemberInfo != null && bigNumberToNumber(userMemberInfo.id) > 0;

  return (
    <Card>
      <View style={styles.cardHeader}>
        <IconPerson size={24} color={BRAND_COLOR} />
        <ZulipText style={styles.cardTitle}>Your Status</ZulipText>
      </View>

      {isValidMember && userMemberInfo ? (
        <>
          <View style={styles.infoRow}>
            <ZulipText style={styles.infoLabel}>Member ID:</ZulipText>
            <ZulipText style={styles.infoValue}>
              #
              {formatBigNumber(userMemberInfo.id)}
            </ZulipText>
          </View>

          <View style={styles.infoRow}>
            <ZulipText style={styles.infoLabel}>Status:</ZulipText>
            <ZulipText style={styles.infoValue}>
              {getMemberStatusDisplayName(userMemberInfo.memberStatus ?? 0)}
            </ZulipText>
          </View>

          <View style={styles.infoRow}>
            <ZulipText style={styles.infoLabel}>Subgroup:</ZulipText>
            <ZulipText style={styles.infoValue}>
              {userSubgroupInfo != null && bigNumberToNumber(userSubgroupInfo.id) > 0
                ? `#${formatBigNumber(userSubgroupInfo.id)}`
                : 'Not in a Subgroup'}
            </ZulipText>
          </View>

          <View style={styles.infoRow}>
            <ZulipText style={styles.infoLabel}>Premium Paid:</ZulipText>
            <ZulipText
              style={[
                styles.statusTextBase,
                {
                  color: userMemberInfo.isPremiumPaidThisPeriod
                    ? TandaPayColors.success
                    : TandaPayColors.error,
                },
              ]}
            >
              {userMemberInfo.isPremiumPaidThisPeriod ? 'Yes' : 'No'}
            </ZulipText>
          </View>

          <View style={styles.infoRow}>
            <ZulipText style={styles.infoLabel}>Coverage Eligible:</ZulipText>
            <ZulipText
              style={[
                styles.statusTextBase,
                {
                  color: userMemberInfo.isEligibleForCoverageThisPeriod
                    ? TandaPayColors.success
                    : TandaPayColors.error,
                },
              ]}
            >
              {userMemberInfo.isEligibleForCoverageThisPeriod ? 'Yes' : 'No'}
            </ZulipText>
          </View>
        </>
      ) : (
        <View style={styles.infoRow}>
          <ZulipText style={styles.infoLabel}>Membership:</ZulipText>
          <ZulipText style={styles.infoValue}>Not a Member</ZulipText>
        </View>
      )}
    </Card>
  );
}
