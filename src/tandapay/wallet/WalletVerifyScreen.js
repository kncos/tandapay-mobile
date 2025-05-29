/* @flow strict-local */

import React, { useState, useEffect } from 'react';
import type { Node } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import Touchable from '../../common/Touchable';

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
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    justifyContent: 'center',
  },
  wordChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#90caf9',
    margin: 4,
  },
  selectedWordChip: {
    backgroundColor: '#2196f3',
    borderColor: '#1976d2',
  },
  wordText: {
    fontSize: 14,
  },
  selectedWordText: {
    color: '#fff',
  },
  verificationContainer: {
    marginBottom: 32,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  positionText: {
    fontSize: 16,
    fontWeight: '500',
    width: 80,
  },
  selectedWordsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  const [shuffledWords, setShuffledWords] = useState<Array<string>>([]);
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
              setSelectedWords({});
              setUsedWords(new Set());
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

  const isComplete = VERIFICATION_POSITIONS.every(pos => selectedWords[pos] != null);

  return (
    <Screen title="Verify Recovery Phrase">
      <View style={styles.container}>
        <ZulipText style={styles.title} text="Verify Your Recovery Phrase" />
        <ZulipText
          style={styles.description}
          text={`Please select the correct words for positions ${VERIFICATION_POSITIONS.map(p => p + 1).join(', ')} to verify you've saved your recovery phrase.`}
        />

        <View style={styles.verificationContainer}>
          {VERIFICATION_POSITIONS.map(position => (
            <View key={position} style={styles.verificationRow}>
              <ZulipText style={styles.positionText} text={`${position + 1}.`} />
              <View style={styles.selectedWordsContainer}>
                {selectedWords[position] != null && selectedWords[position].length > 0 ? (
                  <Touchable onPress={() => handleClearPosition(position)}>
                    <View style={[styles.wordChip, styles.selectedWordChip]}>
                      <ZulipText style={styles.selectedWordText} text={selectedWords[position] || ''} />
                    </View>
                  </Touchable>
                ) : (
                  <ZulipText text="Tap a word below" style={{ color: '#999', fontStyle: 'italic' }} />
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.wordsContainer}>
          {shuffledWords.map((word, index) => {
            const isUsed = usedWords.has(word);
            const chipStyle = isUsed
              ? [styles.wordChip, styles.selectedWordChip]
              : styles.wordChip;
            const textStyle = isUsed
              ? styles.selectedWordText
              : styles.wordText;
            return (
              <Touchable
                key={`word-${word}-${word}`}
                onPress={() => {
                  if (!isUsed) {
                    // Find the first empty position to fill
                    const emptyPosition = VERIFICATION_POSITIONS.find(pos =>
                      selectedWords[pos] == null || selectedWords[pos].length === 0
                    );
                    if (emptyPosition !== undefined) {
                      handleWordSelect(word, emptyPosition);
                    }
                  }
                }}
              >
                <View style={chipStyle}>
                  <ZulipText style={textStyle} text={word} />
                </View>
              </Touchable>
            );
          })}
        </View>

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
