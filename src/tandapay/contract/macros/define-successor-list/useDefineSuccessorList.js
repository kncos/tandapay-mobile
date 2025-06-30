/* @flow strict-local */

import { useState, useCallback } from 'react';
import { getAllWriteTransactions } from '../../tandapay-writer/writeTransactionObjects';

import type { WriteTransaction } from '../../tandapay-writer/writeTransactionObjects';

/**
 * Result types for the Define Successor List macro
 */
export type DefineSuccessorListResult = {|
  +success: boolean,
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
 * This macro generates the single transaction needed to define secretary successors.
 * For initialization state (12 members), exactly 2 successors are required.
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
    // No network data to refresh for this simplified version
    reset();
  }, [reset]);

  const runDefineSuccessorList = useCallback(async (): Promise<DefineSuccessorListResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get the defineSecretarySuccessorList transaction
      const defineSuccessorTransaction = getAllWriteTransactions().find(
        tx => tx.functionName === 'defineSecretarySuccessorList'
      );

      if (!defineSuccessorTransaction) {
        throw new Error('defineSecretarySuccessorList transaction not found');
      }

      const transactions: WriteTransaction[] = [defineSuccessorTransaction];

      const result: DefineSuccessorListResult = {
        success: true,
        transactions,
      };

      setState({
        loading: false,
        result,
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = error?.message || 'Failed to get define successor list transaction';
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
    // Simply return the single defineSecretarySuccessorList transaction
    const defineSuccessorTransaction = getAllWriteTransactions().find(
      tx => tx.functionName === 'defineSecretarySuccessorList'
    );

    return defineSuccessorTransaction ? [defineSuccessorTransaction] : [];
  }, []);

  return {
    state,
    runDefineSuccessorList,
    getTransactions,
    refresh,
    reset,
  };
}
