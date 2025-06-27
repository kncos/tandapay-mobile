/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { Card } from '../components';
import { IconPerson } from '../../common/Icons';
import { BRAND_COLOR, HALF_COLOR } from '../../styles/constants';
import MemberInfoDisplay from './MemberInfoDisplay';

import type { CommunityInfo } from '../contract/communityInfo';
import { bigNumberToNumber } from './utils';

type Props = $ReadOnly<{|
  communityInfo: CommunityInfo,
  userWalletAddress?: ?string,
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
        <MemberInfoDisplay
          member={userMemberInfo}
          showMemberId
          showSubgroupId
          subgroupId={userSubgroupInfo ? bigNumberToNumber(userSubgroupInfo.id) : null}
        />
      ) : (
        <View style={styles.infoRow}>
          <ZulipText style={styles.infoLabel}>Membership:</ZulipText>
          <ZulipText style={styles.infoValue}>Not a Member</ZulipText>
        </View>
      )}
    </Card>
  );
}
