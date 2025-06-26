/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { TandaRibbon } from '../components';
import { BRAND_COLOR, HALF_COLOR } from '../../styles/constants';
import TandaPayColors from '../styles/colors';
import { ThemeContext } from '../../styles/theme';

import type { ThemeData } from '../../styles/theme';

import type { MemberInfo } from '../contract/types';
import {
  formatBigNumber,
  getMemberStatusDisplayName,
  getAssignmentStatusDisplayName,
  groupMembersBySubgroup
} from './utils';

type Props = $ReadOnly<{|
  membersData: ?Array<MemberInfo>,
  loading: boolean,
  error: ?string,
  onRefresh: () => void,
|}>;

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: HALF_COLOR,
    marginTop: 8,
    textAlign: 'center',
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
  infoValueSmall: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusTextBase: {
    fontWeight: 'bold',
  },
  memberHeader: {
    padding: 12,
    marginBottom: 8,
    // backgroundColor will be handled dynamically
  },
  memberHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberDetails: {
    padding: 12,
  },
  memberSeparator: {
    height: 1,
    backgroundColor: TandaPayColors.disabled,
    marginVertical: 8,
  },
  ribbonContent: {
    padding: 0,
    // backgroundColor will be handled dynamically
  },
});

// Render member details for a ribbon
function renderMemberForRibbon(member: MemberInfo, themeData: ThemeData, isLast: boolean = false): Node {
  return (
    <View key={formatBigNumber(member.id)}>
      <View style={[styles.memberHeader, { backgroundColor: themeData.cardColor }]}>
        <ZulipText style={styles.memberHeaderText}>
          Member #
          {formatBigNumber(member.id)}
        </ZulipText>
      </View>

      <View style={styles.memberDetails}>
        <View style={styles.infoRow}>
          <ZulipText style={styles.infoLabel}>Address:</ZulipText>
          <ZulipText style={styles.infoValueSmall}>
            {member.walletAddress.slice(0, 6)}
            ...
            {member.walletAddress.slice(-4)}
          </ZulipText>
        </View>

        <View style={styles.infoRow}>
          <ZulipText style={styles.infoLabel}>Status:</ZulipText>
          <ZulipText style={styles.infoValue}>
            {getMemberStatusDisplayName(member.memberStatus || 0)}
          </ZulipText>
        </View>

        <View style={styles.infoRow}>
          <ZulipText style={styles.infoLabel}>Assignment:</ZulipText>
          <ZulipText style={styles.infoValue}>
            {getAssignmentStatusDisplayName(member.assignmentStatus || 0)}
          </ZulipText>
        </View>

        <View style={styles.infoRow}>
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

        <View style={styles.infoRow}>
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
      </View>

      {!isLast && <View style={styles.memberSeparator} />}
    </View>
  );
}

export default function MembersModalContent(props: Props): Node {
  const { membersData, loading, error, onRefresh } = props;
  const themeData = useContext(ThemeContext);

  // Render members grouped by subgroup using TandaRibbon
  function renderMembersGroupedBySubgroup(): Node {
    if (!membersData || membersData.length === 0) {
      return (
        <View style={styles.infoRow}>
          <ZulipText style={styles.infoValue}>No members found.</ZulipText>
        </View>
      );
    }

    const groupedMembers = groupMembersBySubgroup(membersData);
    const sortedSubgroupIds = Array.from(groupedMembers.keys()).sort((a, b) => a - b);

    return (
      <>
        {sortedSubgroupIds.map(subgroupId => {
          const members = groupedMembers.get(subgroupId) || [];
          const subgroupLabel = subgroupId === 0
            ? `Unassigned Members (${members.length})`
            : `Subgroup #${subgroupId} (${members.length} members)`;

          return (
            <TandaRibbon
              key={subgroupId}
              label={subgroupLabel}
              backgroundColor={subgroupId === 0 ? HALF_COLOR : BRAND_COLOR}
              initiallyCollapsed
              marginTop={0}
              marginBottom={0}
              contentBackgroundColor={themeData.cardColor}
            >
              {members.map((member, index) =>
                renderMemberForRibbon(member, themeData, index === members.length - 1)
              )}
            </TandaRibbon>
          );
        })}
      </>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      {error != null && error.trim() !== '' && (
        <View style={styles.errorContainer}>
          <ZulipText style={styles.errorText}>{error}</ZulipText>
        </View>
      )}

      {renderMembersGroupedBySubgroup()}
    </ScrollView>
  );
}
