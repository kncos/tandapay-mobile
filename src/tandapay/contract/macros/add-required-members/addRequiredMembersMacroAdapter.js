/* @flow strict-local */

/**
 * Add Required Members Macro Adapter
 *
 * Adapts the useAddRequiredMembers hook to work with the existing MacroWorkflow component.
 * This bridges the gap between the add required members logic and the UI transaction flow.
 */

import { useAddRequiredMembers } from './useAddRequiredMembers';
import { getWriteTransactionByName } from '../../tandapay-writer/writeTransactionObjects';
import { InitializationStateConstants } from '../../constants';

import type { MacroDefinition } from '../../../components/MacroWorkflow';
import type { WriteTransaction } from '../../tandapay-writer/writeTransactionObjects';

/**
 * React hook that provides add required members macro functionality
 * This is the recommended way to use add required members in components
 */
export function useAddRequiredMembersMacro(): {|
  +macro: MacroDefinition,
  +refresh: () => void,
|} {
  const addRequiredMembers = useAddRequiredMembers();

  const macro = {
    id: 'add-required-members',
    name: 'Add Required Members',
    description: `Add members to reach the minimum of ${InitializationStateConstants.minCommunitySizeToExit} members required for community initialization.`,

    dataFetcher: async () => ({}),

    validateFunction: (data: mixed) => ({ canExecute: true }),

    executeFunction: async (data: mixed) => {
      try {
        const result = await addRequiredMembers.runAddRequiredMembers();

        if (!result.success) {
          return {
            success: false,
            error: result.error ?? 'Add required members failed',
          };
        }

        const membersNeeded = result.membersNeeded ?? 0;

        if (membersNeeded === 0) {
          return {
            success: true,
            transactions: [],
          };
        }

        // Get the addMemberToCommunity transaction template
        const addMemberTransaction = getWriteTransactionByName('addMemberToCommunity');

        if (!addMemberTransaction) {
          return {
            success: false,
            error: 'addMemberToCommunity transaction not found',
          };
        }

        // Create pre-filled transactions for each member needed
        const transactions: WriteTransaction[] = [];
        for (let i = 0; i < membersNeeded; i++) {
          transactions.push({
            ...addMemberTransaction,
            displayName: `Add Member ${i + 1} of ${membersNeeded}`,
          });
        }

        return {
          success: true,
          transactions,
        };
      } catch (error) {
        return {
          success: false,
          error: error?.message ?? 'Failed to execute add required members',
        };
      }
    },
  };

  return {
    macro,
    refresh: addRequiredMembers.refresh,
  };
}
