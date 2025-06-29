/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { Card } from '../components';
import { IconShield } from '../../common/Icons';
import { BRAND_COLOR, HALF_COLOR } from '../../styles/constants';
import TandaPayColors from '../styles/colors';

import type { CommunityInfo } from '../contract/types/index';
import { formatBigNumber, formatTimeDuration } from './utils';

type PeriodTiming = $ReadOnly<{|
  isInvalid: boolean,
  isActive: boolean,
  statusText: string,
  timeElapsedText?: ?string,
  timeRemainingText?: ?string,
  timeElapsed?: number,
  timeRemaining?: number,
  progress: number,
|}>;

type Props = $ReadOnly<{|
  communityInfo: CommunityInfo,
  periodTiming: PeriodTiming,
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
  progressBarContainer: {
    height: 8,
    backgroundColor: TandaPayColors.disabled,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: HALF_COLOR,
    textAlign: 'center',
  },
});

export default function PeriodInfoCard(props: Props): Node {
  const { communityInfo, periodTiming } = props;

  return (
    <Card>
      <View style={styles.cardHeader}>
        <IconShield size={24} color={BRAND_COLOR} />
        <ZulipText style={styles.cardTitle}>
          Current Period #
          {formatBigNumber(communityInfo.currentPeriodId) || '0'}
        </ZulipText>
      </View>

      <View style={styles.infoRow}>
        <ZulipText style={styles.infoLabel}>Status:</ZulipText>
        <ZulipText
          style={[
            styles.statusTextBase,
            { color: periodTiming.isActive ? TandaPayColors.success : HALF_COLOR },
          ]}
        >
          {periodTiming.statusText || (periodTiming.isActive ? 'Active' : 'Inactive')}
        </ZulipText>
      </View>

      <View style={styles.infoRow}>
        <ZulipText style={styles.infoLabel}>Time Elapsed:</ZulipText>
        <ZulipText style={styles.infoValue}>
          {periodTiming.isInvalid
            ? (periodTiming.timeElapsedText != null && periodTiming.timeElapsedText.trim() !== '') ? periodTiming.timeElapsedText : 'N/A'
            : formatTimeDuration(periodTiming.timeElapsed || 0)}
        </ZulipText>
      </View>

      <View style={styles.infoRow}>
        <ZulipText style={styles.infoLabel}>Time Remaining:</ZulipText>
        <ZulipText style={styles.infoValue}>
          {periodTiming.isInvalid
            ? (periodTiming.timeRemainingText != null && periodTiming.timeRemainingText.trim() !== '') ? periodTiming.timeRemainingText : 'N/A'
            : formatTimeDuration(periodTiming.timeRemaining || 0)}
        </ZulipText>
      </View>

      {/* Progress bar - only show if period is valid */}
      {!periodTiming.isInvalid && (
        <>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${((periodTiming.progress || 0) * 100).toFixed(1)}%`,
                  backgroundColor: BRAND_COLOR,
                },
              ]}
            />
          </View>

          <ZulipText style={styles.progressText}>
            {((periodTiming.progress || 0) * 100).toFixed(1)}
            % Complete
          </ZulipText>
        </>
      )}
    </Card>
  );
}
