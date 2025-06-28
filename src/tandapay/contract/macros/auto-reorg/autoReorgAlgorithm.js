// @flow strict-local

/**
 * Auto-Reorganization Algorithm
 *
 * Adapted from tp-wrapper-e2 auto_reorg.ts
 * Reorganizes subgroups such that every member has a subgroup, and every subgroup is valid.
 */

// Constants from tp-wrapper-e2 tandapay_constants.ts
const SUBGROUP_CONSTANTS = {
  minSize: 4,
  maxSize: 7,
  noSubgroupIdPlaceholder: 0,
};

// Types
type SubgroupId = number;
type Members = string[]; // Array of member addresses
type Subgroups = Map<SubgroupId, Members>;
type SizeToSubgroupId = Map<number, SubgroupId[]>;

// Error messages
const ErrorMessages = {
  UNDEFINED_MEMBER: 'Auto reorg error: undefined member encountered',
  MIN_SIZE_VIOLATION: 'Cannot make new groups when needsAssigned is smaller than the minimum subgroup size',
  UNDEFINED_ASSIGNMENT: 'Got undefined when making new subgroups',
};

export type AutoReorgParameters = {|
  /** mapping between subgroup IDs and the subgroup members lists */
  subgroups: Map<SubgroupId, Members>,
  /** a list of all members that need to be assigned to new subgroups to be valid */
  needsAssigned: Members,
|};

type SubroutineParameters = {|
  ...AutoReorgParameters,
  sizeSortedGroups: SizeToSubgroupId,
|};

/**
 * Accepts AutoReorgParameters and filters the subgroups so that we don't have any that are
 * too big or too small -- only valid and empty ones, with members needing to be assigned to
 * subgroups being in the `needsAssigned` array
 * @returns its parameters but with the subgroups filtered and the needsAssigned array including
 * members that were excess in subgroups that were too large
 */
function filterSubgroups({
  subgroups,
  needsAssigned,
}: AutoReorgParameters): AutoReorgParameters {
  const filteredSubgroups = new Map<SubgroupId, Members>();
  const newNeedsAssigned: Members = [...needsAssigned];

  for (const [id, members] of subgroups) {
    // we want to ensure that only valid members are in the subgroup
    const validMembers = members.filter((m) => !needsAssigned.includes(m));
    const finalMembers = [...validMembers];

    // ensure that the subgroup is not too large
    while (finalMembers.length > SUBGROUP_CONSTANTS.maxSize) {
      const member = finalMembers.pop();
      if (member === undefined) {
        throw new Error(ErrorMessages.UNDEFINED_MEMBER);
      }

      newNeedsAssigned.push(member);
    }

    // finally, after those operations have been performed, add it to the
    // filtered subgroups result. It's possible that the subgroup hasn't been modified
    filteredSubgroups.set(id, finalMembers);
  }

  // return fixed parameters
  return {
    subgroups: filteredSubgroups,
    needsAssigned: newNeedsAssigned,
  };
}

/** groups subgroups by their member count */
function sortSubgroupsBySize(subgroups: Subgroups): SizeToSubgroupId {
  // map to store the result. key will be the size of the subgroup,
  // value will be all of the subgroup IDs that are of that size
  const sizeSortedGroups = new Map<number, SubgroupId[]>();
  for (const [id, members] of subgroups) {
    // get the size. If we have already seen subgroups of this
    // size, append it to the array. Otherwise, initialize a new
    // array with this being the first one
    const size = members.length;
    if (sizeSortedGroups.has(size)) {
      const existing = sizeSortedGroups.get(size);
      if (existing) {
        existing.push(id);
      }
    } else {
      sizeSortedGroups.set(size, [id]);
    }
  }
  return sizeSortedGroups;
}

/**
 * Returns the total number of slots available across all existing valid
 * subgroups, for reorging members to be assigned into
 */
function getValidCapacity(sortedSubgroups: SizeToSubgroupId): number {
  // count the total slots available
  let slotsAvailable = 0;

  // find subgroups that are at least the minimum size, and
  // less than the maximum size
  for (let i = SUBGROUP_CONSTANTS.minSize; i < SUBGROUP_CONSTANTS.maxSize; i++) {
    // this is the capacity of subgroups this size
    const capacity = SUBGROUP_CONSTANTS.maxSize - i;
    // this is how many of them we have
    const numGroupsThisSize = sortedSubgroups.get(i)?.length;
    // this can be undefined if there were no subgroups of this size
    if (numGroupsThisSize === undefined) {
      continue;
    }

    // otherwise, the slots available across all subgroups of this size will be
    // the capacity multiplied by the number of subgroups
    slotsAvailable += numGroupsThisSize * capacity;
  }
  return slotsAvailable;
}

/**
 * Accepts a list of members that need to be divided into new valid subgroups, and
 * returns a 2D array of addresses, where each subarray represents a list of members
 * that can make up a valid subgroup. Every subarray is guaranteed to be at least
 * SUBGROUP_CONSTANTS.minSize and to not exceed SUBGROUP_CONSTANTS.maxSize
 */
