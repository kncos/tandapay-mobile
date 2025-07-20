/* @flow strict-local */

import React, { useState } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

import type { RouteProp } from '../../../react-navigation';
import type { AppNavigationProp } from '../../../nav/AppNavigator';
import Screen from '../../../common/Screen';
import ZulipButton from '../../../common/ZulipButton';
import ZulipText from '../../../common/ZulipText';
import VerificationSection from './components/VerificationSection';
import WordGrid from './components/WordGrid';
import { useWordSelection } from './hooks/useWordSelection';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet-verify'>,
  route: RouteProp<'wallet-verify', {| mnemonic: string, setupScreenCount?: number |}>,
|}>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 12,
  },
  buttonSpacing: {
    marginBottom: 12,
  },
});

// Random positions to verify (3 out of 12) - 0-indexed
const VERIFICATION_POSITIONS = [2, 7, 10]; // 0-indexed: word 3, word 8, word 11

export default function WalletVerifyScreen(props: Props): Node {
  const { navigation, route } = props;
  const { mnemonic, setupScreenCount = 3 } = route.params;

  const [mnemonicWords] = useState(() => mnemonic.split(' '));
  const [selectedPosition, setSelectedPosition] = useState<?number>(VERIFICATION_POSITIONS[0]);

  // Debug the mnemonic splitting
  // eslint-disable-next-line no-console
  console.log('Mnemonic split into words:', mnemonicWords.map((word, idx) => `${idx}: ${word}`).join(', '));

  const {
    shuffledWords,
    selectedWords,
    usedWords,
    isComplete,
    handleWordSelect,
    handleClearPosition,
    resetSelection,
  } = useWordSelection(mnemonicWords, VERIFICATION_POSITIONS);

  const handleVerify = () => {
    const isCorrect = VERIFICATION_POSITIONS.every(pos =>
      selectedWords[pos] === mnemonicWords[pos]
    );

    // Debug logging for verification
    VERIFICATION_POSITIONS.forEach(pos => {
      const selected = selectedWords[pos] != null ? selectedWords[pos] : 'EMPTY';
      const expected = mnemonicWords[pos];
      const isMatch = selected === expected;
      // eslint-disable-next-line no-console
      console.log(`Position ${pos} (word ${pos + 1}): selected="${selected}" expected="${expected}" match=${String(isMatch)}`);
    });

    if (isCorrect) {
      Alert.alert(
        'Verification Successful!',
        'Your wallet has been created successfully.',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Pop the setup screens to return to the previous navigation state
              // This preserves the existing chat app navigation history
              navigation.pop(setupScreenCount + 1);
            },
          },
        ]
      );
    } else {
      // Build a helpful error message showing expected vs selected
      const errorDetails = VERIFICATION_POSITIONS.map(pos => {
        const selected = selectedWords[pos] != null ? selectedWords[pos] : 'EMPTY';
        const expected = mnemonicWords[pos];
        return `Word ${pos + 1}: expected "${expected}", got "${selected}"`;
      }).join('\n');
      
      Alert.alert(
        'Verification Failed',
        `Some words are incorrect. Please check your recovery phrase and try again.\n\n${errorDetails}`,
        [
          {
            text: 'Try Again',
            onPress: () => {
              resetSelection();
            },
          },
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleClearPositionWrapper = (position: number) => {
    handleClearPosition(position);
    setSelectedPosition(position); // Select the cleared position for easy re-selection
  };

  const handleWordGridSelect = (word: string) => {
    if (selectedPosition != null) {
      handleWordSelect(word, selectedPosition);
      // Move to next empty position
      const nextPosition = VERIFICATION_POSITIONS.find(pos =>
        pos !== selectedPosition && (selectedWords[pos] == null || selectedWords[pos].length === 0)
      );
      setSelectedPosition(nextPosition != null ? nextPosition : null);
    }
  };

  const handlePositionSelect = (position: number) => {
    setSelectedPosition(position);
  };

  return (
    <Screen title="Verify Recovery Phrase">
      <View style={styles.container}>
        <ZulipText style={styles.title} text="Verify Your Recovery Phrase" />
        <ZulipText
          style={styles.description}
          text={`Please select the correct words for positions ${VERIFICATION_POSITIONS.map(p => p + 1).join(', ')}. Tap a position to select it, then tap the correct word below.`}
        />

        <VerificationSection
          verificationPositions={VERIFICATION_POSITIONS}
          selectedWords={selectedWords}
          selectedPosition={selectedPosition}
          onClearPosition={handleClearPositionWrapper}
          onPositionSelect={handlePositionSelect}
        />

        <WordGrid
          words={shuffledWords}
          usedWords={usedWords}
          onWordSelect={handleWordGridSelect}
        />

        <View style={styles.buttonContainer}>
          <View style={styles.buttonSpacing}>
            <ZulipButton
              text="Verify & Continue"
              disabled={!isComplete}
              onPress={handleVerify}
            />
          </View>
          <ZulipButton
            secondary
            text="Go Back"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    </Screen>
  );
}
