/* @flow strict-local */

import { useState, useCallback } from 'react';
import MemberDataManager from '../../data-managers/MemberDataManager';
import SubgroupDataManager from '../../data-managers/SubgroupDataManager';
import { autoReorg } from './autoReorgAlgorithm';
import { postprocessAutoReorgResults } from './autoReorgPostprocessor';
import { getAllWriteTransactions } from '../../tandapay-writer/writeTransactionObjects';

import type { SubgroupInfo } from '../../types';
import type { PostprocessorResult } from './autoReorgPostprocessor';
import type { WriteTransaction } from '../../tandapay-writer/writeTransactionObjects';
import { preprocessMembersForAutoReorg } from './autoReorgPreprocessor';

/**
 * Auto-reorg result types
 */
export type AutoReorgResult = {|
  +success: boolean,
  +data?: Map<number, Array<string>>,
  +reassignments?: PostprocessorResult,
  +subgroupData?: $ReadOnlyArray<SubgroupInfo>,
  +transactions?: $ReadOnlyArray<WriteTransaction>,
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
 * Hook for running auto-reorg algorithm
 * Fetches member and subgroup data, preprocesses it, and runs the auto-reorg algorithm
 */
export function useAutoReorg(): {|
  +state: UseAutoReorgState,
  +runAutoReorg: () => Promise<AutoReorgResult>,
  +getTransactions: () => Promise<WriteTransaction[]>,
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

      // Preprocess data for auto-reorg algorithm
      // $FlowFixMe[incompatible-call]
      const autoReorgParams = preprocessMembersForAutoReorg(memberData);

      // Run the actual auto-reorg algorithm
      const newSubgroups = autoReorg(autoReorgParams);

      // Postprocess results to determine what transactions are needed
      const reassignments = postprocessAutoReorgResults(
        // $FlowFixMe[incompatible-call]
        memberData,
        // $FlowFixMe[incompatible-call]
        subgroupData,
        newSubgroups,
      );

      // Generate write transaction objects
      const transactions: WriteTransaction[] = [];

      if (reassignments.transactions.length > 0) {
        // Calculate the maximum subgroup ID needed from reassignments
        const maxSubgroupIdNeeded = Math.max(
          ...reassignments.transactions.map(tx => tx.subgroupId),
        );

        // Count current subgroups from the subgroup data
        // $FlowFixMe[incompatible-call]
        const currentSubgroupCount = subgroupData.length;

        // Calculate how many new subgroups we need to create
        const subgroupsToCreate = Math.max(0, maxSubgroupIdNeeded - currentSubgroupCount);

        // Get transaction templates
        const assignMemberTransaction = getAllWriteTransactions().find(
          tx => tx.functionName === 'assignMemberToSubgroup',
        );
        const createSubgroupTransaction = getAllWriteTransactions().find(
          tx => tx.functionName === 'createSubgroup',
        );

        if (!assignMemberTransaction) {
          throw new Error('assignMemberToSubgroup transaction not found');
        }

        if (subgroupsToCreate > 0 && !createSubgroupTransaction) {
          throw new Error('createSubgroup transaction not found');
        }

        // Add create subgroup transactions if needed
        for (let i = 0; i < subgroupsToCreate; i++) {
          // $FlowFixMe - We've already checked that createSubgroupTransaction exists above
          transactions.push({
            ...createSubgroupTransaction,
            displayName: `Create Subgroup ${currentSubgroupCount + i + 1}`,
          });
        }

        // Add assignment transactions
        const assignmentTransactions = reassignments.transactions.map(txData => ({
          ...assignMemberTransaction,
          displayName: `Assign ${txData.memberWalletAddress.slice(0, 8)}... to Subgroup ${
            txData.subgroupId
          }`,
          // $FlowFixMe - Adding prefilledParams to WriteTransaction
          prefilledParams: {
            memberWalletAddress: txData.memberWalletAddress,
            subgroupId: txData.subgroupId.toString(),
            isReorging: txData.isReorging, // Keep as boolean, don't convert to string
          },
        }));

        transactions.push(...assignmentTransactions);
      }

      const result: AutoReorgResult = {
        success: true,
        data: newSubgroups,
        reassignments,
        // $FlowFixMe
        subgroupData,
        transactions,
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

  const getTransactions = useCallback(async (): Promise<WriteTransaction[]> => {
    const result = await runAutoReorg();
    return result.transactions ? [...result.transactions] : [];
  }, [runAutoReorg]);

  return {
    state,
    runAutoReorg,
    getTransactions,
    refresh,
    reset,
  };
}

export default useAutoReorg;