function makeNewGroups(needsAssigned: string[]): Members[] {
  // if we don't have enough members to make new subgroups out of,
  // then we can't make any valid subgroups. throw an error.
  if (needsAssigned.length < SUBGROUP_CONSTANTS.minSize) {
    throw new Error(ErrorMessages.MIN_SIZE_VIOLATION);
  }

  // we'll store a list of members-lists, where each members-list
  // will represent a separate subgroup
  const newSubgroups: Members[] = [];

  // this is the current members-list we're building
  let curSubgroup: Members = [];
  // while we have members needing assigned
  while (needsAssigned.length > 0) {
    // pop them off
    const m = needsAssigned.pop();
    if (m === undefined) {
      throw new Error(ErrorMessages.UNDEFINED_ASSIGNMENT);
    }

    // add them to the current group
    curSubgroup.push(m);
    // if it reaches the min size, add this to the list of new
    // subgroups we're making and start building the next subgroup
    if (curSubgroup.length === SUBGROUP_CONSTANTS.minSize) {
      newSubgroups.push([...curSubgroup]);
      curSubgroup = [];
    }
  }

  // if there were any stragglers, that means the last group we
  // were building did not have enough members to make a complete subgroup.
  // Given that `(SUBGROUP_CONSTANTS.minSize) + (SUBGROUP_CONSTANTS.minSize-1) === SUBGROUP_CONSTANTS.maxSize`,
  // that means it can never make a subgroup too large to simply add these
  // stragglers to one of the subgroups we just made. So, one of them will be larger
  // than the minimum size, but that's fine.
  if (curSubgroup.length > 0) {
    if (newSubgroups.length > 0) {
      newSubgroups[0].push(...curSubgroup);
    }
  }

  return newSubgroups;
}

/**
 * This is used for case 1, when we have enough members needing reassigned that we can make
 * new subgroups, then we can just do that. For the subgroup IDs, first it will reuse existing
 * empty subgroup IDs, then it will go on to making new subgroup IDs that may not exist yet
 */
function assignToEmptyGroups(params: SubroutineParameters): SubroutineParameters {
  const { subgroups, needsAssigned, sizeSortedGroups } = params;
  // divide all of the members needing assigned into separate groups
  const memberGroupings = makeNewGroups([...needsAssigned]); // Copy array to avoid mutation
  // get an array of all empty subgroup IDs
  const emptySubgroupIds = [...(sizeSortedGroups.get(0) ?? [])]; // Copy array
  // this is used so that we know what IDs to use for any new
  // subgroups we create
  const maxSubgroupId = Math.max(...Array.from(subgroups.keys()), 0);

  // first exhaust the empty subgroups. While there are empty subgroups
  // we can use and we still have member groupings we can put in them
  while (emptySubgroupIds.length > 0 && memberGroupings.length > 0) {
    // get a subgroup id to use and a group of members to place in it
    const id = emptySubgroupIds.pop();
    const members = memberGroupings.pop();
    // if either of those is invalid, throw an error
    if (!id || !members) {
      throw new Error(ErrorMessages.UNDEFINED_ASSIGNMENT);
    }

    // modify the subgroups with this part of the solution
    subgroups.set(id, members);
  }

  // we'll start at this ID, as no subgroup has this ID yet
  let newSubgroupId = maxSubgroupId + 1;
  // so long as we still have member groupings, we'll start
  // making new subgroups to place them in
  while (memberGroupings.length > 0) {
    // get a member grouping to make a new subgroup for
    const members = memberGroupings.pop();
    // it should never be undefined but if it is throw an error
    if (!members) {
      throw new Error(ErrorMessages.UNDEFINED_ASSIGNMENT);
    }

    // create new subgroup for them as part of the solution
    subgroups.set(newSubgroupId, members);
    newSubgroupId += 1;
  }

  // return modified params; subgroups will have been modified
  // with the members needing assigned being placed in their new
  // valid subgroups
  return { subgroups, needsAssigned: [], sizeSortedGroups };
}

/**
 * Case 2. This happens when we don't have enough members needing reassignment
 * to put them all together in their own subgroup(s), but we do have enough capacity
 * within existing valid subgroups to add them to.
 */
function distributeToExistingSubgroups(params: SubroutineParameters): SubroutineParameters {
  const {
    subgroups,
    needsAssigned,
    sizeSortedGroups: initialSizeSortedSubgroups,
  } = params;
  let sizeSortedGroups = initialSizeSortedSubgroups;
  const remainingNeedsAssigned = [...needsAssigned]; // Copy to avoid mutation

  // go through every valid subgroup size that is not max capacity
  for (
    let i = SUBGROUP_CONSTANTS.minSize;
    i < SUBGROUP_CONSTANTS.maxSize;
    i += 1
  ) {
    // get all of the subgroup ids at this size
    const groups = sizeSortedGroups.get(i);

    // if there are none, just skip it
    if (!groups || groups.length === 0) {
      continue;
    }
    // if nobody else needs assigned, we can exit
    if (remainingNeedsAssigned.length === 0) {
      break;
    }

    // otherwise, go through each subgroup of this size
    for (const id of groups) {
      // if nobody else needs assigned, we can exit
      if (remainingNeedsAssigned.length === 0) {
        break;
      }

      // assign a member to this subgroup
      const memberToAssign = remainingNeedsAssigned.pop();
      if (memberToAssign) {
        const existingMembers = subgroups.get(id);
        if (existingMembers) {
          existingMembers.push(memberToAssign);
        }
      }
    }

    // redo the sorting because the subgroup sizes have changed
    sizeSortedGroups = sortSubgroupsBySize(subgroups);
  }

  // subgroups will have been modified with the new assignments
  // being reflected
  return { subgroups, needsAssigned: remainingNeedsAssigned, sizeSortedGroups };
}

