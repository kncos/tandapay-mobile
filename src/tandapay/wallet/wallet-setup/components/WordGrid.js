/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import WordChip from './WordChip';

type Props = $ReadOnly<{|
  words: $ReadOnlyArray<string>,
  usedWords: Set<string>,
  onWordSelect: (word: string) => void,
|}>;

export default function WordGrid(props: Props): Node {
  const { words, usedWords, onWordSelect } = props;

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
        justifyContent: 'center',
      }}
    >
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
