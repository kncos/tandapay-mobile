/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

import Input from '../../common/Input';
import ZulipText from '../../common/ZulipText';
import ErrorText from './ErrorText';
import FormStyles from '../styles/forms';
import { TandaPayTypography } from '../styles';

type Props = $ReadOnly<{|
  value: string,
  onChangeText: (value: string) => void,
  label: string,
  placeholder?: string,
  min?: number,
  max?: number,
  disabled?: boolean,
  style?: ?{},
  allowDecimals?: boolean,
|}>;

const customStyles = StyleSheet.create({
  container: FormStyles.container,
});

/**
 * A numeric input component with validation and formatting options.
 * Supports integer and decimal number input with customizable constraints.
 */
export default function NumberInput(props: Props): Node {
  const {
    value,
    onChangeText,
    label,
    placeholder = '0',
    min,
    max,
    disabled = false,
    style,
    allowDecimals = false,
  } = props;

  const [numberError, setNumberError] = useState('');

  // Validate number format and range
  const validateNumber = useCallback((numberValue: string): string => {
    if (!numberValue.trim()) {
      return '';
    }

    // Check for valid number format
    const regex = allowDecimals ? /^\d*\.?\d*$/ : /^\d*$/;
    if (!regex.test(numberValue)) {
      return allowDecimals ? 'Please enter a valid number' : 'Please enter a valid whole number';
    }

    const numericValue = parseFloat(numberValue);

    if (Number.isNaN(numericValue)) {
      return 'Please enter a valid number';
    }

    // Check minimum value
    if (min != null && numericValue < min) {
      return `Value must be at least ${min}`;
    }

    // Check maximum value
    if (max != null && numericValue > max) {
      return `Value must be at most ${max}`;
    }

    return '';
  }, [min, max, allowDecimals]);

  const handleChangeText = useCallback((text: string) => {
    // Remove any non-numeric characters except decimal point if allowed
    const cleanedText = allowDecimals
      ? text.replace(/[^0-9.]/g, '')
      : text.replace(/[^0-9]/g, '');

    // Prevent multiple decimal points
    if (allowDecimals && cleanedText.includes('.')) {
      const parts = cleanedText.split('.');
      if (parts.length > 2) {
        const fixedText = `${parts[0]}.${parts.slice(1).join('')}`;
        onChangeText(fixedText);
        setNumberError(validateNumber(fixedText));
        return;
      }
    }

    onChangeText(cleanedText);
    setNumberError(validateNumber(cleanedText));
  }, [onChangeText, validateNumber, allowDecimals]);

  return (
    <View style={[customStyles.container, style]}>
      {label && <ZulipText style={TandaPayTypography.label}>{label}</ZulipText>}

      <Input
        placeholder={placeholder}
        value={value}
        onChangeText={handleChangeText}
        keyboardType={allowDecimals ? 'decimal-pad' : 'number-pad'}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
      />

      {numberError !== '' && (
        <ErrorText>
          {numberError}
        </ErrorText>
      )}
    </View>
  );
}
