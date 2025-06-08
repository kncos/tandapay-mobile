/* @flow strict-local */

import React, { useState, useContext } from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import Input from '../../common/Input';
import { ThemeContext } from '../../styles';

type Props = $ReadOnly<{|
  initialConfig?: ?{|
    name: string,
    rpcUrl: string,
    chainId: number,
    blockExplorerUrl?: string,
  |},
  onSave: (config: {|
    name: string,
    rpcUrl: string,
    chainId: number,
    blockExplorerUrl?: string,
  |}) => Promise<void>,
  onClear?: () => void,
  loading?: boolean,
  disabled?: boolean,
|}>;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  formSection: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
  },
});

export default function CustomRpcForm(props: Props): Node {
  const { initialConfig, onSave, onClear, loading, disabled } = props;
  const themeData = useContext(ThemeContext);

  const [customName, setCustomName] = useState(initialConfig?.name || '');
  const [customRpcUrl, setCustomRpcUrl] = useState(initialConfig?.rpcUrl || '');
  const [customChainId, setCustomChainId] = useState(initialConfig?.chainId.toString() || '');
  const [customExplorerUrl, setCustomExplorerUrl] = useState(initialConfig?.blockExplorerUrl || '');

  const handleSave = () => {
    if (!customName.trim() || !customRpcUrl.trim() || !customChainId.trim()) {
      return;
    }

    const chainId = parseInt(customChainId, 10);
    if (Number.isNaN(chainId) || chainId <= 0) {
      return;
    }

    const config = {
      name: customName.trim(),
      rpcUrl: customRpcUrl.trim(),
      chainId,
      blockExplorerUrl: customExplorerUrl.trim() || undefined,
    };

    onSave(config);
  };

  const handleClear = () => {
    setCustomName('');
    setCustomRpcUrl('');
    setCustomChainId('');
    setCustomExplorerUrl('');
    if (onClear) {
      onClear();
    }
  };

  const isFormValid = customName.trim() && customRpcUrl.trim() && customChainId.trim();

  return (
    <View style={styles.container}>
      <ZulipText style={styles.sectionTitle}>Custom RPC Configuration</ZulipText>

      <View style={[styles.formSection, { backgroundColor: themeData.cardColor }]}>
        <Input
          style={styles.input}
          placeholder="Network Name (e.g., Local Ganache)"
          value={customName}
          onChangeText={setCustomName}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />

        <Input
          style={styles.input}
          placeholder="RPC URL (e.g., http://localhost:8545)"
          value={customRpcUrl}
          onChangeText={setCustomRpcUrl}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />

        <Input
          style={styles.input}
          placeholder="Chain ID (e.g., 1337)"
          value={customChainId}
          onChangeText={setCustomChainId}
          keyboardType="numeric"
          autoCorrect={false}
          editable={!disabled}
        />

        <Input
          style={styles.input}
          placeholder="Block Explorer URL (optional)"
          value={customExplorerUrl}
          onChangeText={setCustomExplorerUrl}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />

        <View style={styles.buttonRow}>
          <ZulipButton
            style={styles.button}
            disabled={Boolean(disabled) || Boolean(loading) || !isFormValid}
            text="Save Custom RPC"
            progress={Boolean(loading)}
            onPress={handleSave}
          />

          {(initialConfig && onClear) && (
            <ZulipButton
              style={styles.button}
              disabled={Boolean(disabled)}
              text="Clear"
              onPress={handleClear}
            />
          )}
        </View>
      </View>
    </View>
  );
}
