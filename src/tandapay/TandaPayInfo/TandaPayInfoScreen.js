/* @flow strict-local */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { BRAND_COLOR } from '../../styles/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_COLOR,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  note: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

/**
 * Main TandaPay information screen showing community status, user status, and period information
 * Refactored to use decoupled data managers
 *
 * STUB IMPLEMENTATION - to be completed with proper data integration
 */
function TandaPayInfoScreen(): React$Node {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TandaPay Information</Text>
      <Text style={styles.subtitle}>
        This screen is being refactored to use the new decoupled data architecture.
      </Text>
      <Text style={styles.note}>
        Data managers have been created and are ready for implementation.
      </Text>
    </View>
  );
}

export default TandaPayInfoScreen;
