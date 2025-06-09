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
 * Validate network performance settings
 */
export function validateNetworkPerformance(performance: mixed): ValidationResult {
  const errors = [];

  if (performance === null || performance === undefined) {
    return { isValid: true, errors: [] }; // null/undefined is valid for partial updates
  }

  if (typeof performance !== 'object' || performance === null) {
    errors.push('Network performance must be an object or null');
    return { isValid: false, errors };
  }

  // Flow-safe destructuring
  if (performance != null && typeof performance === 'object') {
    const { cacheExpirationMs, rateLimitDelayMs, retryAttempts } = performance;

    if (cacheExpirationMs !== undefined) {
      if (typeof cacheExpirationMs !== 'number' || cacheExpirationMs < 0) {
        errors.push('Cache expiration must be a non-negative number');
      }
    }

    if (rateLimitDelayMs !== undefined) {
      if (typeof rateLimitDelayMs !== 'number' || rateLimitDelayMs < 0) {
        errors.push('Rate limit delay must be a non-negative number');
      }
    }

    if (retryAttempts !== undefined) {
      if (typeof retryAttempts !== 'number' || retryAttempts < 0 || !Number.isInteger(retryAttempts)) {
        errors.push('Retry attempts must be a non-negative integer');
      }
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
    const { selectedNetwork, customRpcConfig, networkPerformance } = settings;

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

    // Validate network performance settings
    const performanceValidation = validateNetworkPerformance(networkPerformance);
    if (!performanceValidation.isValid) {
      errors.push(...performanceValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
