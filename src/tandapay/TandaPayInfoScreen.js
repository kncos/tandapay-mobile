// @flow strict-local

import React, { useEffect, useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, RefreshControl, ScrollView, Alert, StyleSheet } from 'react-native';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import ZulipText from '../common/ZulipText';
import ZulipButton from '../common/ZulipButton';
import ZulipTextButton from '../common/ZulipTextButton';
import { Card } from './components';
import {
  IconServer,
  IconTandaPayInfo,
  IconAlertTriangle,
  IconPerson,
  IconShield
} from '../common/Icons';
import { useSelector } from '../react-redux';
import { getCurrentTandaPayContractAddress, getTandaPaySelectedNetwork } from './redux/selectors';
import { fetchCommunityInfo } from './contract/communityInfo';
import { TandaPayState, MemberStatus } from './contract/types';
import { BRAND_COLOR, HALF_COLOR } from '../styles/constants';

import type { CommunityInfo } from './contract/communityInfo';
import TandaPayStyles from './styles';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-info'>,
  route: RouteProp<'tandapay-info', void>,
|}>;

// Helper function to convert BigNumber to number safely
function bigNumberToNumber(value: mixed): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return parseInt(value, 10);
  }
  if (value != null && typeof value === 'object') {
    try {
      // Try different methods that BigNumber might have
      // $FlowFixMe[unclear-type] - BigNumber type is mixed, need to check methods
      if (typeof (value: any).toNumber === 'function') {
        // $FlowFixMe[unclear-type] - BigNumber has toNumber method
        return (value: any).toNumber();
      }
      // $FlowFixMe[unclear-type] - BigNumber type is mixed, need to check methods
      if (typeof (value: any).toString === 'function') {
        // $FlowFixMe[unclear-type] - BigNumber has toString method
        return parseInt((value: any).toString(), 10);
      }
    } catch (error) {
      return 0;
    }
  }
  return 0;
}

// Helper function to format BigNumber values
function formatBigNumber(value: mixed): string {
  if (typeof value === 'string')
{ return value; }
  if (typeof value === 'number')
{ return value.toString(); }
  if (value != null && typeof value === 'object' && typeof value.toString === 'function') {
    return value.toString();
  }
  return '0';
}

// Helper function to format time duration
function formatTimeDuration(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const remainingSeconds = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// Helper function to get community state display name
function getCommunityStateDisplayName(state: number): string {
  switch (state) {
    case TandaPayState.Initialization:
      return 'Initialization';
    case TandaPayState.Default:
      return 'Default';
    case TandaPayState.Fractured:
      return 'Fractured';
    case TandaPayState.Collapsed:
      return 'Collapsed';
    default:
      return 'Unknown';
  }
}

// Helper function to get member status display name
function getMemberStatusDisplayName(status: number): string {
  switch (status) {
    case MemberStatus.None:
      return 'Not a Member';
    case MemberStatus.Added:
      return 'Added by Secretary';
    case MemberStatus.New:
      return 'New Member';
    case MemberStatus.Valid:
      return 'Valid (Covered)';
    case MemberStatus.PaidInvalid:
      return 'Paid but Invalid';
    case MemberStatus.UnpaidInvalid:
      return 'Unpaid and Invalid';
    case MemberStatus.Reorged:
      return 'Reorganized';
    case MemberStatus.UserLeft:
      return 'Left Community';
    case MemberStatus.Defected:
      return 'Defected';
    case MemberStatus.UserQuit:
      return 'Quit';
    default:
      return 'Unknown Status';
  }
}

// Helper function to format token amounts
function formatTokenAmount(amount: string | number, decimals: number = 18): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === 0)
{ return '0'; }
  if (num < 0.0001)
{ return '<0.0001'; }
  if (num >= 1000000)
{ return `${(num / 1000000).toFixed(2)}M`; }
  if (num >= 1000)
{ return `${(num / 1000).toFixed(2)}K`; }
  return num.toFixed(4).replace(/\.?0+$/, '');
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: HALF_COLOR,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: HALF_COLOR,
    marginTop: 8,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: HALF_COLOR,
    textAlign: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: HALF_COLOR,
    textAlign: 'center',
    marginTop: 16,
  },
  // Dynamic style bases
  statusTextBase: {
    fontWeight: 'bold',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});

