// @flow

import { useState, useCallback, useMemo } from 'react';
import type { WriteTransaction, WriteTransactionParameter } from '../contract/writeTransactionObjects';

export type TransactionFormState = {|
  parameters: {| [paramName: string]: any |},
  errors: {| [paramName: string]: ?string |},
  isValid: boolean,
|};

/**
 * Validates a single parameter value
 */
export function validateParameter(
  value: any,
  parameter: WriteTransactionParameter
): ?string {
  const { validation, type } = parameter;

  // Required validation
  if (validation.required) {
    if (value === null || value === undefined || value === '') {
      return `${parameter.label} is required`;
    }

    // Array-specific required validation
    if (type === 'address[]' && Array.isArray(value) && value.length === 0) {
      return `${parameter.label} must contain at least one address`;
    }
  }

  // Type-specific validation
  if (value !== null && value !== undefined && value !== '') {
    switch (type) {
      case 'address': {
        // Basic Ethereum address validation (0x followed by 40 hex characters)
        const addressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!addressRegex.test(value)) {
          return 'Please enter a valid Ethereum address (0x...)';
        }
        break;
      }

      case 'uint256': {
        const numValue = Number(value);
        if (Number.isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
          return 'Please enter a valid non-negative integer';
        }

        if (validation.min !== undefined && numValue < validation.min) {
          return `Value must be at least ${validation.min}`;
        }

        if (validation.max !== undefined && numValue > validation.max) {
          return `Value must be at most ${validation.max}`;
        }
        break;
      }

      case 'bool': {
        if (typeof value !== 'boolean') {
          return 'Please select a valid option';
        }
        break;
      }

      case 'address[]': {
        if (!Array.isArray(value)) {
          return 'Invalid address list format';
        }

        const addressRegex = /^0x[a-fA-F0-9]{40}$/;
        for (let i = 0; i < value.length; i++) {
          if (!addressRegex.test(value[i])) {
            return `Address ${i + 1} is not a valid Ethereum address`;
          }
        }
        break;
      }

      default:
        break;
    }
  }

  return null;
}

/**
 * Get the default value for a parameter based on its type
 */
function getDefaultValue(parameter: WriteTransactionParameter): any {
  switch (parameter.type) {
    case 'address':
      return '';
    case 'uint256':
      return '';
    case 'bool':
      // For bool parameters, use false as default unless it's not required
      return false;
    case 'address[]':
      return [];
    default:
      return '';
  }
}

/**
 * Check if a transaction form should be considered valid for gas estimation
 * This is more permissive than full validation - it allows optional parameters to be empty
 */
export function isFormValidForGasEstimation(
  transaction: WriteTransaction,
  formState: TransactionFormState
): boolean {
  // If no parameters, always valid
  if (!transaction.parameters || transaction.parameters.length === 0) {
    return true;
  }

  // Check if all required parameters are valid
  for (const param of transaction.parameters) {
    const value = formState.parameters[param.name];
    const error = formState.errors[param.name];

    // If there's an error and the parameter is required, form is invalid
    if (error && param.validation.required) {
      return false;
    }

    // If there's an error with the parameter value format (regardless of required status), form is invalid
    if (error && value !== null && value !== undefined && value !== '') {
      return false;
    }
  }

  return true;
}

/**
 * Hook for managing transaction form state and validation
 */
export function useTransactionForm(
  transaction: WriteTransaction
): {|
  formState: TransactionFormState,
  updateParameter: (name: string, value: any) => void,
  validateForm: () => boolean,
  resetForm: () => void,
  getParameterValues: () => any[],
  isValidForGasEstimation: boolean,
|} {
  // Initialize form state with default values
  const initialState = useMemo(() => {
    const parameters = {};
    const errors = {};
    let isValid = true;

    if (transaction.parameters) {
      transaction.parameters.forEach((param) => {
        const defaultValue = getDefaultValue(param);
        parameters[param.name] = defaultValue;

        // Validate the default value to determine initial form validity
        const error = validateParameter(defaultValue, param);
        errors[param.name] = error;

        if (error) {
          isValid = false;
        }
      });
    }

    // If transaction has no parameters, it's always valid
    if (!transaction.parameters || transaction.parameters.length === 0) {
      isValid = true;
    }

    return {
      parameters,
      errors,
      isValid,
    };
  }, [transaction]);

  const [formState, setFormState] = useState<TransactionFormState>(initialState);

  // Update a parameter value and validate it
  const updateParameter = useCallback((name: string, value: any) => {
    if (!transaction.parameters) {
      return;
    }

    const parameter = transaction.parameters.find(p => p.name === name);
    if (!parameter) {
      return;
    }

    const error = validateParameter(value, parameter);

    setFormState(prevState => {
      const newState = {
        parameters: { ...prevState.parameters, [name]: value },
        errors: { ...prevState.errors, [name]: error },
        isValid: false, // Will be recalculated below
      };

      // Recalculate overall validity
      const hasErrors = Object.values(newState.errors).some(err => err !== null);
      newState.isValid = !hasErrors;

      return newState;
    });
  }, [transaction.parameters]);

  // Validate the entire form
  const validateForm = useCallback(() => {
    if (!transaction.parameters) {
      return true;
    }

    const newErrors = {};
    let isValid = true;

    transaction.parameters.forEach((param) => {
      const value = formState.parameters[param.name];
      const error = validateParameter(value, param);
      newErrors[param.name] = error;
      if (error) {
        isValid = false;
      }
    });

    setFormState(prevState => ({
      ...prevState,
      errors: newErrors,
      isValid,
    }));

    return isValid;
  }, [transaction.parameters, formState.parameters]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormState(initialState);
  }, [initialState]);

  // Get parameter values in the order expected by the writeFunction
  const getParameterValues = useCallback(() => {
    if (!transaction.parameters) {
      return [];
    }

    return transaction.parameters.map((param) => {
      const value = formState.parameters[param.name];

      // Convert values to appropriate types for contract calls
      switch (param.type) {
        case 'uint256':
          return value === '' ? 0 : Number(value);
        case 'bool':
          return Boolean(value);
        case 'address':
        case 'address[]':
        default:
          return value;
      }
    });
  }, [transaction.parameters, formState.parameters]);

  return {
    formState,
    updateParameter,
    validateForm,
    resetForm,
    getParameterValues,
    isValidForGasEstimation: isFormValidForGasEstimation(transaction, formState),
  };
}
