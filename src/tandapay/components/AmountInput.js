/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import Input from '../../common/Input';
import ZulipText from '../../common/ZulipText';
import { TandaPayColors, TandaPayTypography, TandaPayLayout } from '../styles';

type Props = $ReadOnly<{|
  value: string,
  onChangeText: (amount: string) => void,
  tokenSymbol: string,
  tokenDecimals: number,
  label?: string,
  placeholder?: string,
  style?: ?{},
  disabled?: boolean,
|}>;

// Custom styles for this component
const customStyles = {
  errorText: {
    ...TandaPayTypography.error,
    color: TandaPayColors.error,
  },
};

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
  } = props;

  const [amountError, setAmountError] = useState('');

  // Validate amount format and value
  const validateAmount = useCallback((amountValue: string): string => {
    if (!amountValue.trim()) {
      return '';
    }

    const numericAmount = parseFloat(amountValue);
    if (Number.isNaN(numericAmount)) {
      return 'Please enter a valid number';
    }

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

  // Generate dynamic placeholder
  const dynamicPlaceholder = placeholder != null ? placeholder : `Amount in ${tokenSymbol} (max ${tokenDecimals} decimal places)`;

  return (
    <View style={style ? [TandaPayLayout.inputContainer, style] : TandaPayLayout.inputContainer}>
      {label && <ZulipText style={TandaPayTypography.inputLabel}>{label}</ZulipText>}

      <Input
        placeholder={dynamicPlaceholder}
        value={value}
        onChangeText={handleAmountChange}
        keyboardType="numeric"
        editable={!disabled}
      />

      {amountError ? (
        <ZulipText style={customStyles.errorText}>{amountError}</ZulipText>
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
