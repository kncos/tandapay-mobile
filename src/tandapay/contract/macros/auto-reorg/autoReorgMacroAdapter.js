/* @flow strict-local */

/**
 * Auto-Reorg Macro Adapter
 *
 * Adapts the useAutoReorg hook to work with the existing MacroWorkflow component.
 * This bridges the gap between the auto-reorg algorithm and the UI transaction flow.
 */

import { useAutoReorg } from './useAutoReorg';
import { getAllWriteTransactions } from '../../tandapay-writer/writeTransactionObjects';
import { SubgroupConstants } from '../../constants';

import type { MacroDefinition } from '../../../components/MacroWorkflow';
import type { WriteTransaction } from '../../tandapay-writer/writeTransactionObjects';

/**
 * React hook that provides auto-reorg macro functionality
 * This is the recommended way to use auto-reorg in components
 */
export function useAutoReorgMacro(): {|
  +macro: MacroDefinition,
  +refresh: () => void,
|} {
  const autoReorg = useAutoReorg();

  const macro = {
    id: 'auto-reorg',
    name: 'Auto Reorganization',
    description: `Automatically reorganize subgroups to ensure all members are assigned to valid subgroups (${SubgroupConstants.minSize}-${SubgroupConstants.maxSize} members each).`,

    dataFetcher: async () => ({}),

    validateFunction: (data: mixed) => ({ canExecute: true }),

    executeFunction: async (data: mixed) => {
      try {
        const result = await autoReorg.runAutoReorg();

        if (!result.success) {
          return {
            success: false,
            error: result.error ?? 'Auto-reorg failed',
          };
        }

        if (!result.reassignments) {
          return {
            success: true,
            transactions: [],
          };
        }

        if (result.reassignments.transactions.length === 0) {
          return {
            success: true,
            transactions: [],
          };
        }

        // Calculate the maximum subgroup ID needed from reassignments
        // $FlowFixMe - Flow doesn't understand that we've already checked reassignments exists
        const maxSubgroupIdNeeded = Math.max(
          ...result.reassignments.transactions.map(tx => tx.subgroupId)
        );

        // Count current subgroups from the subgroup data
        // $FlowFixMe - Flow doesn't understand that we've already checked result.success
        const currentSubgroupCount = result.subgroupData ? result.subgroupData.length : 0;

        // Calculate how many new subgroups we need to create
        const subgroupsToCreate = Math.max(0, maxSubgroupIdNeeded - currentSubgroupCount);

        // Get transaction templates
        const assignMemberTransaction = getAllWriteTransactions().find(
          tx => tx.functionName === 'assignMemberToSubgroup'
        );
        const createSubgroupTransaction = getAllWriteTransactions().find(
          tx => tx.functionName === 'createSubgroup'
        );

        if (!assignMemberTransaction) {
          return {
            success: false,
            error: 'assignMemberToSubgroup transaction not found',
          };
        }

        if (subgroupsToCreate > 0 && !createSubgroupTransaction) {
          return {
            success: false,
            error: 'createSubgroup transaction not found',
          };
        }

        // Build transactions array: create subgroups first, then assignments
        const transactions: WriteTransaction[] = [];

        // Add create subgroup transactions if needed
        for (let i = 0; i < subgroupsToCreate; i++) {
          // $FlowFixMe - We've already checked that createSubgroupTransaction exists above
          transactions.push({
            ...createSubgroupTransaction,
            displayName: `Create Subgroup ${currentSubgroupCount + i + 1}`,
          });
        }

        // Add assignment transactions
        // $FlowFixMe - Flow doesn't understand that we've already checked reassignments exists
        const assignmentTransactions = result.reassignments.transactions.map(txData => ({
          ...assignMemberTransaction,
          // $FlowFixMe - Adding prefilledParams to WriteTransaction
          prefilledParams: {
            memberWalletAddress: txData.memberWalletAddress,
            subgroupId: txData.subgroupId.toString(),
            isReorging: txData.isReorging, // Keep as boolean, don't convert to string
          },
        }));

        transactions.push(...assignmentTransactions);

        return {
          success: true,
          transactions,
        };
      } catch (error) {
        return {
          success: false,
          error: error?.message ?? 'Failed to execute auto-reorg',
        };
      }
    },
  };

  return {
    macro,
    refresh: autoReorg.refresh,
  };
}
