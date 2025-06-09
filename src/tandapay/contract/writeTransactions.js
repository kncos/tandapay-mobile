import { ethers } from 'ethers';

// Standardized metadata structure
const createTransaction = (displayName, description, role, requiresParams = false) => ({
  displayName,
  description,
  role,
  requiresParams,
});

// =============================================================================
// MEMBER TRANSACTIONS
// =============================================================================

/**
 * Use case -- The user will join the community and transfer the 11/12th of the individual savings amount's fund.
 */
export function joinCommunity(contract) {
  return contract.joinCommunity();
}
joinCommunity.meta = createTransaction(
  'Join Community',
  'Join the TandaPay community and transfer funds',
  'member',
  false
);

/**
 * Use case -- This function will be used to approve the SubGroup assignment of the member
 * @param approve whether or not to approve the subgroup assignment
 */
export function approveSubgroupAssignment(contract, approve = true) {
  return contract.approveSubgroupAssignment(approve);
}
approveSubgroupAssignment.meta = createTransaction(
  'Approve Subgroup Assignment',
  'Approve your subgroup assignment',
  'member',
  true
);

/**
 * Use case -- This function will be used to approve a new SubGroup member by the existing SubGroup member if the new member is being re-orged.
 * @param subgroupId subgroup Id of the subgroup you want to approve the assignment in
 * @param newMemberId member Id of the member you want to assign
 * @param approve boolean value indicating whether or not to approve the member
 */
export function approveNewSubgroupMember(contract, subgroupId, newMemberId, approve = true) {
  return contract.approveNewSubgroupMember(
    ethers.BigNumber.from(subgroupId),
    ethers.BigNumber.from(newMemberId),
    approve
  );
}
approveNewSubgroupMember.meta = createTransaction(
  'Approve New Subgroup Member',
  'Approve a new member joining your subgroup',
  'member',
  true
);

/**
 * Use case -- Member will be able to exit from a SubGroup using this function.
 */
export function leaveSubgroup(contract) {
  return contract.leaveSubgroup();
}
leaveSubgroup.meta = createTransaction(
  'Leave Subgroup',
  'Exit from your current subgroup',
  'member',
  false
);

/**
 * Use case -- Member will be able to defects using this function.
 */
export function defectFromCommunity(contract) {
  return contract.defectFromCommunity();
}
defectFromCommunity.meta = createTransaction(
  'Defect from Community',
  'Leave the TandaPay community entirely',
  'member',
  false
);

/**
 * Use case -- The Valid members will be able to pay the upcoming period's premium using this function
 * @param useAvailableBalance Use withdrawable balance to pay premium or not
 */
export function payPremium(contract, useAvailableBalance = false) {
  return contract.payPremium(useAvailableBalance);
}
payPremium.meta = createTransaction(
  'Pay Premium',
  'Pay your upcoming period premium',
  'member',
  true
);

/**
 * Use case -- The valid members who are in line of the secretary successors list and are being voted for the secretary can accept the secretary using this function.
 */
export function acceptSecretaryRole(contract) {
  return contract.acceptSecretaryRole();
}
acceptSecretaryRole.meta = createTransaction(
  'Accept Secretary Role',
  'Accept the secretary position',
  'member',
  false
);

/**
 * Use case --  The valid members who are in the line of the secretary successors list can call this function and set up another valid member who is also in the line of the secretary successors list as a secretary in emergencies.
 * a successor can send this transaction and specify a new secretary to take over in the event of an
 * emergency. For it to actually work, multiple successors have to send this while specifying the same new secretary
 * @param newSecretaryWalletAddress wallet address of the new secretary
 */
export function emergencySecretaryHandoff(contract, newSecretaryWalletAddress) {
  return contract.emergencySecretaryHandoff(newSecretaryWalletAddress);
}
emergencySecretaryHandoff.meta = createTransaction(
  'Emergency Secretary Handoff',
  'Set new secretary in emergency situations',
  'member',
  true
);

/**
 * Use case -- The member will be able to withdraw their available fund by calling this function.
 * allows a user to withdraw their available funds, i.e. refunds from periods in which no claim occurred
 */
export function withdrawRefund(contract) {
  return contract.withdrawRefund();
}
withdrawRefund.meta = createTransaction(
  'Withdraw Refund',
  'Withdraw your available funds and refunds',
  'member',
  false
);

