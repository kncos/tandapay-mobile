// @flow

import React from 'react';
import { View, Text } from 'react-native';

import type { WriteTransaction, WriteTransactionParameter } from '../contract/writeTransactionObjects';
import type { TransactionFormState } from '../hooks/useTransactionForm';

import AddressInput from './AddressInput';
import AmountInput from './AmountInput';
import NumberInput from './NumberInput';
import BooleanToggle from './BooleanToggle';
import AddressArrayInput from './AddressArrayInput';

import { TandaPayColors } from '../styles';

const styles = {
  container: {
    marginVertical: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: TandaPayColors.gray900,
    marginBottom: 16,
  },

  parametersContainer: {
    marginTop: 8,
  },

  parameterContainer: {
    marginBottom: 16,
  },

  errorText: {
    color: TandaPayColors.error,
    fontSize: 12,
    marginTop: 4,
  },

  unknownTypeContainer: {
    padding: 12,
    backgroundColor: TandaPayColors.warning,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TandaPayColors.warning,
  },

  unknownTypeText: {
    color: TandaPayColors.gray900,
    fontSize: 14,
    fontStyle: 'italic',
  },
};

type Props = {|
  transaction: WriteTransaction,
  formState: TransactionFormState,
  onParameterChange: (name: string, value: any) => void,
|};

/**
 * Renders a single parameter input based on its type and metadata
 */
function renderParameterInput(
  parameter: WriteTransactionParameter,
  value: any,
  error: ?string,
  onParameterChange: (name: string, value: any) => void
): React$Node {
  const { name, type, label, placeholder, isCurrency } = parameter;

  switch (type) {
    case 'address':
      return (
        <View key={name} style={styles.parameterContainer}>
          <AddressInput
            label={label}
            placeholder={placeholder || '0x...'}
            value={value || ''}
            onChangeText={(newValue: string) => onParameterChange(name, newValue)}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      );

    case 'uint256':
      // Use AmountInput for currency values, NumberInput for regular numbers
      if (isCurrency) {
        return (
          <View key={name} style={styles.parameterContainer}>
            <AmountInput
              label={label}
              placeholder={placeholder}
              value={value || ''}
              onChangeText={(newValue: string) => onParameterChange(name, newValue)}
              tokenSymbol="ETH"
              tokenDecimals={18}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );
      } else {
        return (
          <View key={name} style={styles.parameterContainer}>
            <NumberInput
              label={label}
              placeholder={placeholder}
              value={value || ''}
              onChangeText={(newValue: string) => onParameterChange(name, newValue)}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );
      }

    case 'bool':
      return (
        <View key={name} style={styles.parameterContainer}>
          <BooleanToggle
            label={label}
            value={Boolean(value)}
            onValueChange={(newValue: boolean) => onParameterChange(name, newValue)}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      );

    case 'address[]':
      return (
        <View key={name} style={styles.parameterContainer}>
          <AddressArrayInput
            label={label}
            addresses={value || []}
            onAddressesChange={(newValue: string[]) => onParameterChange(name, newValue)}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      );

    default:
      // Fallback for unknown types
      return (
        <View key={name} style={styles.unknownTypeContainer}>
          <Text style={styles.unknownTypeText}>
            Unsupported parameter type:
            {type}
          </Text>
        </View>
      );
  }
}

/**
 * Dynamic form component that renders parameter inputs based on transaction metadata
 */
export default function TransactionParameterForm({
  transaction,
  formState,
  onParameterChange,
}: Props): React$Node {
  // If the transaction doesn't require parameters, render nothing
  if (!transaction.requiresParams || !transaction.parameters || transaction.parameters.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction Parameters</Text>

      <View style={styles.parametersContainer}>
        {transaction.parameters.map((parameter) => {
          const value = formState.parameters[parameter.name];
          const error = formState.errors[parameter.name];

          return renderParameterInput(
            parameter,
            value,
            error,
            onParameterChange
          );
        })}
      </View>
    </View>
  );
}
