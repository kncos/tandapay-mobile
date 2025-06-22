// @flow strict-local

/**
 * Utility functions for transaction display formatting
 */

/**
 * Format a timestamp to a user-friendly format: YYYY-MM-DD HH:mm:SS
 * @param {string|number} timestamp - Unix timestamp or ISO string
 * @returns {string} Formatted date string
 */
export function formatTimestamp(timestamp: string | number): string {
  if (!timestamp || timestamp === '0') {
    return 'Unknown';
  }

  try {
    let date;

    // Handle Unix timestamp (string or number)
    if (typeof timestamp === 'string' && /^\d+$/.test(timestamp)) {
      date = new Date(parseInt(timestamp, 10) * 1000);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp * 1000);
    } else {
      // Handle ISO string or other date formats
      date = new Date(timestamp);
    }

    // Check if date is valid
    if (Number.isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    // Format as YYYY-MM-DD HH:mm:SS using local timezone
    // Using 'sv-SE' locale which gives us YYYY-MM-DD format
    return date.toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format address for display by truncating middle part
 * @param {string} address - Ethereum address
 * @returns {string} Formatted address
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) {
    return address;
  }
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
