// @flow strict-local

// Flow type for ethers BigNumber - using mixed since ethers is not Flow-typed
export type BigNumber = mixed;

/** Enum type representing the different states the TandaPay community can be in */
export const TandaPayState = Object.freeze({
  /**
   * Initialization state, the TandaPay community starts in this state. The smart contract requires at least 12 members to
   * be added to the community, and for them to be assigned into at least 3 subgroups, before the state can be updated to default.
   * Additional requirements (or warnings) should include: 1.) secretary has defined at least 2 successors, 2.) everyone has enough
   * to cover 110% of their premium, so that when they pay 220% can be paid in the first default period.
   */
  Initialization: 0,
  /** Default state of the community, this happens when the community hasn't had any claims that caused individuals to defect */
  Default: 1,
  /** Fractured state of the community, the community enters this state when there have been claims and at least 12% of the community defected */
  Fractured: 2,
  /** Collapsed state. The community is essentially destroyed. They failed to meet their coverage requirement and thus have been terminated. */
  Collapsed: 3,
});

export type TandaPayStateType = $Values<typeof TandaPayState>;

/** Enum type representing the different roles a member can have in a TandaPay community */
export const TandaPayRole = Object.freeze({
  /** None, this is a default placeholder to represent individuals not affiliated with the community */
  None: 0,
  /** A regular member of the TandaPay community, who does not have privileges to perform secretary write actions */
  Member: 1,
  /** The secretary of the TandaPay community. Has permissions to perform secretary write actions */
  Secretary: 2,
});

export type TandaPayRoleType = $Values<typeof TandaPayRole>;

/** Enum type representing the status of a member as it relates to their subgroup assignment. */
export const AssignmentStatus = Object.freeze({
  /**
   * The member has not been assigned to a subgroup by the secretary.
   * @deprecated This doesn't appear to be used in the smart contract? except maybe as a default value
   */
  Unassigned: 0,
  /** The member has been added to the community, but not assigned to a subgroup yet. */
  AddedBySecretary: 1,
  /** The member has been assigned to a subgroup by the secretary */
  AssignedToGroup: 2,
  /**
   * If a member is reorging (changing subgroups because their previous subgroup became invalid), the member has to approve of their new
   * subgroup assignment. They receive this state after the secretary has assigned them to a group, AND the member themselves has approved it.
   */
  ApprovedByMember: 3,
  /**
   * If a member is reorging (changing subgroups because their previous subgroup became invalid), first the secretary has to assign them to
   * a new subgroup, then the member themselves has to approve this new subgroup assignment, and finally a member of that subgroup must approve
   * for them to join.
   * @deprecated It seems like this value goes unused in the smart contract, and instead, when a subgroup member approves them, they go straight
   *  to assignment Successful
   */
  ApprovedByGroupMember: 4,
  /** The member has successfully been assigned to a subgroup */
  AssignmentSuccessful: 5,
  /**
   * The member is reorging (changing subgroups because their previous subgroup became invalid), and they refused the new subgroup
   * that the secretary assigned them to
   */
  CancelledByMember: 6,
  /**
   * The member is reorging (changing subgroups because their previous subgroup became invalid), and one of the members of their new subgroup
   * veto'd them joining the subgroup
   */
  CancelledByGroupMember: 7,
});

export type AssignmentStatusType = $Values<typeof AssignmentStatus>;

/**
 * Represents a member's status within a TandaPay community, as it relates to their premium payments, subgroup
 * dynamics, and how they will be treated w.r.t. claims and coverage.
 */
