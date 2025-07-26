// @flow

import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from '../../react-redux';

import type { WriteTransaction, WriteTransactionParameter } from '../contract/tandapay-writer/writeTransactionObjects';
import type { TransactionFormState } from '../hooks/useTransactionForm';

import AddressInput from './AddressInput';
import AmountInput from './AmountInput';
import NumberInput from './NumberInput';
import BooleanToggle from './BooleanToggle';
import AddressArrayInput from './AddressArrayInput';
import ErrorText from './ErrorText';
import { ExpectedSuccessorCounts } from '../contract/constants';
import { getAvailableTokens } from '../tokens/tokenSelectors';
import { getTandaPaySelectedNetwork } from '../redux/selectors';
import { findTokenByAddress } from '../definitions';

import FormStyles from '../styles/forms';
import { TandaPayColors } from '../styles';
import { ThemeContext } from '../../styles';

const styles = StyleSheet.create({
  container: FormStyles.section,
  parametersContainer: {
    marginTop: 8,
  },
  parameterContainer: FormStyles.container,
  unknownTypeContainer: {
    padding: 12,
    backgroundColor: TandaPayColors.warning,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TandaPayColors.warning,
  },
});

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
  onParameterChange: (name: string, value: any) => void,
  themeData: any,
  transaction: WriteTransaction,
  availableTokens: any,
  selectedNetwork: string
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
          {error && <ErrorText>{error}</ErrorText>}
        </View>
      );

    case 'uint256':
      // Use AmountInput for currency values, NumberInput for regular numbers
      if (isCurrency) {
        // Get payment token information for proper currency formatting
        let tokenSymbol = 'ETH';
        let tokenDecimals = 18;

        // Check if transaction provides payment token address via prefilledParams
        if (transaction.prefilledParams && transaction.prefilledParams.paymentTokenAddress) {
          const paymentTokenAddress = transaction.prefilledParams.paymentTokenAddress;

          // Try to find token info using the available tokens and token utilities
          if (typeof paymentTokenAddress === 'string' && paymentTokenAddress) {
            const tokenInfo = findTokenByAddress(
              (selectedNetwork: any),
              paymentTokenAddress,
              availableTokens
            );

            if (tokenInfo) {
              tokenSymbol = tokenInfo.symbol;
              tokenDecimals = tokenInfo.decimals;
            } else {
              // Fallback: Use basic pattern matching for common tokens
              const addressLower = paymentTokenAddress.toLowerCase();
              if (addressLower.includes('usdc')) {
                tokenSymbol = 'USDC';
                tokenDecimals = 6;
              } else if (addressLower.includes('usdt')) {
                tokenSymbol = 'USDT';
                tokenDecimals = 6;
              } else if (addressLower.includes('dai')) {
                tokenSymbol = 'DAI';
                tokenDecimals = 18;
              }
            }
          }
        }

        return (
          <View key={name} style={styles.parameterContainer}>
            <AmountInput
              label={label}
              placeholder={placeholder}
              value={value || ''}
              onChangeText={(newValue: string) => onParameterChange(name, newValue)}
              tokenSymbol={tokenSymbol}
              tokenDecimals={tokenDecimals}
            />
            {error && <ErrorText>{error}</ErrorText>}
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
            {error && <ErrorText>{error}</ErrorText>}
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
          {error && <ErrorText>{error}</ErrorText>}
        </View>
      );

    case 'address[]': {
      // MACRO INTEGRATION SUPPORT:
      // This case handles address[] parameters and supports macro-driven configuration.
      // Macros can control the address limit in two ways:
      //
      // Method 1: Via prefilledParams.maxAddresses
      // transaction.prefilledParams = { maxAddresses: 4, ...otherParams }
      //
      // Method 2: Via displayName suffix (fallback)
      // transaction.displayName = "Define Secretary Successor List (4 addresses)"
      //
      // The address limit determines how many address inputs the user can add,
      // indicating to the secretary how many addresses they should provide.

      // Determine maxAddresses based on the transaction and parameter
      // This allows different transactions to have different limits
      // and enables macros to configure custom limits in the future
      let maxAddresses = ExpectedSuccessorCounts.communityLargerThan35; // Default for most address arrays

      // Transaction-specific limits
      if (transaction.functionName === 'defineSecretarySuccessorList' && name === 'successorListWalletAddresses') {
        // For secretary successor list, always use minimum of communitySmallerThan35 as the base
        // This ensures there's always a minimum number of successors required
        maxAddresses = ExpectedSuccessorCounts.communitySmallerThan35; // Minimum of 2 successors
      }

      // Allow macros to override maxAddresses via transaction metadata
      // Macros can set this to indicate how many addresses the user should input
      if (transaction.prefilledParams && transaction.prefilledParams.maxAddresses) {
        const macroMaxAddresses = transaction.prefilledParams.maxAddresses;
        if (typeof macroMaxAddresses === 'number' && macroMaxAddresses > 0) {
          // For secretary successor list, ensure we never go below the minimum
          if (transaction.functionName === 'defineSecretarySuccessorList') {
            maxAddresses = Math.max(macroMaxAddresses, ExpectedSuccessorCounts.communitySmallerThan35);
          } else {
            maxAddresses = macroMaxAddresses;
          }
        }
      }

      // Macros can also set this via displayName suffix (e.g., "Define Secretary Successor List (4 addresses)")
      // This provides a fallback method for macros that don't use prefilledParams
      if (transaction.displayName && transaction.displayName.includes('(') && transaction.displayName.includes('addresses)')) {
        const match = transaction.displayName.match(/\((\d+) addresses?\)/);
        if (match && match[1]) {
          const countFromDisplayName = parseInt(match[1], 10);
          if (!Number.isNaN(countFromDisplayName) && countFromDisplayName > 0) {
            // For secretary successor list, ensure we never go below the minimum
            if (transaction.functionName === 'defineSecretarySuccessorList') {
              maxAddresses = Math.max(countFromDisplayName, ExpectedSuccessorCounts.communitySmallerThan35);
            } else {
              maxAddresses = countFromDisplayName;
            }
          }
        }
      }

      // Determine minAddresses for specific transactions
      let minAddresses = 0; // Default minimum is 0
      if (transaction.functionName === 'defineSecretarySuccessorList' && name === 'successorListWalletAddresses') {
        // Secretary successor list always requires a minimum number of successors
        minAddresses = ExpectedSuccessorCounts.communitySmallerThan35;
      }

      return (
        <View key={name} style={styles.parameterContainer}>
          <AddressArrayInput
            label={label}
            addresses={value || []}
            onAddressesChange={(newValue: string[]) => onParameterChange(name, newValue)}
            maxAddresses={maxAddresses}
            minAddresses={minAddresses}
          />
          {error && <ErrorText>{error}</ErrorText>}
        </View>
      );
    }

    default:
      // Fallback for unknown types
      return (
        <View key={name} style={styles.unknownTypeContainer}>
          <Text style={{ color: themeData.color, fontSize: 14, fontStyle: 'italic' }}>
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
  const themeData = useContext(ThemeContext);

  // Get token and network information for currency rendering
  const availableTokens = useSelector(getAvailableTokens);
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);

  // Dynamic styles that use theme context
  const dynamicStyles = {
    ...styles,
    title: [
      FormStyles.sectionTitle,
      {
        color: themeData.color,
        fontSize: 16,
      }
    ],
    unknownTypeText: {
      color: themeData.color,
      fontSize: 14,
      fontStyle: 'italic',
    },
  };

  // If the transaction doesn't require parameters, render nothing
  if (!transaction.requiresParams || !transaction.parameters || transaction.parameters.length === 0) {
    return null;
  }

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Transaction Parameters</Text>

      <View style={dynamicStyles.parametersContainer}>
        {transaction.parameters.map((parameter) => {
          const value = formState.parameters[parameter.name];
          const error = formState.errors[parameter.name];

          return renderParameterInput(
            parameter,
            value,
            error,
            onParameterChange,
            themeData,
            transaction,
            availableTokens,
            selectedNetwork
          );
        })}
      </View>
    </View>
  );
}
