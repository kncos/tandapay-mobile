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

// Random positions to verify (3 out of 12)
const VERIFICATION_POSITIONS = [2, 7, 11]; // 0-indexed

export default function WalletVerifyScreen(props: Props): Node {
  const { navigation, route } = props;
  const { mnemonic, setupScreenCount = 3 } = route.params;

  const [mnemonicWords] = useState(() => mnemonic.split(' '));

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
              navigation.pop(setupScreenCount);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Verification Failed',
        'Some words are incorrect. Please check your recovery phrase and try again.',
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

  const handleWordGridSelect = (word: string) => {
    // Find the first empty position to fill
    const emptyPosition = VERIFICATION_POSITIONS.find(pos =>
      selectedWords[pos] == null || selectedWords[pos].length === 0
    );
    if (emptyPosition !== undefined) {
      handleWordSelect(word, emptyPosition);
    }
  };

  return (
    <Screen title="Verify Recovery Phrase">
      <View style={styles.container}>
        <ZulipText style={styles.title} text="Verify Your Recovery Phrase" />
        <ZulipText
          style={styles.description}
          text={`Please select the correct words for positions ${VERIFICATION_POSITIONS.map(p => p + 1).join(', ')} to verify you've saved your recovery phrase.`}
        />

        <VerificationSection
          verificationPositions={VERIFICATION_POSITIONS}
          selectedWords={selectedWords}
          onClearPosition={handleClearPosition}
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
