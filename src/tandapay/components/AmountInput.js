/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

// $FlowFixMe[untyped-import] - ethers.js imports
import { ethers } from 'ethers';

import Input from '../../common/Input';
import ZulipText from '../../common/ZulipText';
import ZulipTextButton from '../../common/ZulipTextButton';
import { TandaPayTypography, TandaPayLayout } from '../styles';
import ErrorText from './ErrorText';

type Props = $ReadOnly<{|
  value: string,
  onChangeText: (amount: string) => void,
  tokenSymbol: string,
  tokenDecimals: number,
  label?: string,
  placeholder?: string,
  style?: ?{},
  disabled?: boolean,
  // MAX button functionality
  availableBalance?: ?string,
  onMaxPress?: ?() => void,
  showMaxButton?: boolean,
|}>;

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    marginRight: 8,
  },
  balanceText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
});

export default function AmountInput(props: Props): Node {
  const {
    value,
    onChangeText,
    tokenSymbol,
    tokenDecimals,
    label = 'Amount',
    placeholder,
    style,
    disabled = false,
    availableBalance,
    onMaxPress,
    showMaxButton = false,
  } = props;

  const [amountError, setAmountError] = useState('');

  // Validate amount format and value
  const validateAmount = useCallback((amountValue: string): string => {
    if (!amountValue.trim()) {
      return '';
    }

    // Special case for MaxUint256 (infinite approval)
    if (amountValue === ethers.constants.MaxUint256.toString()) {
      return ''; // This is valid (MaxUint256)
    }

    // For very large numbers, we can't use parseFloat safely, so we'll do string-based validation
    const numericAmount = parseFloat(amountValue);
    if (Number.isNaN(numericAmount)) {
      return 'Please enter a valid number';
    }

    // Only check for <= 0 if it's not MaxUint256
    if (numericAmount <= 0) {
      return 'Amount must be greater than 0';
    }

    // Check decimal places
    const parts = amountValue.split('.');
    if (parts.length === 2 && parts[1].length > tokenDecimals) {
      return `Maximum ${tokenDecimals} decimal places allowed for ${tokenSymbol}`;
    }

    return '';
  }, [tokenSymbol, tokenDecimals]);

  // Handle amount input change with validation
  const handleAmountChange = useCallback((inputValue: string) => {
    // Allow only numbers and one decimal point
    const numericValue = inputValue.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return; // Don't update if multiple decimal points
    }

    // Validate decimal places don't exceed token decimals
    if (parts.length === 2 && parts[1].length > tokenDecimals) {
      return; // Don't update if too many decimal places
    }

    // Update the amount
    onChangeText(numericValue);

    // Validate and set error
    const errorMessage = validateAmount(numericValue);
    setAmountError(errorMessage);
  }, [onChangeText, tokenDecimals, validateAmount]);

  // Handle MAX button press
  const handleMaxPress = useCallback(() => {
    if (onMaxPress) {
      onMaxPress();
    }
  }, [onMaxPress]);

  // Generate dynamic placeholder
  const dynamicPlaceholder = placeholder != null ? placeholder : `Amount in ${tokenSymbol} (max ${tokenDecimals} decimal places)`;

  return (
    <View style={style ? [TandaPayLayout.inputContainer, style] : TandaPayLayout.inputContainer}>
      {label && <ZulipText style={TandaPayTypography.inputLabel}>{label}</ZulipText>}

      <View style={showMaxButton ? styles.inputRow : null}>
        <View style={showMaxButton ? styles.inputWrapper : null}>
          <Input
            placeholder={dynamicPlaceholder}
            value={value}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            editable={!disabled}
          />
        </View>

        {showMaxButton && availableBalance != null && availableBalance.trim() !== '' && (
          <ZulipTextButton
            label="MAX"
            onPress={handleMaxPress}
          />
        )}
      </View>

      {availableBalance != null && availableBalance.trim() !== '' && (
        <ZulipText style={styles.balanceText}>
          Available:
          {' '}
          {availableBalance}
          {' '}
          {tokenSymbol}
        </ZulipText>
      )}

      {amountError ? (
        <ErrorText>{amountError}</ErrorText>
      ) : null}
    </View>
  );
}

// Export validation function for external use
export const validateTokenAmount = (
  amount: string,
  tokenSymbol: string,
  tokenDecimals: number,
): string => {
  if (!amount.trim()) {
    return '';
  }

  const numericAmount = parseFloat(amount);
  if (Number.isNaN(numericAmount)) {
    return 'Please enter a valid number';
  }

  if (numericAmount <= 0) {
    return 'Amount must be greater than 0';
  }

  // Check decimal places
  const parts = amount.split('.');
  if (parts.length === 2 && parts[1].length > tokenDecimals) {
    return `Maximum ${tokenDecimals} decimal places allowed for ${tokenSymbol}`;
  }

  return '';
};
