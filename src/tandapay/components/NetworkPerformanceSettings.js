/* @flow strict-local */

import React, { useState, useContext, useEffect } from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import Input from '../../common/Input';
import { ThemeContext } from '../../styles';
import TandaPayStyles from '../styles';

type Props = $ReadOnly<{|
  cacheExpirationMs: number,
  rateLimitDelayMs: number,
  retryAttempts: number,
  onUpdateCacheExpiration: (cacheExpirationMs: number) => void,
  onUpdateRateLimitDelay: (rateLimitDelayMs: number) => void,
  onUpdateRetryAttempts: (retryAttempts: number) => void,
  onUpdateAll: (settings: {|
    cacheExpirationMs: number,
    rateLimitDelayMs: number,
    retryAttempts: number,
  |}) => void,
  onResetToDefaults: () => void,
  disabled?: boolean,
|}>;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  formSection: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  currentValues: {
    marginTop: 16,
    padding: 12,
    borderRadius: 6,
  },
  currentValuesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  currentValue: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default function NetworkPerformanceSettings(props: Props): Node {
  const {
    cacheExpirationMs,
    rateLimitDelayMs,
    retryAttempts,
    onUpdateAll,
    onResetToDefaults,
    disabled,
  } = props;
  const themeData = useContext(ThemeContext);

  const [localCacheExpiration, setLocalCacheExpiration] = useState(cacheExpirationMs.toString());
  const [localRateLimitDelay, setLocalRateLimitDelay] = useState(rateLimitDelayMs.toString());
  const [localRetryAttempts, setLocalRetryAttempts] = useState(retryAttempts.toString());

  // Update local state when props change
  useEffect(() => {
    setLocalCacheExpiration(cacheExpirationMs.toString());
  }, [cacheExpirationMs]);

  useEffect(() => {
    setLocalRateLimitDelay(rateLimitDelayMs.toString());
  }, [rateLimitDelayMs]);

  useEffect(() => {
    setLocalRetryAttempts(retryAttempts.toString());
  }, [retryAttempts]);

  const handleApplyAll = () => {
    const cacheMs = parseInt(localCacheExpiration, 10);
    const rateLimitMs = parseInt(localRateLimitDelay, 10);
    const attempts = parseInt(localRetryAttempts, 10);

    if (Number.isNaN(cacheMs) || cacheMs < 0
        || Number.isNaN(rateLimitMs) || rateLimitMs < 0
        || Number.isNaN(attempts) || attempts < 0) {
      return;
    }

    onUpdateAll({
      cacheExpirationMs: cacheMs,
      rateLimitDelayMs: rateLimitMs,
      retryAttempts: attempts,
    });
  };

  const handleResetToDefaults = () => {
    setLocalCacheExpiration('30000');
    setLocalRateLimitDelay('100');
    setLocalRetryAttempts('3');
    onResetToDefaults();
  };

  const isFormValid = () => {
    const cacheMs = parseInt(localCacheExpiration, 10);
    const rateLimitMs = parseInt(localRateLimitDelay, 10);
    const attempts = parseInt(localRetryAttempts, 10);

    return !Number.isNaN(cacheMs) && cacheMs >= 0
           && !Number.isNaN(rateLimitMs) && rateLimitMs >= 0
           && !Number.isNaN(attempts) && attempts >= 0;
  };

  const hasChanges = () => (
    localCacheExpiration !== cacheExpirationMs.toString()
    || localRateLimitDelay !== rateLimitDelayMs.toString()
    || localRetryAttempts !== retryAttempts.toString()
  );

  return (
    <View style={styles.container}>
      <ZulipText style={TandaPayStyles.sectionTitle}>Network Performance Settings</ZulipText>
      <ZulipText style={TandaPayStyles.description}>
        Configure caching, rate limiting, and retry behavior for blockchain network calls.
        These settings affect how the app interacts with TandaPay contracts.
      </ZulipText>

      <View style={[styles.formSection, { backgroundColor: themeData.cardColor }]}>
        {/* Cache Expiration */}
        <ZulipText style={TandaPayStyles.inputLabel}>Cache Expiration Time</ZulipText>
        <ZulipText style={TandaPayStyles.description}>
          How long (in milliseconds) to cache contract data before refreshing. Default: 30000ms (30 seconds)
        </ZulipText>
        <Input
          placeholder="30000"
          value={localCacheExpiration}
          onChangeText={setLocalCacheExpiration}
          keyboardType="numeric"
          autoCorrect={false}
          editable={!disabled}
        />

        {/* Rate Limit Delay */}
        <ZulipText style={TandaPayStyles.inputLabel}>Rate Limit Delay</ZulipText>
        <ZulipText style={TandaPayStyles.description}>
          Delay (in milliseconds) between consecutive blockchain calls. Default: 100ms
        </ZulipText>
        <Input
          placeholder="100"
          value={localRateLimitDelay}
          onChangeText={setLocalRateLimitDelay}
          keyboardType="numeric"
          autoCorrect={false}
          editable={!disabled}
        />

        {/* Retry Attempts */}
        <ZulipText style={TandaPayStyles.inputLabel}>Retry Attempts</ZulipText>
        <ZulipText style={TandaPayStyles.description}>
          Number of times to retry failed network calls. Default: 3 attempts
        </ZulipText>
        <Input
          placeholder="3"
          value={localRetryAttempts}
          onChangeText={setLocalRetryAttempts}
          keyboardType="numeric"
          autoCorrect={false}
          editable={!disabled}
        />

        <View style={TandaPayStyles.buttonRow}>
          <ZulipButton
            style={TandaPayStyles.button}
            disabled={Boolean(disabled) || !isFormValid() || !hasChanges()}
            text="Apply Settings"
            onPress={handleApplyAll}
          />

          <ZulipButton
            style={TandaPayStyles.button}
            disabled={Boolean(disabled)}
            text="Reset to Defaults"
            onPress={handleResetToDefaults}
          />
        </View>

        {/* Current Values Display */}
        <View style={[styles.currentValues, { backgroundColor: themeData.backgroundColor, opacity: 0.8 }]}>
          <ZulipText style={styles.currentValuesTitle}>Current Settings:</ZulipText>
          <ZulipText style={styles.currentValue}>
            Cache Expiration:
            {String(cacheExpirationMs)}
            ms
          </ZulipText>
          <ZulipText style={styles.currentValue}>
            Rate Limit Delay:
            {String(rateLimitDelayMs)}
            ms
          </ZulipText>
          <ZulipText style={styles.currentValue}>
            Retry Attempts:
            {String(retryAttempts)}
          </ZulipText>
        </View>
      </View>
    </View>
  );
}
