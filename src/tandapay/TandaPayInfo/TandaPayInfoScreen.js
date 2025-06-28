/* @flow strict-local */

import React, { useEffect, useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, RefreshControl, ScrollView, StyleSheet, Modal, ActivityIndicator } from 'react-native';

import type { AppNavigationProp } from '../../nav/AppNavigator';
import type { RouteProp } from '../../react-navigation';
import Screen from '../../common/Screen';
import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import ModalContainer from '../components/ModalContainer';
import { IconAlertTriangle } from '../../common/Icons';
import { useSelector } from '../../react-redux';
import { getCurrentTandaPayContractAddress, getCommunityInfo, getCommunityInfoLoading, isCommunityInfoStale } from '../redux/selectors';
import { fetchCommunityInfo, invalidateCachedBatchData } from '../contract/communityInfo';
import { fetchBatchMembersData, fetchBatchSubgroupsData, deserializeMembersData, deserializeSubgroupsData } from '../contract/batchDataManager';
import type { SerializedMemberInfo, SerializedSubgroupInfo } from '../contract/batchDataManager';
import { getWalletAddress } from '../wallet/WalletManager';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import { HALF_COLOR, BRAND_COLOR } from '../../styles/constants';
import { serializeBigNumbers, deserializeBigNumbers } from '../utils/bigNumberUtils';

import type { CommunityInfo } from '../contract/communityInfo';
import TandaPayStyles from '../styles';
import {
  CommunityOverviewCard,
  PeriodInfoCard,
  UserStatusCard,
  MembersModalContent,
  SubgroupsModalContent,
  bigNumberToNumber,
} from './index';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-info'>,
  route: RouteProp<'tandapay-info', void>,
|}>;

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
});

