/* @flow strict-local */

import { useState, useEffect } from 'react';

type WordSelectionState = {|
  shuffledWords: $ReadOnlyArray<string>,
  selectedWords: {[number]: ?string},
  usedWords: Set<string>,
  isComplete: boolean,
|};

type WordSelectionActions = {|
  handleWordSelect: (word: string, position: number) => void,
  handleClearPosition: (position: number) => void,
  resetSelection: () => void,
|};

type UseWordSelectionReturn = {|
  ...WordSelectionState,
  ...WordSelectionActions,
|};

export function useWordSelection(
  mnemonicWords: $ReadOnlyArray<string>,
  verificationPositions: $ReadOnlyArray<number>,
): UseWordSelectionReturn {
  const [shuffledWords, setShuffledWords] = useState<$ReadOnlyArray<string>>([]);
  const [selectedWords, setSelectedWords] = useState<{[number]: ?string}>({});
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Create a shuffled array of all words for selection
    const allWords = [...mnemonicWords];
    // Add some random words to make it more challenging
    const commonWords = ['apple', 'banana', 'orange', 'house', 'computer', 'phone', 'water', 'light'];
    allWords.push(...commonWords.slice(0, 6));

    // Shuffle the array
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, [mnemonicWords]);

  const handleWordSelect = (word: string, position: number) => {
    if (usedWords.has(word)) {
      return; // Word already used
    }

    // Remove previous selection for this position
    const previousWord = selectedWords[position];
    if (previousWord != null && previousWord.length > 0) {
      setUsedWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(previousWord);
        return newSet;
      });
    }

    // Add new selection
    setSelectedWords(prev => ({ ...prev, [position]: word }));
    setUsedWords(prev => new Set([...prev, word]));
  };

  const handleClearPosition = (position: number) => {
    const word = selectedWords[position];
    if (word != null && word.length > 0) {
      setUsedWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(word);
        return newSet;
      });
      setSelectedWords(prev => {
        const newObj = { ...prev };
        delete newObj[position];
        return newObj;
      });
    }
  };

  const resetSelection = () => {
    setSelectedWords({});
    setUsedWords(new Set());
  };

  const isComplete = verificationPositions.every(pos => selectedWords[pos] != null);

  return {
    shuffledWords,
    selectedWords,
    usedWords,
    isComplete,
    handleWordSelect,
    handleClearPosition,
    resetSelection,
  };
}
