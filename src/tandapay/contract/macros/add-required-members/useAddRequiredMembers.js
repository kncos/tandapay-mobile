/* @flow strict-local */

import { useState, useCallback } from 'react';
import CommunityInfoManager from '../../data-managers/CommunityInfoManager';
import { bigNumberToNumber } from '../../../TandaPayInfo/utils';
import { InitializationStateConstants, CommunityStates } from '../../constants';

const MINIMUM_MEMBERS = InitializationStateConstants.minCommunitySizeToExit;

/**
 * Add required members result types
 */
export type AddRequiredMembersResult = {|
  +success: boolean,
  +membersNeeded?: number,
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
 * Hook for determining how many members need to be added
 * Fetches community data and calculates members needed to reach minimum
 */
export function useAddRequiredMembers(): {|
  +state: UseAddRequiredMembersState,
  +runAddRequiredMembers: () => Promise<AddRequiredMembersResult>,
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
          membersNeeded: 0, // 0 transactions needed
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

      const result: AddRequiredMembersResult = {
        success: true,
        membersNeeded,
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

  return {
    state,
    runAddRequiredMembers,
    refresh,
    reset,
  };
}

export default useAddRequiredMembers;
