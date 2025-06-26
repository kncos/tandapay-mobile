/* @flow strict-local */

import React, { useEffect, useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, RefreshControl, ScrollView, StyleSheet, Modal } from 'react-native';

import type { AppNavigationProp } from '../../nav/AppNavigator';
import type { RouteProp } from '../../react-navigation';
import Screen from '../../common/Screen';
import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import ModalContainer from '../components/ModalContainer';
import { IconAlertTriangle } from '../../common/Icons';
import { useSelector } from '../../react-redux';
import { getCurrentTandaPayContractAddress } from '../redux/selectors';
import { fetchCommunityInfo } from '../contract/communityInfo';
import { batchGetAllMemberInfo, batchGetAllSubgroupInfo } from '../contract/read';
import { HALF_COLOR } from '../../styles/constants';

import type { CommunityInfo } from '../contract/communityInfo';
import type { MemberInfo, SubgroupInfo } from '../contract/types';
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
  const [communityInfo, setCommunityInfo] = useState<?CommunityInfo>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<?string>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [subgroupsModalVisible, setSubgroupsModalVisible] = useState(false);
  const [membersData, setMembersData] = useState<?Array<MemberInfo>>(null);
  const [subgroupsData, setSubgroupsData] = useState<?Array<SubgroupInfo>>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<?string>(null);

  // Redux selectors
  const contractAddress = useSelector(state => getCurrentTandaPayContractAddress(state));

  // Fetch community information
  const fetchCommunityData = useCallback(
    async (forceRefresh: boolean = false) => {
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

        const result = await fetchCommunityInfo();

        if (result.success) {
          setCommunityInfo(result.data);
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
        const errorMessage = (err && err.message) || 'Unknown error occurred';
        setError(errorMessage);
        setCommunityInfo(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [contractAddress],
  );

  // Initial load
  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
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

    setModalLoading(true);
    setModalError(null);

    try {
      const memberCount = bigNumberToNumber(communityInfo.currentMemberCount);

      if (memberCount === 0) {
        setMembersData([]);
        setModalLoading(false);
        return;
      }

      const result = await batchGetAllMemberInfo(contractAddress, memberCount);

      if (result.success) {
        setMembersData(result.data);
      } else {
        throw new Error((result.error.userMessage != null && result.error.userMessage.trim() !== '') ? result.error.userMessage : 'Failed to fetch members');
      }
    } catch (err) {
      const errorMessage = (err && err.message) || 'Failed to fetch members';
      setModalError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  }, [contractAddress, communityInfo]);

  // Fetch subgroups data for modal - ONLY runs when user clicks View
  const fetchSubgroupsData = useCallback(async () => {
    if (contractAddress == null || contractAddress.trim() === '' || !communityInfo) {
      return;
    }

    setModalLoading(true);
    setModalError(null);

    try {
      const subgroupCount = bigNumberToNumber(communityInfo.currentSubgroupCount);

      if (subgroupCount === 0) {
        setSubgroupsData([]);
        setModalLoading(false);
        return;
      }

      const result = await batchGetAllSubgroupInfo(contractAddress, subgroupCount);

      if (result.success) {
        setSubgroupsData(result.data);
      } else {
        throw new Error((result.error.userMessage != null && result.error.userMessage.trim() !== '') ? result.error.userMessage : 'Failed to fetch subgroups');
      }
    } catch (err) {
      const errorMessage = (err && err.message) || 'Failed to fetch subgroups';
      setModalError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  }, [contractAddress, communityInfo]);

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
  if (loading && !communityInfo) {
    return (
      <Screen title="TandaPay Info" canGoBack={navigation.canGoBack()}>
        <View style={styles.loadingContainer}>
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
            <UserStatusCard communityInfo={communityInfo} />
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
            membersData={membersData}
            loading={modalLoading}
            error={modalError}
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
            subgroupsData={subgroupsData}
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