function TandaPayInfoScreen(props: Props): Node {
  const { navigation } = props;

  // State management
  const [communityInfo, setCommunityInfo] = useState<?CommunityInfo>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<?string>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Redux selectors
  const contractAddress = useSelector((state) => getCurrentTandaPayContractAddress(state));

  const selectedNetwork = useSelector((state) => getTandaPaySelectedNetwork(state));

  // Fetch community information
  const fetchCommunityData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      if (contractAddress == null || contractAddress.trim() === '') {
        throw new Error('No TandaPay contract address configured. Please configure a contract address in settings.');
      }

      const result = await fetchCommunityInfo();

      if (result.success) {
        setCommunityInfo(result.data);
      } else {
        throw new Error(
          result.error && typeof result.error.userMessage === 'string' && result.error.userMessage.trim() !== ''
            ? result.error.userMessage
            : 'Failed to fetch community information'
        );
      }
    } catch (err) {
      const errorMessage = (err && err.message) || 'Unknown error occurred';
      setError(errorMessage);
      setCommunityInfo(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [contractAddress]);

  // Initial load
  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    fetchCommunityData(true);
  }, [fetchCommunityData]);

  // Calculate period timing information
  const getPeriodTiming = useCallback(() => {
    if (!communityInfo)
{ return null; }

    const currentPeriodId = bigNumberToNumber(communityInfo.currentPeriodId);

    // Check if period is invalid (ID 0 or invalid timestamps)
    if (currentPeriodId === 0) {
      return {
        isInvalid: true,
        isActive: false,
        statusText: 'Period not started',
        timeElapsedText: 'Period not started',
        timeRemainingText: 'Period not started',
        progress: 0
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const { startTimestamp, endTimestamp } = communityInfo.currentPeriodInfo;

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
        progress: 0
      };
    }

    const periodDuration = endTime - startTime;
    const timeElapsed = now - startTime;
    const timeRemaining = endTime - now;
    const isActive = now >= startTime && now <= endTime;

    return {
      isInvalid: false,
      periodDuration,
      timeElapsed: Math.max(0, timeElapsed),
      timeRemaining: Math.max(0, timeRemaining),
      progress: Math.min(1, Math.max(0, timeElapsed / periodDuration)),
      isActive,
      statusText: isActive ? 'Active' : (now < startTime ? 'Not started' : 'Ended'),
      timeElapsedText: null, // Will use formatTimeDuration
      timeRemainingText: null // Will use formatTimeDuration
    };
  }, [communityInfo]);

  // Render loading state
  if (loading && !communityInfo) {
    return (
      <Screen title="TandaPay Info" canGoBack={navigation.canGoBack()}>
        <View style={styles.loadingContainer}>
          <ZulipText style={styles.loadingText}>
            Loading community information...
          </ZulipText>
        </View>
      </Screen>
    );
  }

  // Render error state
  if (error != null && error.trim() !== '' && !communityInfo) {
    return (
      <Screen title="TandaPay Info" canGoBack={navigation.canGoBack()}>
        <View style={styles.errorContainer}>
          <IconAlertTriangle size={48} color="#f44336" />
          <ZulipText style={styles.errorTitle}>
            Unable to Load Community Info
          </ZulipText>
          <ZulipText style={styles.errorText}>
            {error}
          </ZulipText>
          <View style={TandaPayStyles.buttonRow}>
            <ZulipButton
              style={TandaPayStyles.button}
              secondary
              text="Retry"
              onPress={() => fetchCommunityData()}
            />
          </View>
          <View style={TandaPayStyles.buttonRow}>
            <ZulipButton
              style={TandaPayStyles.button}
              secondary
              text="Go Back"
              onPress={() => navigation.goBack()}
            />
          </View>
        </View>
      </Screen>
    );
  }

  const periodTiming = getPeriodTiming();

  return (
    <Screen title="TandaPay Info" canGoBack={navigation.canGoBack()}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Community Status Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <IconTandaPayInfo size={24} color={BRAND_COLOR} />
            <ZulipText style={styles.cardTitle}>
              Community Status
            </ZulipText>
          </View>

          <View style={styles.infoRow}>
            <ZulipText style={styles.infoLabel}>State:</ZulipText>
            <ZulipText style={styles.infoValue}>
              {getCommunityStateDisplayName(communityInfo?.communityState || 0)}
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
              {(contractAddress != null && contractAddress.trim() !== '')
                ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`
                : 'Not configured'
              }
            </ZulipText>
          </View>
        </Card>

        {/* Period Information Card */}
        {communityInfo && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <IconShield size={24} color={BRAND_COLOR} />
              <ZulipText style={styles.cardTitle}>
                Current Period #
                {formatBigNumber(communityInfo.currentPeriodId) || '0'}
              </ZulipText>
            </View>

            {periodTiming && (
              <>
                <View style={styles.infoRow}>
                  <ZulipText style={styles.infoLabel}>Status:</ZulipText>
                  <ZulipText style={[
                    styles.statusTextBase,
                    { color: periodTiming.isActive ? '#4CAF50' : HALF_COLOR }
                  ]}
                  >
                    {periodTiming.statusText || (periodTiming.isActive ? 'Active' : 'Inactive')}
                  </ZulipText>
                </View>

                <View style={styles.infoRow}>
                  <ZulipText style={styles.infoLabel}>Time Elapsed:</ZulipText>
                  <ZulipText style={styles.infoValue}>
                    {periodTiming.isInvalid
                      ? (periodTiming.timeElapsedText || 'N/A')
                      : formatTimeDuration(periodTiming.timeElapsed || 0)
                    }
                  </ZulipText>
                </View>

                <View style={styles.infoRow}>
                  <ZulipText style={styles.infoLabel}>Time Remaining:</ZulipText>
                  <ZulipText style={styles.infoValue}>
                    {periodTiming.isInvalid
                      ? (periodTiming.timeRemainingText || 'N/A')
                      : formatTimeDuration(periodTiming.timeRemaining || 0)
                    }
                  </ZulipText>
                </View>

                {/* Progress bar - only show if period is valid */}
                {!periodTiming.isInvalid && (
                  <>
                    <View style={styles.progressBarContainer}>
                      <View style={[
                        styles.progressBarFill,
                        {
                          width: `${((periodTiming.progress || 0) * 100).toFixed(1)}%`,
                          backgroundColor: BRAND_COLOR,
                        }
                      ]}
                      />
                    </View>

                    <ZulipText style={styles.progressText}>
                      {((periodTiming.progress || 0) * 100).toFixed(1)}
                      % Complete
                    </ZulipText>
                  </>
                )}
              </>
            )}
          </Card>
        )}

        {/* Community Stats Card */}
        {communityInfo && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <IconServer size={24} color={BRAND_COLOR} />
              <ZulipText style={styles.cardTitle}>
                Community Stats
              </ZulipText>
            </View>

            <View style={styles.infoRow}>
              <ZulipText style={styles.infoLabel}>Base Premium:</ZulipText>
              <ZulipText style={styles.infoValue}>
                {formatTokenAmount(formatBigNumber(communityInfo.basePremium) || '0')}
                {' '}
                ETH
              </ZulipText>
            </View>

            <View style={styles.infoRow}>
              <ZulipText style={styles.infoLabel}>Total Coverage:</ZulipText>
              <ZulipText style={styles.infoValue}>
                {formatTokenAmount(formatBigNumber(communityInfo.totalCoverageAmount) || '0')}
                {' '}
                ETH
              </ZulipText>
            </View>

            <View style={styles.flexRow}>
              <View style={styles.flex1}>
                <ZulipText style={styles.infoLabel}>Members:</ZulipText>
                <ZulipText style={styles.infoValue}>
                  {formatBigNumber(communityInfo.currentMemberCount) || '0'}
                </ZulipText>
              </View>
              <ZulipTextButton
                label="View"
                onPress={() => Alert.alert('Coming Soon', 'Member list will be available in a future update.')}
              />
            </View>

            <View style={styles.flexRow}>
              <View style={styles.flex1}>
                <ZulipText style={styles.infoLabel}>Subgroups:</ZulipText>
                <ZulipText style={styles.infoValue}>
                  {formatBigNumber(communityInfo.currentSubgroupCount) || '0'}
                </ZulipText>
              </View>
              <ZulipTextButton
                label="View"
                onPress={() => Alert.alert('Coming Soon', 'Subgroup list will be available in a future update.')}
              />
            </View>
          </Card>
        )}

        {/* User Status Card (if user is a member) */}
        {communityInfo?.userMemberInfo && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <IconPerson size={24} color={BRAND_COLOR} />
              <ZulipText style={styles.cardTitle}>
                Your Status
              </ZulipText>
            </View>

            <View style={styles.infoRow}>
              <ZulipText style={styles.infoLabel}>Member ID:</ZulipText>
              <ZulipText style={styles.infoValue}>
                #
                {formatBigNumber(communityInfo.userMemberInfo.id) || 'Unknown'}
              </ZulipText>
            </View>

            <View style={styles.infoRow}>
              <ZulipText style={styles.infoLabel}>Status:</ZulipText>
              <ZulipText style={styles.infoValue}>
                {getMemberStatusDisplayName(communityInfo.userMemberInfo?.memberStatus ?? 0)}
              </ZulipText>
            </View>

            <View style={styles.infoRow}>
              <ZulipText style={styles.infoLabel}>Subgroup:</ZulipText>
              <ZulipText style={styles.infoValue}>
                {communityInfo.userSubgroupInfo
                  ? `#${formatBigNumber(communityInfo.userSubgroupInfo.id) || 'Unknown'}`
                  : 'Not assigned'
                }
              </ZulipText>
            </View>

            <View style={styles.infoRow}>
              <ZulipText style={styles.infoLabel}>Premium Paid:</ZulipText>
              <ZulipText style={[
                styles.statusTextBase,
                { color: communityInfo.userMemberInfo?.isPremiumPaidThisPeriod
                  ? '#4CAF50' : '#f44336' }
              ]}
              >
                {communityInfo.userMemberInfo?.isPremiumPaidThisPeriod ? 'Yes' : 'No'}
              </ZulipText>
            </View>

            <View style={styles.infoRow}>
              <ZulipText style={styles.infoLabel}>Coverage Eligible:</ZulipText>
              <ZulipText style={[
                styles.statusTextBase,
                { color: communityInfo.userMemberInfo?.isEligibleForCoverageThisPeriod
                  ? '#4CAF50' : '#f44336' }
              ]}
              >
                {communityInfo.userMemberInfo?.isEligibleForCoverageThisPeriod ? 'Yes' : 'No'}
              </ZulipText>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <ZulipButton
            style={TandaPayStyles.button}
            text="Refresh"
            onPress={handleRefresh}
            secondary
          />
          <ZulipButton
            style={TandaPayStyles.button}
            text="Go Back"
            onPress={() => navigation.goBack()}
          />
        </View>

        {/* Last updated info */}
        {communityInfo && (
          <ZulipText style={styles.lastUpdatedText}>
            Last updated:
            {' '}
            {new Date(communityInfo.lastUpdated).toLocaleString()}
          </ZulipText>
        )}
      </ScrollView>
    </Screen>
  );
}

export default TandaPayInfoScreen;
