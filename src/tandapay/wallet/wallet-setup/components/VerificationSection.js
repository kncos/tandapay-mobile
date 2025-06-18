/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import VerificationRow from './VerificationRow';

type Props = $ReadOnly<{|
  verificationPositions: $ReadOnlyArray<number>,
  selectedWords: {[number]: ?string},
  onClearPosition: (position: number) => void,
|}>;

export default function VerificationSection(props: Props): Node {
  const { verificationPositions, selectedWords, onClearPosition } = props;

  return (
    <View style={{ marginBottom: 32 }}>
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