/**
 * Use case -- The members who are eligible for the coverage will be able to submit for claim using this function.
 */
export function submitClaim(contract) {
  return contract.submitClaim();
}
submitClaim.meta = createTransaction(
  'Submit Claim',
  'Submit an insurance claim to your group',
  'member',
  false
);

/**
 * Use case -- The whitelisted claimant will be able to withdraw the claim amount by calling this function
 * @param forfeit whether to forfeit the claim
 */
export function withdrawClaimFund(contract, forfeit = false) {
  return contract.withdrawClaimFund(forfeit);
}
withdrawClaimFund.meta = createTransaction(
  'Withdraw Claim Fund',
  'Withdraw your approved claim amount',
  'member',
  true
);

// =============================================================================
// SECRETARY TRANSACTIONS
// =============================================================================

/**
 * Add a member to the TandaPay community (as the secretary)
 * @param memberWalletAddress wallet address of the member to add
 * @returns A transaction response after the transaction has been included on a block
 */
export function addMemberToCommunity(contract, memberWalletAddress) {
  return contract.addMemberToCommunity(memberWalletAddress);
}
addMemberToCommunity.meta = createTransaction(
  'Add Member to Community',
  'Add a new member to the community (Secretary only)',
  'secretary',
  true
);

/**
 * This function is used to create a new subgroup for the TandaPay community.
 * @returns A transaction response after the transaction has been included on a block
 */
export function createSubgroup(contract) {
  return contract.createSubgroup();
}
createSubgroup.meta = createTransaction(
  'Create Subgroup',
  'Create a new subgroup within the community',
  'secretary',
  false
);

/**
 * This function is used to assign a member to a SubGroup.
 * @param memberWalletAddress wallet address of the member to assign
 * @param subgroupId ID of the subgroup to assign the member to
 * @param isReorging whether this is a re-organization assignment
 * @returns A transaction response after the transaction has been included on a block
 */
export function assignMemberToSubgroup(contract, memberWalletAddress, subgroupId, isReorging = false) {
  return contract.assignMemberToSubgroup(
    memberWalletAddress,
    ethers.BigNumber.from(subgroupId),
    isReorging
  );
}
assignMemberToSubgroup.meta = createTransaction(
  'Assign Member to Subgroup',
  'Assign a member to a specific subgroup',
  'secretary',
  true
);

/**
 * This function is used to set the default coverage and initiate the default state of the community.
 * @param totalCoverage the total coverage amount to set
 * @returns A transaction response after the transaction has been included on a block
 */
export function initiateDefaultState(contract, totalCoverage) {
  return contract.initiateDefaultState(totalCoverage);
}
initiateDefaultState.meta = createTransaction(
  'Initiate Default State',
  'Set default coverage and initiate community state',
  'secretary',
  true
);

/**
 * This function is used to whitelist a claim submitted by the claimants.
 * @param claimId claim ID for the claim to whitelist
 * @returns A transaction response after the transaction has been included on a block
 */
export function whitelistClaim(contract, claimId) {
  return contract.whitelistClaim(ethers.BigNumber.from(claimId));
}
whitelistClaim.meta = createTransaction(
  'Whitelist Claim',
  'Approve a submitted insurance claim',
  'secretary',
  true
);

/**
 * This function is used to update the coverage amount for the TandaPay community. Can only be called when the
 * community is in the initialization or default state.
 * @param totalCoverage the new total coverage amount
 * @returns A transaction response after the transaction has been included on a block
 */
export function updateCoverageAmount(contract, totalCoverage) {
  return contract.updateCoverageAmount(totalCoverage);
}
updateCoverageAmount.meta = createTransaction(
  'Update Coverage Amount',
  'Update the total coverage amount for the community',
  'secretary',
  true
);

/**
 * Defines a list of successor candidates for the Secretary role. If `12 <= (community size) <= 35`,
 * then at least 2 successors must be defined. If `35 < (community size)`, at least 6 successors must
 * be defined.
 * @param successorListWalletAddresses array of wallet addresses for secretary successors
 * @returns A transaction response after the transaction has been included on a block
 */
export function defineSecretarySuccessorList(contract, successorListWalletAddresses) {
  return contract.defineSecretarySuccessorList(successorListWalletAddresses);
}
defineSecretarySuccessorList.meta = createTransaction(
  'Define Secretary Successor List',
  'Set candidates for secretary succession',
  'secretary',
  true
);

