/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import WordChip from './WordChip';

type Props = $ReadOnly<{|
  words: $ReadOnlyArray<string>,
  usedWords: Set<string>,
  onWordSelect: (word: string) => void,
|}>;

const styles = StyleSheet.create({
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    justifyContent: 'center',
  },
});

export default function WordGrid(props: Props): Node {
  const { words, usedWords, onWordSelect } = props;
  
  return (
    <View style={styles.wordsContainer}>
      {words.map((word, index) => {
        const isUsed = usedWords.has(word);
        return (
          <WordChip
            key={`word-${word}-${word}`}
            word={word}
            isSelected={isUsed}
            onPress={() => {
              if (!isUsed) {
                onWordSelect(word);
              }
            }}
          />
        );
      })}
    </View>
  );
}
