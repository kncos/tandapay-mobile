/* @flow strict-local */

/**
 * Alchemy URL detection and validation utilities
 */

/**
 * Check if a URL is an Alchemy endpoint
 * @param url The RPC URL to check
 * @returns True if the URL appears to be an Alchemy endpoint
 */
export function isAlchemyUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const normalizedUrl = url.toLowerCase();
  return normalizedUrl.includes('alchemy.com') || normalizedUrl.includes('g.alchemy.com');
}

/**
 * Extract the API key from an Alchemy URL
 * @param url The Alchemy URL
 * @returns The API key if found, null otherwise
 */
export function extractAlchemyApiKey(url: string): ?string {
  if (!isAlchemyUrl(url)) {
    return null;
  }

  try {
    // Alchemy URLs typically end with /v2/{api-key}
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];

    // Basic validation - Alchemy API keys are typically 32 characters
    if (lastPart && lastPart.length >= 16) {
      return lastPart;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Validate that an Alchemy URL has a proper API key
 * @param url The Alchemy URL to validate
 * @returns True if the URL has a valid-looking API key
 */
export function hasValidAlchemyApiKey(url: string): boolean {
  const apiKey = extractAlchemyApiKey(url);
  return apiKey != null && apiKey.length >= 16;
}

/**
 * Auto-detect Alchemy configuration from RPC URL
 * @param rpcUrl The RPC URL to analyze
 * @returns Object with detection results
 */
export function detectAlchemyConfig(rpcUrl: string): {|
  isAlchemy: boolean,
  hasApiKey: boolean,
  apiKey: ?string,
|} {
  const isAlchemy = isAlchemyUrl(rpcUrl);
  const apiKey = isAlchemy ? extractAlchemyApiKey(rpcUrl) : null;
  const hasApiKey = apiKey != null;

  return {
    isAlchemy,
    hasApiKey,
    apiKey,
  };
}
