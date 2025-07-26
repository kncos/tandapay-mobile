/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipTextButton from '../../common/ZulipTextButton';
import { Card } from '../components';
import { IconShield } from '../../common/Icons';
import { BRAND_COLOR, HALF_COLOR } from '../../styles/constants';
import TandaPayColors from '../styles/colors';

import type { CommunityInfo } from '../contract/types/index';
import { formatBigNumber, formatTimeDuration, bigNumberToNumber } from './utils';

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
  claimsCount?: number,
  onShowClaims?: () => void,
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
});

export default function PeriodInfoCard(props: Props): Node {
  const { communityInfo, claimsCount = 0, onShowClaims } = props;

  // Generate period timing internally
  const getPeriodTiming = useCallback((): PeriodTiming => {
    const currentPeriodId = bigNumberToNumber(communityInfo.currentPeriodId);

    // Check if period is invalid (ID 0)
    if (currentPeriodId === 0) {
      return {
        isInvalid: true,
        isActive: false,
        statusText: 'Period Not Started',
        timeElapsedText: 'Period Not Started',
        timeRemainingText: 'Period Not Started',
        progress: 0,
      };
    }

    const now = Math.floor(Date.now() / 1000);

    // Safely access currentPeriodInfo properties from mixed type
    const currentPeriodInfo = communityInfo.currentPeriodInfo;
    if (currentPeriodInfo == null || typeof currentPeriodInfo !== 'object') {
      return {
        isInvalid: true,
        isActive: false,
        statusText: 'No period information available',
        progress: 0,
      };
    }

    // $FlowFixMe[prop-missing] - currentPeriodInfo is mixed, accessing properties safely
    const startTimestamp = currentPeriodInfo.startTimestamp;
    // $FlowFixMe[prop-missing] - currentPeriodInfo is mixed, accessing properties safely
    const endTimestamp = currentPeriodInfo.endTimestamp;

    // Convert BigNumbers to numbers
    const startTime = bigNumberToNumber(startTimestamp);
    const endTime = bigNumberToNumber(endTimestamp);

    // Check for invalid timestamps (0 or end before start)
    if (startTime === 0 || endTime === 0 || endTime <= startTime) {
      return {
        isInvalid: true,
        isActive: false,
        statusText: 'Inactive',
        timeElapsedText: 'Period not configured',
        timeRemainingText: 'Period not configured',
        progress: 0,
      };
    }

    const periodDuration = endTime - startTime;
    const timeElapsed = now - startTime;
    const timeRemaining = endTime - now;
    const isActive = now >= startTime && now <= endTime;
    const isPastEnd = now > endTime;

    // If period ID > 0 and we're past the end timestamp, show "Advance Period"
    if (isPastEnd && currentPeriodId > 0) {
      return {
        isInvalid: false,
        timeElapsed,
        timeRemaining: 0,
        progress: 1,
        isActive: false,
        statusText: 'Advance Period',
      };
    }

    return {
      isInvalid: false,
      timeElapsed: Math.max(0, timeElapsed),
      timeRemaining: Math.max(0, timeRemaining),
      progress: Math.min(1, Math.max(0, timeElapsed / periodDuration)),
      isActive,
      statusText: isActive ? 'Active' : now < startTime ? 'Not started' : 'Ended',
    };
  }, [communityInfo]);

  const periodTiming = getPeriodTiming();

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

      {/* Claims count row */}
      <View style={styles.countRow}>
        <View style={styles.countContainer}>
          <ZulipText style={styles.infoLabel}>Number of Claims:</ZulipText>
          <ZulipText style={styles.countValue}>
            {claimsCount}
          </ZulipText>
        </View>
        {claimsCount > 0 && onShowClaims ? (
          <ZulipTextButton
            label="View"
            onPress={onShowClaims}
          />
        ) : (
          <ZulipText style={[styles.infoLabel, { color: HALF_COLOR }]}>
            View
          </ZulipText>
        )}
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
