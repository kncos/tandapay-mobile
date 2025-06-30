/* @flow strict-local */

/**
 * Define Successor List Macro Adapter
 *
 * Adapts the useDefineSuccessorList hook to work with the MacroWorkflow component.
 * This macro analyzes the community size and creates a single transaction for
 * defining secretary successors with the appropriate address array limit.
 */

import { useDefineSuccessorList } from './useDefineSuccessorList';
import { getWriteTransactionByName } from '../../tandapay-writer/writeTransactionObjects';

import type { MacroDefinition } from '../../../components/MacroWorkflow';
import type { WriteTransaction } from '../../tandapay-writer/writeTransactionObjects';

export function useDefineSuccessorListAdapter(): {|
  +macro: MacroDefinition,
  +refresh: () => void,
|} {
  const successorListMacro = useDefineSuccessorList();

  const macro = {
    id: 'define-successor-list',
    name: 'Define Expected Successor List',
    description: 'Configure the secretary successor list based on current community size. The system will determine how many successors you need to define.',

    // Minimal data fetcher - real data fetching happens in executeFunction
    dataFetcher: async () => ({}),

    // Always allow execution - validation happens in executeFunction
    validateFunction: (data: mixed) => ({ canExecute: true }),

    executeFunction: async (data: mixed) => {
      try {
        const result = await successorListMacro.runDefineSuccessorList();

        if (!result.success) {
          return {
            success: false,
            error: result.error ?? 'Failed to analyze successor requirements',
          };
        }

        // Get the base transaction template
        const baseTransaction = getWriteTransactionByName('defineSecretarySuccessorList');

        if (!baseTransaction) {
          return {
            success: false,
            error: 'defineSecretarySuccessorList transaction not found',
          };
        }

        // Create the transaction with the dynamic successor count
        const transaction: WriteTransaction = {
          ...baseTransaction,
          displayName: `Define Secretary Successor List (${result.successorCount || 0} addresses)`,
          // Use displayName parsing method since prefilledParams doesn't support numbers
          // The TransactionParameterForm will parse "(N addresses)" from the displayName
        };

        return {
          success: true,
          transactions: [transaction],
        };
      } catch (error) {
        return {
          success: false,
          error: error?.message ?? 'Failed to configure successor list',
        };
      }
    },
  };

  return {
    macro,
    refresh: successorListMacro.refresh,
  };
}
