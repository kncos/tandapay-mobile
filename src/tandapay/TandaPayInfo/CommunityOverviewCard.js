/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipTextButton from '../../common/ZulipTextButton';
import { Card } from '../components';
import { IconTandaPayInfo } from '../../common/Icons';
import { useSelector } from '../../react-redux';
import {
  getCurrentTandaPayContractAddress,
  getTandaPaySelectedNetwork,
  getTandaPayDefaultTokens,
  getTandaPayCustomTokens,
} from '../redux/selectors';
import { BRAND_COLOR, HALF_COLOR } from '../../styles/constants';
import { findTokenByAddress, getTokenDisplayText } from '../utils/tokenUtils';
import type { TokenDisplayInfo } from '../utils/tokenUtils';
import ScrollableTextBox from '../components/ScrollableTextBox';

import type { CommunityInfo } from '../contract/communityInfo';
import { formatBigNumber, formatTokenAmount, getCommunityStateDisplayName, bigNumberToNumber } from './utils';

type Props = $ReadOnly<{|
  communityInfo: CommunityInfo,
  onShowMembers: () => void,
  onShowSubgroups: () => void,
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
  infoValueSmall: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoValueCapitalized: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countValue: {
    fontWeight: 'bold',
    marginLeft: 'auto',
    marginRight: 16,
  },
  tokenAddressContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
});

export default function CommunityOverviewCard(props: Props): Node {
  const { communityInfo, onShowMembers, onShowSubgroups } = props;
  const contractAddress = useSelector(state => getCurrentTandaPayContractAddress(state));
  const selectedNetwork = useSelector(state => getTandaPaySelectedNetwork(state));
  const defaultTokens = useSelector(state => getTandaPayDefaultTokens(state));
  const customTokens = useSelector(state => getTandaPayCustomTokens(state));

  const memberCount = bigNumberToNumber(communityInfo.currentMemberCount);
  const subgroupCount = bigNumberToNumber(communityInfo.currentSubgroupCount);

  // Find the payment token information
  const paymentTokenInfo: ?TokenDisplayInfo = findTokenByAddress(
    communityInfo.paymentTokenAddress,
    selectedNetwork,
    defaultTokens,
    customTokens
  );

  const tokenSymbol = getTokenDisplayText(paymentTokenInfo);

  return (
    <Card>
      <View style={styles.cardHeader}>
        <IconTandaPayInfo size={24} color={BRAND_COLOR} />
        <ZulipText style={styles.cardTitle}>Community Overview</ZulipText>
      </View>

      <View style={styles.infoRow}>
        <ZulipText style={styles.infoLabel}>State:</ZulipText>
        <ZulipText style={styles.infoValue}>
          {getCommunityStateDisplayName(communityInfo.communityState || 0)}
        </ZulipText>
      </View>

      <View style={styles.infoRow}>
        <ZulipText style={styles.infoLabel}>Network:</ZulipText>
        <ZulipText style={[styles.infoValue, styles.infoValueCapitalized]}>
          {selectedNetwork}
        </ZulipText>
      </View>

      <View style={styles.infoRow}>
        <ZulipText style={styles.infoLabel}>Contract:</ZulipText>
        <ZulipText style={styles.infoValueSmall}>
          {contractAddress != null && contractAddress.trim() !== ''
            ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`
            : 'Not configured'}
        </ZulipText>
      </View>

      <View style={styles.infoRow}>
        <ZulipText style={styles.infoLabel}>Base Premium:</ZulipText>
        <ZulipText style={styles.infoValue}>
          {formatTokenAmount(formatBigNumber(communityInfo.basePremium) || '0')}
          {' '}
          {tokenSymbol}
        </ZulipText>
      </View>

      <View style={styles.infoRow}>
        <ZulipText style={styles.infoLabel}>Total Coverage:</ZulipText>
        <ZulipText style={styles.infoValue}>
          {formatTokenAmount(formatBigNumber(communityInfo.totalCoverageAmount) || '0')}
          {' '}
          {tokenSymbol}
        </ZulipText>
      </View>

      {/* Show payment token address if it's unknown */}
      {paymentTokenInfo && !paymentTokenInfo.isKnown && (
        <View style={styles.tokenAddressContainer}>
          <ZulipText style={styles.infoLabel}>Payment Token Address:</ZulipText>
          <ScrollableTextBox
            text={paymentTokenInfo.address}
            label="Payment Token"
            size="small"
          />
        </View>
      )}

      <View style={styles.countRow}>
        <View style={styles.countContainer}>
          <ZulipText style={styles.infoLabel}>Members:</ZulipText>
          <ZulipText style={styles.countValue}>
            {formatBigNumber(communityInfo.currentMemberCount) || '0'}
          </ZulipText>
        </View>
        {memberCount > 0 ? (
          <ZulipTextButton
            label="View"
            onPress={onShowMembers}
          />
        ) : (
          <ZulipText style={[styles.infoLabel, { color: HALF_COLOR }]}>
            View
          </ZulipText>
        )}
      </View>

      <View style={styles.countRow}>
        <View style={styles.countContainer}>
          <ZulipText style={styles.infoLabel}>Subgroups:</ZulipText>
          <ZulipText style={styles.countValue}>
            {formatBigNumber(communityInfo.currentSubgroupCount) || '0'}
          </ZulipText>
        </View>
        {subgroupCount > 0 ? (
          <ZulipTextButton
            label="View"
            onPress={onShowSubgroups}
          />
        ) : (
          <ZulipText style={[styles.infoLabel, { color: HALF_COLOR }]}>
            View
          </ZulipText>
        )}
      </View>
    </Card>
  );
}
