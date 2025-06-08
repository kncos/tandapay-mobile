/* @flow strict-local */

import React, { useState } from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import ZulipText from '../../../common/ZulipText';
import { AddressInput, AmountInput } from '../index';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
});

/**
 * Example component demonstrating the usage of AddressInput and AmountInput components
 * with different token configurations.
 */
export default function ComponentExamples(): Node {
  const [ethAddress, setEthAddress] = useState('');
  const [ethAmount, setEthAmount] = useState('');
  const [usdcAmount, setUsdcAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  return (
    <View style={styles.container}>
      <ZulipText style={styles.title}>TandaPay Component Examples</ZulipText>

      {/* Address Input Example */}
      <View style={styles.section}>
        <ZulipText style={styles.subtitle}>Address Input with QR Scanner</ZulipText>
        <AddressInput
          value={ethAddress}
          onChangeText={setEthAddress}
          label="Ethereum Address"
          placeholder="Enter or scan address..."
        />
      </View>

      {/* ETH Amount Input Example */}
      <View style={styles.section}>
        <ZulipText style={styles.subtitle}>ETH Amount (18 decimals)</ZulipText>
        <AmountInput
          value={ethAmount}
          onChangeText={setEthAmount}
          tokenSymbol="ETH"
          tokenDecimals={18}
          label="ETH Amount"
        />
      </View>

      {/* USDC Amount Input Example */}
      <View style={styles.section}>
        <ZulipText style={styles.subtitle}>USDC Amount (6 decimals)</ZulipText>
        <AmountInput
          value={usdcAmount}
          onChangeText={setUsdcAmount}
          tokenSymbol="USDC"
          tokenDecimals={6}
          label="USDC Amount"
        />
      </View>

      {/* Custom Token Example */}
      <View style={styles.section}>
        <ZulipText style={styles.subtitle}>Custom Token (2 decimals)</ZulipText>
        <AmountInput
          value={customAmount}
          onChangeText={setCustomAmount}
          tokenSymbol="CUSTOM"
          tokenDecimals={2}
          label="Custom Token Amount"
          placeholder="Enter amount (max 2 decimals)"
        />
      </View>

      {/* Display Values */}
      <View style={styles.section}>
        <ZulipText style={styles.subtitle}>Current Values:</ZulipText>
        <ZulipText>Address: {ethAddress || 'Not set'}</ZulipText>
        <ZulipText>ETH Amount: {ethAmount || 'Not set'}</ZulipText>
        <ZulipText>USDC Amount: {usdcAmount || 'Not set'}</ZulipText>
        <ZulipText>Custom Amount: {customAmount || 'Not set'}</ZulipText>
      </View>
    </View>
  );
}
