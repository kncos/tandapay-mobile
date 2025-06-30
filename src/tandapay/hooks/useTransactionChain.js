/* @flow strict-local */

import { useState, useCallback } from 'react';
import type { WriteTransaction } from '../contract/tandapay-writer/writeTransactionObjects';

/**
 * Individual transaction chain definition
 */
export type TransactionChain = {|
  +id: string,
  +name: string,
  +transactions: WriteTransaction[],
  +onComplete?: () => void | Promise<void>,
  +onError?: (error: string, transactionIndex: number) => void | Promise<void>,
  +onRefresh?: () => void | Promise<void>,
|};

/**
 * Chain sequence for multiple chains
 */
export type ChainSequence = {|
  +chains: TransactionChain[],
  +onAllComplete?: () => void | Promise<void>,
  +onSequenceError?: (error: string, chainIndex: number) => void | Promise<void>,
|};

/**
 * Transaction result from TransactionModal
 */
export type TransactionResult = {|
  +success: boolean,
  +txHash?: string,
  +error?: string,
|};

/**
 * Hook for managing transaction chains and sequences
 */
export function useTransactionChain(): {|
  +currentChain: ?TransactionChain,
  +currentTransaction: ?WriteTransaction,
  +chainProgress: ?{| current: number, total: number, macroName: string |},
  +sequenceProgress: ?{| currentChain: number, totalChains: number |},
  +isVisible: boolean,
  +isExecuting: boolean,
  +startSequence: (sequence: ChainSequence) => void,
  +startSingleChain: (chain: TransactionChain) => void,
  +handleTransactionComplete: (result: TransactionResult) => Promise<void>,
  +handleClose: () => Promise<void>,
  +cancel: () => void,
|} {
  const [currentChain, setCurrentChain] = useState<?TransactionChain>(null);
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState<number>(0);
  const [chainSequence, setChainSequence] = useState<?ChainSequence>(null);
  const [currentChainIndex, setCurrentChainIndex] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const reset = useCallback(() => {
    setCurrentChain(null);
    setCurrentTransactionIndex(0);
    setChainSequence(null);
    setCurrentChainIndex(0);
    setIsExecuting(false);
  }, []);

  const startSingleChain = useCallback((chain: TransactionChain) => {
    if (chain.transactions.length === 0) {
      // No transactions, call completion immediately
      if (chain.onComplete) {
        chain.onComplete();
      }
      return;
    }

    setCurrentChain(chain);
    setCurrentTransactionIndex(0);
    setChainSequence(null);
    setCurrentChainIndex(0);
    setIsExecuting(true);
  }, []);

  const startSequence = useCallback((sequence: ChainSequence) => {
    if (sequence.chains.length === 0) {
      if (sequence.onAllComplete) {
        sequence.onAllComplete();
      }
      return;
    }

    setChainSequence(sequence);
    setCurrentChainIndex(0);
    const firstChain = sequence.chains[0];
    startSingleChain(firstChain);
  }, [startSingleChain]);

  const moveToNextChain = useCallback(async () => {
    if (!chainSequence) {
      return;
    }

    const nextChainIndex = currentChainIndex + 1;
    
    if (nextChainIndex >= chainSequence.chains.length) {
      // All chains complete
      if (chainSequence.onAllComplete) {
        await chainSequence.onAllComplete();
      }
      reset();
    } else {
      // Move to next chain
      setCurrentChainIndex(nextChainIndex);
      const nextChain = chainSequence.chains[nextChainIndex];
      startSingleChain(nextChain);
    }
  }, [chainSequence, currentChainIndex, reset, startSingleChain]);

  const handleTransactionComplete = useCallback(async (result: TransactionResult): Promise<void> => {
    if (!currentChain || !isExecuting) {
      return;
    }

    if (result.success) {
      const nextTransactionIndex = currentTransactionIndex + 1;
      
      if (nextTransactionIndex >= currentChain.transactions.length) {
        // Current chain complete
        if (currentChain.onComplete) {
          await currentChain.onComplete();
        }
        
        if (chainSequence) {
          // Move to next chain in sequence
          await moveToNextChain();
        } else {
          // Single chain complete
          reset();
        }
      } else {
        // Move to next transaction in current chain
        setCurrentTransactionIndex(nextTransactionIndex);
      }
    } else {
      // Transaction failed
      const error = result.error ?? 'Transaction failed';
      
      if (currentChain.onError) {
        await currentChain.onError(error, currentTransactionIndex);
      }
      
      if (chainSequence && chainSequence.onSequenceError) {
        await chainSequence.onSequenceError(error, currentChainIndex);
      }
      
      reset();
    }
  }, [currentChain, currentTransactionIndex, chainSequence, currentChainIndex, isExecuting, moveToNextChain, reset]);

  const handleClose = useCallback(async (): Promise<void> => {
    // User cancelled - call error handlers
    if (currentChain?.onError) {
      await currentChain.onError('User cancelled', currentTransactionIndex);
    }
    
    if (chainSequence?.onSequenceError) {
      await chainSequence.onSequenceError('User cancelled', currentChainIndex);
    }
    
    reset();
  }, [currentChain, currentTransactionIndex, chainSequence, currentChainIndex, reset]);

  const cancel = useCallback(() => {
    reset();
  }, [reset]);

  // Current transaction
  const currentTransaction = currentChain?.transactions[currentTransactionIndex] || null;

  // Chain progress
  const chainProgress = currentChain ? {
    current: currentTransactionIndex + 1,
    total: currentChain.transactions.length,
    macroName: currentChain.name,
  } : null;

  // Sequence progress
  const sequenceProgress = chainSequence ? {
    currentChain: currentChainIndex + 1,
    totalChains: chainSequence.chains.length,
  } : null;

  return {
    currentChain,
    currentTransaction,
    chainProgress,
    sequenceProgress,
    isVisible: isExecuting && !!currentTransaction,
    isExecuting,
    startSequence,
    startSingleChain,
    handleTransactionComplete,
    handleClose,
    cancel,
  };
}

export default useTransactionChain;
