/* @flow strict-local */

// $FlowIgnore[untyped-import] - Ethers.js BigNumber import
import { BigNumber } from 'ethers';

/**
 * Special marker to identify serialized BigNumber values
 */
const BIGNUMBER_MARKER = '__TANDAPAY_BIGNUMBER__';

/**
 * Recursively serialize an object, converting BigNumber instances to serializable strings
 */
export function serializeBigNumbers(obj: mixed): mixed {
  if (obj == null) {
    return obj;
  }

  // Handle BigNumber objects - use multiple detection methods
  if (typeof obj === 'object' && obj != null) {
    // Method 1: Use ethers BigNumber.isBigNumber() if available
    if (BigNumber.isBigNumber && BigNumber.isBigNumber(obj)) {
      return {
        [BIGNUMBER_MARKER]: String(obj),
      };
    }
    
    // Method 2: Check for BigNumber-specific properties
    // $FlowFixMe[incompatible-use] - checking for BigNumber methods
    if (typeof obj.toString === 'function' && typeof obj.toHexString === 'function'
        && (obj.type === 'BigNumber' || obj.isBigNumber === true || obj.hex != null)) {
      return {
        [BIGNUMBER_MARKER]: String(obj),
      };
    }
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigNumbers(item));
  }

  // Handle plain objects
  if (typeof obj === 'object' && obj != null && obj.constructor === Object) {
    const result = {};
    Object.keys(obj).forEach(key => {
      // $FlowFixMe[incompatible-use] - obj is verified to be an object
      result[key] = serializeBigNumbers(obj[key]);
    });
    return result;
  }

  // Return primitive values as-is
  return obj;
}

/**
 * Recursively deserialize an object, converting serialized BigNumber strings back to BigNumber instances
 */
export function deserializeBigNumbers(obj: mixed): mixed {
  if (obj == null) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => deserializeBigNumbers(item));
  }

  // Handle objects
  if (typeof obj === 'object' && obj != null && obj.constructor === Object) {
    // Check if this is a serialized BigNumber
    // $FlowFixMe[incompatible-use] - checking for serialized marker
    if (obj[BIGNUMBER_MARKER] != null) {
      try {
        // $FlowFixMe[incompatible-use] - accessing serialized value
        return BigNumber.from(obj[BIGNUMBER_MARKER]);
      } catch (error) {
        // If conversion fails, return the original string
        // $FlowFixMe[incompatible-use] - accessing serialized value
        return obj[BIGNUMBER_MARKER];
      }
    }

    // Handle plain objects
    const result = {};
    Object.keys(obj).forEach(key => {
      // $FlowFixMe[incompatible-use] - obj is verified to be an object
      result[key] = deserializeBigNumbers(obj[key]);
    });
    return result;
  }

  // Return primitive values as-is
  return obj;
}

/**
 * Safe JSON stringify that handles BigNumber objects
 */
export function stringifyWithBigNumbers(obj: mixed): string {
  const serialized = serializeBigNumbers(obj);
  return JSON.stringify(serialized) || '{}';
}

/**
 * Safe JSON parse that reconstructs BigNumber objects
 */
export function parseWithBigNumbers(jsonString: string): mixed {
  try {
    return deserializeBigNumbers(JSON.parse(jsonString));
  } catch (error) {
    return null;
  }
}
