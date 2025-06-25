/* @flow strict-local */

/**
 * TandaPay Contract Error Mapping
 * Maps contract error names to user-friendly messages
 */

export const CONTRACT_ERROR_MAPPING = {
  // Already/Duplicate State Errors
  AlreadyAdded: 'This member has already been added to the community.',
  AlreadyClaimed: 'Claim has already been submitted for this period',
  AlreadySet: 'This value has already been configured',
  AlreadySubmitted: 'Submission has already been made',

  // Validation Errors
  AmountZero: 'Amount cannot be zero',
  CannotBeZeroAddress: 'Invalid address - cannot be zero address',
  InvalidMember: 'You are not authorized to perform this action.',
  InvalidSubGroup: 'Invalid subgroup specified',
  NoValiddMember: 'No valid member found',
  ClaimantNotValidMember: 'Claimant is not a valid member',
  NotValidMember: 'You are not authorized to perform this action.',

  // Timing/Window Errors
  NotClaimWindow: 'Claims can only be submitted during the claim window',
  NotClaimSubmittionWindow: 'Not currently in the claim submission window',
  NotDefectWindow: 'Defection is only allowed during the defect window',
  NotPayWindow: 'Payments can only be made during the payment window',
  NotRefundWindow: 'Refunds are not available at this time.',
  NotWhitelistWindow: 'Whitelist operations are only allowed during the whitelist window',
  NotInInjectionWindow: 'Capital injection is only allowed during the injection window',
  TimeNotPassed: 'Required time period has not passed yet',
  TurningTimePassed: 'Time limit for this action has expired',
  PrevPeriodNotEnded: 'Previous period must end before starting new period',
  SamePeriod: 'Cannot perform this action in the same period',

  // State-Based Errors
  NotInInitilization: 'Community is not in initialization state',
  NotInAssigned: 'Member is not in assigned state',
  NotInAssignmentSuccessfull: 'Assignment was not successful',
  NotInCovereged: 'Not in covered state',
  NotInDefOrFra: 'Not in default or fragmentation state',
  NotInEmergency: 'Not in emergency state',
  NotInInDefault: 'Not in default state',
  NotInIniOrDef: 'Not in initialization or default state',
  NotInManualCollaps: 'Not in manual collapse state',
  InEmergency: 'Cannot perform this action during emergency state',
  CommunityIsCollapsed: 'Community has collapsed',
  ManuallyCollapsed: 'Community has been manually collapsed',

  // Financial/Coverage Errors
  InsufficientFunds: 'Insufficient funds to complete this transaction.',
  CoverageFullfilled: 'Coverage requirement has already been fulfilled',
  DFNotMet: 'Default fund requirement not met',
  SGMNotFullfilled: 'Subgroup membership requirement not fulfilled',

  // Claim-Related Errors
  ClaimNoOccured: 'No claim has occurred',
  NoClaimOccured: 'No claim has occurred',
  InValidClaim: 'Invalid claim submitted',
  NotClaimant: 'User is not the claimant',

  // Assignment/Membership Errors
  NotAssignedYet: 'Member has not been assigned to a subgroup yet',
  NotIncluded: 'Member is not included in this group',
  OutOfTheCommunity: 'User is not part of the community',
  NotWhiteListed: 'User is not whitelisted',

  // Authorization/Role Errors
  NotFirstSuccessor: 'User is not the first successor',
  NotInSuccessorList: 'User is not in the successor list',
  NotHandingOver: 'Secretary handover is not in progress',
  HandoverAlreadyInProgress: 'Secretary handover is already in progress',
  NeedMoreSuccessor: 'More successors are required',

  // Emergency/Refund Errors
  CannotEmergencyRefund: 'Emergency refund is not available',
  EmergencyGracePeriod: 'Currently in emergency grace period',
  DelayInitiated: 'Delay has been initiated',
  NotReorged: 'Reorganization has not been completed',
  WLCAvailable: 'Whitelist capacity is available',

  // Payment/Financial State Errors
  NotPaidInvalid: 'Payment is invalid or not completed',

  // Technical/System Errors
  ReentrancyGuardReentrantCall: 'Reentrancy attack detected - transaction blocked',

  // Secretary-specific Errors
  SecretaryInvalidOwner: 'Invalid secretary owner address',
  SecretaryUnauthorizedSecretary: 'Unauthorized secretary account',
};

/**
 * Get user-friendly error message for a contract error
 * @param {string} errorName - The contract error name
 * @returns {string} User-friendly error message
 */
export function getContractErrorMessage(errorName: string): string {
  const message = CONTRACT_ERROR_MAPPING[errorName];
  if (message) {
    return message;
  }

  // Return a generic but informative message if error name not found
  return `Contract error: ${errorName}`;
}

/**
 * Get all supported contract error names
 * @returns {string[]} Array of all contract error names
 */
export function getSupportedErrorNames(): Array<string> {
  return Object.keys(CONTRACT_ERROR_MAPPING);
}

/**
 * Check if an error name is supported
 * @param {string} errorName - The error name to check
 * @returns {boolean} True if the error name is supported
 */
export function isErrorNameSupported(errorName: string): boolean {
  return errorName in CONTRACT_ERROR_MAPPING;
}
