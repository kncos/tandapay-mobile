// @flow strict-local

/**
 * Validation result type
 */
export type ValidationResult = $ReadOnly<{|
  isValid: boolean,
  errors: $ReadOnlyArray<string>,
|}>;

/**
 * Validate network value
 */
export function validateNetwork(network: mixed): ValidationResult {
  const errors = [];

  if (typeof network !== 'string') {
    errors.push('Network must be a string');
  } else {
    const validNetworks = ['mainnet', 'sepolia', 'arbitrum', 'polygon', 'custom'];
    if (!validNetworks.includes(network)) {
      errors.push(`Network must be one of: ${validNetworks.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate custom RPC configuration
 */
export function validateCustomRpcConfig(config: mixed): ValidationResult {
  const errors = [];

  if (config === null || config === undefined) {
    return { isValid: true, errors: [] }; // null/undefined is valid
  }

  if (typeof config !== 'object' || config === null) {
    errors.push('Custom RPC config must be an object or null');
    return { isValid: false, errors };
  }

  // Flow-safe destructuring
  if (config != null && typeof config === 'object') {
    const { name, rpcUrl, chainId, blockExplorerUrl } = config;

    if (typeof name !== 'string' || name.trim() === '') {
      errors.push('Custom RPC name must be a non-empty string');
    }

    if (typeof rpcUrl !== 'string' || rpcUrl.trim() === '') {
      errors.push('Custom RPC URL must be a non-empty string');
    } else if (!rpcUrl.startsWith('http://') && !rpcUrl.startsWith('https://')) {
      errors.push('Custom RPC URL must start with http:// or https://');
    }

    if (typeof chainId !== 'number' || chainId <= 0 || !Number.isInteger(chainId)) {
      errors.push('Chain ID must be a positive integer');
    }

    if (blockExplorerUrl !== undefined
      && (typeof blockExplorerUrl !== 'string'
        || (!blockExplorerUrl.startsWith('http://') && !blockExplorerUrl.startsWith('https://')))) {
      errors.push('Block explorer URL must be a valid HTTP/HTTPS URL or undefined');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate TandaPay settings state
 */
export function validateTandaPaySettings(settings: mixed): ValidationResult {
  const errors = [];

  if (typeof settings !== 'object' || settings === null) {
    errors.push('Settings must be an object');
    return { isValid: false, errors };
  }

  // Flow-safe destructuring
  if (settings != null && typeof settings === 'object') {
    const { selectedNetwork, customRpcConfig } = settings;

    // Validate network
    const networkValidation = validateNetwork(selectedNetwork);
    if (!networkValidation.isValid) {
      errors.push(...networkValidation.errors);
    }

    // Validate custom RPC config
    const rpcValidation = validateCustomRpcConfig(customRpcConfig);
    if (!rpcValidation.isValid) {
      errors.push(...rpcValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
