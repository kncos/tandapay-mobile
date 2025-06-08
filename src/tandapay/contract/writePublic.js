/* flow */

/**
 * Issues any due refunds within the TandaPay community. Must be called between 72 and 96 hours
 * of the beginning of a TandaPay period, and only when no claim was whitelisted in the previous period.
 * @returns A transaction response
 */
export const issueRefund = async (contract) => contract.issueRefund(true);
