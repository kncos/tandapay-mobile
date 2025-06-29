/* @flow strict-local */

import { useState, useCallback } from 'react';
import { MemberStatus, AssignmentStatus } from '../../types';
import MemberDataManager from '../../data-managers/MemberDataManager';
import SubgroupDataManager from '../../data-managers/SubgroupDataManager';
import { autoReorg } from './autoReorgAlgorithm';
import { postprocessAutoReorgResults } from './autoReorgPostprocessor';

import type { MemberInfo, SubgroupInfo } from '../../types';
import type { AutoReorgParameters } from './autoReorgAlgorithm';
import type { PostprocessorResult } from './autoReorgPostprocessor';

/**
 * Auto-reorg result types
 */
export type AutoReorgResult = {|
  +success: boolean,
  +data?: Map<number, Array<string>>,
  +reassignments?: PostprocessorResult,
  +subgroupData?: $ReadOnlyArray<SubgroupInfo>,
  +error?: string,
|};

/**
 * Hook state for auto-reorg functionality
 */
export type UseAutoReorgState = {|
  +loading: boolean,
  +result: ?AutoReorgResult,
  +error: ?string,
|};

/**
 * Preprocess member and subgroup data for auto-reorg algorithm
 * Converts React Native app data structures to the format expected by autoReorgAlgorithm
 */
function preprocessDataForAutoReorg(
  memberData: $ReadOnlyArray<MemberInfo>,
  subgroupData: $ReadOnlyArray<SubgroupInfo>
): AutoReorgParameters {
  // Create a mapping of subgroup ID to member addresses
  const subgroups = new Map<number, Array<string>>();

  // Initialize all subgroups (including empty ones)
  for (const subgroup of subgroupData) {
    // Convert BigNumber to number for subgroup ID
    // $FlowFixMe[incompatible-use] - BigNumber has toString method
    const subgroupId = parseInt(subgroup.id.toString(), 10);
    subgroups.set(subgroupId, [...subgroup.members]);
  }

  // Members that need to be assigned to new subgroups
  const needsAssigned: Array<string> = [];

  // Process each member to determine if they need reassignment
  for (const member of memberData) {
    const walletAddress = member.walletAddress;
    const memberStatus = member.memberStatus;
    const assignmentStatus = member.assignmentStatus;

    // Determine if member needs reassignment based on their status
    const needsReassignment =
      memberStatus === MemberStatus.PaidInvalid
      || assignmentStatus === AssignmentStatus.AddedBySecretary
      || assignmentStatus === AssignmentStatus.CancelledByMember
      || assignmentStatus === AssignmentStatus.CancelledByGroupMember;

    if (needsReassignment) {
      needsAssigned.push(walletAddress);
    }
  }

  return {
    subgroups,
    needsAssigned,
  };
}

/**
 * Hook for running auto-reorg algorithm
 * Fetches member and subgroup data, preprocesses it, and runs the auto-reorg algorithm
 */
export function useAutoReorg(): {|
  +state: UseAutoReorgState,
  +runAutoReorg: () => Promise<AutoReorgResult>,
  +refresh: () => void,
  +reset: () => void,
|} {
  const [state, setState] = useState<UseAutoReorgState>({
    loading: false,
    result: null,
    error: null,
  });

  const reset = useCallback(() => {
    setState({
      loading: false,
      result: null,
      error: null,
    });
  }, []);

  const refresh = useCallback(() => {
    // Invalidate all the data sources used by auto-reorg
    MemberDataManager.invalidate();
    SubgroupDataManager.invalidate();
    // Reset hook state to force fresh fetch on next run
    reset();
  }, [reset]);

  const runAutoReorg = useCallback(async (): Promise<AutoReorgResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch member and subgroup data
      const [memberData, subgroupData] = await Promise.all([
        MemberDataManager.get({ forceRefresh: true }),
        SubgroupDataManager.get({ forceRefresh: true }),
      ]);

      // Validate member data
      if (memberData == null || !Array.isArray(memberData)) {
        throw new Error('Failed to fetch member data');
      }

      // Validate subgroup data
      if (subgroupData == null || !Array.isArray(subgroupData)) {
        throw new Error('Failed to fetch subgroup data');
      }

      // $FlowFixMe[unclear-type] - Data is validated as array above
      const typedMemberData: $ReadOnlyArray<MemberInfo> = (memberData: any);
      // $FlowFixMe[unclear-type] - Data is validated as array above
      const typedSubgroupData: $ReadOnlyArray<SubgroupInfo> = (subgroupData: any);

      // Preprocess data for auto-reorg algorithm
      const autoReorgParams = preprocessDataForAutoReorg(typedMemberData, typedSubgroupData);

      // Run the actual auto-reorg algorithm
      const newSubgroups = autoReorg(autoReorgParams);

      // Postprocess results to determine what transactions are needed
      const reassignments = postprocessAutoReorgResults(
        typedMemberData,
        typedSubgroupData,
        newSubgroups
      );

      // // Pretty print the reassignments
      // const transactionCount = reassignments.transactions.length;
      // // eslint-disable-next-line no-console
      // console.log(`🔄 Auto-Reorg Complete: ${transactionCount} reassignments needed`);
      // if (transactionCount > 0) {
      //   // eslint-disable-next-line no-console
      //   console.log('📋 Required Reassignments:');
      //   for (const transaction of reassignments.transactions) {
      //     // eslint-disable-next-line no-console
      //     console.log(`  ${transaction.memberWalletAddress.slice(0, 8)}... -> subgroup ${transaction.subgroupId}`);
      //   }
      // } else {
      //   // eslint-disable-next-line no-console
      //   console.log('✅ No reassignments needed - all members are optimally assigned');
      // }

      const result: AutoReorgResult = {
        success: true,
        data: newSubgroups,
        reassignments,
        subgroupData: typedSubgroupData,
      };

      setState({
        loading: false,
        result,
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = error?.message || 'Failed to run auto-reorg';
      const errorResult: AutoReorgResult = {
        success: false,
        error: errorMessage,
      };

      setState({
        loading: false,
        result: errorResult,
        error: errorMessage,
      });

      return errorResult;
    }
  }, []);

  return {
    state,
    runAutoReorg,
    refresh,
    reset,
  };
}

export default useAutoReorg;
