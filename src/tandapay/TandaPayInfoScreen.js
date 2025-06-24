// @flow strict-local

import React, { useEffect, useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, RefreshControl, ScrollView, Alert } from 'react-native';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import ZulipText from '../common/ZulipText';
import ZulipButton from '../common/ZulipButton';
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

export default function TandaPayInfoScreen(props: Props): Node {
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ZulipText style={{ fontSize: 16, color: HALF_COLOR }}>
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <IconAlertTriangle size={48} color="#f44336" />
          <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16, textAlign: 'center' }}>
            Unable to Load Community Info
          </ZulipText>
          <ZulipText style={{ fontSize: 14, color: HALF_COLOR, marginTop: 8, textAlign: 'center' }}>
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
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Community Status Card */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <IconTandaPayInfo size={24} color={BRAND_COLOR} />
            <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
              Community Status
            </ZulipText>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <ZulipText style={{ color: HALF_COLOR }}>State:</ZulipText>
            <ZulipText style={{ fontWeight: 'bold' }}>
              {getCommunityStateDisplayName(communityInfo?.communityState || 0)}
            </ZulipText>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <ZulipText style={{ color: HALF_COLOR }}>Network:</ZulipText>
            <ZulipText style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
              {selectedNetwork}
            </ZulipText>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ZulipText style={{ color: HALF_COLOR }}>Contract:</ZulipText>
            <ZulipText style={{ fontWeight: 'bold', fontSize: 12 }}>
              {(contractAddress != null && contractAddress.trim() !== '')
                ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`
                : 'Not configured'
              }
            </ZulipText>
          </View>
        </Card>

        {/* Period Information Card */}
        {communityInfo && (
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <IconShield size={24} color={BRAND_COLOR} />
              <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
                Current Period #
                {formatBigNumber(communityInfo.currentPeriodId) || '0'}
              </ZulipText>
            </View>

            {periodTiming && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <ZulipText style={{ color: HALF_COLOR }}>Status:</ZulipText>
                  <ZulipText style={{
                    fontWeight: 'bold',
                    color: periodTiming.isActive ? '#4CAF50' : HALF_COLOR
                  }}
                  >
                    {periodTiming.statusText || (periodTiming.isActive ? 'Active' : 'Inactive')}
                  </ZulipText>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <ZulipText style={{ color: HALF_COLOR }}>Time Elapsed:</ZulipText>
                  <ZulipText style={{ fontWeight: 'bold' }}>
                    {periodTiming.isInvalid
                      ? (periodTiming.timeElapsedText || 'N/A')
                      : formatTimeDuration(periodTiming.timeElapsed || 0)
                    }
                  </ZulipText>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <ZulipText style={{ color: HALF_COLOR }}>Time Remaining:</ZulipText>
                  <ZulipText style={{ fontWeight: 'bold' }}>
                    {periodTiming.isInvalid
                      ? (periodTiming.timeRemainingText || 'N/A')
                      : formatTimeDuration(periodTiming.timeRemaining || 0)
                    }
                  </ZulipText>
                </View>

                {/* Progress bar - only show if period is valid */}
                {!periodTiming.isInvalid && (
                  <>
                    <View style={{
                      height: 8,
                      backgroundColor: '#f0f0f0',
                      borderRadius: 4,
                      marginBottom: 8
                    }}
                    >
                      <View style={{
                        height: '100%',
                        width: `${((periodTiming.progress || 0) * 100).toFixed(1)}%`,
                        backgroundColor: BRAND_COLOR,
                        borderRadius: 4
                      }}
                      />
                    </View>

                    <ZulipText style={{ fontSize: 12, color: HALF_COLOR, textAlign: 'center' }}>
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
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <IconServer size={24} color={BRAND_COLOR} />
              <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
                Community Stats
              </ZulipText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <ZulipText style={{ color: HALF_COLOR }}>Base Premium:</ZulipText>
              <ZulipText style={{ fontWeight: 'bold' }}>
                {formatTokenAmount(formatBigNumber(communityInfo.basePremium) || '0')}
                {' '}
                ETH
              </ZulipText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <ZulipText style={{ color: HALF_COLOR }}>Total Coverage:</ZulipText>
              <ZulipText style={{ fontWeight: 'bold' }}>
                {formatTokenAmount(formatBigNumber(communityInfo.totalCoverageAmount) || '0')}
                {' '}
                ETH
              </ZulipText>
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}
            >
              <ZulipText style={{ color: HALF_COLOR }}>Members:</ZulipText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ZulipText style={{ fontWeight: 'bold', marginRight: 8 }}>
                  {formatBigNumber(communityInfo.currentMemberCount) || '0'}
                </ZulipText>
                <ZulipButton
                  style={TandaPayStyles.button}
                  text="View"
                  onPress={() => Alert.alert('Coming Soon', 'Member list will be available in a future update.')}
                  secondary
                />
              </View>
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            >
              <ZulipText style={{ color: HALF_COLOR }}>Subgroups:</ZulipText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ZulipText style={{ fontWeight: 'bold', marginRight: 8 }}>
                  {formatBigNumber(communityInfo.currentSubgroupCount) || '0'}
                </ZulipText>
                <ZulipButton
                  style={TandaPayStyles.button}
                  text="View"
                  onPress={() => Alert.alert('Coming Soon', 'Subgroup list will be available in a future update.')}
                  secondary
                />
              </View>
            </View>
          </Card>
        )}

        {/* User Status Card (if user is a member) */}
        {communityInfo?.userMemberInfo && (
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <IconPerson size={24} color={BRAND_COLOR} />
              <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
                Your Status
              </ZulipText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <ZulipText style={{ color: HALF_COLOR }}>Member ID:</ZulipText>
              <ZulipText style={{ fontWeight: 'bold' }}>
                #
                {formatBigNumber(communityInfo.userMemberInfo.id) || 'Unknown'}
              </ZulipText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <ZulipText style={{ color: HALF_COLOR }}>Status:</ZulipText>
              <ZulipText style={{ fontWeight: 'bold' }}>
                {getMemberStatusDisplayName(communityInfo.userMemberInfo?.memberStatus ?? 0)}
              </ZulipText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <ZulipText style={{ color: HALF_COLOR }}>Subgroup:</ZulipText>
              <ZulipText style={{ fontWeight: 'bold' }}>
                {communityInfo.userSubgroupInfo
                  ? `#${formatBigNumber(communityInfo.userSubgroupInfo.id) || 'Unknown'}`
                  : 'Not assigned'
                }
              </ZulipText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <ZulipText style={{ color: HALF_COLOR }}>Premium Paid:</ZulipText>
              <ZulipText style={{
                fontWeight: 'bold',
                color: communityInfo.userMemberInfo?.isPremiumPaidThisPeriod
                  ? '#4CAF50' : '#f44336'
              }}
              >
                {communityInfo.userMemberInfo?.isPremiumPaidThisPeriod ? 'Yes' : 'No'}
              </ZulipText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ZulipText style={{ color: HALF_COLOR }}>Coverage Eligible:</ZulipText>
              <ZulipText style={{
                fontWeight: 'bold',
                color: communityInfo.userMemberInfo?.isEligibleForCoverageThisPeriod
                  ? '#4CAF50' : '#f44336'
              }}
              >
                {communityInfo.userMemberInfo?.isEligibleForCoverageThisPeriod ? 'Yes' : 'No'}
              </ZulipText>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
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
          <ZulipText style={{
            fontSize: 12,
            color: HALF_COLOR,
            textAlign: 'center',
            marginTop: 16
          }}
          >
            Last updated:
            {' '}
            {new Date(communityInfo.lastUpdated).toLocaleString()}
          </ZulipText>
        )}
      </ScrollView>
    </Screen>
  );
}