/**
 * Case 3; this happens when we don't have enough space in existing valid subgroups for
 * for members to be assigned to, and we also don't have enough members needing assignment
 * for them to have a subgroup of their own. In this case, we will have to remove members
 * from an existing valid subgroup so that there are enough needing assignment that they
 * can make a valid subgroup of their own
 */
function rebalanceGroupsForNewFormation(params: SubroutineParameters): SubroutineParameters {
  const {
    subgroups,
    needsAssigned,
    sizeSortedGroups: initialSizeSortedSubgroups,
  } = params;
  let sizeSortedGroups = initialSizeSortedSubgroups;
  const updatedNeedsAssigned = [...needsAssigned]; // Copy to avoid mutation

  // we'll start with the biggest subgroups and work our way down through
  // each valid subgroup that is big enough that removing a member won't
  // cause it to become invalid
  for (let i = SUBGROUP_CONSTANTS.maxSize; i > SUBGROUP_CONSTANTS.minSize; i--) {
    // get all of the groups of this size
    const groups = sizeSortedGroups.get(i);
    // if there are none, just continue to the next smallest size
    if (!groups || groups.length === 0) {
      continue;
    }

    // go through each group
    for (const id of groups) {
      // get the members in that group
      const members = subgroups.get(id);
      if (!members) {
        continue;
      }

      // so long as we have enough members to pop out of this group and we don't have
      // enough needing assignment to make a valid subgroup yet, then remove members and
      // mark them as needing assignment
      while (
        members.length > SUBGROUP_CONSTANTS.minSize
        && updatedNeedsAssigned.length < SUBGROUP_CONSTANTS.minSize
      ) {
        const removedMember = members.pop();
        // should never happen but if it does throw an error
        if (!removedMember) {
          throw new Error(ErrorMessages.UNDEFINED_MEMBER);
        }

        // mark as needs assignment
        updatedNeedsAssigned.push(removedMember);
      }
    }
  }

  // since subgroup sizes have changed, redo sorting
  sizeSortedGroups = sortSubgroupsBySize(subgroups);
  // subgroups has been modified to reflect the new changes
  return { subgroups, needsAssigned: updatedNeedsAssigned, sizeSortedGroups };
}

/** internal auto-reorg method that is the entry point for the actual algorithm */
function ar(params: SubroutineParameters): Map<SubgroupId, Members> {
  // total number of slots in existing valid subgroups that we could potentially
  // assign reorging members into
  const validCapacity = getValidCapacity(params.sizeSortedGroups);

  // case 1: make new subgroups
  if (params.needsAssigned.length >= SUBGROUP_CONSTANTS.minSize) {
    const result = assignToEmptyGroups(params);
    return result.subgroups;
    // case 2: assign to existing subgroups
  } else if (validCapacity >= params.needsAssigned.length) {
    const result = distributeToExistingSubgroups(params);
    return result.subgroups;
    // case 3: we don't have enough people needing reassigned to make new subgroups,
    // but we also don't have enough capacity in existing valid subgroups to assign them to,
    // so we have to remove people from a valid group (without causing that group to become
    // smaller than the minimum size) and mark them for reassignment so we can potentially
    // make a new subgroup with them + the members already needing reassigned.
  } else {
    const rebalanced = rebalanceGroupsForNewFormation(params);
    return ar(rebalanced);
  }
}

/**
 * Reorganizes subgroups such that every member has a subgroup, and every subgroup is valid.
 * @param params Accepts a k-v mapping of `(subgroupId, memberAddresses)` for existing subgroups
 * as well as a list of members that are needing assigned.
 * @returns a mapping of `(subgroupId, memberAddresses)` k-v pairs
 * that represents all of the members divided into subgroups in such a way that every subgroup
 * is valid and we performed a minimal amount of reassignments to get there.
 */
export function autoReorg(params: AutoReorgParameters): Map<number, string[]> {
  // removes anyone in needsAssigned from the subgroup members lists,
  // and also removes any excess members in any subgroups and adds them
  // to needsAssigned
  const filteredParams = filterSubgroups(params);

  // sorts the subgroups into (size, [ids...]) pairs
  const sizeSortedGroups = sortSubgroupsBySize(filteredParams.subgroups);

  // return the solution
  return ar({
    ...filteredParams,
    sizeSortedGroups,
  });
}
