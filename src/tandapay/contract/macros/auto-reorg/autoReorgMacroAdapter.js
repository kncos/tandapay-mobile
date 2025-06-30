/* @flow strict-local */

/**
 * Auto-Reorg Macro Adapter
 *
 * Adapts the useAutoReorg hook to work with the existing MacroWorkflow component.
 * This bridges the gap between the auto-reorg algorithm and the UI transaction flow.
 */

import { useAutoReorg } from './useAutoReorg';
import { SubgroupConstants } from '../../constants';

import type { MacroDefinition } from '../../../components/MacroWorkflow';

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

        // Return the transactions directly from the auto-reorg result
        return {
          success: true,
          transactions: result.transactions ? [...result.transactions] : [],
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
