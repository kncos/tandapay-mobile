/* flow */

/**
 * Simulation methods for public write functions
 * These methods use callStatic to simulate transactions without executing them on-chain
 */

/**
 * Simulate issuing any due refunds within the TandaPay community
 * @param contract The TandaPay contract instance
 * @returns Simulation result with success status and any return values
 */
export const simulateIssueRefund = async (contract) => {
  try {
    // Use callStatic to simulate the transaction
    const result = await contract.callStatic.issueRefund(true);

    // Estimate gas for the transaction
    const gasEstimate = await contract.estimateGas.issueRefund(true);

    return {
      success: true,
      result,
      gasEstimate: gasEstimate.toString(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      gasEstimate: null,
      error: error.message || 'Simulation failed'
    };
  }
};