export const MemberStatus = Object.freeze({
  /** @deprecated Doesn't seem to be used in the smart contract? could be a default placeholder. Called `UnAssigned` in the smart contract */
  None: 0,
  /**
   * Members seem to get this status upon being added to the community by the secretary. Members who
   * are joining after the community is in the default state must have this status in order to send a
   * "join community" transaction. NOTE: called `Assigned` in the smart contract, renamed to `Added` here
   */
  Added: 1,
  /**
   * Members receive this status if they are joining in the default state, after the secretary has added them to the community,
   * and the member themselves has sent the "join community" transaction.
   */
  New: 2,
  /** @deprecated Seems to be unused in the smart contract, not sure why it's here. Only included for compatibility reasons. */
  SAEPaid: 3,
  /**
   * Members have this status when they have met the criteria of being in a valid subgroup and also paid their premiums.
   * When they have this status, it means that they have active coverage and are allowed to make a claim.
   */
  Valid: 4,
  /**
   * If a member pays their premium, but then individuals in their subgroup leave the community, resulting in their subgroup
   * becoming invalid, they receive this status. When they have this status, they need to reorg into a new subgroup
   */
  PaidInvalid: 5,
  /**
   * If a member fails to pay their premium, but the community is in the default state, this removes their coverage but allows
   * them to remain in the community for an extra period and pay their next premium to get their coverage back.
   */
  UnpaidInvalid: 6,
  /**
   * This means that a member has successfully reorganized into a new subgroup after previously being paid-invalid. They become
   * `Valid` again if their new subgroup doesn't become invalid and they remain in good standing by paying their premiums.
   */
  Reorged: 7,
  /** Users get this status when they leave the community, either by not successfully reorging or by failing to pay premiums. */
  UserLeft: 8,
  /** Users get this status when they opt to defect from the community while having coverage due to disagreeing with a claim. */
  Defected: 9,
  /** Users get this status when they leave the community following defections. Typically when they leave the community after losing coverage */
  UserQuit: 10,
  /** @deprecated This also seems to not be used by the smart contract. kept for compatibility reasons */
  REJECTEDBYGM: 11,
});

export type MemberStatusType = $Values<typeof MemberStatus>;

/** Contains information about a given subgroup, including its subgroup ID, addresses of its members, and whether it is a valid subgroup */
export type SubgroupInfo = {|
  /** the Subgroup ID */
  +id: BigNumber,
  /** Addresses of each member in this subgroup */
  +members: $ReadOnlyArray<string>,
  /** validity of the subgroup (a subgroup is valid if it has between 4 and 7 members, inclusive) */
  +isValid: boolean,
|};

/**
 * Contains information about a given claim, including the Claim ID, the amount, whether it was whitelisted by the secretary,
 * the wallet address of the claimant, the subgroup ID of the claimant, and whether or not the claimant has accepted the funds
 * or has chosen to relinquish them.
 */
export type ClaimInfo = {|
  /** Claim ID */
  +id: BigNumber,
  /** Period ID the claim occurred in */
  +periodId: BigNumber,
  /** Amount of the claim */
  +amount: BigNumber,
  /** Whether the claim was whitelisted by the secretary */
  +isWhitelisted: boolean,
  /** Wallet address of the claimant */
  +claimantWalletAddress: string,
  /** ID of the subgroup the claimant belongs to */
  +claimantSubgroupId: BigNumber,
  /** Whether or not the claimant has claimed these funds */
  +hasClaimantClaimedFunds: boolean,
|};

/**
 * Contains information about a given member of the TandaPay community.
 */
export type MemberInfo = {|
  /** Member ID */
  +id: BigNumber,
  /** ID of the subgroup this member belongs to */
  +subgroupId: BigNumber,
  /** This member's wallet address */
  +walletAddress: string,
  /** Amount the member contributed to the community escrow this period */
  +communityEscrowAmount: BigNumber,
  /** Amount the member contributed to their savings escrow this period */
  +savingsEscrowAmount: BigNumber,
  /** Pending refund the user has */
  +pendingRefundAmount: BigNumber,
  /** Refunds that are available for the user to withdraw */
  +availableToWithdrawAmount: BigNumber,
  /** Whether or not the user has coverage this period (whether or not they can make a claim) */
  +isEligibleForCoverageThisPeriod: boolean,
  /** Whether or not the user paid their premium this period. */
  +isPremiumPaidThisPeriod: boolean,
  /** Queued refund amount for this period */
  +queuedRefundAmountThisPeriod: BigNumber,
  +memberStatus: MemberStatusType,
  +assignmentStatus: AssignmentStatusType,
|};

/** Contains information about the period, including start/end times, total coverage, total premiums paid, and all claim IDs */
export type PeriodInfo = {|
  /** The timestamp when the period begins */
  +startTimestamp: BigNumber,
  /** This is the timestamp that the period ended at, or is currently scheduled to end at. Warning: for current periods, the secretary can push this back. */
  +endTimestamp: BigNumber,
  /** This is the total amount of coverage that the community had this period */
  +coverageAmount: BigNumber,
  /** Pretty sure this includes savings contributions */
  +totalPremiumsPaid: BigNumber,
  /** an array containing the IDs of each claim that occurred this period */
  +claimIds: $ReadOnlyArray<BigNumber>,
|};