/**
 * Allows the secretary to give their position to one of their successors
 * @param successorWalletAddress wallet address of the successor to hand over to
 * @returns A transaction response after the transaction has been included on a block
 */
export function handoverSecretaryRoleToSuccessor(contract, successorWalletAddress) {
  return contract.handoverSecretaryRoleToSuccessor(successorWalletAddress);
}
handoverSecretaryRoleToSuccessor.meta = createTransaction(
  'Handover Secretary Role',
  'Transfer secretary position to a successor',
  'secretary',
  true
);

/**
 * This function is used to inject funds into the community by the secretary. Basically, this is a way
 * that the secretary can save their TandaPay community which may be on the verge of collapse, by
 * putting their own funds into the pot (i.e., the community escrow) to ensure that the coverage requirement
 * (i.e., community escrow amount = total coverage) is met.
 * @returns A transaction response after the transaction has been included on a block
 */
export function injectFunds(contract) {
  return contract.injectFunds();
}
injectFunds.meta = createTransaction(
  'Inject Funds',
  'Inject funds to save community from collapse',
  'secretary',
  false
);

/**
 * If there is a shortfall in the coverage requirement, but every member of the community has enough
 * in their savings accounts that they can be equally debited to make up for the shortfall, then the
 * secretary may call this transaction to make that happen
 * @returns A transaction response after the transaction has been included on a block
 */
export function divideShortfall(contract) {
  return contract.divideShortfall();
}
divideShortfall.meta = createTransaction(
  'Divide Shortfall',
  'Divide coverage shortfall among all members',
  'secretary',
  false
);

/**
 * Introduces an additional day before the period will end. This gives members more time to pay
 * their premiums and adds a delay before the secretary may advance the period
 * @returns A transaction response after the transaction has been included on a block
 */
export function extendPeriodByOneDay(contract) {
  return contract.extendPeriodByOneDay();
}
extendPeriodByOneDay.meta = createTransaction(
  'Extend Period by One Day',
  'Add one day before period ends',
  'secretary',
  false
);

/**
 * This method is used to advance to the next period. Must be called after the previous period has
 * ended.
 * @returns A transaction response after the transaction has been included on a block
 */
export function advancePeriod(contract) {
  return contract.advancePeriod();
}
advancePeriod.meta = createTransaction(
  'Advance Period',
  'Advance to the next period',
  'secretary',
  false
);

// =============================================================================
// PUBLIC TRANSACTIONS
// =============================================================================

/**
 * Issues any due refunds within the TandaPay community. Must be called between 72 and 96 hours
 * of the beginning of a TandaPay period, and only when no claim was whitelisted in the previous period.
 * @returns A transaction response
 */
export function issueRefund(contract) {
  return contract.issueRefund(true);
}
issueRefund.meta = createTransaction(
  'Issue Refund',
  'Issues due refunds within the community',
  'public',
  false
);

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all write transactions with their metadata
 */
export function getAllWriteTransactions() {
  const transactions = [];

  // Get all exported functions from this module
  const moduleExports = {
    joinCommunity,
    approveSubgroupAssignment,
    approveNewSubgroupMember,
    leaveSubgroup,
    defectFromCommunity,
    payPremium,
    acceptSecretaryRole,
    emergencySecretaryHandoff,
    withdrawRefund,
    submitClaim,
    withdrawClaimFund,
    addMemberToCommunity,
    createSubgroup,
    assignMemberToSubgroup,
    initiateDefaultState,
    whitelistClaim,
    updateCoverageAmount,
    defineSecretarySuccessorList,
    handoverSecretaryRoleToSuccessor,
    injectFunds,
    divideShortfall,
    extendPeriodByOneDay,
    advancePeriod,
    issueRefund,
  };

  Object.keys(moduleExports).forEach((functionName) => {
    const func = moduleExports[functionName];
    if (func.meta) {
      transactions.push({
        functionName,
        func,
        ...func.meta,
      });
    }
  });

  return transactions;
}

/**
 * Get write transactions filtered by role
 */
export function getWriteTransactionsByRole(role) {
  return getAllWriteTransactions().filter((transaction) => transaction.role === role);
}

/**
 * Get write transactions that don't require parameters
 */
export function getParameterlessWriteTransactions() {
  return getAllWriteTransactions().filter((transaction) => !transaction.requiresParams);
}
