/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import VerificationRow from './VerificationRow';

type Props = $ReadOnly<{|
  verificationPositions: $ReadOnlyArray<number>,
  selectedWords: {[number]: ?string},
  onClearPosition: (position: number) => void,
|}>;

const styles = StyleSheet.create({
  verificationContainer: {
    marginBottom: 32,
  },
});

export default function VerificationSection(props: Props): Node {
  const { verificationPositions, selectedWords, onClearPosition } = props;
  
  return (
    <View style={styles.verificationContainer}>
      {verificationPositions.map(position => (
        <VerificationRow
          key={position}
          position={position}
          selectedWord={selectedWords[position]}
          onClear={onClearPosition}
        />
      ))}
    </View>
  );
}
