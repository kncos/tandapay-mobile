/* @flow strict-local */

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useSelector, useDispatch } from '../../react-redux';
import {
  getTandaPayCacheExpiration,
  getTandaPayRateLimitDelay,
  getTandaPayRetryAttempts,
} from '../redux/selectors';
import {
  updateNetworkPerformance,
  updateCacheExpiration,
  updateRateLimitDelay,
  updateRetryAttempts,
} from '../redux/actions';

type NetworkPerformanceHookReturn = {|
  cacheExpirationMs: number,
  rateLimitDelayMs: number,
  retryAttempts: number,
  handleUpdateCacheExpiration: (cacheExpirationMs: number) => void,
  handleUpdateRateLimitDelay: (rateLimitDelayMs: number) => void,
  handleUpdateRetryAttempts: (retryAttempts: number) => void,
  handleUpdateAll: (settings: {|
    cacheExpirationMs: number,
    rateLimitDelayMs: number,
    retryAttempts: number,
  |}) => void,
  handleResetToDefaults: () => void,
|};

/**
 * Custom hook for managing network performance settings
 * Provides handlers for updating individual and bulk performance settings
 */
export function useNetworkPerformanceSettings(): NetworkPerformanceHookReturn {
  const dispatch = useDispatch();

  // Get current values from Redux state
  const cacheExpirationMs = useSelector(getTandaPayCacheExpiration);
  const rateLimitDelayMs = useSelector(getTandaPayRateLimitDelay);
  const retryAttempts = useSelector(getTandaPayRetryAttempts);

  const handleUpdateCacheExpiration = useCallback((cacheMs: number) => {
    if (cacheMs < 0) {
      Alert.alert('Invalid Value', 'Cache expiration must be a non-negative number');
      return;
    }
    dispatch(updateCacheExpiration(cacheMs));
    Alert.alert('Settings Updated', `Cache expiration set to ${String(cacheMs)}ms`);
  }, [dispatch]);

  const handleUpdateRateLimitDelay = useCallback((rateLimitMs: number) => {
    if (rateLimitMs < 0) {
      Alert.alert('Invalid Value', 'Rate limit delay must be a non-negative number');
      return;
    }
    dispatch(updateRateLimitDelay(rateLimitMs));
    Alert.alert('Settings Updated', `Rate limit delay set to ${String(rateLimitMs)}ms`);
  }, [dispatch]);

  const handleUpdateRetryAttempts = useCallback((attempts: number) => {
    if (attempts < 0 || !Number.isInteger(attempts)) {
      Alert.alert('Invalid Value', 'Retry attempts must be a non-negative integer');
      return;
    }
    dispatch(updateRetryAttempts(attempts));
    Alert.alert('Settings Updated', `Retry attempts set to ${String(attempts)}`);
  }, [dispatch]);

  const handleUpdateAll = useCallback((settings: {|
    cacheExpirationMs: number,
    rateLimitDelayMs: number,
    retryAttempts: number,
  |}) => {
    const { cacheExpirationMs: cacheMs, rateLimitDelayMs: rateLimitMs, retryAttempts: attempts } = settings;

    // Validate all values
    if (cacheMs < 0) {
      Alert.alert('Invalid Value', 'Cache expiration must be a non-negative number');
      return;
    }
    if (rateLimitMs < 0) {
      Alert.alert('Invalid Value', 'Rate limit delay must be a non-negative number');
      return;
    }
    if (attempts < 0 || !Number.isInteger(attempts)) {
      Alert.alert('Invalid Value', 'Retry attempts must be a non-negative integer');
      return;
    }

    dispatch(updateNetworkPerformance(({
      cacheExpirationMs: cacheMs,
      rateLimitDelayMs: rateLimitMs,
      retryAttempts: attempts,
    }: {|
      cacheExpirationMs?: number,
      rateLimitDelayMs?: number,
      retryAttempts?: number,
    |})));
    Alert.alert(
      'Settings Updated',
      `Network performance settings updated:\n• Cache expiration: ${String(cacheMs)}ms\n• Rate limit delay: ${String(rateLimitMs)}ms\n• Retry attempts: ${String(attempts)}`
    );
  }, [dispatch]);

  const handleResetToDefaults = useCallback(() => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all network performance settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            dispatch(updateNetworkPerformance(({
              cacheExpirationMs: 30000,
              rateLimitDelayMs: 100,
              retryAttempts: 3,
            }: {|
              cacheExpirationMs?: number,
              rateLimitDelayMs?: number,
              retryAttempts?: number,
            |})));
            Alert.alert(
              'Settings Reset',
              'Network performance settings have been reset to defaults:\n• Cache expiration: 30000ms (30 seconds)\n• Rate limit delay: 100ms\n• Retry attempts: 3'
            );
          },
        },
      ]
    );
  }, [dispatch]);

  return {
    cacheExpirationMs,
    rateLimitDelayMs,
    retryAttempts,
    handleUpdateCacheExpiration,
    handleUpdateRateLimitDelay,
    handleUpdateRetryAttempts,
    handleUpdateAll,
    handleResetToDefaults,
  };
}