function TandaPayInfoScreen(props: Props): Node {
  const { navigation } = props;

  // State management
  const [localCommunityInfo, setLocalCommunityInfo] = useState<?CommunityInfo>(null);
  const [loading, setLoading] = useState(false); // Start with false, will be set by fetch logic
  const [error, setError] = useState<?string>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userWalletAddress, setUserWalletAddress] = useState<?string>(null);
  const [walletAddressLoading, setWalletAddressLoading] = useState(true); // Track wallet address loading

  // Modal state
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [subgroupsModalVisible, setSubgroupsModalVisible] = useState(false);
  const [membersData, setMembersData] = useState<?SerializedMemberInfo>(null);
  const [subgroupsData, setSubgroupsData] = useState<?SerializedSubgroupInfo>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<?string>(null);

  // Redux selectors
  const contractAddress = useSelector(state => getCurrentTandaPayContractAddress(state));
  const reduxCommunityInfo = useSelector(state => getCommunityInfo(state));
  const reduxLoading = useSelector(state => getCommunityInfoLoading(state));
  const isDataStale = useSelector(state => isCommunityInfoStale(state, 5 * 60 * 1000)); // 5 minutes

  // Use Redux state if available, otherwise fall back to local state
  // Deserialize local community info when needed
  const deserializedLocalCommunityInfo = localCommunityInfo
    // $FlowFixMe[incompatible-cast] - deserializeBigNumbers handles the type conversion
    ? (deserializeBigNumbers(localCommunityInfo): CommunityInfo)
    : null;

  // Deserialize modal data when needed
  const deserializedMembersData = deserializeMembersData(membersData);
  const deserializedSubgroupsData = deserializeSubgroupsData(subgroupsData);

  const communityInfo = reduxCommunityInfo || deserializedLocalCommunityInfo;

  // Use Redux loading state if available, otherwise fall back to local loading
  // Also include wallet address loading to ensure we wait for all data
  const isLoading = reduxLoading || loading || walletAddressLoading;

  // Get user's wallet address on component mount
  useEffect(() => {
    const loadWalletAddress = async () => {
      try {
        setWalletAddressLoading(true);
        const addressResult = await getWalletAddress();
        if (addressResult.success && addressResult.data != null && addressResult.data.trim() !== '') {
          setUserWalletAddress(addressResult.data);
        }
      } catch (err) {
        // Create structured error for debugging but don't show to user
        // Wallet address is optional - users can still view community info
        TandaPayErrorHandler.createError(
          'WALLET_ERROR',
          `Failed to load wallet address: ${err?.message || 'Unknown error'}`,
          {
            details: err
          }
        );
        // Don't set any error state since wallet address is optional
      } finally {
        setWalletAddressLoading(false);
      }
    };

    loadWalletAddress();
  }, []);

  // Fetch community information
  const fetchCommunityData = useCallback(
    async (forceRefresh: boolean = false) => {
      // Only fetch if data is stale, missing, or force refresh is requested
      if (!forceRefresh && reduxCommunityInfo && !isDataStale) {
        // Data is fresh, no need to fetch
        setLoading(false);
        return;
      }

      try {
        if (forceRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        if (contractAddress == null || contractAddress.trim() === '') {
          throw new Error(
            'No TandaPay contract address configured. Please configure a contract address in settings.',
          );
        }

        const result = await fetchCommunityInfo(contractAddress, userWalletAddress);

        if (result.success) {
          // Serialize BigNumbers before storing in local React state to prevent JSON serialization errors
          // $FlowFixMe[incompatible-call] - serializeBigNumbers handles the type conversion
          setLocalCommunityInfo(serializeBigNumbers(result.data));
        } else {
          throw new Error(
            result.error
            && typeof result.error.userMessage === 'string'
            && result.error.userMessage.trim() !== ''
              ? result.error.userMessage
              : 'Failed to fetch community information',
          );
        }
      } catch (err) {
        // Create comprehensive error information
        let errorMessage = 'Unknown error occurred';
        let userMessage = 'Failed to fetch community information';

        if (err && err.message) {
          errorMessage = err.message;
          // Use the error message as user message if it's descriptive
          if (err.message.includes('contract address') || err.message.includes('network') || err.message.includes('connection')) {
            userMessage = err.message;
          }
        }

        // Create structured error for better debugging
        TandaPayErrorHandler.createError(
          'CONTRACT_ERROR',
          `Community data fetch failed: ${errorMessage}`,
          {
            userMessage,
            details: {
              contractAddress,
              userWalletAddress,
              forceRefresh,
              error: err
            }
          }
        );

        setError(userMessage);
        setLocalCommunityInfo(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [contractAddress, userWalletAddress, reduxCommunityInfo, isDataStale],
  );

  // Initial load - check if data exists and is fresh
  useEffect(() => {
    // Only proceed if contract address is available and wallet address loading is complete
    if (contractAddress != null && contractAddress.trim() !== '' && !walletAddressLoading) {
      // If we don't have data or data is stale, fetch it
      if (!reduxCommunityInfo || isDataStale) {
        setLoading(true);
        fetchCommunityData();
      } else {
        // We have fresh data, no need to fetch
        setLoading(false);
      }
    }
  }, [contractAddress, reduxCommunityInfo, isDataStale, fetchCommunityData, walletAddressLoading]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    // Invalidate cached batch data to force fresh fetch on next modal open
    invalidateCachedBatchData();
    fetchCommunityData(true);
  }, [fetchCommunityData]);

  // Calculate period timing information
  const getPeriodTiming = useCallback((): ?PeriodTiming => {
    if (!communityInfo) {
      return null;
    }

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

  // Fetch members data for modal - ONLY runs when user clicks View
  const fetchMembersData = useCallback(async () => {
    if (contractAddress == null || contractAddress.trim() === '' || !communityInfo) {
      return;
    }

    setModalError(null);
    setModalLoading(true);

    try {
      const result = await fetchBatchMembersData(contractAddress, userWalletAddress, communityInfo);

      if (result.success) {
        setMembersData(result.data);
        // Only show loading if we actually had to fetch (not from cache)
        if (result.fromCache) {
          setModalLoading(false);
        }
      } else {
        setModalError(result.error);
      }
    } catch (err) {
      setModalError('Unable to load member information. Please try again.');
    } finally {
      setModalLoading(false);
    }
  }, [contractAddress, communityInfo, userWalletAddress]);

  // Fetch subgroups data for modal - ONLY runs when user clicks View
  const fetchSubgroupsData = useCallback(async () => {
    if (contractAddress == null || contractAddress.trim() === '' || !communityInfo || userWalletAddress == null) {
      return;
    }

    setModalError(null);
    setModalLoading(true);

    try {
      const result = await fetchBatchSubgroupsData(contractAddress, userWalletAddress, communityInfo);

      if (result.success) {
        setSubgroupsData(result.data);
        // Only show loading if we actually had to fetch (not from cache)
        if (result.fromCache) {
          setModalLoading(false);
        }
      } else {
        setModalError(result.error);
      }
    } catch (err) {
      setModalError('Unable to load subgroup information. Please try again.');
    } finally {
      setModalLoading(false);
    }
  }, [contractAddress, communityInfo, userWalletAddress]);

  // Handle showing members modal - ONLY triggers when user clicks View
  const handleShowMembers = useCallback(() => {
    setMembersModalVisible(true);
    // Start async fetch without awaiting
    fetchMembersData();
  }, [fetchMembersData]);

  // Handle showing subgroups modal - ONLY triggers when user clicks View
  const handleShowSubgroups = useCallback(() => {
    setSubgroupsModalVisible(true);
    // Start async fetch without awaiting
    fetchSubgroupsData();
  }, [fetchSubgroupsData]);

  // Synchronous wrapper for onRefresh handlers
  const handleRefreshMembers = useCallback(() => {
    fetchMembersData();
  }, [fetchMembersData]);

  const handleRefreshSubgroups = useCallback(() => {
    fetchSubgroupsData();
  }, [fetchSubgroupsData]);

  // Handle closing modals
  const handleCloseModals = useCallback(() => {
    setMembersModalVisible(false);
    setSubgroupsModalVisible(false);
    setMembersData(null);
    setSubgroupsData(null);
    setModalError(null);
  }, []);

  // Render loading state
  if (isLoading && !communityInfo) {
    return (
      <Screen title="TandaPay Info" canGoBack={navigation.canGoBack()}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLOR} style={{ marginBottom: 16 }} />
          <ZulipText style={styles.loadingText}>Loading community information...</ZulipText>
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
          <ZulipText style={styles.errorTitle}>Unable to Load Community Info</ZulipText>
          <ZulipText style={styles.errorText}>{error}</ZulipText>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Community Overview Card */}
        {communityInfo && (
          <View style={styles.card}>
            <CommunityOverviewCard
              communityInfo={communityInfo}
              onShowMembers={handleShowMembers}
              onShowSubgroups={handleShowSubgroups}
            />
          </View>
        )}

        {/* Period Information Card */}
        {communityInfo && periodTiming && (
          <View style={styles.card}>
            <PeriodInfoCard
              communityInfo={communityInfo}
              periodTiming={periodTiming}
            />
          </View>
        )}

        {/* User Status Card */}
        {communityInfo && (
          <View style={styles.card}>
            <UserStatusCard
              communityInfo={communityInfo}
              userWalletAddress={userWalletAddress}
            />
          </View>
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

      {/* Members Modal */}
      <Modal
        visible={membersModalVisible}
        animationType="slide"
        onRequestClose={handleCloseModals}
      >
        <ModalContainer onClose={handleCloseModals} title="Community Members" contentPadding={0}>
          <MembersModalContent
            membersData={deserializedMembersData}
            loading={modalLoading}
            error={modalError}
            secretaryAddress={communityInfo?.secretaryAddress}
            onRefresh={handleRefreshMembers}
          />
        </ModalContainer>
      </Modal>

      {/* Subgroups Modal */}
      <Modal
        visible={subgroupsModalVisible}
        animationType="slide"
        onRequestClose={handleCloseModals}
      >
        <ModalContainer onClose={handleCloseModals} title="Community Subgroups" contentPadding={0}>
          <SubgroupsModalContent
            subgroupsData={deserializedSubgroupsData}
            loading={modalLoading}
            error={modalError}
            onRefresh={handleRefreshSubgroups}
          />
        </ModalContainer>
      </Modal>
    </Screen>
  );
}

export default TandaPayInfoScreen;
