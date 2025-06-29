/* @flow strict-local */

/**
 * Auto-Reorg Macro Adapter
 *
 * Adapts the useAutoReorg hook to work with the existing MacroWorkflow component.
 * This bridges the gap between the auto-reorg algorithm and the UI transaction flow.
 */

import { useAutoReorg } from './useAutoReorg';
import { getAllWriteTransactions } from '../../tandapay-writer/writeTransactionObjects';

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
    description: 'Automatically reorganize subgroups to ensure all members are assigned to valid subgroups (4-7 members each).',

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

        // Get the assignMemberToSubgroup transaction template
        const assignMemberTransaction = getAllWriteTransactions().find(
          tx => tx.functionName === 'assignMemberToSubgroup'
        );

        if (!assignMemberTransaction) {
          return {
            success: false,
            error: 'assignMemberToSubgroup transaction not found',
          };
        }

        // Create pre-filled transactions
        // $FlowFixMe - Flow doesn't understand that we've already checked reassignments exists
        const transactions: WriteTransaction[] = result.reassignments.transactions.map(txData => ({
          ...assignMemberTransaction,
          // $FlowFixMe - Adding prefilledParams to WriteTransaction
          prefilledParams: {
            memberWalletAddress: txData.memberWalletAddress,
            subgroupId: txData.subgroupId.toString(),
            isReorging: txData.isReorging, // Keep as boolean, don't convert to string
          },
        }));

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
