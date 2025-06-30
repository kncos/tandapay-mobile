/* @flow strict-local */

import { useState, useCallback } from 'react';
import CommunityInfoManager from '../../data-managers/CommunityInfoManager';
import { ExpectedSuccessorCounts } from '../../constants';
import { getAllWriteTransactions } from '../../tandapay-writer/writeTransactionObjects';

import type { WriteTransaction } from '../../tandapay-writer/writeTransactionObjects';

/**
 * Result types for the Define Successor List macro
 */
export type DefineSuccessorListResult = {|
  +success: boolean,
  +successorCount?: number,
  +communitySize?: number,
  +transactions?: $ReadOnlyArray<WriteTransaction>,
  +error?: string,
|};

/**
 * Hook state
 */
export type UseDefineSuccessorListState = {|
  +loading: boolean,
  +result: ?DefineSuccessorListResult,
  +error: ?string,
|};

/**
 * Core hook for Define Successor List macro business logic
 *
 * This macro analyzes the current community size and determines how many
 * secretary successors should be defined based on the community constants.
 */
export function useDefineSuccessorList(): {|
  +state: UseDefineSuccessorListState,
  +runDefineSuccessorList: () => Promise<DefineSuccessorListResult>,
  +getTransactions: () => Promise<WriteTransaction[]>,
  +refresh: () => void,
  +reset: () => void,
|} {
  const [state, setState] = useState<UseDefineSuccessorListState>({
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
    // Invalidate community info data to force fresh fetch
    CommunityInfoManager.invalidate();
    reset();
  }, [reset]);

  const runDefineSuccessorList = useCallback(async (): Promise<DefineSuccessorListResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch community data with force refresh to get latest member count
      const communityData = await CommunityInfoManager.get({ forceRefresh: true });

      if (communityData == null) {
        throw new Error('Failed to fetch community data');
      }

      // Extract member count - it comes as a BigNumber from the contract
      if (communityData.currentMemberCount == null) {
        throw new Error('Member count not available in community data');
      }

      // Convert BigNumber to regular number
      // $FlowFixMe[incompatible-use] - BigNumber conversion
      const memberCount = parseInt(communityData.currentMemberCount.toString(), 10);

      if (Number.isNaN(memberCount) || memberCount < 0) {
        throw new Error('Invalid member count received from contract');
      }

      // Determine required successor count based on community size
      const successorCount = ExpectedSuccessorCounts.getExpectedSuccessorCount(memberCount);

      // Generate guidance transactions for defining successors
      const transactions: WriteTransaction[] = [];

      if (successorCount > 0) {
        // Get the assignSuccessor transaction template for guidance
        const assignSuccessorTransaction = getAllWriteTransactions().find(
          tx => tx.functionName === 'assignSuccessor' || tx.functionName === 'defineSuccessor'
        );

        if (assignSuccessorTransaction) {
          // Create guidance transactions showing that successors need to be defined
          for (let i = 0; i < successorCount; i++) {
            transactions.push({
              ...assignSuccessorTransaction,
              displayName: `Define Successor ${i + 1} (Manual Action Required)`,
              description: `This community of ${memberCount} members requires ${successorCount} successor${successorCount === 1 ? '' : 's'} to be defined. Please assign successor addresses manually.`,
            });
          }
        }
      }

      const result: DefineSuccessorListResult = {
        success: true,
        successorCount,
        communitySize: memberCount,
        transactions,
      };

      setState({
        loading: false,
        result,
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = error?.message || 'Failed to analyze successor requirements';
      const errorResult: DefineSuccessorListResult = {
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
    const result = await runDefineSuccessorList();
    return result.transactions ? [...result.transactions] : [];
  }, [runDefineSuccessorList]);

  return {
    state,
    runDefineSuccessorList,
    getTransactions,
    refresh,
    reset,
  };
}
