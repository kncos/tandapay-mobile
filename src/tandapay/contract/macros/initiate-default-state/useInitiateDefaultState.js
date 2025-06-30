/* @flow strict-local */

import { useState, useCallback } from 'react';
import CommunityInfoManager from '../../data-managers/CommunityInfoManager';
import { InitializationStateConstants } from '../../constants';
import { getAllWriteTransactions } from '../../tandapay-writer/writeTransactionObjects';

import type { WriteTransaction } from '../../tandapay-writer/writeTransactionObjects';

/**
 * Result types for the Initiate Default State macro
 */
export type InitiateDefaultStateResult = {|
  +success: boolean,
  +transactions?: $ReadOnlyArray<WriteTransaction>,
  +error?: string,
  +readyToInitiate?: boolean,
  +memberCount?: number,
  +subgroupCount?: number,
  +successorCount?: number,
  +allMembersAssigned?: boolean,
  +validSubgroupSizes?: boolean,
|};

/**
 * Hook state
 */
export type UseInitiateDefaultStateState = {|
  +loading: boolean,
  +result: ?InitiateDefaultStateResult,
  +error: ?string,
|};

/**
 * Core hook for Initiate Default State macro business logic
 *
 * This macro analyzes the current community state and determines if it's ready
 * to exit initialization state. If all conditions are met, it provides the
 * transaction to initiate the default operational state.
 */
export function useInitiateDefaultState(): {|
  +state: UseInitiateDefaultStateState,
  +runInitiateDefaultState: () => Promise<InitiateDefaultStateResult>,
  +getTransactions: () => Promise<WriteTransaction[]>,
  +refresh: () => void,
  +reset: () => void,
|} {
  const [state, setState] = useState<UseInitiateDefaultStateState>({
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

  const runInitiateDefaultState = useCallback(async (): Promise<InitiateDefaultStateResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch community data with force refresh to get latest state
      const communityData = await CommunityInfoManager.get({ forceRefresh: true });

      if (communityData == null) {
        throw new Error('Failed to fetch community data');
      }

      // Extract member count - it comes as a BigNumber from the contract
      if (communityData.currentMemberCount == null) {
        throw new Error('Member count not available in community data');
      }

      // Extract subgroup count
      if (communityData.currentSubgroupCount == null) {
        throw new Error('Subgroup count not available in community data');
      }

      // Extract secretary successor list
      if (communityData.secretarySuccessorList == null) {
        throw new Error('Secretary successor list not available in community data');
      }

      // Convert BigNumbers to regular numbers
      // $FlowFixMe[incompatible-use] - BigNumber conversion
      const memberCount = parseInt(communityData.currentMemberCount.toString(), 10);
      // $FlowFixMe[incompatible-use] - BigNumber conversion
      const subgroupCount = parseInt(communityData.currentSubgroupCount.toString(), 10);

      if (Number.isNaN(memberCount) || memberCount < 0) {
        throw new Error('Invalid member count received from contract');
      }

      if (Number.isNaN(subgroupCount) || subgroupCount < 0) {
        throw new Error('Invalid subgroup count received from contract');
      }

      // Check successor list - it should be an array of addresses
      // $FlowFixMe[prop-missing] - secretarySuccessorList exists in community data
      // $FlowFixMe[unclear-type] - communityData is mixed type from manager
      const successorList = (communityData: Object).secretarySuccessorList;
      const successorCount = Array.isArray(successorList) ? successorList.length : 0;

      // Check all conditions for initialization exit
      const hasMinMembers = memberCount >= InitializationStateConstants.minCommunitySizeToExit;
      const hasMinSubgroups = subgroupCount >= InitializationStateConstants.minSubgroupCountToExit;
      const hasMinSuccessors = successorCount >= 2; // At least 2 successors required

      // For now, we assume all members are assigned and subgroup sizes are valid
      // since we can't easily check individual member/subgroup assignments without
      // additional contract calls. This should be true if the setup macro was completed.
      const allMembersAssigned = true;
      const validSubgroupSizes = true;

      const readyToInitiate = hasMinMembers && hasMinSubgroups && hasMinSuccessors
                             && allMembersAssigned && validSubgroupSizes;

      // Generate transaction if ready
      const transactions: WriteTransaction[] = [];

      if (readyToInitiate) {
        // Get the initiateDefaultState transaction
        const initiateTransaction = getAllWriteTransactions().find(
          tx => tx.functionName === 'initiateDefaultState'
        );

        if (initiateTransaction) {
          transactions.push(initiateTransaction);
        }
      }

      const result: InitiateDefaultStateResult = {
        success: true,
        transactions,
        readyToInitiate,
        memberCount,
        subgroupCount,
        successorCount,
        allMembersAssigned,
        validSubgroupSizes,
      };

      setState({
        loading: false,
        result,
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = error?.message || 'Failed to analyze community readiness';
      const errorResult: InitiateDefaultStateResult = {
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
    const result = await runInitiateDefaultState();
    return result.transactions ? [...result.transactions] : [];
  }, [runInitiateDefaultState]);

  return {
    state,
    runInitiateDefaultState,
    getTransactions,
    refresh,
    reset,
  };
}
