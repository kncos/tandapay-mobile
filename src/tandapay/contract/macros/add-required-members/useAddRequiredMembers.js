/* @flow strict-local */

import { useState, useCallback } from 'react';
import CommunityInfoManager from '../../data-managers/CommunityInfoManager';
import { bigNumberToNumber } from '../../../TandaPayInfo/utils';
import { InitializationStateConstants, CommunityStates } from '../../constants';
import { getAllWriteTransactions } from '../../tandapay-writer/writeTransactionObjects';

import type { WriteTransaction } from '../../tandapay-writer/writeTransactionObjects';

const MINIMUM_MEMBERS = InitializationStateConstants.minCommunitySizeToExit;

/**
 * Add required members result types
 */
export type AddRequiredMembersResult = {|
  +success: boolean,
  +membersNeeded?: number,
  +transactions?: $ReadOnlyArray<WriteTransaction>,
  +error?: string,
|};

/**
 * Hook state for add required members functionality
 */
export type UseAddRequiredMembersState = {|
  +loading: boolean,
  +result: ?AddRequiredMembersResult,
  +error: ?string,
|};

/**
 * Hook for determining how many members need to be added and generating appropriate UI guidance
 * Fetches community data and calculates members needed to reach minimum
 */
export function useAddRequiredMembers(): {|
  +state: UseAddRequiredMembersState,
  +runAddRequiredMembers: () => Promise<AddRequiredMembersResult>,
  +getTransactions: () => Promise<WriteTransaction[]>,
  +refresh: () => void,
  +reset: () => void,
|} {
  const [state, setState] = useState<UseAddRequiredMembersState>({
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
    // Invalidate all the data sources used by add required members
    CommunityInfoManager.invalidate();
    // Reset hook state to force fresh fetch on next run
    reset();
  }, [reset]);

  const runAddRequiredMembers = useCallback(async (): Promise<AddRequiredMembersResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch community data
      const communityData = await CommunityInfoManager.get({ forceRefresh: true });

      // Validate community data
      if (communityData == null) {
        throw new Error('Failed to fetch community data');
      }

      // $FlowFixMe[unclear-type] - Data from contract
      const typedCommunityData: mixed = communityData;

      // Get current member count and state
      // $FlowFixMe[unclear-type] - mixed data from contract
      const currentMemberCount = bigNumberToNumber(((typedCommunityData: any).currentMemberCount: mixed)) || 0;
      // $FlowFixMe[unclear-type] - mixed data from contract
      const isInInitializationState = ((typedCommunityData: any).currentState: string) === CommunityStates.initialization;

      // Check if we're in the right state to add members
      if (!isInInitializationState) {
        const result: AddRequiredMembersResult = {
          success: true,
          membersNeeded: 0,
          transactions: [], // No transactions needed
        };

        setState({
          loading: false,
          result,
          error: null,
        });

        return result;
      }

      // Calculate how many members are needed
      const membersNeeded = Math.max(0, MINIMUM_MEMBERS - currentMemberCount);

      // Generate guidance transactions (these are informational, not executable)
      const transactions: WriteTransaction[] = [];

      if (membersNeeded > 0) {
        // Get the addMemberToCommunity transaction template for guidance
        const addMemberTransaction = getAllWriteTransactions().find(
          tx => tx.functionName === 'addMemberToCommunity'
        );

        if (addMemberTransaction) {
          // Create guidance transactions showing that members need to be added
          for (let i = 0; i < membersNeeded; i++) {
            transactions.push({
              ...addMemberTransaction,
              displayName: `Add Member ${i + 1} (Manual Action Required)`,
              description: `This community needs ${membersNeeded} more member${membersNeeded === 1 ? '' : 's'} to reach the minimum of ${MINIMUM_MEMBERS}. Please add members manually through the TandaPay interface.`,
            });
          }
        }
      }

      const result: AddRequiredMembersResult = {
        success: true,
        membersNeeded,
        transactions,
      };

      setState({
        loading: false,
        result,
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = error?.message || 'Failed to determine required members';
      const errorResult: AddRequiredMembersResult = {
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
    const result = await runAddRequiredMembers();
    return result.transactions ? [...result.transactions] : [];
  }, [runAddRequiredMembers]);

  return {
    state,
    runAddRequiredMembers,
    getTransactions,
    refresh,
    reset,
  };
}

export default useAddRequiredMembers;
