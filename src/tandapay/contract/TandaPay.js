export const TandaPayInfo = {
  abi: [
    {
      type: 'constructor',
      inputs: [
        { name: '_paymentToken', type: 'address', internalType: 'address' },
        { name: 'owner', type: 'address', internalType: 'address' },
      ],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'EmergencyStartTime',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'acceptSecretaryRole',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'addMemberToCommunity',
      inputs: [{ name: '_member', type: 'address', internalType: 'address' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'advancePeriod',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'approveNewSubgroupMember',
      inputs: [
        { name: '_sId', type: 'uint256', internalType: 'uint256' },
        { name: '_nMemberId', type: 'uint256', internalType: 'uint256' },
        { name: '_accepted', type: 'bool', internalType: 'bool' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'approveSubgroupAssignment',
      inputs: [{ name: '_shouldJoin', type: 'bool', internalType: 'bool' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'assignMemberToSubgroup',
      inputs: [
        { name: '_member', type: 'address', internalType: 'address' },
        { name: '_sId', type: 'uint256', internalType: 'uint256' },
        { name: '_isReorging', type: 'bool', internalType: 'bool' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'beginEmergency',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'createSubgroup',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'defectFromCommunity',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'defineSecretarySuccessorList',
      inputs: [
        { name: '_successors', type: 'address[]', internalType: 'address[]' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'divideShortfall',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'emergencyRefund',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'emergencySecretaryHandoff',
      inputs: [
        { name: '_eSecretary', type: 'address', internalType: 'address' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'emergencyWithdraw',
      inputs: [
        { name: 'to', type: 'address', internalType: 'address' },
        { name: 'amount', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'endEmergency',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'extendPeriodByOneDay',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'getBasePremium',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getClaimIdsInPeriod',
      inputs: [{ name: '_pId', type: 'uint256', internalType: 'uint256' }],
      outputs: [{ name: '', type: 'uint256[]', internalType: 'uint256[]' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getClaimInfo',
      inputs: [
        { name: '_pId', type: 'uint256', internalType: 'uint256' },
        { name: '_cId', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [
        {
          name: '',
          type: 'tuple',
          internalType: 'struct TandaPay.ClaimInfo',
          components: [
            { name: 'id', type: 'uint256', internalType: 'uint256' },
            { name: 'claimant', type: 'address', internalType: 'address' },
            { name: 'claimAmount', type: 'uint256', internalType: 'uint256' },
            { name: 'SGId', type: 'uint256', internalType: 'uint256' },
            { name: 'isWhitelistd', type: 'bool', internalType: 'bool' },
            { name: 'isClaimed', type: 'bool', internalType: 'bool' },
          ],
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getCommunityState',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'uint8',
          internalType: 'enum TandaPay.CommunityStates',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getCurrentClaimId',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getCurrentMemberCount',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getCurrentPeriodId',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getCurrentSubgroupCount',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getDefectorMemberIdsInPeriod',
      inputs: [{ name: '_pId', type: 'uint256', internalType: 'uint256' }],
      outputs: [{ name: '', type: 'uint256[]', internalType: 'uint256[]' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getEmergencyHandOverStartedPeriod',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getEmergencyHandoverStartedAt',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getEmergencySecretaries',
      inputs: [],
      outputs: [{ name: '', type: 'address[2]', internalType: 'address[2]' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getHandoverStartedAt',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getIsAMemberDefectedInPeriod',
      inputs: [{ name: '_pId', type: 'uint256', internalType: 'uint256' }],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getIsAllMemberNotPaidInPeriod',
      inputs: [{ name: '_pId', type: 'uint256', internalType: 'uint256' }],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getIsHandingOver',
      inputs: [],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getMemberIdFromAddress',
      inputs: [{ name: '_member', type: 'address', internalType: 'address' }],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getMemberInfoFromAddress',
      inputs: [
        { name: '_member', type: 'address', internalType: 'address' },
        { name: '_pId', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [
        {
          name: '',
          type: 'tuple',
          internalType: 'struct TandaPay.DemoMemberInfo',
          components: [
            { name: 'memberId', type: 'uint256', internalType: 'uint256' },
            {
              name: 'associatedGroupId',
              type: 'uint256',
              internalType: 'uint256',
            },
            { name: 'member', type: 'address', internalType: 'address' },
            { name: 'cEscrowAmount', type: 'uint256', internalType: 'uint256' },
            {
              name: 'ISEscorwAmount',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'pendingRefundAmount',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'availableToWithdraw',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'eligibleForCoverageInPeriod',
              type: 'bool',
              internalType: 'bool',
            },
            { name: 'isPremiumPaid', type: 'bool', internalType: 'bool' },
            {
              name: 'idToQuedRefundAmount',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'status',
              type: 'uint8',
              internalType: 'enum TandaPayEvents.MemberStatus',
            },
            {
              name: 'assignment',
              type: 'uint8',
              internalType: 'enum TandaPay.AssignmentStatus',
            },
          ],
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getMemberInfoFromId',
      inputs: [
        { name: '_memberId', type: 'uint256', internalType: 'uint256' },
        { name: '_pId', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [
        {
          name: '',
          type: 'tuple',
          internalType: 'struct TandaPay.DemoMemberInfo',
          components: [
            { name: 'memberId', type: 'uint256', internalType: 'uint256' },
            {
              name: 'associatedGroupId',
              type: 'uint256',
              internalType: 'uint256',
            },
            { name: 'member', type: 'address', internalType: 'address' },
            { name: 'cEscrowAmount', type: 'uint256', internalType: 'uint256' },
            {
              name: 'ISEscorwAmount',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'pendingRefundAmount',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'availableToWithdraw',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'eligibleForCoverageInPeriod',
              type: 'bool',
              internalType: 'bool',
            },
            { name: 'isPremiumPaid', type: 'bool', internalType: 'bool' },
            {
              name: 'idToQuedRefundAmount',
              type: 'uint256',
              internalType: 'uint256',
            },
            {
              name: 'status',
              type: 'uint8',
              internalType: 'enum TandaPayEvents.MemberStatus',
            },
            {
              name: 'assignment',
              type: 'uint8',
              internalType: 'enum TandaPay.AssignmentStatus',
            },
          ],
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getPaymentTokenAddress',
      inputs: [],
      outputs: [{ name: '', type: 'address', internalType: 'address' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getPeriodIdToPeriodInfo',
      inputs: [{ name: '_pId', type: 'uint256', internalType: 'uint256' }],
      outputs: [
        {
          name: '',
          type: 'tuple',
          internalType: 'struct TandaPay.PeriodInfo',
          components: [
            { name: 'startedAt', type: 'uint256', internalType: 'uint256' },
            { name: 'willEndAt', type: 'uint256', internalType: 'uint256' },
            { name: 'claimIds', type: 'uint256[]', internalType: 'uint256[]' },
            { name: 'coverage', type: 'uint256', internalType: 'uint256' },
            { name: 'totalPaid', type: 'uint256', internalType: 'uint256' },
          ],
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getSecretaryAddress',
      inputs: [],
      outputs: [{ name: '', type: 'address', internalType: 'address' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getSecretarySuccessorList',
      inputs: [],
      outputs: [{ name: '', type: 'address[]', internalType: 'address[]' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getSubgroupInfo',
      inputs: [{ name: '_sId', type: 'uint256', internalType: 'uint256' }],
      outputs: [
        {
          name: '',
          type: 'tuple',
          internalType: 'struct TandaPay.SubGroupInfo',
          components: [
            { name: 'id', type: 'uint256', internalType: 'uint256' },
            { name: 'members', type: 'address[]', internalType: 'address[]' },
            { name: 'isValid', type: 'bool', internalType: 'bool' },
          ],
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getTotalCoverageAmount',
      inputs: [],
      outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getUpcomingSecretary',
      inputs: [],
      outputs: [{ name: '', type: 'address', internalType: 'address' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getWhitelistedClaimIdsInPeriod',
      inputs: [{ name: '_pId', type: 'uint256', internalType: 'uint256' }],
      outputs: [{ name: '', type: 'uint256[]', internalType: 'uint256[]' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'handoverSecretaryRoleToSuccessor',
      inputs: [
        {
          name: '_prefferedSuccessor',
          type: 'address',
          internalType: 'address',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'initiateDefaultState',
      inputs: [{ name: '_coverage', type: 'uint256', internalType: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'injectFunds',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'issueRefund',
      inputs: [{ name: '_shouldTransfer', type: 'bool', internalType: 'bool' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'joinCommunity',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'leaveSubgroup',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'payPremium',
      inputs: [{ name: '_useFromATW', type: 'bool', internalType: 'bool' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'submitClaim',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'updateCoverageAmount',
      inputs: [{ name: '_coverage', type: 'uint256', internalType: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'updateMemberStatus',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'whitelistClaim',
      inputs: [{ name: '_cId', type: 'uint256', internalType: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'withdrawClaimFund',
      inputs: [{ name: 'isForfeit', type: 'bool', internalType: 'bool' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'withdrawRefund',
      inputs: [],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'event',
      name: 'AddedToCommunity',
      inputs: [
        {
          name: 'member',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'id',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'AdditionalDayAdded',
      inputs: [
        {
          name: 'pEndTime',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ApproveNewGroupMember',
      inputs: [
        {
          name: 'member',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'approver',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'groupId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'approved',
          type: 'bool',
          indexed: false,
          internalType: 'bool',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ApprovedGroupAssignment',
      inputs: [
        {
          name: 'member',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'groupId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        { name: 'joined', type: 'bool', indexed: false, internalType: 'bool' },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'AssignedToSubGroup',
      inputs: [
        {
          name: 'member',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'groupId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'isReOrging',
          type: 'bool',
          indexed: false,
          internalType: 'bool',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ClaimSubmitted',
      inputs: [
        {
          name: 'member',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'claimId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ClaimWhiteListed',
      inputs: [
        {
          name: 'cId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'CommunityCollapsed',
      inputs: [
        {
          name: 'collapsedAt',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'CoverageUpdated',
      inputs: [
        {
          name: 'coverage',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'basePremium',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'DefaultStateInitiatedAndCoverageSet',
      inputs: [
        {
          name: 'coverage',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'EmergencyBegan',
      inputs: [
        {
          name: 'emergencyStartedAt',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'EmergencyPayment',
      inputs: [
        {
          name: 'to',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'amount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'EmergencyhandOverSecretary',
      inputs: [
        {
          name: 'secretary',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ExitedFromSubGroup',
      inputs: [
        {
          name: 'member',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'groupId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ForfeitClaim',
      inputs: [
        {
          name: 'claimant',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'claimId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'FundClaimFailed',
      inputs: [
        {
          name: 'totalClaimableAmount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'cAmount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'vmCount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'pmAmount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'pmShortAmount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'FundClaimed',
      inputs: [
        {
          name: 'claimant',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'amount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'cId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'FundInjected',
      inputs: [
        {
          name: 'amount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'JoinedToCommunity',
      inputs: [
        {
          name: 'member',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'paidAmount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'LeavedFromGroup',
      inputs: [
        {
          name: 'member',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'gId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'mId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ManualCollapseCancelled',
      inputs: [],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ManualCollapsedCancelled',
      inputs: [
        {
          name: 'timee',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ManualCollapsedHappenend',
      inputs: [],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'MemberDefected',
      inputs: [
        {
          name: 'member',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'periodId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'MemberStatusUpdated',
      inputs: [
        {
          name: 'member',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'newStatus',
          type: 'uint8',
          indexed: false,
          internalType: 'enum TandaPayEvents.MemberStatus',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'NextPeriodInitiated',
      inputs: [
        {
          name: 'periodId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'coverage',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'baseAmount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'PremiumPaid',
      inputs: [
        {
          name: 'member',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'periodId',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'amount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'usingATW',
          type: 'bool',
          indexed: false,
          internalType: 'bool',
        },
      ],
      anonymous: false,
    },
    { type: 'event', name: 'RefundIssued', inputs: [], anonymous: false },
    {
      type: 'event',
      name: 'RefundWithdrawn',
      inputs: [
        {
          name: 'member',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'amount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'SecretaryAccepted',
      inputs: [
        {
          name: 'nSecretary',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'SecretaryHandOverEnabled',
      inputs: [
        {
          name: 'prefferedSuccessr',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'SecretarySuccessorsDefined',
      inputs: [
        {
          name: 'successors',
          type: 'address[]',
          indexed: false,
          internalType: 'address[]',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'SecretaryTransferred',
      inputs: [
        {
          name: 'previousOwner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'newOwner',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ShortFallDivided',
      inputs: [
        {
          name: 'totalAmount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'pmAmount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'fromSecrretary',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'SubGroupCreated',
      inputs: [
        {
          name: 'id',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    { type: 'error', name: 'AlreadyAdded', inputs: [] },
    { type: 'error', name: 'AlreadyClaimed', inputs: [] },
    { type: 'error', name: 'AlreadySet', inputs: [] },
    { type: 'error', name: 'AlreadySubmitted', inputs: [] },
    { type: 'error', name: 'AmountZero', inputs: [] },
    { type: 'error', name: 'CannotBeZeroAddress', inputs: [] },
    { type: 'error', name: 'CannotEmergencyRefund', inputs: [] },
    { type: 'error', name: 'ClaimNoOccured', inputs: [] },
    { type: 'error', name: 'ClaimantNotValidMember', inputs: [] },
    { type: 'error', name: 'CommunityIsCollapsed', inputs: [] },
    { type: 'error', name: 'CoverageFullfilled', inputs: [] },
    { type: 'error', name: 'DFNotMet', inputs: [] },
    { type: 'error', name: 'DelayInitiated', inputs: [] },
    { type: 'error', name: 'EmergencyGracePeriod', inputs: [] },
    { type: 'error', name: 'HandoverAlreadyInProgress', inputs: [] },
    { type: 'error', name: 'InEmergency', inputs: [] },
    { type: 'error', name: 'InValidClaim', inputs: [] },
    { type: 'error', name: 'InsufficientFunds', inputs: [] },
    { type: 'error', name: 'InvalidMember', inputs: [] },
    { type: 'error', name: 'InvalidSubGroup', inputs: [] },
    { type: 'error', name: 'ManuallyCollapsed', inputs: [] },
    { type: 'error', name: 'NeedMoreSuccessor', inputs: [] },
    { type: 'error', name: 'NoClaimOccured', inputs: [] },
    { type: 'error', name: 'NoValiddMember', inputs: [] },
    { type: 'error', name: 'NotAssignedYet', inputs: [] },
    { type: 'error', name: 'NotClaimSubmittionWindow', inputs: [] },
    { type: 'error', name: 'NotClaimWindow', inputs: [] },
    { type: 'error', name: 'NotClaimant', inputs: [] },
    { type: 'error', name: 'NotDefectWindow', inputs: [] },
    { type: 'error', name: 'NotFirstSuccessor', inputs: [] },
    { type: 'error', name: 'NotHandingOver', inputs: [] },
    { type: 'error', name: 'NotInAssigned', inputs: [] },
    { type: 'error', name: 'NotInAssignmentSuccessfull', inputs: [] },
    { type: 'error', name: 'NotInCovereged', inputs: [] },
    { type: 'error', name: 'NotInDefOrFra', inputs: [] },
    { type: 'error', name: 'NotInEmergency', inputs: [] },
    { type: 'error', name: 'NotInInDefault', inputs: [] },
    { type: 'error', name: 'NotInIniOrDef', inputs: [] },
    { type: 'error', name: 'NotInInitilization', inputs: [] },
    { type: 'error', name: 'NotInInjectionWindow', inputs: [] },
    { type: 'error', name: 'NotInManualCollaps', inputs: [] },
    { type: 'error', name: 'NotInSuccessorList', inputs: [] },
    { type: 'error', name: 'NotIncluded', inputs: [] },
    { type: 'error', name: 'NotPaidInvalid', inputs: [] },
    { type: 'error', name: 'NotPayWindow', inputs: [] },
    { type: 'error', name: 'NotRefundWindow', inputs: [] },
    { type: 'error', name: 'NotReorged', inputs: [] },
    { type: 'error', name: 'NotValidMember', inputs: [] },
    { type: 'error', name: 'NotWhiteListed', inputs: [] },
    { type: 'error', name: 'NotWhitelistWindow', inputs: [] },
    { type: 'error', name: 'OutOfTheCommunity', inputs: [] },
    { type: 'error', name: 'PrevPeriodNotEnded', inputs: [] },
    { type: 'error', name: 'ReentrancyGuardReentrantCall', inputs: [] },
    { type: 'error', name: 'SGMNotFullfilled', inputs: [] },
    { type: 'error', name: 'SamePeriod', inputs: [] },
    {
      type: 'error',
      name: 'SecretaryInvalidOwner',
      inputs: [{ name: 'owner', type: 'address', internalType: 'address' }],
    },
    {
      type: 'error',
      name: 'SecretaryUnauthorizedSecretary',
      inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
    },
    { type: 'error', name: 'TimeNotPassed', inputs: [] },
    { type: 'error', name: 'TurningTimePassed', inputs: [] },
    { type: 'error', name: 'WLCAvailable', inputs: [] },
  ],
  bytecode: {
    object:
      '0x608034620000ea57601f620055f838819003918201601f19168301916001600160401b03831184841017620000ee578084926040948552833981010312620000ea5760206200004e8262000102565b916001600160a01b0391829162000066910162000102565b16908115620000d2575f549260018060a01b03199280848616175f558260405195167f688b8f34d886f8a2414b39aa6cef1ec6198215ba9b47fe8ac4260b44139bd5b65f80a360016009551690600a541617600a5560ff19601254166012556154e09081620001188239f35b6040516351f49ec560e01b81525f6004820152602490fd5b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b0382168203620000ea5756fe60806040526004361015610011575f80fd5b5f3560e01c8062b16fee146145335780630a5b34f2146144f5578063108f1d03146143ec578063110f8874146142e35780631401e6cc146142aa57806316bfe25c146141235780631afbd12814613f395780632250e16614613eab578063256b7e2314613e8e5780632647092314613e5557806335bd2c5d14613d63578063396b624714613d4657806339786a96146139225780633cf1aa95146138585780633f1b3f8f1461370f57806342c1b0ef146134955780634ae4ab48146132af5780634ee4a857146132305780634ee9c6f7146131a157806350c8e1fd146130815780635c6af45614612ea65780635d86b8e114612e895780636619980814612e4b5780636b61aed914612e135780636d4da76d14612deb57806372547ec914612a85578063756b01b6146128975780637985940d1461286e5780637b47d7e814612851578063881d59be1461282a578063953434ae1461280d57806395ccea671461265c5780639e99d7c6146123ae578063a504f809146121c3578063a8fdb788146120d2578063ac115bbe146120b5578063b87b1d0d14611fa5578063bc017b5714611cb1578063be47120614611a89578063c1fb07fc14611965578063c2a41da014611943578063c3a4229714611317578063c4afc37a14610ff3578063cb695ef414610fd6578063d26a624b14610c42578063d98b250314610bf3578063dbcd14f014610a92578063dea182c114610a6a578063e15d69f314610a4d578063e26747c514610a04578063e329972d14610904578063ec15a89014610746578063f2ddec411461060c578063f34cf775146105ef578063f3f02d0314610397578063fb3944f1146102ac5763fef4c5501461028b575f80fd5b346102a8575f3660031901126102a8576020600854604051908152f35b5f80fd5b346102a8575f3660031901126102a8576102c4615315565b60ff60125416600581101561038357600481146103715760031461035f57600e54805f526019602052600160405f2001549062015180820180921161034b575f526019602052600160405f200155600e545f527f1053ff2559207f3358e287928bbde971ad88f7b99c0335368afe0c5baf1ef55f6020600160405f200154604051908152a1005b634e487b7160e01b5f52601160045260245ffd5b60405163f856e0a560e01b8152600490fd5b6040516338f25eb760e21b8152600490fd5b634e487b7160e01b5f52602160045260245ffd5b346102a8575f3660031901126102a8576012805460059160ff9182168381101561038357600481146103715760031461035f5760015b600b546001810180911161034b578110156105ed57805f526020906014825260405f2091600a8301908582541691600c831015928361038357801515806105df575b84816105ce575b816105bd575b50610430575b5050505060019150016103cd565b60089283870194600e92835491825f528784528b60405f2054165f14610560575050835460ff19166004178455505b888854168a811015610383576001148061054b575b610526575b88885416948a861015610383576001977f732dc60c5d1b1df84f06b7e689c1024b7164003eeeded6276c17827b428734c8966040966104e3958d9460028094149081610511575b506104ed575b5050898060a01b039101541693541690845193845283019061484c565ba185808080610422565b60ff199182895416178855545f52600783018552875f209081541690558d806104c6565b905081545f52865284895f205416155f6104c0565b60ff1960068185541617845582545f5260078801825260405f20908154169055610479565b5081545f528481528860405f20541615610474565b610383576004148061059e575b610578575b5061045f565b5f19810190811161034b575f52601c815260405f20600160ff198254161790558a610572565b505f19810181811161034b575f52601c82528960405f2054161561056d565b90506103835760098114158461041c565b905061038357600181141584610416565b505f9350600281141561040f565b005b346102a8575f3660031901126102a8576020600d54604051908152f35b346102a85760203660031901126102a857610625614836565b60ff601254166005811015610383576003811461035f57610644615315565b6004811461037157801515908161073a575b50610728576001600160a01b0381165f8181526018602052604090205490919061071657600a7f6041a3b674b81a0fecc93042cf89f30bf96db96073f1312e253264f8a5cceba3926106a9600b5461499c565b600b8181555f8281526014602090815260408083208581558684526018835292819020949094556002820180546001600160a01b03191690951790945593909301805461ffff1916610101179055915482516001600160a01b03909416845290830152819081015b0390a1005b60405163f411c32760e01b8152600490fd5b60405163897c9a9360e01b8152600490fd5b60019150141582610656565b346102a8576020806003193601126102a85760043590610764615315565b60ff6012541660058110156103835760048114610371576003811461035f57600181141590816108f8575b506108e657600e5491825f526019825260405f20546213c680810180821161034b5742119081156108dc575b506108ca57825f526016825260405f20815f52825260405f208054938285036108b85760018201546001600160a01b03165f818152601886526040808220548252601487529020600a015490919060ff16600c8110156103835760041491821592610888575b5050610876577f3d37a493337dd24e7cb7bec23d4bde6447e3a1d6e75803de86dbf9f9b5732b8493600461086d9201600160ff19825416179055600e545f526013845260405f20614a47565b604051908152a1005b6040516329ceba1160e11b8152600490fd5b9091505f526018845260405f20545f5260148452600760405f2001905f52835260ff60405f205416158580610821565b60405163e22b971160e01b8152600490fd5b604051633341b44560e11b8152600490fd5b90504210846107bb565b604051637bf65ebd60e11b8152600490fd5b6002915014158361078f565b346102a8576020806003193601126102a8576004355f6080604051610928816147dc565b828152828582015260606040820152826060820152015280155f146109ff5750600e545b5f526019815260405f20604051610962816147dc565b815481526001926001830154928183019384526109816002820161494c565b9160408401928352600460038301549260608601938452015492608085019384526040519582875260c08701955183880152516040870152519360a0606087015284518091528160e087019501915f5b8281106109ec5784516080890152855160a089015287870388f35b83518752958101959281019288016109d1565b61094c565b346102a85760203660031901126102a85760043580610a485750600e545b5f526013602052610a44610a3860405f2061494c565b604051918291826146d4565b0390f35b610a22565b346102a8575f3660031901126102a8576020600754604051908152f35b346102a8575f3660031901126102a857600a546040516001600160a01b039091168152602090f35b346102a85760603660031901126102a857600435610aae614778565b60ff60125416916005831015610383576004831461037157600380931461035f57805f52601560205260405f20916024355f52601460205260405f20600a81019485549460ff8616600c81101561038357600703610be2575f915f9060018093018054925b838110610bac575b505050505015610b9a577f5cf6fd140141a8a14aca1d538d93e40de68c6a776df311ae862a898ea2a660ef946080948315610b8a5750805461ffff19166105041790555b60020154604080516001600160a01b03909216825233602083015281019290925215156060820152a1005b61ff001916610700179055610b5f565b604051633d76489160e01b8152600490fd5b610bb68183614a32565b90543391851b1c6001600160a01b031614610bd2578401610b13565b5050505090508680808080610b1b565b60405162789f4360e21b8152600490fd5b346102a85760203660031901126102a857610c0c614769565b610c146152f2565b60ff60125416600581101561038357600481146103715760031461035f57610c3b90614bb8565b6001600955005b346102a85760203660031901126102a857610c5b614836565b6001600160a01b0381811691908215610fc45760ff60125416600581101561038357600380911461035f575f335f52601860205260405f20548015159081610f9e575b50610f96575b15610b9a5760055460ff8116610f60575b505f925f93600194858054915b828110610f375750505015610f255781548316158080610f19575b80610f0c575b610edf5715610e6d57600380546001600160a01b0319166001600160a01b0390921691909117905542600855600e546006555b818154169283151580610e60575b610d56575b7f882febe0458c27b4ed12caa22ad034f24f206e2da9aa922015eff66e45f2006b602086604051908152a1005b5f9492938460045416145f14610e3f57610d7284835416615444565b8054825485165f5b828110610e18575050505b6001600160601b0360a01b8083541683556004541660045554935f19850194851161034b57610dea602094610e0893610dde7f882febe0458c27b4ed12caa22ad034f24f206e2da9aa922015eff66e45f2006b986149b7565b9054911b1c16916149b7565b90919060018060a01b038084549260031b9316831b921b1916179055565b610e10614ae6565b918380610d29565b8187610e23836149b7565b905490881b1c1614610e37575b8301610d7a565b965086610e30565b9350610e5983610e4d614a00565b905490841b1c16615444565b5f93610d85565b5082600454161515610d24565b60085462015180810180911161034b5780421080610eff575b15610ea4575050600480546001600160a01b03191685179055610d16565b421180610ef1575b15610edf57600380546001600160a01b0319166001600160a01b0390921691909117905542600855600e54600655610d16565b604051637787a74d60e01b8152600490fd5b50600654600e541415610eac565b50600654600e5414610e86565b50600654600e5414610ce3565b50836004541615610cdd565b6040516362c9b45b60e01b8152600490fd5b86610f41826149b7565b905490881b1c168914610f57575b018690610cc2565b92508092610f4f565b60075462093a80810180911161034b57421015610f895760405163349944a560e21b8152600490fd5b60ff191660055584610cb5565b506001610ca4565b90505f52601460205260ff600a60405f20015416600c8110156103835760041486610c9e565b604051631e7d738760e21b8152600490fd5b346102a8575f3660031901126102a8576020600b54604051908152f35b346102a85760203660031901126102a85761100c614769565b6110146152f2565b60ff60125416600581101561038357600481146103715760031461035f57600e54805f52601960205260405f205462054600810180911161034b57421180156112f5575b6112e3575f19810190811161034b575f52601360205260405f20546112d157600b5460015b60018201821161034b57600182018110156112a657805f52601460205260405f20906005820180549081611297575b5050600e546001811180611276575b80611269575b6111ea575b50600e546003811161118f575b508380611182575b6110ea575b600191500161107d565b6006820180545f91829055600a5460029094015460405163a9059cbb60e01b81526001600160a01b039182166004820152602481019290925290936020928592604492849291165af191821561117757600192611148575b506110e0565b6111699060203d602011611170575b6111618183614814565b810190614934565b5084611142565b503d611157565b6040513d5f823e3d90fd5b50600682015415156110db565b8060021981011161034b57600219015f526009820160205260405f205480156110d3576111c160068401918254614927565b9055600e548060021981011161034b57600219015f52600982016020525f6040812055846110d3565b60ff60125416600581101561038357600214908161124a575b501561123757600382015f81549155600e54805f1981011161034b575f19015f526009830160205260405f20555b846110c6565b600382015f815491556006830155611231565b5f1981019150811161034b575f52601360205260405f20541585611203565b50600383015415156110c1565b50805f1981011161034b575f1981015f52601360205260405f2054156110bb565b5f9055600683015584806110ac565b7f01c9e927536754e1d95ea7a9eda17265ab11a240401b5926f33c0eb76c9d7f335f80a16001600955005b60405163fcb6f0ab60e01b8152600490fd5b60405163d53184ed60e01b8152600490fd5b50805f52601960205260405f20546203f480810180911161034b574210611058565b346102a8575f3660031901126102a85761132f615315565b60125460ff81169060058210156103835760048214610371576003821461035f575f91600181141580611935575b6108e657600e548015158061191d575b61190b5761137a9061499c565b9283600e5561038357600214611813575b505f52601960205260405f20428155600f54611407575b62278d00420180421161034b578160039160017f08a7ba25f6100ab18c633572926abf5bd6a45439a9322adee245bc3a9685efda940155600f549182910155600e54610711601054604051938493846040919493926060820195825260208201520152565b60ff60125416600581101561038357600481146103715760031461035f5760015b600b546001810180911161034b5781101561166257805f52601460205260405f209060ff600a83015416600c81101590816103835780151580611654575b8281611643575b81611632575b50611485575b50506001915001611428565b600e5491825f526008850160205260ff60405f2054165f146115d257505050600a8201805460ff191660041790555b60ff60125416600581101561038357600114806115b7575b61158a575b60ff601254169160058310156103835760407f732dc60c5d1b1df84f06b7e689c1024b7164003eeeded6276c17827b428734c89160026001951480611570575b611544575b61153c60ff600a878060a01b03600285015416930154168351928352602083019061484c565ba18380611479565b60ff19600881600a8401541617600a830155600e545f5260078201602052825f20908154169055611516565b50600e545f526008810160205260ff825f20541615611511565b60ff19600681600a8501541617600a840155600e545f526007830160205260405f209081541690556114d1565b50600e545f526008820160205260ff60405f205416156114cc565b6103835760041480611611575b6115ea575b506114b4565b5f19810190811161034b575f52601c60205260405f20600160ff19825416179055836115e4565b505f19810181811161034b575f52601c60205260ff60405f205416156115df565b905061038357600981141582611473565b90506103835760018114158261146d565b505f91506002811415611466565b5060015b600c80546001810180911161034b5782101561175757815f526015602052600160405f2001805460048110908161174d575b506116a8575b5050600101611666565b90925f5b8254811015611741576116bf8184614a32565b60018060a01b0391549060031b1c165f52601860205260405f20545f52601460205260405f2090600a82019182549260ff841693888510156103835760046001951461170f575b505050016116ac565b60089060ff1916179055600660038201915f8354816117346004850192835490614927565b9555550155868080611706565b5092505060018361169e565b9050151585611698565b50505f90600190600b546001810180911192835b61034b57818110156117b857805f52601460205260ff600a60405f20015416600c811015610383576004146117a4575b6001018361176b565b936117b060019161499c565b94905061179b565b50509190506001600e54116117ce575b506113a2565b806117ff5750600360ff1960125416176012555f8051602061548b8339815191526020604051428152a15b816117c8565b61180b90600f54614909565b6010556117f9565b5f19820182811161034b57805f526020601a815260ff60405f2054161591826118e8575b826118c5575b826118ac575b5081611889575b81611866575b501561138b5760ff19166001176012558161138b565b6002198401915083821161034b57601c915f525260ff60405f2054161583611850565b9050600119830183811161034b575f52601c815260ff60405f205416159061184a565b9091505f52601c815260ff60405f205416159084611843565b9150600219840184811161034b575f52601a815260ff60405f205416159161183d565b9150600119840184811161034b575f52601a815260ff60405f2054161591611837565b6040516307318e9360e31b8152600490fd5b50805f526019602052600160405f200154421061136d565b505f9250600281141561135d565b346102a8575f3660031901126102a857602060ff600554166040519015158152f35b346102a85760403660031901126102a857610a44611981614836565b611a7760ff602435611991614b48565b506001600160a01b039384165f90815260186020908152604080832054835260148252909120909180611a835750600e54945b81549560018301549160028401541690600384015460048501546005860154916006870154935f526007870188528860405f205416946008880189528960405f20541696600989018a52600a60405f2054990154996040519d8e611a27816147bf565b528d015260408c015260608b015260808a015260a089015260c0880152151560e08701521515610100860152610120850152611a698282166101408601614ba0565b60081c166101608301614bac565b60405191829182614859565b946119c4565b346102a85760603660031901126102a857611aa2614836565b602435611aad614778565b9160ff601254166005811015610383576003811461035f57600490611ad0615315565b1461037157815f52601560205260405f209260018060a01b03908183165f52601860205260405f20545f52601460205260405f2091855415611c9f57600283015416918215611c8d576001860192835490600160401b821015611c7957610dea826001611b409401875586614a32565b8115611c3757600a81019586549360ff8516600c81101561038357600503611c25578660016002947fd23000da82104e78ccbf3c41c153eca50a357a80f2ae156096b8b1b43f36f2e19a60076107119960ff19161790555b01555460048110159081611c19575b5015611bf95701805460ff811615611be9575b50505b604080516001600160a01b03909416845260208401949094521515928201929092529081906060820190565b60ff191660011790558580611bba565b01805460ff8116611c0c575b5050611bbd565b60ff191690558580611c05565b60079150111588611ba7565b6040516333ddf1dd60e01b8152600490fd5b7fd23000da82104e78ccbf3c41c153eca50a357a80f2ae156096b8b1b43f36f2e1956107119386600184600a6002960161020061ff0019825416179055611b98565b634e487b7160e01b5f52604160045260245ffd5b6040516339ec64c160e11b8152600490fd5b604051635ad439e560e11b8152600490fd5b346102a8575f3660031901126102a857611cc96152f2565b611cd1615315565b60ff8060125416600581101561038357600481146103715760031461035f57600e54611cfc816153d5565b611d058161541c565b5f5260206019815260405f20600360048201549101549081811015611f9357611d2d916149aa565b5f905f600b5493600180860180961195865b61034b5780821015611dd357815f526014835260405f209188600a8401541692600c841015610383576004899414611d7c575b5060010191611d3f565b94611d8860049161499c565b9501548015611d725790968015801580611dca575b15611daf575050600190965b90611d72565b90979150611dc0575b600190611da9565b9495508594611db8565b50818310611d9d565b90508593879580611de48684614909565b1015611f8d5750611df58482614909565b935b5f926001875b61034b5781811015611e6257805f526014865260405f209089600a8301541691600c83101561038357600460019314611e39575b500187611dfd565b60040180548980821015611e4f575b5050611e31565b611e58916149aa565b90558a8089611e48565b8487858886600e545f5260198252600460405f2001611e82848254614927565b905582611e8f82866148f6565b10611ee3575b5050611ed97f39657cef6eb725e291a5e37fe8032a18477b98dd7abc4a03d93428153eff3d0393604051938493846040919493926060820195825260208201520152565b0390a16001600955005b611ef9919450611ef390846148f6565b826149aa565b600a546040516323b872dd60e01b8152336004820152306024820152604481018390529491908290869060649082905f906001600160a01b03165af1918215611177577f39657cef6eb725e291a5e37fe8032a18477b98dd7abc4a03d93428153eff3d0395611ed993611f6f575b505093611e95565b81611f8592903d10611170576111618183614814565b508580611f67565b93611df7565b604051633958314d60e01b8152600490fd5b346102a85760203660031901126102a857611fbe614836565b611fc6615315565b60ff6012541690600582101561038357600380921461035f576001600160a01b039081169182612062575b5050600654600e5414612050576020817f9d35d6f02c23b682244e3ab27b9be76fa329228dd25ecfa1b9b9974d77c22a14926001600160601b0360a01b600254161760025542600755600160ff196005541617600555604051908152a1005b60405163349944a560e21b8152600490fd5b5f915f90600192600154925b838110612087575b505050505015610b9a578180611ff1565b82612091826149b7565b905490841b1c1687146120a557840161206e565b5050505090508280808080612076565b346102a8575f3660031901126102a8576020600654604051908152f35b346102a857610a44612178611a7760ff6120eb36614753565b906120f4614b48565b505f52601460205260405f209080155f146121bd5750600e54905b80549160018201549060018060a01b0360028401541690600384015460048501546005860154916006870154935f52600787016020528860405f20541694600888016020528960405f2054169660098901602052600a60405f2054990154996040519d8e6147bf565b8d5260208d015260408c015260608b015260808a015260a089015260c0880152151560e08701521515610100860152610120850152611a698282166101408601614ba0565b9061210f565b346102a8575f3660031901126102a85760ff60125416600581101561038357600380911461035f5760055460ff81161561239c575f905f91600192838054915b82811061236c5750505015610b9a5760ff19166005556002546001600160a01b03919082163381036122c0575061223933615444565b5f915f918054925b8381106122995750505f19820191821161034b5761226593610dde610dea936149b7565b61226d614ae6565b7f6a36d5245b4e10f0299e42d1766cde6e266f8168b22e7cb0f8ab6e71021a54e56020604051338152a1005b826122a3826149b7565b905490881b1c1633146122b8575b8101612241565b9350836122b1565b151580612354575b61234257816122d5614a00565b905490851b1c1633145f14612330576122fc826122f0614a00565b905490861b1c16615444565b545f1981019290831161034b57612315612323936149b7565b9054911b1c16610dea614a00565b61232b614ae6565b61226d565b6040516301bb5b1f60e51b8152600490fd5b604051631a0a745560e11b8152600490fd5b5060075462015180810180911161034b5742106122c8565b612375816149b7565b90543391891b1c6001600160a01b031614612393575b018490612203565b9250809261238b565b604051631e72ba9760e01b8152600490fd5b346102a8575f3660031901126102a85760ff8060125416600581101561038357600481146103715760031461035f57335f5260206018815260405f20545f526014906014815260405f20906001928383019485545f526015835260405f206002850160018060a01b0397888254161561264a57600e54805f526019875260405f20546203f480810180911161034b5742118015612636575b612624575f19810190811161034b575f526017865260405f20541561261257600a91600a8801998960099560ff199c8d81541660091790550161248890615340565b82549154165f52601b875260405f20555f9055600e545f52601d855260405f2086546124b391614a47565b60038601805490600488019182546124ca91614927565b60058901555f90555f90556012549160ff8316600581101561038357881461256b575b50505050506007601a92600e545f5201815260405f20848154169055600e545f525260405f2091825460ff81161561255e575b600e546040805133815260208101929092527f188272a28ee264707f833eac91033ac3a9a04f67845e5a9034afc774a4a9603c919081908101610711565b1617905580808080612520565b600b54965f95909489939091898501808b11865b6125c3575b50505050505050600c850294808604600c149015171561034b57866007936064601a9704106125b5575b82956124ed565b1660021760125586866125ae565b8061034b578187101561260d57865f52828b52848460405f2001541696600c88101561038357868e98146125fa575b87019661257f565b99612605889161499c565b9a90506125f2565b612584565b604051631f86a3f560e21b8152600490fd5b6040516379055d9d60e01b8152600490fd5b50805f526019875260405f20544210612446565b60405163092ebc6d60e31b8152600490fd5b346102a85760403660031901126102a857612675614836565b6024356126806152f2565b612688615315565b60ff60125416600581101561038357600481036127fb5760115462015180810180911161034b5742106127e95760031461035f576001600160a01b0382811615610fc457600a5416916040516370a0823160e01b81523060048201526020908181602481885afa80156111775784915f916127b8575b50106127a65760405163a9059cbb60e01b81526001600160a01b038316600482015260248101849052938190859060449082905f905af1938415611177577f20a3ee7ebf8af442c82daa0e821d3c5a43acc00c80968747a24d6e7f3663d35494612788575b5050604080516001600160a01b03909216825260208201929092529081908101611ed9565b8161279e92903d10611170576111618183614814565b508380612763565b60405163356680b760e01b8152600490fd5b809250838092503d83116127e2575b6127d18183614814565b810103126102a857839051866126fe565b503d6127c7565b6040516302e9939360e41b8152600490fd5b604051633b1cf39760e21b8152600490fd5b346102a8575f3660031901126102a8576020600f54604051908152f35b346102a8575f3660031901126102a8575f546040516001600160a01b039091168152602090f35b346102a8575f3660031901126102a8576020601154604051908152f35b346102a8575f3660031901126102a85760ff601254166040516005821015610383576020918152f35b346102a8575f3660031901126102a8576128af615315565b60125460ff8116600581101561038357600481146103715760031461035f5760ff1916600417601255426011556128e46152f2565b60ff6012541660058110156103835760038114159081612a79575b50612a6757600b546001905b60018101811161034b5760018101821015612a3657815f52601460205260405f209161295c6129516129466003860154600487015490614927565b600586015490614927565b600685015490614927565b906003600e54115f146129e257600e546009850193925b600e54600219810190811161034b5782116129bb5761299e90825f528560205260405f205490614927565b90805f52846020525f6040812055801561034b575f190190612973565b91929460019450600691505b5f60038201555f60048201555f60058201550155019061290b565b91905f905b600e548211612a2857612a0c612a2291835f526009870160205260405f205490614927565b91805f52600986016020525f604081205561499c565b906129e7565b9050600660019392946129c7565b60016009557fac72b0b13eb85909e8e5deeb2bb65c912e147d60cfd7284a17b85e0fe88fdae66020604051428152a1005b60405163a7c1043560e01b8152600490fd5b600491501415816128ff565b346102a8576020806003193601126102a857600435612aa2615315565b60ff601281601254169060059160058110156103835760048114610371576003811461035f575f908015159081612ddc575b5061072857600f54612baa575b50505081600f555f9060018091600b548260018201809211905b612b52575b7fd4116e5003fcbb3a549e4e271b1d73063c38f23828139309c6ac1ef0700a4a506040888a612b2f8a83614909565b601055600e545f5260198152816003845f200155601054908351928352820152a1005b8095949561034b5781861015612ba257855f526014885282600a60405f20015416600c81101561038357600414612b8f575b838095960194612afb565b83612b9a819661499c565b955050612b84565b849550612b00565b94909291946103835760015b600b546001810180911161034b57811015612dcf57805f526014825260405f2090600a820184815416600c81101591826103835781151580612dc1575b8381612db0575b81612d9f575b50612c13575b5050506001915001612bb6565b60089182860193600e91825491825f52868a528a60405f2054165f14612d42575050825460ff19166004178355505b878954168b8110156103835760011480612d2d575b612d08575b87895416938b851015610383576001967f732dc60c5d1b1df84f06b7e689c1024b7164003eeeded6276c17827b428734c895604095612cc6948c9460028094149081612cf3575b50612ccf575b5050888060a01b039101541692541683519283528783019061484c565ba1878080612c06565b60ff199182885416178755545f52600783018b52865f209081541690558e80612ca9565b905081545f528c5284885f205416155f612ca3565b60ff1960068184541617835581545f5260078701885260405f20908154169055612c5c565b5080545f528387528760405f20541615612c57565b6103835760041480612d80575b612d5a575b50612c42565b5f19810190811161034b575f52601c875260405f20600160ff198254161790558b612d54565b505f19810181811161034b575f52601c88528860405f20541615612d4f565b905061038357600982141583612c00565b905061038357600182141583612bfa565b505f92506002821415612bf3565b5093509050838080612ae1565b91505060015f91141587612ad4565b346102a8575f3660031901126102a8576002546040516001600160a01b039091168152602090f35b346102a85760203660031901126102a8576001600160a01b03612e34614836565b165f526018602052602060405f2054604051908152f35b346102a85760203660031901126102a85760043580612e845750600e545b5f52601c602052602060ff60405f2054166040519015158152f35b612e69565b346102a8575f3660031901126102a8576020601054604051908152f35b346102a8576020806003193601126102a857612ec0614769565b60ff601254166005811015610383576004811461037157600380911461035f57335f526018835260405f20545f526014835260405f209060019060018301948554801561306f575f526015815260405f2092855f14612f9e5750505050600a019182549260ff841693600c851015610383577f4506ecebb8afddc27b5896d964fe56a6aa511603ed4fac7fb871650473f2175d94600703612f8e5750805461ff0019166103001790555b54604080513381526020810192909252911515918101919091528060608101610711565b61ff001916610500179055612f6a565b90919593505f9060015f9401968754945b858110613040575050505f19830192831161034b578561301561301a92610dea612ffc6014977f4506ecebb8afddc27b5896d964fe56a6aa511603ed4fac7fb871650473f2175d9b614a32565b905460039190911b1c6001600160a01b03169184614a32565b614b2c565b335f526018815260405f20545f5252600a60405f2001600a60ff19825416179055612f6a565b61304a818a614a32565b905490831b1c6001600160a01b03163314613067575b8201612faf565b925082613060565b60405163b4479a6360e01b8152600490fd5b346102a8575f3660031901126102a8576130996152f2565b6130a1615315565b60ff60125416600581101561038357600481146103715760031461035f57600e546130cb816153d5565b6130d48161541c565b5f52601960205260405f20600481016003815492015480831015611f93576130ff83613106926149aa565b8093614927565b9055600a546040516323b872dd60e01b8152336004820152306024820152604481018390529190602090839060649082905f906001600160a01b03165af1908115611177577f11f018c083eb908425163290b18ec4bff42c1ba4edf4020de879c7ae1b7ce0f392602092613184575b50604051908152a16001600955005b61319a90833d8511611170576111618183614814565b5083613175565b346102a8575f3660031901126102a857604080516131be816147f8565b36903760405160035f825b6002821061321057836131db816147f8565b604051905f90825b600283106131f057604084f35b81516001600160a01b0316815260019290920191602091820191016131e3565b82546001600160a01b0316815260019283019291909101906020016131c9565b346102a8575f3660031901126102a85760ff601254166005811015610383576003811461035f57600490613262615315565b14610371577f3b88d52dc51aa53d344c3581f44ecf26dd6a764b15cd0e86e576d816c28361636020613295600c5461499c565b80600c55805f52601582528060405f2055604051908152a1005b346102a8575f3660031901126102a85760ff60125416600581101561038357600481146103715760031461035f57335f52601860205260405f20545f52601460205260405f20600181019081545f52601560205260405f209160018060a01b036002830154161561264a575f9055600a8101805460ff1916600517905561333860018301615340565b600e545f526007810160205260405f2060ff198154169055600381015f8154816133686004860192835490614927565b93555560069061337d60068401918254614927565b905560046001840154106133df575b50600281015491549054604080516001600160a01b0390941684526020840192909252908201527fed11cf2f685bc5fb16110aa145d0b495f9cfdc2ed33e03b9362d4bdc3fba262d908060608101610711565b60028301805460ff191690555f5b600184015481101561346d5780613408600192838701614a32565b838060a01b0391549060031b1c165f52601860205260405f20545f52601460205260405f20600a8101600560ff198254161790556134658460038301925f8454816134596004850192835490614927565b96555501918254614927565b9055016133ed565b50507fed11cf2f685bc5fb16110aa145d0b495f9cfdc2ed33e03b9362d4bdc3fba262d61338c565b346102a8576020806003193601126102a8576004359067ffffffffffffffff8083116102a857366023840112156102a85782600401359260249184116136fb578360051b604051946134e985830187614814565b85528284860191830101913683116102a8578301905b8282106136dc57505050613511615315565b60ff6012541660058110156136c85760031461035f57600b5490600c821015806136bd575b1561368f57600284511061367d57929190925b5f936001928184809301809111925b61358d575b6040517f37624b43bc21d01bec4f033a1fb10552d28b406b1a68210476d53af5a7d4e68e9080610711898261470f565b8551871015613678575f85805b6135f9575b5015610b9a576001600160a01b036135b78888614ad2565b5116968554600160401b8110156135e657906135de879899610dea848a80960186556149b7565b019695613558565b85634e487b7160e01b5f5260416004525ffd5b84919498979596986136655782811015613658576001600160a01b03806136208a89614ad2565b511690825f5260148652600260405f200154161461364a579697949694959490939086018661359a565b50925086949395968861359f565b979594969793909361359f565b86634e487b7160e01b5f5260116004525ffd5b61355d565b6040516350a01e1d60e11b8152600490fd5b602382116136a1575b92919092613549565b600684511015613698576040516350a01e1d60e11b8152600490fd5b506023821115613536565b50634e487b7160e01b5f9081526021600452fd5b81356001600160a01b03811681036102a85781529084019084016134ff565b50634e487b7160e01b5f9081526041600452fd5b346102a8575f3660031901126102a8576137276152f2565b61372f615315565b60125460ff81166005811015610383576004036127fb5760115462015180810180911161034b5742106127e95760ff1916600317601255600a546040516370a0823160e01b81523060048201526001600160a01b0391909116906020908181602481865afa908115611177575f9161382b575b5060105481106137ca575b5f8051602061548b83398151915282604051428152a16001600955005b60405163a9059cbb60e01b81523360048201526024810191909152918190839060449082905f905af1918215611177575f8051602061548b83398151915292156137ad5761382490823d8411611170576111618183614814565b50826137ad565b90508181813d8311613851575b6138428183614814565b810103126102a85751836137a2565b503d613838565b346102a8576020806003193601126102a8575f60408051613878816147a3565b82815260608482015201526004355f526015815260405f2060405161389c816147a3565b8154815260019260ff60026138b360018601614a7b565b9483850195865201541690604083019115158252604051938185526080850193518286015251926060604086015283518091528160a086019401915f5b8281106139065784511515606088015286860387f35b83516001600160a01b03168652948101949281019287016138f0565b346102a8576020806003193601126102a85761393c614769565b6139446152f2565b60ff601254169160058310156103835760048314610371576003831461035f57600192838114159081613d3a575b506108e657600e5480613ceb575b83810180911161034b575f9081526019825260408082203383526018845281832054835260148452912060028101546001600160a01b03919082161561264a57600a8101805460ff8160081c16600881101561038357600503613cda5760ff16600c81101590816103835760098114918215613ccd575b8215613cbc575b5050613caa5760105493601485028581046014148615171561034b576064613a27910486614927565b8760048501928354838110613c92575b50600401613a46888254614927565b9055613c4e575b60105491613a6060038601938454614927565b8093558054828110613c32575b5083549260ff841692600c84101592836103835760028514928315613c24575b848415613c12575b5083613c05575b5082613bf9575b5050613b89575b505050505081613afb575b50907fed66735ec09b73f80882349a417c96f1ac5bb6bf493441951d147d84c5ed5d8c92608092600e5460405193338552840152604083015215156060820152a1600955005b600a546040516323b872dd60e01b81523360048201523060248201526044810184905294929392918391869160649183915f91165af1928315611177577fed66735ec09b73f80882349a417c96f1ac5bb6bf493441951d147d84c5ed5d8c94608094613b6c575b5091925092613ab5565b613b8290843d8611611170576111618183614814565b5086613b62565b61038357600403613be9575b5050600e5486810180911161034b575f5260078101845260405f209060ff19918783825416179055600e549087820180921161034b576008915f520184528560405f20918254161790558580808080613aaa565b60ff191660041790558680613b95565b54101590508b80613aa3565b601054111592508d613a9c565b90935061038357600685149284613a95565b5f9450600486149350613a8d565b80613c40613c4692856149aa565b90614927565b81558a613a6d565b946006840180549082821190815f14613c8b57613c6b84846149aa565b905b5515613c7d5750505f5b94613a4d565b613c86916149aa565b613c77565b5f90613c6d565b60049198613c40613ca392866149aa565b9790613a37565b60405163fdc7b1fb60e01b8152600490fd5b9091506103835760081488806139fe565b50600a811491505f6139f7565b604051627c247360e31b8152600490fd5b805f526019825260405f205462239880810180911161034b5742108015613d24575b15613980576040516337888d6760e01b8152600490fd5b50805f52601982528360405f2001544211613d0d565b60029150141584613972565b346102a8575f3660031901126102a8576020600e54604051908152f35b346102a857613d7136614753565b905f60a0604051613d8181614787565b828152826020820152826040820152826060820152826080820152015280155f14613e505750600e545b5f52601660205260405f20905f5260205260c060405f2060405190613dcf82614787565b80549182815260018060a01b03918260018201541692602083019384526002820154906040840191825260046003840154936060860194855201549460ff60a0608087019682891615158852019660081c161515865260405196875251166020860152516040850152516060840152511515608083015251151560a0820152f35b613dab565b346102a85760203660031901126102a85760043580613e895750600e545b5f526017602052610a44610a3860405f2061494c565b613e73565b346102a8575f3660031901126102a8576020600c54604051908152f35b346102a8575f3660031901126102a857604051806001916001549283825260208092019360015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6925f905b828210613f1b57610a4486613f0f818a0382614814565b6040519182918261470f565b84546001600160a01b03168752958601959383019390830190613ef8565b346102a8575f3660031901126102a85760ff60125416600581101561038357600481146103715760031461035f57600e54805f526020906019825260405f205462127500810180911161034b574211801561410f575b6140fd5760018111806140d0575b6140be57600d613fad815461499c565b92838255335f52601e815260405f20835f52815260405f2054155f146140ac577fedb73a28656fc54b5b54d180d469da306262375b8fab1d30e7bfdfe6fa4d71a89361071193335f52601e835260405f20905f52825260405f20556014600e5491825f526016815261403860405f20855490815f52835260405f20945f526017835260405f20614a47565b600e545f5260198152614053600260405f2001855490614a47565b8354835560018301336001600160601b0360a01b825416179055335f526018815260405f20545f52526003600160405f20015491015554604051918291338360209093929193604081019460018060a01b031681520152565b604051639fbfc58960e01b8152600490fd5b6040516303a5a26f60e11b8152600490fd5b50335f526018825260405f20545f5260148252600760405f2001815f52825260ff60405f20541615613f9d565b60405163709758ab60e11b8152600490fd5b50805f526019825260405f20544210613f8f565b346102a8575f3660031901126102a85761413b6152f2565b60ff601254166005811015610383576003906003811415908161429e575b50612a6757600b546001808201809211805b61034b5782821015610c3b57815f526020916014835260405f2091858301805461419b6004860191825490614927565b916141ac6005870193845490614927565b936141bd6006880195865490614927565b90600e9a808c54115f1461423f5760098c9b99939b5493019a5b8c54600219810190811161034b57841161421c5761420090845f528c8c5260405f205490614927565b92805f528b8b525f6040812055801561034b575f1901926141d7565b9695935f95929c5085935083919b506001999a505b55555555019091928061416b565b60095f9c9b9c9a99939a9301995b8b5484116142855761426d61427f91855f528c8c5260405f205490614927565b93805f528b8b525f604081205561499c565b9261424d565b9695935f95929c9a5085935083919b5060019950614231565b60049150141582614159565b346102a85760203660031901126102a857600435806142de5750600e545b5f52601d602052610a44610a3860405f2061494c565b6142c8565b346102a8575f3660031901126102a8576142fb6152f2565b335f52601860205260405f20545f52601460205260405f20600681019081549081156143da575f92839055600a54600291909101805460405163a9059cbb60e01b81526001600160a01b039182166004820152602481018590529490926020918691604491839187165af1938415611177577f3d97f39b86d061200a7834082f5926e58ec10fd85a9d6930f497729d5e6cc35c946143bb575b505460408051929091166001600160a01b0316825260208201929092529081908101611ed9565b6143d39060203d602011611170576111618183614814565b5084614394565b6040516365e52d5160e11b8152600490fd5b346102a8576020806003193601126102a8576004359061440a615315565b60125460ff811660058110156103835760048114610371576003811461035f576144e357600b5491600c831080156144d7575b6144c55760015b60048110614495577fe891dc01ac1296966aff69221063a5796adb4993741b159b043f7066e29239396020866144898760018860ff19161760125582600f5582614909565b601055604051908152a1005b805f52601582526004600160405f200154106144b357600101614444565b6040516305a2d66760e11b8152600490fd5b60405163dd5d9ea160e01b8152600490fd5b506003600c541061443d565b6040516305c3c4b960e41b8152600490fd5b346102a85760203660031901126102a8576004358061452e5750600e545b5f52601a602052602060ff60405f2054166040519015158152f35b614513565b346102a8575f3660031901126102a85761454b6152f2565b60ff601254166005811015610383576003811461035f5760048114610371576001036146c257335f52601860205260405f20545f52601460205260405f20600a810180549060ff8216600c811015610383576001036146b05760105460148102908082046014148115171561034b5760646145c7920490614927565b600b810290808204600b149015171561034b57600c610302910492600485016145f1858254614927565b905561ffff1916179055600a546040516323b872dd60e01b815233600482015230602482015260448101839052926001600160a01b0391602090859060649082905f9087165af1908115611177577fa1036ac26bc1acfe7c0581273bb656a2426fb6f32067116729c8fad15a58bfc794600292614691575b50015460408051929091166001600160a01b0316825260208201929092529081908101611ed9565b6146a99060203d602011611170576111618183614814565b5085614669565b60405163991c8dc760e01b8152600490fd5b604051637250f10560e01b8152600490fd5b60209060206040818301928281528551809452019301915f5b8281106146fb575050505090565b8351855293810193928101926001016146ed565b60209060206040818301928281528551809452019301915f5b828110614736575050505090565b83516001600160a01b031685529381019392810192600101614728565b60409060031901126102a8576004359060243590565b6004359081151582036102a857565b6044359081151582036102a857565b60c0810190811067ffffffffffffffff821117611c7957604052565b6060810190811067ffffffffffffffff821117611c7957604052565b610180810190811067ffffffffffffffff821117611c7957604052565b60a0810190811067ffffffffffffffff821117611c7957604052565b6040810190811067ffffffffffffffff821117611c7957604052565b90601f8019910116810190811067ffffffffffffffff821117611c7957604052565b600435906001600160a01b03821682036102a857565b90600c8210156103835752565b919091610180810192805182526020810151602083015260018060a01b036040820151166040830152606081015160608301526080810151608083015260a081015160a083015260c081015160c083015260e0810151151560e08301526101008082015115159083015261012080820151908301526148e1610140808301519084019061484c565b61016080910151916008831015610383570152565b8181029291811591840414171561034b57565b8115614913570490565b634e487b7160e01b5f52601260045260245ffd5b9190820180921161034b57565b908160209103126102a8575180151581036102a85790565b90604051918281549182825260209260208301915f5260205f20935f905b8282106149825750505061498092500383614814565b565b85548452600195860195889550938101939091019061496a565b5f19811461034b5760010190565b9190820391821161034b57565b6001548110156149ec5760015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf601905f90565b634e487b7160e01b5f52603260045260245ffd5b600154156149ec5760015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6905f90565b80548210156149ec575f5260205f2001905f90565b8054600160401b811015611c7957614a6491600182018155614a32565b819291549060031b91821b915f19901b1916179055565b90604051918281549182825260209260208301915f5260205f20935f905b828210614aaf5750505061498092500383614814565b85546001600160a01b031684526001958601958895509381019390910190614a99565b80518210156149ec5760209160051b010190565b6001548015614b18575f1901614b13614afe826149b7565b81549060018060a01b039060031b1b19169055565b600155565b634e487b7160e01b5f52603160045260245ffd5b80548015614b18575f190190614b45614afe8383614a32565b55565b60405190614b55826147bf565b5f610160838281528260208201528260408201528260608201528260808201528260a08201528260c08201528260e08201528261010082015282610120820152826101408201520152565b600c8210156103835752565b60088210156103835752565b90600e54805f52601960205260405f205462151800810180911161034b57421080156152cf575b6152bd57805f1981011161034b575f1981015f52601660205260405f20335f52601e60205260405f205f1983015f5260205260405f20545f5260205260405f209260018060a01b03600185015416908133036152ab5760048501805460ff8116156152995760ff8160081c1661528757835f52601860205260405f20545f52601460205260ff600a60405f20015416600c811015610383576004036108765761ff00191661010017905561523657505f1981015f526017602052614ca560405f2061494c565b5f915f5b8251811015614cfd575f1982015f52601660205260405f20614ccb8285614ad2565b515f5260205260ff600460405f20015416614ce9575b600101614ca9565b92614cf560019161499c565b939050614ce1565b50614d1b9291505f19015f526019602052600360405f200154614909565b915f8093600193600b54945b60018601861161034b5760018601811015614d7c57805f52601460205260ff600a60405f20015416600c81101561038357600414614d68575b600101614d27565b95614d7460019161499c565b969050614d60565b509091929350606093600e545f52601a60205260ff60405f205416615210575b614da68684614909565b925f9660015b600b5460018101811161034b57600101811015614e4657805f52601460205260405f2060ff600a82015416600c81101561038357600414614df1575b50600101614dac565b6003018054919791878110614e21575b600192614e1a92614e138a80946149aa565b9055614927565b9690614de8565b600192614e39614e1a939c613c4084614e139c6149aa565b9b82995092509250614e01565b509094939195969296805180614ff4575b5050848410614f2b575050505060028201819055600a54600183015460405163a9059cbb60e01b81526001600160a01b039182166004820152602481018490529391602091859116815f81604481015b03925af1928315611177577f1d3e1b711499f6260ce9c1c1eeabe0f46dfc60b81542d0021ecef0716d0ed1cb93614f0c575b5060018101549054604080516001600160a01b03909316835260208301939093529181019190915280606081015b0390a1565b614f249060203d602011611170576111618183614814565b505f614ed9565b6402540be400614f3b85876149aa565b1015614f8d5750505060028301819055600a54600184015460405163a9059cbb60e01b81526001600160a01b0391821660048201526024810193909352919391602091859116815f8160448101614ea7565b7fd2c92d0f1dd9e4ffc64744c794d5c6f0c58306865dcb816a20cf0db5c300d97e955060a094600360ff1960125416176012556040519485526020850152604084015260608301526080820152a15f8051602061548b8339815191526020604051428152a1565b5f989498979391959692975088155f146151f65750969591959492945b875f935b86518510156151e6576150288588614ad2565b515f52601460205260018060a01b03600260405f200154165f52601b60205260405f20545f526015602052615062600160405f2001614a7b565b965f985f9a5f5b8a5181101561512d576001600160a01b03615084828d614ad2565b51165f52601860205260405f20545f52601460205260405f2060ff600a82015416600c811015610383576004146150bf575b50600101615069565b909b9c6150cb9061499c565b9c8015801580615120575b156150ec575050600460019101549b5b906150b6565b9c91909c6150fe575b506001906150e6565b6004919c5001548060011b908082046002149015171561034b579a60016150f5565b50600483015482116150d6565b5092959194999093979b969a6151439088614909565b90808210156151de5750985b5f5b89518110156151c5576001600160a01b0361516c828c614ad2565b51165f52601860205260405f20545f52601460205260405f2060ff600a82015416600c811015610383576004146151a7575b50600101615151565b8b6001929e60046151be9301614e138382546149aa565b9c9061519e565b50959a9199929850929650946001909101939192615015565b90509861514f565b9296985092509293505f80614e57565b90613c40615204928a614909565b96959195949294615011565b949350601d60205261523061522760405f2061494c565b94855190614927565b94614d9c565b5f60028501559254604080516001600160a01b039095168552602085019190915291927f2f6a2242608827783b40fb797960e2d61ea6e692e9c61049f223ec66f18bbc429290915081908101614f07565b604051630c8d9eab60e31b8152600490fd5b604051636a9a57a560e01b8152600490fd5b604051634a7777b360e11b8152600490fd5b60405163215eb65f60e21b8152600490fd5b50805f52601960205260405f205462224700810180911161034b57421015614bdf565b600260095414615303576002600955565b604051633ee5aeb560e01b8152600490fd5b5f546001600160a01b0316330361532857565b6040516306b66d0160e01b8152336004820152602490fd5b905f905f5b8354811015615381576153588185614a32565b90543360039290921b1c6001600160a01b031614615379575b600101615345565b915081615371565b509180545f19810190811161034b57614980926153ae6153a46130159385614a32565b9190549285614a32565b81546001600160a01b03600392831b81811b199092169490921b9490941c1690921b179055565b5f52601960205260405f2054804210908115615405575b506153f357565b6040516307f1ee4960e31b8152600490fd5b90506203f480810180911161034b5742115f6153ec565b5f526019602052600260405f2001541561543257565b60405163a8de391160e01b8152600490fd5b5f80546001600160a01b039283166001600160a01b03198216811783559216907f688b8f34d886f8a2414b39aa6cef1ec6198215ba9b47fe8ac4260b44139bd5b69080a356fe7a406291d7dedc33dcf93635d6443b37b6f30b4d33a6b86f5e2427e9d96f7c22a26469706673582212208ea780fafc4c83eaeb08f66091822cccd8bd0680aca88d2bcfc77e21af995c1164736f6c63430008170033',
    sourceMap:
      '274:71126:3:-:0;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;-1:-1:-1;;;;;274:71126:3;;;;;;;:::i;:::-;;766:30:4;;;762:101;;-1:-1:-1;274:71126:3;;;;;;;;;;;;;;-1:-1:-1;274:71126:3;;;;;;2279:44:4;-1:-1:-1;2279:44:4;;1857:1:2;2061:21;1857:1;274:71126:3;;5353:36;274:71126;;;5353:36;274:71126;;;5399:48;274:71126;;5399:48;274:71126;;;;;;;;762:101:4;274:71126:3;;-1:-1:-1;;;819:33:4;;-1:-1:-1;819:33:4;;;274:71126:3;;;819:33:4;274:71126:3;-1:-1:-1;274:71126:3;;;;;;-1:-1:-1;274:71126:3;;;;;-1:-1:-1;274:71126:3;;;;-1:-1:-1;;;;;274:71126:3;;;;;;:::o',
    linkReferences: {},
  },
  deployedBytecode: {
    object:
      '0x60806040526004361015610011575f80fd5b5f3560e01c8062b16fee146145335780630a5b34f2146144f5578063108f1d03146143ec578063110f8874146142e35780631401e6cc146142aa57806316bfe25c146141235780631afbd12814613f395780632250e16614613eab578063256b7e2314613e8e5780632647092314613e5557806335bd2c5d14613d63578063396b624714613d4657806339786a96146139225780633cf1aa95146138585780633f1b3f8f1461370f57806342c1b0ef146134955780634ae4ab48146132af5780634ee4a857146132305780634ee9c6f7146131a157806350c8e1fd146130815780635c6af45614612ea65780635d86b8e114612e895780636619980814612e4b5780636b61aed914612e135780636d4da76d14612deb57806372547ec914612a85578063756b01b6146128975780637985940d1461286e5780637b47d7e814612851578063881d59be1461282a578063953434ae1461280d57806395ccea671461265c5780639e99d7c6146123ae578063a504f809146121c3578063a8fdb788146120d2578063ac115bbe146120b5578063b87b1d0d14611fa5578063bc017b5714611cb1578063be47120614611a89578063c1fb07fc14611965578063c2a41da014611943578063c3a4229714611317578063c4afc37a14610ff3578063cb695ef414610fd6578063d26a624b14610c42578063d98b250314610bf3578063dbcd14f014610a92578063dea182c114610a6a578063e15d69f314610a4d578063e26747c514610a04578063e329972d14610904578063ec15a89014610746578063f2ddec411461060c578063f34cf775146105ef578063f3f02d0314610397578063fb3944f1146102ac5763fef4c5501461028b575f80fd5b346102a8575f3660031901126102a8576020600854604051908152f35b5f80fd5b346102a8575f3660031901126102a8576102c4615315565b60ff60125416600581101561038357600481146103715760031461035f57600e54805f526019602052600160405f2001549062015180820180921161034b575f526019602052600160405f200155600e545f527f1053ff2559207f3358e287928bbde971ad88f7b99c0335368afe0c5baf1ef55f6020600160405f200154604051908152a1005b634e487b7160e01b5f52601160045260245ffd5b60405163f856e0a560e01b8152600490fd5b6040516338f25eb760e21b8152600490fd5b634e487b7160e01b5f52602160045260245ffd5b346102a8575f3660031901126102a8576012805460059160ff9182168381101561038357600481146103715760031461035f5760015b600b546001810180911161034b578110156105ed57805f526020906014825260405f2091600a8301908582541691600c831015928361038357801515806105df575b84816105ce575b816105bd575b50610430575b5050505060019150016103cd565b60089283870194600e92835491825f528784528b60405f2054165f14610560575050835460ff19166004178455505b888854168a811015610383576001148061054b575b610526575b88885416948a861015610383576001977f732dc60c5d1b1df84f06b7e689c1024b7164003eeeded6276c17827b428734c8966040966104e3958d9460028094149081610511575b506104ed575b5050898060a01b039101541693541690845193845283019061484c565ba185808080610422565b60ff199182895416178855545f52600783018552875f209081541690558d806104c6565b905081545f52865284895f205416155f6104c0565b60ff1960068185541617845582545f5260078801825260405f20908154169055610479565b5081545f528481528860405f20541615610474565b610383576004148061059e575b610578575b5061045f565b5f19810190811161034b575f52601c815260405f20600160ff198254161790558a610572565b505f19810181811161034b575f52601c82528960405f2054161561056d565b90506103835760098114158461041c565b905061038357600181141584610416565b505f9350600281141561040f565b005b346102a8575f3660031901126102a8576020600d54604051908152f35b346102a85760203660031901126102a857610625614836565b60ff601254166005811015610383576003811461035f57610644615315565b6004811461037157801515908161073a575b50610728576001600160a01b0381165f8181526018602052604090205490919061071657600a7f6041a3b674b81a0fecc93042cf89f30bf96db96073f1312e253264f8a5cceba3926106a9600b5461499c565b600b8181555f8281526014602090815260408083208581558684526018835292819020949094556002820180546001600160a01b03191690951790945593909301805461ffff1916610101179055915482516001600160a01b03909416845290830152819081015b0390a1005b60405163f411c32760e01b8152600490fd5b60405163897c9a9360e01b8152600490fd5b60019150141582610656565b346102a8576020806003193601126102a85760043590610764615315565b60ff6012541660058110156103835760048114610371576003811461035f57600181141590816108f8575b506108e657600e5491825f526019825260405f20546213c680810180821161034b5742119081156108dc575b506108ca57825f526016825260405f20815f52825260405f208054938285036108b85760018201546001600160a01b03165f818152601886526040808220548252601487529020600a015490919060ff16600c8110156103835760041491821592610888575b5050610876577f3d37a493337dd24e7cb7bec23d4bde6447e3a1d6e75803de86dbf9f9b5732b8493600461086d9201600160ff19825416179055600e545f526013845260405f20614a47565b604051908152a1005b6040516329ceba1160e11b8152600490fd5b9091505f526018845260405f20545f5260148452600760405f2001905f52835260ff60405f205416158580610821565b60405163e22b971160e01b8152600490fd5b604051633341b44560e11b8152600490fd5b90504210846107bb565b604051637bf65ebd60e11b8152600490fd5b6002915014158361078f565b346102a8576020806003193601126102a8576004355f6080604051610928816147dc565b828152828582015260606040820152826060820152015280155f146109ff5750600e545b5f526019815260405f20604051610962816147dc565b815481526001926001830154928183019384526109816002820161494c565b9160408401928352600460038301549260608601938452015492608085019384526040519582875260c08701955183880152516040870152519360a0606087015284518091528160e087019501915f5b8281106109ec5784516080890152855160a089015287870388f35b83518752958101959281019288016109d1565b61094c565b346102a85760203660031901126102a85760043580610a485750600e545b5f526013602052610a44610a3860405f2061494c565b604051918291826146d4565b0390f35b610a22565b346102a8575f3660031901126102a8576020600754604051908152f35b346102a8575f3660031901126102a857600a546040516001600160a01b039091168152602090f35b346102a85760603660031901126102a857600435610aae614778565b60ff60125416916005831015610383576004831461037157600380931461035f57805f52601560205260405f20916024355f52601460205260405f20600a81019485549460ff8616600c81101561038357600703610be2575f915f9060018093018054925b838110610bac575b505050505015610b9a577f5cf6fd140141a8a14aca1d538d93e40de68c6a776df311ae862a898ea2a660ef946080948315610b8a5750805461ffff19166105041790555b60020154604080516001600160a01b03909216825233602083015281019290925215156060820152a1005b61ff001916610700179055610b5f565b604051633d76489160e01b8152600490fd5b610bb68183614a32565b90543391851b1c6001600160a01b031614610bd2578401610b13565b5050505090508680808080610b1b565b60405162789f4360e21b8152600490fd5b346102a85760203660031901126102a857610c0c614769565b610c146152f2565b60ff60125416600581101561038357600481146103715760031461035f57610c3b90614bb8565b6001600955005b346102a85760203660031901126102a857610c5b614836565b6001600160a01b0381811691908215610fc45760ff60125416600581101561038357600380911461035f575f335f52601860205260405f20548015159081610f9e575b50610f96575b15610b9a5760055460ff8116610f60575b505f925f93600194858054915b828110610f375750505015610f255781548316158080610f19575b80610f0c575b610edf5715610e6d57600380546001600160a01b0319166001600160a01b0390921691909117905542600855600e546006555b818154169283151580610e60575b610d56575b7f882febe0458c27b4ed12caa22ad034f24f206e2da9aa922015eff66e45f2006b602086604051908152a1005b5f9492938460045416145f14610e3f57610d7284835416615444565b8054825485165f5b828110610e18575050505b6001600160601b0360a01b8083541683556004541660045554935f19850194851161034b57610dea602094610e0893610dde7f882febe0458c27b4ed12caa22ad034f24f206e2da9aa922015eff66e45f2006b986149b7565b9054911b1c16916149b7565b90919060018060a01b038084549260031b9316831b921b1916179055565b610e10614ae6565b918380610d29565b8187610e23836149b7565b905490881b1c1614610e37575b8301610d7a565b965086610e30565b9350610e5983610e4d614a00565b905490841b1c16615444565b5f93610d85565b5082600454161515610d24565b60085462015180810180911161034b5780421080610eff575b15610ea4575050600480546001600160a01b03191685179055610d16565b421180610ef1575b15610edf57600380546001600160a01b0319166001600160a01b0390921691909117905542600855600e54600655610d16565b604051637787a74d60e01b8152600490fd5b50600654600e541415610eac565b50600654600e5414610e86565b50600654600e5414610ce3565b50836004541615610cdd565b6040516362c9b45b60e01b8152600490fd5b86610f41826149b7565b905490881b1c168914610f57575b018690610cc2565b92508092610f4f565b60075462093a80810180911161034b57421015610f895760405163349944a560e21b8152600490fd5b60ff191660055584610cb5565b506001610ca4565b90505f52601460205260ff600a60405f20015416600c8110156103835760041486610c9e565b604051631e7d738760e21b8152600490fd5b346102a8575f3660031901126102a8576020600b54604051908152f35b346102a85760203660031901126102a85761100c614769565b6110146152f2565b60ff60125416600581101561038357600481146103715760031461035f57600e54805f52601960205260405f205462054600810180911161034b57421180156112f5575b6112e3575f19810190811161034b575f52601360205260405f20546112d157600b5460015b60018201821161034b57600182018110156112a657805f52601460205260405f20906005820180549081611297575b5050600e546001811180611276575b80611269575b6111ea575b50600e546003811161118f575b508380611182575b6110ea575b600191500161107d565b6006820180545f91829055600a5460029094015460405163a9059cbb60e01b81526001600160a01b039182166004820152602481019290925290936020928592604492849291165af191821561117757600192611148575b506110e0565b6111699060203d602011611170575b6111618183614814565b810190614934565b5084611142565b503d611157565b6040513d5f823e3d90fd5b50600682015415156110db565b8060021981011161034b57600219015f526009820160205260405f205480156110d3576111c160068401918254614927565b9055600e548060021981011161034b57600219015f52600982016020525f6040812055846110d3565b60ff60125416600581101561038357600214908161124a575b501561123757600382015f81549155600e54805f1981011161034b575f19015f526009830160205260405f20555b846110c6565b600382015f815491556006830155611231565b5f1981019150811161034b575f52601360205260405f20541585611203565b50600383015415156110c1565b50805f1981011161034b575f1981015f52601360205260405f2054156110bb565b5f9055600683015584806110ac565b7f01c9e927536754e1d95ea7a9eda17265ab11a240401b5926f33c0eb76c9d7f335f80a16001600955005b60405163fcb6f0ab60e01b8152600490fd5b60405163d53184ed60e01b8152600490fd5b50805f52601960205260405f20546203f480810180911161034b574210611058565b346102a8575f3660031901126102a85761132f615315565b60125460ff81169060058210156103835760048214610371576003821461035f575f91600181141580611935575b6108e657600e548015158061191d575b61190b5761137a9061499c565b9283600e5561038357600214611813575b505f52601960205260405f20428155600f54611407575b62278d00420180421161034b578160039160017f08a7ba25f6100ab18c633572926abf5bd6a45439a9322adee245bc3a9685efda940155600f549182910155600e54610711601054604051938493846040919493926060820195825260208201520152565b60ff60125416600581101561038357600481146103715760031461035f5760015b600b546001810180911161034b5781101561166257805f52601460205260405f209060ff600a83015416600c81101590816103835780151580611654575b8281611643575b81611632575b50611485575b50506001915001611428565b600e5491825f526008850160205260ff60405f2054165f146115d257505050600a8201805460ff191660041790555b60ff60125416600581101561038357600114806115b7575b61158a575b60ff601254169160058310156103835760407f732dc60c5d1b1df84f06b7e689c1024b7164003eeeded6276c17827b428734c89160026001951480611570575b611544575b61153c60ff600a878060a01b03600285015416930154168351928352602083019061484c565ba18380611479565b60ff19600881600a8401541617600a830155600e545f5260078201602052825f20908154169055611516565b50600e545f526008810160205260ff825f20541615611511565b60ff19600681600a8501541617600a840155600e545f526007830160205260405f209081541690556114d1565b50600e545f526008820160205260ff60405f205416156114cc565b6103835760041480611611575b6115ea575b506114b4565b5f19810190811161034b575f52601c60205260405f20600160ff19825416179055836115e4565b505f19810181811161034b575f52601c60205260ff60405f205416156115df565b905061038357600981141582611473565b90506103835760018114158261146d565b505f91506002811415611466565b5060015b600c80546001810180911161034b5782101561175757815f526015602052600160405f2001805460048110908161174d575b506116a8575b5050600101611666565b90925f5b8254811015611741576116bf8184614a32565b60018060a01b0391549060031b1c165f52601860205260405f20545f52601460205260405f2090600a82019182549260ff841693888510156103835760046001951461170f575b505050016116ac565b60089060ff1916179055600660038201915f8354816117346004850192835490614927565b9555550155868080611706565b5092505060018361169e565b9050151585611698565b50505f90600190600b546001810180911192835b61034b57818110156117b857805f52601460205260ff600a60405f20015416600c811015610383576004146117a4575b6001018361176b565b936117b060019161499c565b94905061179b565b50509190506001600e54116117ce575b506113a2565b806117ff5750600360ff1960125416176012555f8051602061548b8339815191526020604051428152a15b816117c8565b61180b90600f54614909565b6010556117f9565b5f19820182811161034b57805f526020601a815260ff60405f2054161591826118e8575b826118c5575b826118ac575b5081611889575b81611866575b501561138b5760ff19166001176012558161138b565b6002198401915083821161034b57601c915f525260ff60405f2054161583611850565b9050600119830183811161034b575f52601c815260ff60405f205416159061184a565b9091505f52601c815260ff60405f205416159084611843565b9150600219840184811161034b575f52601a815260ff60405f205416159161183d565b9150600119840184811161034b575f52601a815260ff60405f2054161591611837565b6040516307318e9360e31b8152600490fd5b50805f526019602052600160405f200154421061136d565b505f9250600281141561135d565b346102a8575f3660031901126102a857602060ff600554166040519015158152f35b346102a85760403660031901126102a857610a44611981614836565b611a7760ff602435611991614b48565b506001600160a01b039384165f90815260186020908152604080832054835260148252909120909180611a835750600e54945b81549560018301549160028401541690600384015460048501546005860154916006870154935f526007870188528860405f205416946008880189528960405f20541696600989018a52600a60405f2054990154996040519d8e611a27816147bf565b528d015260408c015260608b015260808a015260a089015260c0880152151560e08701521515610100860152610120850152611a698282166101408601614ba0565b60081c166101608301614bac565b60405191829182614859565b946119c4565b346102a85760603660031901126102a857611aa2614836565b602435611aad614778565b9160ff601254166005811015610383576003811461035f57600490611ad0615315565b1461037157815f52601560205260405f209260018060a01b03908183165f52601860205260405f20545f52601460205260405f2091855415611c9f57600283015416918215611c8d576001860192835490600160401b821015611c7957610dea826001611b409401875586614a32565b8115611c3757600a81019586549360ff8516600c81101561038357600503611c25578660016002947fd23000da82104e78ccbf3c41c153eca50a357a80f2ae156096b8b1b43f36f2e19a60076107119960ff19161790555b01555460048110159081611c19575b5015611bf95701805460ff811615611be9575b50505b604080516001600160a01b03909416845260208401949094521515928201929092529081906060820190565b60ff191660011790558580611bba565b01805460ff8116611c0c575b5050611bbd565b60ff191690558580611c05565b60079150111588611ba7565b6040516333ddf1dd60e01b8152600490fd5b7fd23000da82104e78ccbf3c41c153eca50a357a80f2ae156096b8b1b43f36f2e1956107119386600184600a6002960161020061ff0019825416179055611b98565b634e487b7160e01b5f52604160045260245ffd5b6040516339ec64c160e11b8152600490fd5b604051635ad439e560e11b8152600490fd5b346102a8575f3660031901126102a857611cc96152f2565b611cd1615315565b60ff8060125416600581101561038357600481146103715760031461035f57600e54611cfc816153d5565b611d058161541c565b5f5260206019815260405f20600360048201549101549081811015611f9357611d2d916149aa565b5f905f600b5493600180860180961195865b61034b5780821015611dd357815f526014835260405f209188600a8401541692600c841015610383576004899414611d7c575b5060010191611d3f565b94611d8860049161499c565b9501548015611d725790968015801580611dca575b15611daf575050600190965b90611d72565b90979150611dc0575b600190611da9565b9495508594611db8565b50818310611d9d565b90508593879580611de48684614909565b1015611f8d5750611df58482614909565b935b5f926001875b61034b5781811015611e6257805f526014865260405f209089600a8301541691600c83101561038357600460019314611e39575b500187611dfd565b60040180548980821015611e4f575b5050611e31565b611e58916149aa565b90558a8089611e48565b8487858886600e545f5260198252600460405f2001611e82848254614927565b905582611e8f82866148f6565b10611ee3575b5050611ed97f39657cef6eb725e291a5e37fe8032a18477b98dd7abc4a03d93428153eff3d0393604051938493846040919493926060820195825260208201520152565b0390a16001600955005b611ef9919450611ef390846148f6565b826149aa565b600a546040516323b872dd60e01b8152336004820152306024820152604481018390529491908290869060649082905f906001600160a01b03165af1918215611177577f39657cef6eb725e291a5e37fe8032a18477b98dd7abc4a03d93428153eff3d0395611ed993611f6f575b505093611e95565b81611f8592903d10611170576111618183614814565b508580611f67565b93611df7565b604051633958314d60e01b8152600490fd5b346102a85760203660031901126102a857611fbe614836565b611fc6615315565b60ff6012541690600582101561038357600380921461035f576001600160a01b039081169182612062575b5050600654600e5414612050576020817f9d35d6f02c23b682244e3ab27b9be76fa329228dd25ecfa1b9b9974d77c22a14926001600160601b0360a01b600254161760025542600755600160ff196005541617600555604051908152a1005b60405163349944a560e21b8152600490fd5b5f915f90600192600154925b838110612087575b505050505015610b9a578180611ff1565b82612091826149b7565b905490841b1c1687146120a557840161206e565b5050505090508280808080612076565b346102a8575f3660031901126102a8576020600654604051908152f35b346102a857610a44612178611a7760ff6120eb36614753565b906120f4614b48565b505f52601460205260405f209080155f146121bd5750600e54905b80549160018201549060018060a01b0360028401541690600384015460048501546005860154916006870154935f52600787016020528860405f20541694600888016020528960405f2054169660098901602052600a60405f2054990154996040519d8e6147bf565b8d5260208d015260408c015260608b015260808a015260a089015260c0880152151560e08701521515610100860152610120850152611a698282166101408601614ba0565b9061210f565b346102a8575f3660031901126102a85760ff60125416600581101561038357600380911461035f5760055460ff81161561239c575f905f91600192838054915b82811061236c5750505015610b9a5760ff19166005556002546001600160a01b03919082163381036122c0575061223933615444565b5f915f918054925b8381106122995750505f19820191821161034b5761226593610dde610dea936149b7565b61226d614ae6565b7f6a36d5245b4e10f0299e42d1766cde6e266f8168b22e7cb0f8ab6e71021a54e56020604051338152a1005b826122a3826149b7565b905490881b1c1633146122b8575b8101612241565b9350836122b1565b151580612354575b61234257816122d5614a00565b905490851b1c1633145f14612330576122fc826122f0614a00565b905490861b1c16615444565b545f1981019290831161034b57612315612323936149b7565b9054911b1c16610dea614a00565b61232b614ae6565b61226d565b6040516301bb5b1f60e51b8152600490fd5b604051631a0a745560e11b8152600490fd5b5060075462015180810180911161034b5742106122c8565b612375816149b7565b90543391891b1c6001600160a01b031614612393575b018490612203565b9250809261238b565b604051631e72ba9760e01b8152600490fd5b346102a8575f3660031901126102a85760ff8060125416600581101561038357600481146103715760031461035f57335f5260206018815260405f20545f526014906014815260405f20906001928383019485545f526015835260405f206002850160018060a01b0397888254161561264a57600e54805f526019875260405f20546203f480810180911161034b5742118015612636575b612624575f19810190811161034b575f526017865260405f20541561261257600a91600a8801998960099560ff199c8d81541660091790550161248890615340565b82549154165f52601b875260405f20555f9055600e545f52601d855260405f2086546124b391614a47565b60038601805490600488019182546124ca91614927565b60058901555f90555f90556012549160ff8316600581101561038357881461256b575b50505050506007601a92600e545f5201815260405f20848154169055600e545f525260405f2091825460ff81161561255e575b600e546040805133815260208101929092527f188272a28ee264707f833eac91033ac3a9a04f67845e5a9034afc774a4a9603c919081908101610711565b1617905580808080612520565b600b54965f95909489939091898501808b11865b6125c3575b50505050505050600c850294808604600c149015171561034b57866007936064601a9704106125b5575b82956124ed565b1660021760125586866125ae565b8061034b578187101561260d57865f52828b52848460405f2001541696600c88101561038357868e98146125fa575b87019661257f565b99612605889161499c565b9a90506125f2565b612584565b604051631f86a3f560e21b8152600490fd5b6040516379055d9d60e01b8152600490fd5b50805f526019875260405f20544210612446565b60405163092ebc6d60e31b8152600490fd5b346102a85760403660031901126102a857612675614836565b6024356126806152f2565b612688615315565b60ff60125416600581101561038357600481036127fb5760115462015180810180911161034b5742106127e95760031461035f576001600160a01b0382811615610fc457600a5416916040516370a0823160e01b81523060048201526020908181602481885afa80156111775784915f916127b8575b50106127a65760405163a9059cbb60e01b81526001600160a01b038316600482015260248101849052938190859060449082905f905af1938415611177577f20a3ee7ebf8af442c82daa0e821d3c5a43acc00c80968747a24d6e7f3663d35494612788575b5050604080516001600160a01b03909216825260208201929092529081908101611ed9565b8161279e92903d10611170576111618183614814565b508380612763565b60405163356680b760e01b8152600490fd5b809250838092503d83116127e2575b6127d18183614814565b810103126102a857839051866126fe565b503d6127c7565b6040516302e9939360e41b8152600490fd5b604051633b1cf39760e21b8152600490fd5b346102a8575f3660031901126102a8576020600f54604051908152f35b346102a8575f3660031901126102a8575f546040516001600160a01b039091168152602090f35b346102a8575f3660031901126102a8576020601154604051908152f35b346102a8575f3660031901126102a85760ff601254166040516005821015610383576020918152f35b346102a8575f3660031901126102a8576128af615315565b60125460ff8116600581101561038357600481146103715760031461035f5760ff1916600417601255426011556128e46152f2565b60ff6012541660058110156103835760038114159081612a79575b50612a6757600b546001905b60018101811161034b5760018101821015612a3657815f52601460205260405f209161295c6129516129466003860154600487015490614927565b600586015490614927565b600685015490614927565b906003600e54115f146129e257600e546009850193925b600e54600219810190811161034b5782116129bb5761299e90825f528560205260405f205490614927565b90805f52846020525f6040812055801561034b575f190190612973565b91929460019450600691505b5f60038201555f60048201555f60058201550155019061290b565b91905f905b600e548211612a2857612a0c612a2291835f526009870160205260405f205490614927565b91805f52600986016020525f604081205561499c565b906129e7565b9050600660019392946129c7565b60016009557fac72b0b13eb85909e8e5deeb2bb65c912e147d60cfd7284a17b85e0fe88fdae66020604051428152a1005b60405163a7c1043560e01b8152600490fd5b600491501415816128ff565b346102a8576020806003193601126102a857600435612aa2615315565b60ff601281601254169060059160058110156103835760048114610371576003811461035f575f908015159081612ddc575b5061072857600f54612baa575b50505081600f555f9060018091600b548260018201809211905b612b52575b7fd4116e5003fcbb3a549e4e271b1d73063c38f23828139309c6ac1ef0700a4a506040888a612b2f8a83614909565b601055600e545f5260198152816003845f200155601054908351928352820152a1005b8095949561034b5781861015612ba257855f526014885282600a60405f20015416600c81101561038357600414612b8f575b838095960194612afb565b83612b9a819661499c565b955050612b84565b849550612b00565b94909291946103835760015b600b546001810180911161034b57811015612dcf57805f526014825260405f2090600a820184815416600c81101591826103835781151580612dc1575b8381612db0575b81612d9f575b50612c13575b5050506001915001612bb6565b60089182860193600e91825491825f52868a528a60405f2054165f14612d42575050825460ff19166004178355505b878954168b8110156103835760011480612d2d575b612d08575b87895416938b851015610383576001967f732dc60c5d1b1df84f06b7e689c1024b7164003eeeded6276c17827b428734c895604095612cc6948c9460028094149081612cf3575b50612ccf575b5050888060a01b039101541692541683519283528783019061484c565ba1878080612c06565b60ff199182885416178755545f52600783018b52865f209081541690558e80612ca9565b905081545f528c5284885f205416155f612ca3565b60ff1960068184541617835581545f5260078701885260405f20908154169055612c5c565b5080545f528387528760405f20541615612c57565b6103835760041480612d80575b612d5a575b50612c42565b5f19810190811161034b575f52601c875260405f20600160ff198254161790558b612d54565b505f19810181811161034b575f52601c88528860405f20541615612d4f565b905061038357600982141583612c00565b905061038357600182141583612bfa565b505f92506002821415612bf3565b5093509050838080612ae1565b91505060015f91141587612ad4565b346102a8575f3660031901126102a8576002546040516001600160a01b039091168152602090f35b346102a85760203660031901126102a8576001600160a01b03612e34614836565b165f526018602052602060405f2054604051908152f35b346102a85760203660031901126102a85760043580612e845750600e545b5f52601c602052602060ff60405f2054166040519015158152f35b612e69565b346102a8575f3660031901126102a8576020601054604051908152f35b346102a8576020806003193601126102a857612ec0614769565b60ff601254166005811015610383576004811461037157600380911461035f57335f526018835260405f20545f526014835260405f209060019060018301948554801561306f575f526015815260405f2092855f14612f9e5750505050600a019182549260ff841693600c851015610383577f4506ecebb8afddc27b5896d964fe56a6aa511603ed4fac7fb871650473f2175d94600703612f8e5750805461ff0019166103001790555b54604080513381526020810192909252911515918101919091528060608101610711565b61ff001916610500179055612f6a565b90919593505f9060015f9401968754945b858110613040575050505f19830192831161034b578561301561301a92610dea612ffc6014977f4506ecebb8afddc27b5896d964fe56a6aa511603ed4fac7fb871650473f2175d9b614a32565b905460039190911b1c6001600160a01b03169184614a32565b614b2c565b335f526018815260405f20545f5252600a60405f2001600a60ff19825416179055612f6a565b61304a818a614a32565b905490831b1c6001600160a01b03163314613067575b8201612faf565b925082613060565b60405163b4479a6360e01b8152600490fd5b346102a8575f3660031901126102a8576130996152f2565b6130a1615315565b60ff60125416600581101561038357600481146103715760031461035f57600e546130cb816153d5565b6130d48161541c565b5f52601960205260405f20600481016003815492015480831015611f93576130ff83613106926149aa565b8093614927565b9055600a546040516323b872dd60e01b8152336004820152306024820152604481018390529190602090839060649082905f906001600160a01b03165af1908115611177577f11f018c083eb908425163290b18ec4bff42c1ba4edf4020de879c7ae1b7ce0f392602092613184575b50604051908152a16001600955005b61319a90833d8511611170576111618183614814565b5083613175565b346102a8575f3660031901126102a857604080516131be816147f8565b36903760405160035f825b6002821061321057836131db816147f8565b604051905f90825b600283106131f057604084f35b81516001600160a01b0316815260019290920191602091820191016131e3565b82546001600160a01b0316815260019283019291909101906020016131c9565b346102a8575f3660031901126102a85760ff601254166005811015610383576003811461035f57600490613262615315565b14610371577f3b88d52dc51aa53d344c3581f44ecf26dd6a764b15cd0e86e576d816c28361636020613295600c5461499c565b80600c55805f52601582528060405f2055604051908152a1005b346102a8575f3660031901126102a85760ff60125416600581101561038357600481146103715760031461035f57335f52601860205260405f20545f52601460205260405f20600181019081545f52601560205260405f209160018060a01b036002830154161561264a575f9055600a8101805460ff1916600517905561333860018301615340565b600e545f526007810160205260405f2060ff198154169055600381015f8154816133686004860192835490614927565b93555560069061337d60068401918254614927565b905560046001840154106133df575b50600281015491549054604080516001600160a01b0390941684526020840192909252908201527fed11cf2f685bc5fb16110aa145d0b495f9cfdc2ed33e03b9362d4bdc3fba262d908060608101610711565b60028301805460ff191690555f5b600184015481101561346d5780613408600192838701614a32565b838060a01b0391549060031b1c165f52601860205260405f20545f52601460205260405f20600a8101600560ff198254161790556134658460038301925f8454816134596004850192835490614927565b96555501918254614927565b9055016133ed565b50507fed11cf2f685bc5fb16110aa145d0b495f9cfdc2ed33e03b9362d4bdc3fba262d61338c565b346102a8576020806003193601126102a8576004359067ffffffffffffffff8083116102a857366023840112156102a85782600401359260249184116136fb578360051b604051946134e985830187614814565b85528284860191830101913683116102a8578301905b8282106136dc57505050613511615315565b60ff6012541660058110156136c85760031461035f57600b5490600c821015806136bd575b1561368f57600284511061367d57929190925b5f936001928184809301809111925b61358d575b6040517f37624b43bc21d01bec4f033a1fb10552d28b406b1a68210476d53af5a7d4e68e9080610711898261470f565b8551871015613678575f85805b6135f9575b5015610b9a576001600160a01b036135b78888614ad2565b5116968554600160401b8110156135e657906135de879899610dea848a80960186556149b7565b019695613558565b85634e487b7160e01b5f5260416004525ffd5b84919498979596986136655782811015613658576001600160a01b03806136208a89614ad2565b511690825f5260148652600260405f200154161461364a579697949694959490939086018661359a565b50925086949395968861359f565b979594969793909361359f565b86634e487b7160e01b5f5260116004525ffd5b61355d565b6040516350a01e1d60e11b8152600490fd5b602382116136a1575b92919092613549565b600684511015613698576040516350a01e1d60e11b8152600490fd5b506023821115613536565b50634e487b7160e01b5f9081526021600452fd5b81356001600160a01b03811681036102a85781529084019084016134ff565b50634e487b7160e01b5f9081526041600452fd5b346102a8575f3660031901126102a8576137276152f2565b61372f615315565b60125460ff81166005811015610383576004036127fb5760115462015180810180911161034b5742106127e95760ff1916600317601255600a546040516370a0823160e01b81523060048201526001600160a01b0391909116906020908181602481865afa908115611177575f9161382b575b5060105481106137ca575b5f8051602061548b83398151915282604051428152a16001600955005b60405163a9059cbb60e01b81523360048201526024810191909152918190839060449082905f905af1918215611177575f8051602061548b83398151915292156137ad5761382490823d8411611170576111618183614814565b50826137ad565b90508181813d8311613851575b6138428183614814565b810103126102a85751836137a2565b503d613838565b346102a8576020806003193601126102a8575f60408051613878816147a3565b82815260608482015201526004355f526015815260405f2060405161389c816147a3565b8154815260019260ff60026138b360018601614a7b565b9483850195865201541690604083019115158252604051938185526080850193518286015251926060604086015283518091528160a086019401915f5b8281106139065784511515606088015286860387f35b83516001600160a01b03168652948101949281019287016138f0565b346102a8576020806003193601126102a85761393c614769565b6139446152f2565b60ff601254169160058310156103835760048314610371576003831461035f57600192838114159081613d3a575b506108e657600e5480613ceb575b83810180911161034b575f9081526019825260408082203383526018845281832054835260148452912060028101546001600160a01b03919082161561264a57600a8101805460ff8160081c16600881101561038357600503613cda5760ff16600c81101590816103835760098114918215613ccd575b8215613cbc575b5050613caa5760105493601485028581046014148615171561034b576064613a27910486614927565b8760048501928354838110613c92575b50600401613a46888254614927565b9055613c4e575b60105491613a6060038601938454614927565b8093558054828110613c32575b5083549260ff841692600c84101592836103835760028514928315613c24575b848415613c12575b5083613c05575b5082613bf9575b5050613b89575b505050505081613afb575b50907fed66735ec09b73f80882349a417c96f1ac5bb6bf493441951d147d84c5ed5d8c92608092600e5460405193338552840152604083015215156060820152a1600955005b600a546040516323b872dd60e01b81523360048201523060248201526044810184905294929392918391869160649183915f91165af1928315611177577fed66735ec09b73f80882349a417c96f1ac5bb6bf493441951d147d84c5ed5d8c94608094613b6c575b5091925092613ab5565b613b8290843d8611611170576111618183614814565b5086613b62565b61038357600403613be9575b5050600e5486810180911161034b575f5260078101845260405f209060ff19918783825416179055600e549087820180921161034b576008915f520184528560405f20918254161790558580808080613aaa565b60ff191660041790558680613b95565b54101590508b80613aa3565b601054111592508d613a9c565b90935061038357600685149284613a95565b5f9450600486149350613a8d565b80613c40613c4692856149aa565b90614927565b81558a613a6d565b946006840180549082821190815f14613c8b57613c6b84846149aa565b905b5515613c7d5750505f5b94613a4d565b613c86916149aa565b613c77565b5f90613c6d565b60049198613c40613ca392866149aa565b9790613a37565b60405163fdc7b1fb60e01b8152600490fd5b9091506103835760081488806139fe565b50600a811491505f6139f7565b604051627c247360e31b8152600490fd5b805f526019825260405f205462239880810180911161034b5742108015613d24575b15613980576040516337888d6760e01b8152600490fd5b50805f52601982528360405f2001544211613d0d565b60029150141584613972565b346102a8575f3660031901126102a8576020600e54604051908152f35b346102a857613d7136614753565b905f60a0604051613d8181614787565b828152826020820152826040820152826060820152826080820152015280155f14613e505750600e545b5f52601660205260405f20905f5260205260c060405f2060405190613dcf82614787565b80549182815260018060a01b03918260018201541692602083019384526002820154906040840191825260046003840154936060860194855201549460ff60a0608087019682891615158852019660081c161515865260405196875251166020860152516040850152516060840152511515608083015251151560a0820152f35b613dab565b346102a85760203660031901126102a85760043580613e895750600e545b5f526017602052610a44610a3860405f2061494c565b613e73565b346102a8575f3660031901126102a8576020600c54604051908152f35b346102a8575f3660031901126102a857604051806001916001549283825260208092019360015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6925f905b828210613f1b57610a4486613f0f818a0382614814565b6040519182918261470f565b84546001600160a01b03168752958601959383019390830190613ef8565b346102a8575f3660031901126102a85760ff60125416600581101561038357600481146103715760031461035f57600e54805f526020906019825260405f205462127500810180911161034b574211801561410f575b6140fd5760018111806140d0575b6140be57600d613fad815461499c565b92838255335f52601e815260405f20835f52815260405f2054155f146140ac577fedb73a28656fc54b5b54d180d469da306262375b8fab1d30e7bfdfe6fa4d71a89361071193335f52601e835260405f20905f52825260405f20556014600e5491825f526016815261403860405f20855490815f52835260405f20945f526017835260405f20614a47565b600e545f5260198152614053600260405f2001855490614a47565b8354835560018301336001600160601b0360a01b825416179055335f526018815260405f20545f52526003600160405f20015491015554604051918291338360209093929193604081019460018060a01b031681520152565b604051639fbfc58960e01b8152600490fd5b6040516303a5a26f60e11b8152600490fd5b50335f526018825260405f20545f5260148252600760405f2001815f52825260ff60405f20541615613f9d565b60405163709758ab60e11b8152600490fd5b50805f526019825260405f20544210613f8f565b346102a8575f3660031901126102a85761413b6152f2565b60ff601254166005811015610383576003906003811415908161429e575b50612a6757600b546001808201809211805b61034b5782821015610c3b57815f526020916014835260405f2091858301805461419b6004860191825490614927565b916141ac6005870193845490614927565b936141bd6006880195865490614927565b90600e9a808c54115f1461423f5760098c9b99939b5493019a5b8c54600219810190811161034b57841161421c5761420090845f528c8c5260405f205490614927565b92805f528b8b525f6040812055801561034b575f1901926141d7565b9695935f95929c5085935083919b506001999a505b55555555019091928061416b565b60095f9c9b9c9a99939a9301995b8b5484116142855761426d61427f91855f528c8c5260405f205490614927565b93805f528b8b525f604081205561499c565b9261424d565b9695935f95929c9a5085935083919b5060019950614231565b60049150141582614159565b346102a85760203660031901126102a857600435806142de5750600e545b5f52601d602052610a44610a3860405f2061494c565b6142c8565b346102a8575f3660031901126102a8576142fb6152f2565b335f52601860205260405f20545f52601460205260405f20600681019081549081156143da575f92839055600a54600291909101805460405163a9059cbb60e01b81526001600160a01b039182166004820152602481018590529490926020918691604491839187165af1938415611177577f3d97f39b86d061200a7834082f5926e58ec10fd85a9d6930f497729d5e6cc35c946143bb575b505460408051929091166001600160a01b0316825260208201929092529081908101611ed9565b6143d39060203d602011611170576111618183614814565b5084614394565b6040516365e52d5160e11b8152600490fd5b346102a8576020806003193601126102a8576004359061440a615315565b60125460ff811660058110156103835760048114610371576003811461035f576144e357600b5491600c831080156144d7575b6144c55760015b60048110614495577fe891dc01ac1296966aff69221063a5796adb4993741b159b043f7066e29239396020866144898760018860ff19161760125582600f5582614909565b601055604051908152a1005b805f52601582526004600160405f200154106144b357600101614444565b6040516305a2d66760e11b8152600490fd5b60405163dd5d9ea160e01b8152600490fd5b506003600c541061443d565b6040516305c3c4b960e41b8152600490fd5b346102a85760203660031901126102a8576004358061452e5750600e545b5f52601a602052602060ff60405f2054166040519015158152f35b614513565b346102a8575f3660031901126102a85761454b6152f2565b60ff601254166005811015610383576003811461035f5760048114610371576001036146c257335f52601860205260405f20545f52601460205260405f20600a810180549060ff8216600c811015610383576001036146b05760105460148102908082046014148115171561034b5760646145c7920490614927565b600b810290808204600b149015171561034b57600c610302910492600485016145f1858254614927565b905561ffff1916179055600a546040516323b872dd60e01b815233600482015230602482015260448101839052926001600160a01b0391602090859060649082905f9087165af1908115611177577fa1036ac26bc1acfe7c0581273bb656a2426fb6f32067116729c8fad15a58bfc794600292614691575b50015460408051929091166001600160a01b0316825260208201929092529081908101611ed9565b6146a99060203d602011611170576111618183614814565b5085614669565b60405163991c8dc760e01b8152600490fd5b604051637250f10560e01b8152600490fd5b60209060206040818301928281528551809452019301915f5b8281106146fb575050505090565b8351855293810193928101926001016146ed565b60209060206040818301928281528551809452019301915f5b828110614736575050505090565b83516001600160a01b031685529381019392810192600101614728565b60409060031901126102a8576004359060243590565b6004359081151582036102a857565b6044359081151582036102a857565b60c0810190811067ffffffffffffffff821117611c7957604052565b6060810190811067ffffffffffffffff821117611c7957604052565b610180810190811067ffffffffffffffff821117611c7957604052565b60a0810190811067ffffffffffffffff821117611c7957604052565b6040810190811067ffffffffffffffff821117611c7957604052565b90601f8019910116810190811067ffffffffffffffff821117611c7957604052565b600435906001600160a01b03821682036102a857565b90600c8210156103835752565b919091610180810192805182526020810151602083015260018060a01b036040820151166040830152606081015160608301526080810151608083015260a081015160a083015260c081015160c083015260e0810151151560e08301526101008082015115159083015261012080820151908301526148e1610140808301519084019061484c565b61016080910151916008831015610383570152565b8181029291811591840414171561034b57565b8115614913570490565b634e487b7160e01b5f52601260045260245ffd5b9190820180921161034b57565b908160209103126102a8575180151581036102a85790565b90604051918281549182825260209260208301915f5260205f20935f905b8282106149825750505061498092500383614814565b565b85548452600195860195889550938101939091019061496a565b5f19811461034b5760010190565b9190820391821161034b57565b6001548110156149ec5760015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf601905f90565b634e487b7160e01b5f52603260045260245ffd5b600154156149ec5760015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6905f90565b80548210156149ec575f5260205f2001905f90565b8054600160401b811015611c7957614a6491600182018155614a32565b819291549060031b91821b915f19901b1916179055565b90604051918281549182825260209260208301915f5260205f20935f905b828210614aaf5750505061498092500383614814565b85546001600160a01b031684526001958601958895509381019390910190614a99565b80518210156149ec5760209160051b010190565b6001548015614b18575f1901614b13614afe826149b7565b81549060018060a01b039060031b1b19169055565b600155565b634e487b7160e01b5f52603160045260245ffd5b80548015614b18575f190190614b45614afe8383614a32565b55565b60405190614b55826147bf565b5f610160838281528260208201528260408201528260608201528260808201528260a08201528260c08201528260e08201528261010082015282610120820152826101408201520152565b600c8210156103835752565b60088210156103835752565b90600e54805f52601960205260405f205462151800810180911161034b57421080156152cf575b6152bd57805f1981011161034b575f1981015f52601660205260405f20335f52601e60205260405f205f1983015f5260205260405f20545f5260205260405f209260018060a01b03600185015416908133036152ab5760048501805460ff8116156152995760ff8160081c1661528757835f52601860205260405f20545f52601460205260ff600a60405f20015416600c811015610383576004036108765761ff00191661010017905561523657505f1981015f526017602052614ca560405f2061494c565b5f915f5b8251811015614cfd575f1982015f52601660205260405f20614ccb8285614ad2565b515f5260205260ff600460405f20015416614ce9575b600101614ca9565b92614cf560019161499c565b939050614ce1565b50614d1b9291505f19015f526019602052600360405f200154614909565b915f8093600193600b54945b60018601861161034b5760018601811015614d7c57805f52601460205260ff600a60405f20015416600c81101561038357600414614d68575b600101614d27565b95614d7460019161499c565b969050614d60565b509091929350606093600e545f52601a60205260ff60405f205416615210575b614da68684614909565b925f9660015b600b5460018101811161034b57600101811015614e4657805f52601460205260405f2060ff600a82015416600c81101561038357600414614df1575b50600101614dac565b6003018054919791878110614e21575b600192614e1a92614e138a80946149aa565b9055614927565b9690614de8565b600192614e39614e1a939c613c4084614e139c6149aa565b9b82995092509250614e01565b509094939195969296805180614ff4575b5050848410614f2b575050505060028201819055600a54600183015460405163a9059cbb60e01b81526001600160a01b039182166004820152602481018490529391602091859116815f81604481015b03925af1928315611177577f1d3e1b711499f6260ce9c1c1eeabe0f46dfc60b81542d0021ecef0716d0ed1cb93614f0c575b5060018101549054604080516001600160a01b03909316835260208301939093529181019190915280606081015b0390a1565b614f249060203d602011611170576111618183614814565b505f614ed9565b6402540be400614f3b85876149aa565b1015614f8d5750505060028301819055600a54600184015460405163a9059cbb60e01b81526001600160a01b0391821660048201526024810193909352919391602091859116815f8160448101614ea7565b7fd2c92d0f1dd9e4ffc64744c794d5c6f0c58306865dcb816a20cf0db5c300d97e955060a094600360ff1960125416176012556040519485526020850152604084015260608301526080820152a15f8051602061548b8339815191526020604051428152a1565b5f989498979391959692975088155f146151f65750969591959492945b875f935b86518510156151e6576150288588614ad2565b515f52601460205260018060a01b03600260405f200154165f52601b60205260405f20545f526015602052615062600160405f2001614a7b565b965f985f9a5f5b8a5181101561512d576001600160a01b03615084828d614ad2565b51165f52601860205260405f20545f52601460205260405f2060ff600a82015416600c811015610383576004146150bf575b50600101615069565b909b9c6150cb9061499c565b9c8015801580615120575b156150ec575050600460019101549b5b906150b6565b9c91909c6150fe575b506001906150e6565b6004919c5001548060011b908082046002149015171561034b579a60016150f5565b50600483015482116150d6565b5092959194999093979b969a6151439088614909565b90808210156151de5750985b5f5b89518110156151c5576001600160a01b0361516c828c614ad2565b51165f52601860205260405f20545f52601460205260405f2060ff600a82015416600c811015610383576004146151a7575b50600101615151565b8b6001929e60046151be9301614e138382546149aa565b9c9061519e565b50959a9199929850929650946001909101939192615015565b90509861514f565b9296985092509293505f80614e57565b90613c40615204928a614909565b96959195949294615011565b949350601d60205261523061522760405f2061494c565b94855190614927565b94614d9c565b5f60028501559254604080516001600160a01b039095168552602085019190915291927f2f6a2242608827783b40fb797960e2d61ea6e692e9c61049f223ec66f18bbc429290915081908101614f07565b604051630c8d9eab60e31b8152600490fd5b604051636a9a57a560e01b8152600490fd5b604051634a7777b360e11b8152600490fd5b60405163215eb65f60e21b8152600490fd5b50805f52601960205260405f205462224700810180911161034b57421015614bdf565b600260095414615303576002600955565b604051633ee5aeb560e01b8152600490fd5b5f546001600160a01b0316330361532857565b6040516306b66d0160e01b8152336004820152602490fd5b905f905f5b8354811015615381576153588185614a32565b90543360039290921b1c6001600160a01b031614615379575b600101615345565b915081615371565b509180545f19810190811161034b57614980926153ae6153a46130159385614a32565b9190549285614a32565b81546001600160a01b03600392831b81811b199092169490921b9490941c1690921b179055565b5f52601960205260405f2054804210908115615405575b506153f357565b6040516307f1ee4960e31b8152600490fd5b90506203f480810180911161034b5742115f6153ec565b5f526019602052600260405f2001541561543257565b60405163a8de391160e01b8152600490fd5b5f80546001600160a01b039283166001600160a01b03198216811783559216907f688b8f34d886f8a2414b39aa6cef1ec6198215ba9b47fe8ac4260b44139bd5b69080a356fe7a406291d7dedc33dcf93635d6443b37b6f30b4d33a6b86f5e2427e9d96f7c22a26469706673582212208ea780fafc4c83eaeb08f66091822cccd8bd0680aca88d2bcfc77e21af995c1164736f6c63430008170033',
    sourceMap:
      '274:71126:3:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;1895:26:4;274:71126:3;;;;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;920:70:4;;:::i;:::-;274:71126:3;4638:15;274:71126;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;5060:104;;39126:8;274:71126;;;;39105:20;274:71126;;;;;;39105:40;274:71126;;39161:6;274:71126;;;;;;;;;39105:20;274:71126;;;;;;39050:40;274:71126;39126:8;274:71126;;;39183:60;274:71126;;;;;39202:40;274:71126;;;;;;39183:60;274:71126;;;;;;;;;;;;;5060:104;274:71126;;-1:-1:-1;;;5131:22:3;;274:71126;;5131:22;4634:95;274:71126;;-1:-1:-1;;;4705:13:3;;274:71126;;4705:13;274:71126;;;;;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;4638:15;274:71126;;;;;;;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;5060:104;;274:71126;48884:3;48870:8;274:71126;;;;;;;;;48866:16;;;;;274:71126;;;;;48930:20;274:71126;;;;;48988:12;;;;274:71126;;;;;;;;;;;;;;48988:39;;;:91;;;48884:3;48988:148;;;;48884:3;48988:237;;;48884:3;48967:1617;;;48884:3;;;;;274:71126;48884:3;;274:71126;48851:13;;48967:1617;49262:19;;;;;49282:8;;274:71126;;;;;;;;;;;;;;;;49258:406;274:71126;;;-1:-1:-1;;274:71126:3;;-1:-1:-1;;274:71126:3;;;;;-1:-1:-1;49258:406:3;274:71126;;;;;;;;;;;49810:42;:96;;;49258:406;49785:296;;49258:406;274:71126;;;;;;;;;;;;50143:25;50522:47;50143:25;274:71126;50143:25;274:71126;50143:25;;;;50124:44;;;:205;;;;49258:406;50099:400;;;49258:406;274:71126;;;;;;;50542:12;;274:71126;;;;;;;;;;;;;;;:::i;:::-;50522:47;48967:1617;;;;;;50099:400;274:71126;;;;;;;;;;;;;50429:33;;;274:71126;;;;;;;;;;;50099:400;;;;50124:205;274:71126;;;;;;;;;;;;;;50299:30;50124:205;;;49785:296;274:71126;;49962:27;274:71126;;;;;;;;;;;50011:33;;;274:71126;;;;;;;;;;;49785:296;;49810:96;274:71126;;;;;;;;;;;;;;49876:30;49810:96;;49258:406;274:71126;;;49424:34;:103;;;49258:406;49395:251;;49258:406;;;;49395:251;-1:-1:-1;;274:71126:3;;;;;;;;;49576:26;274:71126;;;;;;;;;;;;;;49395:251;;;49424:103;-1:-1:-1;;;274:71126:3;;;;;;;;;49487:26;274:71126;;;;;;;;49486:41;49424:103;;48988:237;274:71126;;;;49204:21;49188:37;;;48988:237;;;:148;274:71126;;;;;49099:37;;;48988:148;;;:91;-1:-1:-1;274:71126:3;;-1:-1:-1;49063:16:3;49047:32;;;48988:91;;48866:16;274:71126;;;;;;;-1:-1:-1;;274:71126:3;;;;;65513:7;274:71126;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;;:::i;:::-;;5064:15;274:71126;;;;;;;;5083:25;5064:44;;5060:104;;920:70:4;;:::i;:::-;274:71126:3;4638:44;;4634:95;;5827:49;;;:107;;;;274:71126;5810:182;;;-1:-1:-1;;;;;274:71126:3;;;;;;6055:16;274:71126;;;;;;;;;6051:82;;6349:12;6462:35;274:71126;6143:10;;274:71126;6143:10;:::i;:::-;;274:71126;;;;;;;6190:20;274:71126;;;;;;;;;;;;;;6055:16;274:71126;;;;;;;;;;6317:12;;;274:71126;;-1:-1:-1;;;;;;274:71126:3;;;;;;;6349:12;;;;274:71126;;-1:-1:-1;;274:71126:3;;;;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;6462:35;;;;274:71126;6051:82;274:71126;;-1:-1:-1;;;6108:14:3;;274:71126;;6108:14;5810:182;274:71126;;-1:-1:-1;;;5966:15:3;;274:71126;;5966:15;5827:107;274:71126;5892:42;;;;5827:107;;;274:71126;;;;;;;;;;;;;;;920:70:4;;;:::i;:::-;274:71126:3;4638:15;274:71126;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;;5060:104;;274:71126;16470:42;;;:102;;;;274:71126;16453:177;;;16687:8;274:71126;;;;;16666:20;274:71126;;;;;;16869:7;274:71126;;;;;;;16828:15;:49;:90;;;;;274:71126;16811:170;;;274:71126;;;17162:28;274:71126;;;;;;;;;;;;;;;17220:16;;;;17216:68;;274:71126;17389:14;;274:71126;-1:-1:-1;;;;;274:71126:3;;;;;17372:16;274:71126;;;;;;;;;17351:20;274:71126;;;;17351:61;;274:71126;;;;;;;;;;;;;17351:95;;;;:221;;;274:71126;17334:305;;;;17781:22;17680:18;274:71126;17715:50;17680:18;;274:71126;;;;;;;;;16687:8;274:71126;;;17715:25;274:71126;;;;;17715:50;:::i;:::-;274:71126;;;;;17781:22;274:71126;17334:305;274:71126;;-1:-1:-1;;;17604:24:3;;274:71126;;17604:24;17351:221;274:71126;;;;;17372:16;274:71126;;;;;;;;17351:20;274:71126;;17463:99;274:71126;;;17463:99;274:71126;;;;;;;;;;;17462:110;17351:221;;;;17216:68;274:71126;;-1:-1:-1;;;17259:14:3;;274:71126;;17259:14;16811:170;274:71126;;-1:-1:-1;;;16950:20:3;;274:71126;;16950:20;16828:90;:15;;;16893:25;16828:90;;;16453:177;274:71126;;-1:-1:-1;;;16604:15:3;;274:71126;;16604:15;16470:102;16547:25;16528:44;;;;16470:102;;;274:71126;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;70966:9;;:27;:9;;;274:71126;70978:8;274:71126;70966:27;274:71126;;71016:20;274:71126;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;70966:27;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;;68546:9;;;274:71126;68558:8;274:71126;68546:27;274:71126;;68590:25;274:71126;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;;68546:27;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;1777:17:4;274:71126:3;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;65014:12;274:71126;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;;;;:::i;:::-;;4638:15;274:71126;;;;;;;;;;4638:44;;4634:95;;5083:25;;5064:44;;5060:104;;274:71126;;;13206:24;274:71126;;;;;;;;;;13273:20;274:71126;;;;;13353:12;;;274:71126;;;;;;;;;;;;;13369:20;13353:36;13349:86;;274:71126;13522:13;274:71126;;;;13541:13;;274:71126;;13517:178;13537:24;;;;;;13517:178;13708:5;;;;;;13704:56;;14077:64;;274:71126;;13835:227;;;;-1:-1:-1;274:71126:3;;-1:-1:-1;;274:71126:3;;;;;13835:227;14099:12;;274:71126;;;;-1:-1:-1;;;;;274:71126:3;;;;;13586:10;274:71126;;;;;;;;;;;;;;;;14077:64;274:71126;13835:227;-1:-1:-1;;274:71126:3;;;;;13835:227;;13704:56;274:71126;;-1:-1:-1;;;13736:13:3;;274:71126;;13736:13;13563:3;13600:16;;;;:::i;:::-;274:71126;;13586:10;274:71126;;;;-1:-1:-1;;;;;274:71126:3;13586:30;13582:103;;13563:3;274:71126;13522:13;;13582:103;13636:11;;;;;;13665:5;;;;;;;13349:86;274:71126;;-1:-1:-1;;;13412:12:3;;274:71126;;13412:12;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;;:::i;:::-;2466:103:2;;:::i;:::-;274:71126:3;4638:15;274:71126;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;5060:104;;5173:1;;;:::i;:::-;274:71126;3068:21:2;274:71126:3;;;;;;;;-1:-1:-1;;274:71126:3;;;;;;:::i;:::-;-1:-1:-1;;;;;274:71126:3;;;;;4501:18;;4497:77;;274:71126;5064:15;274:71126;;;;;;;;5083:25;5064:44;;;5060:104;;274:71126;31221:10;274:71126;;31204:16;274:71126;;;;;;31259:10;;;:94;;;;274:71126;31242:158;;;274:71126;31413:5;31409:56;;274:71126;;;;;31905:208;;274:71126;32190:11;274:71126;32216:13;274:71126;;;;;;;32211:170;32231:30;;;;;;32394:7;;;;32390:65;;274:71126;;;;32529:38;;;:92;;32211:170;32529:150;;;32211:170;32512:222;;32747:38;;;274:71126;;;-1:-1:-1;;;;;;274:71126:3;-1:-1:-1;;;;;274:71126:3;;;;;;;;;32882:15;32853:44;274:71126;32944:8;274:71126;32911:41;274:71126;32743:987;274:71126;;;;33836:38;;;;:92;;;32743:987;33819:908;;32743:987;34742:39;274:71126;;;;;;;34742:39;274:71126;33819:908;274:71126;33953:13;;;274:71126;;;;33984:52;33980:472;274:71126;;;34075:24;274:71126;;;;34075:24;:::i;:::-;274:71126;;;;;;;34139:30;;;;;;33980:472;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;;;;;;;;;34567:26;274:71126;34596:81;34567:110;34596:81;;34742:39;34596:81;;:::i;:::-;274:71126;;;;;;34567:26;;:::i;:::-;:110;274:71126;;;;;;;;;;;;;;;;;;;;;;;;;34567:110;34691:23;;:::i;:::-;33819:908;;;;;34171:3;34202:22;;;;;:::i;:::-;274:71126;;;;;;;34202:50;34198:114;;34171:3;;274:71126;34124:13;;34198:114;34280:9;-1:-1:-1;34280:9:3;34198:114;;33980:472;34387:22;;;;;;:::i;:::-;274:71126;;;;;;;34387:22;:::i;:::-;274:71126;33980:472;;;33836:92;274:71126;;;;;33890:38;;33836:92;;32743:987;33038:26;274:71126;33068:6;274:71126;;;;;;;33004:15;;:71;:133;;;32743:987;32983:737;;;-1:-1:-1;;274:71126:3;;;-1:-1:-1;;;;;;274:71126:3;;;;;32743:987;;32983:737;33004:15;33272:75;:141;;;32983:737;33247:459;;;274:71126;;;-1:-1:-1;;;;;;274:71126:3;-1:-1:-1;;;;;274:71126:3;;;;;;;;;33004:15;33038:26;274:71126;33613:8;274:71126;33580:41;274:71126;32743:987;;33247:459;274:71126;;-1:-1:-1;;;33675:12:3;;274:71126;;33675:12;33272:141;274:71126;33371:30;274:71126;33405:8;274:71126;33371:42;;33272:141;;33004:133;274:71126;33095:30;274:71126;33129:8;274:71126;33095:42;33004:133;;32529:150;274:71126;32637:30;274:71126;32671:8;274:71126;32637:42;32529:150;;:92;274:71126;;;;;32583:38;32529:92;;32390:65;274:71126;;-1:-1:-1;;;32424:20:3;;274:71126;;32424:20;32263:3;32301:22;;;;:::i;:::-;274:71126;;;;;;;32286:37;;32282:89;;32263:3;274:71126;32216:13;;;;32282:89;32343:13;;;32282:89;;;31905:208;31959:17;274:71126;31979:6;274:71126;;;;;;;31940:15;:46;;;;274:71126;;-1:-1:-1;;;32009:27:3;;274:71126;;32009:27;31936:167;-1:-1:-1;;274:71126:3;;;31905:208;;;31242:158;31378:11;274:71126;31242:158;;31259:94;274:71126;;;;31285:20;274:71126;;;31285:34;274:71126;;;31285:34;274:71126;;;;;;;;;31285:68;31259:94;;;4497:77;274:71126;;-1:-1:-1;;;4542:21:3;;274:71126;;4542:21;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;65183:8;274:71126;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;;:::i;:::-;2466:103:2;;:::i;:::-;274:71126:3;4638:15;274:71126;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;5060:104;;60162:8;274:71126;;;;60141:20;274:71126;;;;;;60185:6;274:71126;;;;;;;60111:15;:81;:178;;;;274:71126;60094:255;;-1:-1:-1;;274:71126:3;;;;;;;;;60362:25;274:71126;;;;;;60358:102;;62212:8;274:71126;;62265:3;274:71126;;;;;;;;;;62250:13;;;;;274:71126;;;62311:20;274:71126;;;;;62352:25;274:71126;62352:25;;274:71126;;62352:29;;62348:250;;62265:3;274:71126;;60162:8;274:71126;;62722:12;;:83;;;62265:3;62722:126;;;62265:3;62701:741;;62265:3;274:71126;60162:8;274:71126;5083:25;63509:12;;63505:322;;62265:3;63896:48;;;;;62265:3;63892:239;;62265:3;274:71126;62265:3;;274:71126;62235:13;;63892:239;63982:25;;;274:71126;;;;;;;64072:12;274:71126;64094:12;;;;274:71126;;;-1:-1:-1;;;64072:44:3;;-1:-1:-1;;;;;274:71126:3;;;;64072:44;;274:71126;;;;;;;;;;;;;;;;;;;;64072:44;;;;;;;274:71126;64072:44;;;63892:239;;;;64072:44;;;274:71126;64072:44;274:71126;64072:44;;;;;;;;:::i;:::-;;;;;:::i;:::-;;;;;;;;;;;274:71126;;;;;;;;;63896:48;63915:25;;;;274:71126;63915:29;;63896:48;;63505:322;274:71126;;;;;;;;;;;;;63545:26;;;274:71126;;;;;;63545:44;63541:272;63505:322;63541:272;63613:115;:25;;;274:71126;;;63613:115;:::i;:::-;274:71126;;60162:8;274:71126;;;;;;;;;;;;;;63545:26;;;274:71126;;;;;;;63541:272;63505:322;;62701:741;274:71126;4638:15;274:71126;;;;;;;;62925:25;62906:44;:119;;;;62701:741;-1:-1:-1;62881:547:3;;;5083:25;63086:19;;274:71126;;;;;60162:8;274:71126;;;;;;;;;;;;;;63172:26;;;274:71126;;;;;;62881:547;62701:741;;;62881:547;5083:25;63288:19;;274:71126;;;;;63374:25;;;274:71126;62881:547;;62906:119;-1:-1:-1;;274:71126:3;;;-1:-1:-1;274:71126:3;;;;;;60362:25;274:71126;;;;;;62974:51;62906:119;;;62722:126;62825:19;5083:25;62825:19;;274:71126;62825:23;;62722:126;;:83;274:71126;;;;;;;;;;;;;;;60362:25;274:71126;;;;;;62754:51;62722:83;;62348:250;274:71126;;;62548:25;;;274:71126;62348:250;;;;62250:13;64156:14;274:71126;64156:14;;274:71126;3068:21:2;274:71126:3;;60358:102;274:71126;;-1:-1:-1;;;60435:14:3;;274:71126;;60435:14;60094:255;274:71126;;-1:-1:-1;;;60321:17:3;;274:71126;;60321:17;60111:178;274:71126;;;;60141:20;274:71126;;;;;;60282:6;274:71126;;;;;;;60111:15;60208:81;60111:178;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;920:70:4;;:::i;:::-;4638:15:3;274:71126;;;;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;;5060:104;;274:71126;45198:42;274:71126;45198:42;;;:102;;;274:71126;45181:177;;45384:8;274:71126;45384:12;;;:86;;;274:71126;45367:166;;45543:10;;;:::i;:::-;274:71126;;45384:8;274:71126;;;45645:25;45626:44;45622:527;;274:71126;;;;46249:20;274:71126;;;;;46307:15;274:71126;;46337:13;274:71126;46333:2062;;274:71126;48442:7;46307:15;274:71126;46307:15;;274:71126;;;48405:15;5083:25;48405:15;274:71126;48506:57;48405:15;;274:71126;46337:13;274:71126;48460:14;;;;274:71126;45384:8;274:71126;48506:57;48551:11;274:71126;;;48506:57;;;;274:71126;;;;;;;;;;;;;;;;;;46333:2062;274:71126;4638:15;274:71126;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;5060:104;;274:71126;48884:3;48870:8;274:71126;;;;;;;;;48866:16;;;;;274:71126;;;48930:20;274:71126;;;;;48988:12;274:71126;48988:12;;;274:71126;;;;;;;;;;48988:39;;;:91;;;48884:3;48988:148;;;;48884:3;48988:237;;;48884:3;48967:1617;;;48884:3;;;274:71126;48884:3;;274:71126;48851:13;;48967:1617;45384:8;274:71126;;;;;49262:19;;;274:71126;;;;;;;;49258:406;274:71126;;;-1:-1:-1;;;48988:12:3;;;274:71126;;-1:-1:-1;;274:71126:3;;;;;49258:406;274:71126;4638:15;274:71126;;;;;;;;;49810:42;:96;;;49258:406;49785:296;;49258:406;274:71126;4638:15;274:71126;;;;;;;;;;50522:47;50124:44;45645:25;274:71126;50124:44;;:205;;;49258:406;50099:400;;49258:406;274:71126;;48988:12;274:71126;;;;;45645:25;50542:12;;274:71126;;48988:12;;274:71126;;;;;;;;;;;;:::i;:::-;50522:47;48967:1617;;;;50099:400;274:71126;;49262:19;48988:12;;;;274:71126;;;48988:12;;;274:71126;45384:8;274:71126;;;50429:33;;;274:71126;;;;;;;;;;;50099:400;;50124:205;274:71126;45384:8;274:71126;;;49262:19;;;274:71126;;;;;;;;50299:30;50124:205;;49785:296;274:71126;;49962:27;48988:12;;;;274:71126;;;48988:12;;;274:71126;45384:8;274:71126;;;50011:33;;;274:71126;;;;;;;;;;;49785:296;;49810:96;274:71126;45384:8;274:71126;;;49262:19;;;274:71126;;;;;;;;49876:30;49810:96;;49258:406;274:71126;;;49424:34;:103;;;49258:406;49395:251;;49258:406;;;;49395:251;-1:-1:-1;;274:71126:3;;;;;;;;;49576:26;274:71126;;;;;;;;;;;;;;49395:251;;;49424:103;-1:-1:-1;;;274:71126:3;;;;;;;;;49487:26;274:71126;;;;;;;;49486:41;49424:103;;48988:237;274:71126;;;;49204:21;49188:37;;;48988:237;;;:148;274:71126;;;;;49099:37;;;48988:148;;;:91;-1:-1:-1;274:71126:3;;-1:-1:-1;45645:25:3;49047:32;;;48988:91;;48866:16;;274:71126;46445:3;274:71126;;;;;;;;;;;46425:18;;;;;274:71126;;;46497:24;274:71126;;;;;;46639:13;274:71126;;;46639:24;;:52;;;;46445:3;46635:976;;;46445:3;;;274:71126;;46410:13;;46635:976;46802:13;;274:71126;46843:3;274:71126;;46817:24;;;;;46968:16;;;;:::i;:::-;274:71126;;;;;;;;5083:25;274:71126;;;;;46951:16;274:71126;;;;;;;;48930:20;274:71126;;;;;47147:12;48988;47147;;274:71126;;;;;;;;;;;;;;;;47147:34;;47143:428;;46843:3;;;;274:71126;46802:13;;47143:428;49262:19;274:71126;;;;;;;47509:25;5083;47298:19;;274:71126;;;;47352:20;47298:74;274:71126;47352:20;;274:71126;;;47298:74;;:::i;:::-;274:71126;;;47509:25;274:71126;47143:428;;;;;46817:24;;;;;274:71126;46635:976;;;46639:52;46667:24;;;;46639:52;;;46425:18;;;274:71126;47857:13;274:71126;;48870:8;274:71126;;;;;;;47852:183;;47890:3;274:71126;;47872:16;;;;;;274:71126;;;48930:20;274:71126;;;48988:12;274:71126;;;47917:30;274:71126;;;;;;;;;47917:52;47913:108;;47890:3;274:71126;;47857:13;;;47913:108;47993:9;;274:71126;47993:9;;:::i;:::-;47913:108;;;;;47872:16;;;;;;274:71126;45384:8;274:71126;48053:12;48049:336;;47852:183;46333:2062;;;48049:336;48089:12;;;274:71126;5083:25;274:71126;;4638:15;274:71126;;;4638:15;274:71126;-1:-1:-1;;;;;;;;;;;274:71126:3;;;46307:15;274:71126;;48195:35;48085:269;48049:336;;;48085:269;48312:23;274:71126;46337:13;274:71126;48312:23;:::i;:::-;48298:37;274:71126;48085:269;;45622:527;-1:-1:-1;;274:71126:3;;;;;;;;;;;45708:25;274:71126;;;;;;;;45707:40;:100;;;;45622:527;45707:160;;;45622:527;45707:221;;;45622:527;45707:282;;;;45622:527;45707:343;;;45622:527;45686:453;;45622:527;45686:453;-1:-1:-1;;274:71126:3;;;4638:15;274:71126;45686:453;45622:527;;45707:343;-1:-1:-1;;274:71126:3;;;-1:-1:-1;274:71126:3;;;;;46010:26;274:71126;;;;;;;;;;46009:41;45707:343;;;:282;274:71126;-1:-1:-1;;;274:71126:3;;;;;;;;;45949:26;274:71126;;;;;;;;45948:41;45707:282;;;:221;274:71126;;;;;45888:26;274:71126;;;;;;;;45887:41;45707:221;;;;:160;274:71126;-1:-1:-1;;;274:71126:3;;;;;;;;;45708:25;274:71126;;;;;;;;45827:40;45707:160;;;:100;274:71126;-1:-1:-1;;;274:71126:3;;;;;;;;;45708:25;274:71126;;;;;;;;45767:40;45707:100;;;45367:166;274:71126;;-1:-1:-1;;;45502:20:3;;274:71126;;45502:20;45384:86;274:71126;;;;45430:20;274:71126;;;;;;45430:40;274:71126;45412:15;:58;45384:86;;45198:102;-1:-1:-1;274:71126:3;;-1:-1:-1;45275:25:3;45256:44;;;45198:102;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;;1537:13:4;274:71126:3;;;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;;;:::i;:::-;69102:451;274:71126;;;;;:::i;:::-;-1:-1:-1;;;;;;274:71126:3;;;;;;;68976:16;274:71126;;;;;;;;;;;68942:20;274:71126;;;;;;;69035:9;;;274:71126;69047:8;274:71126;69035:27;;274:71126;;69158:23;274:71126;69158:23;;274:71126;69195:12;;;;274:71126;;69221:19;;;;274:71126;;69254:20;;274:71126;69288:25;;;274:71126;69327:25;;;;274:71126;;;;69366:33;;;274:71126;;;;;;;;69418:19;;;;274:71126;;;;;;;;69456:26;;;;274:71126;;69501:12;274:71126;;;;69501:12;;274:71126;;;;;;;;;:::i;:::-;;69102:451;;274:71126;;69102:451;;274:71126;69102:451;;;274:71126;69102:451;;;274:71126;69102:451;;;274:71126;69102:451;;;274:71126;;;;69102:451;;274:71126;;;69102:451;;;274:71126;69102:451;;;274:71126;69102:451;274:71126;;;69102:451;;;;:::i;:::-;69418:19;274:71126;;69102:451;;;;:::i;:::-;274:71126;;;;;;;:::i;69035:27::-;;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;;:::i;:::-;;;;;:::i;:::-;;;5064:15;274:71126;;;;;;;;5083:25;5064:44;;5060:104;;274:71126;920:70:4;;;:::i;:::-;4638:44:3;4634:95;;274:71126;;;7391:24;274:71126;;;;;;;;;;;;;;;;;7492:16;274:71126;;;;;;;;7458:20;274:71126;;;;;;;;7582:13;7578:68;;7660:12;;;274:71126;;7660:26;;;7656:79;;274:71126;7779:13;;274:71126;;;;-1:-1:-1;;;274:71126:3;;;;;;;;;;;;;;;:::i;:::-;7892:452;;;;7965:12;;;274:71126;;;;;;;;;;;;;;7965:41;7961:103;;274:71126;;7660:12;274:71126;8826:46;274:71126;8172:20;8826:46;274:71126;;;;;;;7892:452;8511:23;274:71126;;;8555:25;;;:54;;;;7892:452;-1:-1:-1;8551:260:3;;;8630:13;274:71126;;;;;8629:14;8625:73;;8551:260;;;;274:71126;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;8625:73;-1:-1:-1;;274:71126:3;;;;;8625:73;;;;8551:260;8732:13;274:71126;;;;;8728:73;;8551:260;;;;;8728:73;-1:-1:-1;;274:71126:3;;;8728:73;;;;8555:54;8608:1;8584:25;;;;8555:54;;;7961:103;274:71126;;-1:-1:-1;;;8033:16:3;;274:71126;;8033:16;7892:452;8826:46;8282:16;8826:46;8282:16;;274:71126;8282:16;;7660:12;8282:16;;274:71126;;;;;;;;;7892:452;;274:71126;;;;;;;;;;;;7656:79;274:71126;;-1:-1:-1;;;7709:15:3;;274:71126;;7709:15;7578:68;274:71126;;-1:-1:-1;;;7618:17:3;;274:71126;;7618:17;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;2466:103:2;;:::i;:::-;920:70:4;;:::i;:::-;274:71126:3;;4638:15;274:71126;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;5060:104;;36870:8;274:71126;36910:3;;;:::i;:::-;36945;;;:::i;:::-;274:71126;;;36987:20;274:71126;;;;;5083:25;274:71126;37031:15;;274:71126;37050:14;;274:71126;37031:33;;;;;37027:91;;37205:32;;;:::i;:::-;274:71126;37247:19;274:71126;37319:8;274:71126;37342:13;274:71126;;;;;;;37337:528;;37373:3;274:71126;;37357:14;;;;;;274:71126;;;37419:20;274:71126;;;;;37460:12;;;;;274:71126;;;;;;;;;;37460:34;;;37456:399;;37373:3;;274:71126;;37342:13;;;37456:399;37514:13;;274:71126;37514:13;;:::i;:::-;37549:20;;274:71126;37549:24;37545:296;37456:399;37545:296;37601:13;;;;;;:48;;;37545:296;37597:226;;;37677:31;;274:71126;37677:31;37597:226;;37545:296;37456:399;;37597:226;37737:86;;;;;;37597:226;274:71126;37597:226;;;37737:86;37782:18;;-1:-1:-1;37782:18:3;;37737:86;;37601:48;37618:31;;;;37601:48;;37357:14;;;;;;;37950:21;;;;;:::i;:::-;:32;:91;;;37997:21;;;;;:::i;:::-;37950:91;;274:71126;;;38090:13;38121:3;274:71126;;38105:14;;;;;;274:71126;;;37419:20;274:71126;;;;;38208:12;;37460;38208;;274:71126;;;;;;;;;;;38208:34;;38204:183;;38121:3;;274:71126;38090:13;;;38204:183;274:71126;38266:20;274:71126;;38266:32;;;;;38262:111;;38204:183;;;;;38262:111;38322:32;;;:::i;:::-;274:71126;;38262:111;;;;;38105:14;;;;;;36870:8;274:71126;;;36987:20;274:71126;;;;;;38407:40;:51;274:71126;;;38407:51;:::i;:::-;274:71126;;38472:22;;;;;:::i;:::-;:32;38468:273;;38085:312;274:71126;;38756:52;;274:71126;;;38756:52;;;;274:71126;;;;;;;;;;;;;;;;;;38756:52;;;;274:71126;3068:21:2;274:71126:3;;38468:273;38551:34;38562:22;;;;;;;:::i;:::-;38551:34;;:::i;:::-;37460:12;274:71126;;;-1:-1:-1;;;38599:131:3;;38642:10;274:71126;38599:131;;274:71126;38678:4;274:71126;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;;;274:71126:3;38599:131;;;;;;;38756:52;38599:131;38756:52;38599:131;;;38468:273;;;;;;38599:131;;;;;;-1:-1:-1;38599:131:3;;;;;;:::i;:::-;;;;;;37950:91;;;;37027;274:71126;;-1:-1:-1;;;37087:20:3;;274:71126;;37087:20;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;;:::i;:::-;920:70:4;;:::i;:::-;274:71126:3;5064:15;274:71126;;;;;;;;;5083:25;;5064:44;;5060:104;;-1:-1:-1;;;;;274:71126:3;;;;;28061:382;;274:71126;;;28602:30;274:71126;28636:8;274:71126;28602:42;28598:105;;274:71126;;28843:45;274:71126;-1:-1:-1;;;;;274:71126:3;;28713:39;274:71126;;;28713:39;274:71126;28782:15;28762:35;274:71126;;;;;;;;;;;;;;;28843:45;274:71126;28598:105;274:71126;;-1:-1:-1;;;28665:27:3;;274:71126;;28665:27;28061:382;274:71126;28142:13;274:71126;;;;;;28137:219;28157:30;;;;;;28137:219;28373:5;;;;;;28369:64;;28061:382;;;;28189:3;28239:22;;;;:::i;:::-;274:71126;;;;;;;28216:45;;28212:130;;28189:3;274:71126;28142:13;;28212:130;28285:11;;;;;;28318:5;;;;;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;1655:30:4;274:71126:3;;;;;;;;;;;;;69899:451;274:71126;;;;:::i;:::-;;;;:::i;:::-;;;;69755:20;274:71126;;;;;69832:27;:9;;:27;:9;;;274:71126;69844:8;274:71126;69832:27;;274:71126;;69955:23;;;;274:71126;;;;;;;69992:12;;;274:71126;;70018:19;;;;274:71126;;70051:20;;274:71126;70085:25;;;274:71126;70124:25;;;;274:71126;;;;70163:33;;;274:71126;;;;;;;;70215:19;;;;274:71126;;;;;;;;70253:26;;;;274:71126;;70298:12;274:71126;;;;70298:12;;274:71126;;;;;;;:::i;:::-;;;;69899:451;;274:71126;;69899:451;;274:71126;69899:451;;;274:71126;69899:451;;;274:71126;69899:451;;;274:71126;69899:451;;;274:71126;;;;69899:451;;274:71126;;;69899:451;;;274:71126;69899:451;;;274:71126;69899:451;274:71126;;;69899:451;;;;:::i;69832:27::-;;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;5064:15;274:71126;;;;;;;;5083:25;5064:44;;;5060:104;;274:71126;;;;;29163:14;29159:68;;274:71126;29315:13;274:71126;;;;;;;29310:167;29330:30;;;;;;29490:5;;;;29486:56;;-1:-1:-1;;274:71126:3;;;29702:17;274:71126;-1:-1:-1;;;;;274:71126:3;;;;29385:10;29688:31;;;;29385:10;29754;29385;29754;:::i;:::-;274:71126;29811:13;274:71126;;;;29806:181;29826:30;;;;;;-1:-1:-1;;;;274:71126:3;;;;;;;30000:110;30029:81;;30000:26;30029:81;;:::i;30000:110::-;30124:23;;:::i;:::-;30764:29;274:71126;;;29385:10;274:71126;;30764:29;274:71126;29858:3;29899:22;;;;:::i;:::-;274:71126;;;;;;;29385:10;29885:36;29881:92;;29858:3;;274:71126;29811:13;;29881:92;29945:9;-1:-1:-1;29945:9:3;29881:92;;29684:1065;30201:31;;:97;;;29684:1065;30180:188;;30400:22;;;:::i;:::-;274:71126;;;;;;;29385:10;30386:36;30382:357;274:71126;;;30461:22;;;;:::i;:::-;274:71126;;;;;;;30461:22;:::i;:::-;274:71126;-1:-1:-1;;274:71126:3;;;;;;;;30527:89;30502:114;30527:89;;:::i;:::-;274:71126;;;;;;30502:22;;:::i;:114::-;30634:23;;:::i;:::-;29684:1065;;30382:357;274:71126;;-1:-1:-1;;;30705:19:3;;274:71126;;30705:19;30180:188;274:71126;;-1:-1:-1;;;30338:15:3;;274:71126;;30338:15;30201:97;274:71126;30270:17;274:71126;30290:8;274:71126;;;;;;;30252:15;:46;30201:97;;29362:3;29399:22;;;:::i;:::-;274:71126;;29385:10;274:71126;;;;-1:-1:-1;;;;;274:71126:3;29385:36;29381:86;;29362:3;274:71126;29315:13;;;;29381:86;29441:11;;;29381:86;;;29159:68;274:71126;;-1:-1:-1;;;29200:16:3;;274:71126;;29200:16;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;;4638:15;274:71126;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;5060:104;;18256:10;274:71126;;;18239:16;274:71126;;;;;;;;18205:20;274:71126;18205:20;274:71126;;;;;;;18354:23;;;;274:71126;;;;;18316:24;274:71126;;;;;18439:12;;;274:71126;;;;;;;;;;18439:26;18435:80;;18680:8;274:71126;;;;18659:20;274:71126;;;;;;18703:6;274:71126;;;;;;;18629:15;:81;:155;;;;274:71126;18612:232;;-1:-1:-1;;274:71126:3;;;;;;;;;18921:18;274:71126;;;;;;18921:44;18917:98;;19484:12;;;;;19499:21;;;274:71126;;;;;;;;19499:21;274:71126;;;19556:13;19534:36;;;:::i;:::-;274:71126;;;;;;;19585:29;274:71126;;;;;;;;;18680:8;274:71126;;;19726:21;274:71126;;;;;;;19726:52;;;:::i;:::-;5083:25;19912:19;;274:71126;;19934:20;274:71126;19934:20;;274:71126;;;19912:42;;;:::i;:::-;274:71126;19884:25;;274:71126;;;;;;;4638:15;274:71126;;;;;;;;;;;20105:42;;20101:531;;274:71126;;;;;;20720:33;20835:25;274:71126;18680:8;274:71126;;;20720:33;274:71126;;;;;;;;;;;18680:8;274:71126;;;;;;;;;;;;;20834:36;20830:109;;274:71126;18680:8;274:71126;;;;18256:10;274:71126;;;;;;;;;20954:36;;274:71126;;;;;20954:36;274:71126;20830:109;274:71126;;;;20830:109;;;;;;20101:531;20216:8;274:71126;;;;20163:15;;20197:13;;20163:15;;274:71126;;;;;;20197:13;274:71126;;;20192:238;274:71126;;;;;;;;;;;;;;;;;;;;;;;20720:33;274:71126;20540:3;20835:25;274:71126;;-1:-1:-1;20507:115:3;;20192:238;20101:531;;;;20507:115;274:71126;18439:12;274:71126;4638:15;274:71126;20507:115;;;;20230:3;274:71126;;;20212:16;;;;;;274:71126;;;;;;;;;;;20326:13;274:71126;;;;;;;;;20326:38;;;;20322:94;;20230:3;;274:71126;20197:13;;;20322:94;20388:9;;;;;:::i;:::-;20322:94;;;;;20212:16;;;18917:98;274:71126;;-1:-1:-1;;;18988:16:3;;274:71126;;18988:16;18612:232;274:71126;;-1:-1:-1;;;18816:17:3;;274:71126;;18816:17;18629:155;274:71126;;;;18659:20;274:71126;;;;;;18629:15;18726:58;18629:155;;18435:80;274:71126;;-1:-1:-1;;;18488:16:3;;274:71126;;18488:16;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;;:::i;:::-;;;2466:103:2;;:::i;:::-;920:70:4;;:::i;:::-;274:71126:3;4790:15;274:71126;;;;;;;;;4790:44;;4786:98;;4915:18;274:71126;4936:8;274:71126;;;;;;;4897:15;:47;4893:107;;5083:25;5064:44;5060:104;;-1:-1:-1;;;;;274:71126:3;;;4501:18;4497:77;;44067:12;274:71126;;;;;;;;44067:37;;44098:4;274:71126;44067:37;;274:71126;;44067:37;;;274:71126;44067:37;;;;;;;;;;274:71126;44067:37;;;274:71126;44067:46;;44063:103;;274:71126;;-1:-1:-1;;;44175:33:3;;-1:-1:-1;;;;;274:71126:3;;;44175:33;;274:71126;;;;;;;;;;;;;;;;-1:-1:-1;;44175:33:3;;;;;;;44223:28;44175:33;;;274:71126;-1:-1:-1;;274:71126:3;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;;44223:28;274:71126;44175:33;;;;;;-1:-1:-1;44175:33:3;;;;;;:::i;:::-;;;;;;44063:103;274:71126;;-1:-1:-1;;;44136:19:3;;274:71126;;44136:19;44067:37;;;;;;;;;;;;;;;;;;:::i;:::-;;;274:71126;;;;;;;44067:37;;;;;;;;4893:107;274:71126;;-1:-1:-1;;;4967:22:3;;274:71126;;4967:22;4786:98;274:71126;;-1:-1:-1;;;4857:16:3;;274:71126;;4857:16;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;65833:13;274:71126;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;825:33;274:71126;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;66418:15;274:71126;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;920:70:4;;:::i;:::-;4638:15:3;274:71126;;;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;5060:104;;-1:-1:-1;;274:71126:3;;;4638:15;274:71126;43516:15;43495:36;274:71126;2466:103:2;;:::i;:::-;274:71126:3;4638:15;274:71126;;;;;;;;5083:25;60685:44;;;:92;;;;274:71126;60681:153;;;60859:8;274:71126;;60877:959;60912:3;274:71126;;;;;;;;;;60897:13;;;;;274:71126;;;60958:20;274:71126;;;;;60995:19;61043:98;:70;:42;5083:25;61043:19;;274:71126;;61065:20;;274:71126;61043:42;;:::i;:::-;274:71126;61088:25;;274:71126;61043:70;;:::i;:::-;61116:25;;;274:71126;61043:98;;:::i;:::-;274:71126;5083:25;61159:8;274:71126;61159:12;61155:487;5083:25;;;61159:8;274:71126;61295:26;;;;274:71126;61236:3;61159:8;274:71126;-1:-1:-1;;274:71126:3;;;;;;;61217:17;;;;61280:44;274:71126;;;;;;;;;;;61280:44;;:::i;:::-;274:71126;;;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;61195:20;;61217:17;;;;274:71126;61217:17;;61116:25;61217:17;;61155:487;274:71126;5083:25;61043:19;;274:71126;;;61065:20;;274:71126;;;61088:25;;274:71126;61116:25;274:71126;;60882:13;;;61155:487;61440:9;;274:71126;61436:192;61466:3;61159:8;274:71126;61451:13;;;;61510:44;61466:3;274:71126;;;;61525:26;;;274:71126;;;;;;61510:44;;:::i;:::-;274:71126;;;;61525:26;;;274:71126;;;;;;;61466:3;:::i;:::-;61440:9;;;61451:13;;;61116:25;274:71126;61451:13;;;61155:487;;60897:13;274:71126;3068:21:2;274:71126:3;43573:31;274:71126;;;43516:15;274:71126;;43573:31;274:71126;60681:153;274:71126;;-1:-1:-1;;;60800:23:3;;274:71126;;60800:23;60685:92;274:71126;60733:44;;;;60685:92;;;274:71126;;;;;;;;;;;;;;;920:70:4;;:::i;:::-;274:71126:3;4638:15;274:71126;4638:15;274:71126;;;;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;;5060:104;;274:71126;25291:49;;;;:107;;;;274:71126;25274:182;;;25529:13;274:71126;25525:69;;274:71126;;;;;25529:13;274:71126;;25723:13;274:71126;;;25742:8;274:71126;;;;;;;;25718:175;274:71126;;;25718:175;26098:39;274:71126;25988:27;;;;;;:::i;:::-;25974:41;274:71126;26048:8;274:71126;;;26027:20;274:71126;;;5083:25;274:71126;;;26027:39;274:71126;25974:41;274:71126;;;;;;;;;;26098:39;274:71126;25756:3;274:71126;;;;;;25738:16;;;;;;274:71126;;;25779:20;274:71126;;;25779:30;274:71126;;;25779:30;274:71126;;;;;;;;;25779:52;25775:108;;25756:3;;;;;274:71126;25723:13;;;25775:108;25851:17;;;;;:::i;:::-;25775:108;;;;;25738:16;;;;;;25525:69;274:71126;;;;;;;;48884:3;48870:8;274:71126;;;;;;;;;48866:16;;;;;274:71126;;;48930:20;274:71126;;;;;48988:12;;;;274:71126;;;;;;;;;;;;48988:39;;;:91;;;48884:3;48988:148;;;;48884:3;48988:237;;;48884:3;48967:1617;;;48884:3;;;;274:71126;48884:3;;274:71126;48851:13;;48967:1617;49262:19;;;;;49282:8;;274:71126;;;;;;;;;;;;;;;;49258:406;274:71126;;;-1:-1:-1;;274:71126:3;;-1:-1:-1;;274:71126:3;;;;;-1:-1:-1;49258:406:3;274:71126;;;;;;;;;;;49810:42;:96;;;49258:406;49785:296;;49258:406;274:71126;;;;;;;;;;;;50143:25;50522:47;50143:25;274:71126;50143:25;274:71126;50143:25;;;;50124:44;;;:205;;;;49258:406;50099:400;;;49258:406;274:71126;;;;;;;50542:12;;274:71126;;;;;;;;;;;;;;;:::i;:::-;50522:47;48967:1617;;;;;50099:400;274:71126;;;;;;;;;;;;;50429:33;;;274:71126;;;;;;;;;;;50099:400;;;;50124:205;274:71126;;;;;;;;;;;;;;50299:30;50124:205;;;49785:296;274:71126;;49962:27;274:71126;;;;;;;;;;;50011:33;;;274:71126;;;;;;;;;;;49785:296;;49810:96;274:71126;;;;;;;;;;;;;;49876:30;49810:96;;49258:406;274:71126;;;49424:34;:103;;;49258:406;49395:251;;49258:406;;;;49395:251;-1:-1:-1;;274:71126:3;;;;;;;;;49576:26;274:71126;;;;;;;;;;;;;;49395:251;;;49424:103;-1:-1:-1;;;274:71126:3;;;;;;;;;49487:26;274:71126;;;;;;;;49486:41;49424:103;;48988:237;274:71126;;;;49204:21;49188:37;;;48988:237;;;:148;274:71126;;;;;49099:37;;;48988:148;;;:91;-1:-1:-1;274:71126:3;;-1:-1:-1;49063:16:3;49047:32;;;48988:91;;48866:16;;;;;;25525:69;;;;;25291:107;274:71126;;;;;25356:42;;;25291:107;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;1309:17:4;274:71126:3;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;-1:-1:-1;;;;;274:71126:3;;:::i;:::-;;;;68245:16;274:71126;;;;;;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;;71310:9;;;274:71126;71322:8;274:71126;71310:27;274:71126;;71360:26;274:71126;;;;;;;;;;;;;;;;;71310:27;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;65987:11;274:71126;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;4638:15;274:71126;;;;;;;;;4638:44;;4634:95;;5083:25;;5064:44;;5060:104;;11518:10;274:71126;;11501:16;274:71126;;;;;;;;11467:20;274:71126;;;;;;;11553:23;274:71126;11553:23;;274:71126;;;11553:28;;11549:82;;274:71126;;11670:24;274:71126;;;;;11815:712;;;;;;11850:12;;;;;;274:71126;;;;;;;;;;;;;;12542:119;;11866:20;11850:36;11866:20;;-1:-1:-1;274:71126:3;;-1:-1:-1;;274:71126:3;;;;;11846:223;274:71126;;;;11518:10;274:71126;;;;;;;;;;;;;;;;;;;;;;;12542:119;274:71126;11846:223;-1:-1:-1;;274:71126:3;;;;;11846:223;;11815:712;12099:13;;;;;274:71126;12131:13;274:71126;;12150:13;;274:71126;;;12126:169;12146:24;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;12331:39;12308:62;12384:17;12331:39;12308:20;12331:39;11467:20;12331:39;12542:119;12331:39;;:::i;:::-;274:71126;;5083:25;274:71126;;;;;-1:-1:-1;;;;;274:71126:3;;12308:20;;:::i;:62::-;12384:17;:::i;:::-;11518:10;274:71126;;11501:16;274:71126;;;;;;;;;12494:22;274:71126;;;12417:74;12494:22;274:71126;;;;;;;;11815:712;;12172:3;12199:16;;;;:::i;:::-;274:71126;;;;;;-1:-1:-1;;;;;274:71126:3;11518:10;12199:30;12195:86;;12172:3;;274:71126;12131:13;;12195:86;12253:9;-1:-1:-1;12253:9:3;12195:86;;11549:82;274:71126;;-1:-1:-1;;;11604:16:3;;274:71126;;11604:16;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;2466:103:2;;:::i;:::-;920:70:4;;:::i;:::-;274:71126:3;4638:15;274:71126;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;5060:104;;35241:8;274:71126;35281:3;;;:::i;:::-;35315;;;:::i;:::-;274:71126;;35358:20;274:71126;;;;;;35402:15;;5083:25;274:71126;;35421:14;;274:71126;35402:33;;;;35398:91;;35592:32;;35643:26;35592:32;;:::i;:::-;35643:26;;;:::i;:::-;274:71126;;35679:12;274:71126;;;-1:-1:-1;;;35679:61:3;;35705:10;274:71126;35679:61;;274:71126;35725:4;274:71126;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;;;274:71126:3;35679:61;;;;;;;35755:21;35679:61;274:71126;35679:61;;;274:71126;;;;;;;35755:21;274:71126;3068:21:2;274:71126:3;;35679:61;;;;;;;;;;;;;:::i;:::-;;;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;;;;;;:::i;:::-;;;;;;1431:21:4;274:71126:3;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;5064:15;274:71126;;;;;;;;5083:25;5064:44;;5060:104;;274:71126;920:70:4;;;:::i;:::-;4638:44:3;4634:95;;6836:27;274:71126;6703:12;;274:71126;6703:12;:::i;:::-;274:71126;6703:12;274:71126;;;;6754:24;274:71126;;;;;;;;;;;;6836:27;274:71126;;;;;;;-1:-1:-1;;274:71126:3;;;;;4638:15;274:71126;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;5060:104;;41694:10;274:71126;;41677:16;274:71126;;;;;;;;41643:20;274:71126;;;;;;41792:23;;274:71126;;;;;41754:24;274:71126;;;;;;;;;;;41877:12;;;274:71126;;41877:26;41873:80;;274:71126;;;42057:12;;;274:71126;;-1:-1:-1;;274:71126:3;;;;;42107:36;-1:-1:-1;42129:13:3;;42107:36;:::i;:::-;42261:8;274:71126;;;42227:33;;;274:71126;;;;;;;;;;;;5083:25;42306:19;;274:71126;;;42328:20;42306:42;274:71126;42328:20;;274:71126;;;42306:42;;:::i;:::-;274:71126;;;42425:25;;:36;:25;;;274:71126;;;42425:36;:::i;:::-;274:71126;;;;42129:13;;274:71126;42537:24;42533:576;;274:71126;-1:-1:-1;41877:12:3;;;274:71126;;;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;43124:55;;274:71126;;;;43124:55;274:71126;42533:576;41877:12;42577:13;;274:71126;;-1:-1:-1;;274:71126:3;;;-1:-1:-1;42658:3:3;274:71126;42129:13;;274:71126;42632:24;;;;;42129:13;42768:16;274:71126;42129:13;;;;42768:16;:::i;:::-;274:71126;;;;;;;;5083:25;274:71126;;;;;41677:16;274:71126;;;;;;;;41643:20;274:71126;;;;;42057:12;42821:13;;274:71126;;;;;;;;;43046:38;42899:20;5083:25;42899:20;;274:71126;;;;42922:21;42899:44;274:71126;42922:21;;274:71126;;;42899:44;;:::i;:::-;274:71126;;;43046:26;274:71126;;;43046:38;:::i;:::-;274:71126;;;42617:13;;42632:24;;;43124:55;42533:576;;274:71126;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;920:70:4;;;;;:::i;:::-;274:71126:3;5064:15;274:71126;;;;;;;;5083:25;5064:44;5060:104;;26733:8;274:71126;26756:11;26765:2;26756:11;;;:26;;;274:71126;26752:276;;;26823:1;274:71126;;26802:22;26798:87;;26752:276;;;;;274:71126;;;;;;;;;;;;27089:433;274:71126;;;27089:433;274:71126;;27537:39;;274:71126;27537:39;274:71126;;27537:39;:::i;27133:3::-;274:71126;;27109:22;;;;;274:71126;27180:13;;274:71126;;;27175:205;27397:5;;27393:64;;-1:-1:-1;;;;;27496:14:3;;;;:::i;:::-;274:71126;;;;;-1:-1:-1;;;274:71126:3;;;;;;;;;;;;;;;;;;;:::i;:::-;;27094:13;;;;274:71126;;;;;;;;;;;;27210:3;274:71126;;;;;;;;;;27195:13;;;;;;-1:-1:-1;;;;;274:71126:3;27237:14;;;;:::i;:::-;274:71126;;;;;;27255:20;274:71126;;27255:30;274:71126;;;27255:30;274:71126;;27237:48;27233:133;;27180:13;;;;27210:3;;27180:13;27210:3;;27180:13;274:71126;;27210:3;27180:13;;27233:133;27309:11;;;;;;;;27342:5;;;27195:13;;;;;;;;;;;274:71126;;;;;;;;;;;;27109:22;;;26798:87;274:71126;;-1:-1:-1;;;26851:19:3;;274:71126;;26851:19;26752:276;274:71126;26905:10;;26901:127;;26752:276;;;;;;;26901:127;26956:1;274:71126;;26935:22;26931:87;26901:127;26931:87;274:71126;;-1:-1:-1;;;26984:19:3;;274:71126;;26984:19;26756:26;26771:11;274:71126;26771:11;;;26756:26;;274:71126;-1:-1:-1;;;;274:71126:3;;;;;;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;;-1:-1:-1;;;;274:71126:3;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;2466:103:2;;:::i;:::-;920:70:4;;:::i;:::-;4790:15:3;274:71126;;;;;;;;;;;4790:44;4786:98;;4915:18;274:71126;4936:8;274:71126;;;;;;;4897:15;:47;4893:107;;-1:-1:-1;;274:71126:3;44585:25;274:71126;4790:15;274:71126;44634:12;274:71126;;;-1:-1:-1;;;44634:37:3;;44665:4;274:71126;44634:37;;274:71126;-1:-1:-1;;;;;274:71126:3;;;;;44634:37;;;274:71126;;;;44634:37;;;;;;;274:71126;44634:37;;;274:71126;;44691:11;274:71126;44685:17;;44681:86;;274:71126;-1:-1:-1;;;;;;;;;;;274:71126:3;;;4897:15;274:71126;;44781:35;274:71126;3068:21:2;274:71126:3;;44681:86;274:71126;;-1:-1:-1;;;44718:38:3;;44740:10;274:71126;44718:38;;274:71126;;;;;;;;;;;;;;;;;-1:-1:-1;;44718:38:3;;;;;;;-1:-1:-1;;;;;;;;;;;44718:38:3;;44681:86;44718:38;;;;;;;;;;;;;:::i;:::-;;;44681:86;;44634:37;;;;;;;;;;;;;;;;:::i;:::-;;;274:71126;;;;;44634:37;;;;;;;;274:71126;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;66655:24;274:71126;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;2466:103:2;;:::i;:::-;274:71126:3;4638:15;274:71126;;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;;5060:104;;274:71126;21655:42;;;;;:102;;;;274:71126;21638:177;;;21829:8;274:71126;21829:12;21825:299;;274:71126;;;;;;;;;;;;;22169:20;274:71126;;;;;;22291:10;274:71126;;22274:16;274:71126;;;;;;;;22240:20;274:71126;;;;22364:12;;;274:71126;-1:-1:-1;;;;;274:71126:3;;;;22364:26;22360:80;;22505:16;;;274:71126;;;;;;;;;;;;;;22505:67;22488:155;;274:71126;;;;;;;;;;22720:21;22704:37;;:91;;;;;274:71126;22704:145;;;;274:71126;22687:224;;;;22943:11;274:71126;;22240:20;274:71126;;;;;22240:20;274:71126;;;;;;;23019:3;22983:40;274:71126;;22983:40;;:::i;:::-;23103:20;274:71126;23103:20;;274:71126;;;23103:31;;;23099:108;;274:71126;23279:15;274:71126;23279:15;:30;274:71126;;;23279:30;:::i;:::-;274:71126;;23391:295;;274:71126;22943:11;274:71126;23696:19;:34;5083:25;23696:19;;274:71126;;;23696:34;:::i;:::-;274:71126;;;;;23803:31;;;23799:117;;274:71126;;;;;;;;;;;;;;;;;22364:12;24012:32;;:86;;;;;274:71126;24012:149;;;;;274:71126;24011:201;;;;274:71126;24011:249;;;;274:71126;23994:529;;;;274:71126;24585:15;;;;;;24581:137;;274:71126;;;24733:59;274:71126;;;21829:8;274:71126;;;22291:10;;274:71126;;;;;;;;;;;;;;;24733:59;22720:21;274:71126;;24581:137;22505:16;274:71126;;;-1:-1:-1;;;24616:65:3;;22291:10;274:71126;24616:65;;274:71126;24662:4;274:71126;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;24616:65;;;;;;;24733:59;24616:65;274:71126;24616:65;;;24581:137;;;;;;;;24616:65;;;;;;;;;;;;;:::i;:::-;;;;;23994:529;274:71126;;;24289:34;24285:106;;23994:529;274:71126;;21829:8;274:71126;;;;;;;;;;;24404:33;;;274:71126;;;;;;;;;;;;;;;;;21829:8;274:71126;;;;;;;;;;;;;;24472:19;274:71126;;;;;;;;;;;;;23994:529;;;;;;;24285:106;-1:-1:-1;;274:71126:3;;;;;24285:106;;;;24011:249;274:71126;24228:32;;;-1:-1:-1;24011:249:3;;;;:201;22943:11;274:71126;-1:-1:-1;24178:34:3;;-1:-1:-1;24011:201:3;;;24012:149;274:71126;;;;;24134:27;24118:43;;24012:149;;;;:86;274:71126;;-1:-1:-1;274:71126:3;24064:34;;;-1:-1:-1;24012:86:3;;23799:117;23874:31;;23850:55;23874:31;;;:::i;:::-;23850:55;;:::i;:::-;274:71126;;23799:117;;;23391:295;23442:25;;;;274:71126;;23509:23;;;;:85;;;;;;23551:23;;;;:::i;:::-;23509:85;;274:71126;23622:53;;;;;274:71126;23622:53;23391:295;;;23622:53;23652:23;;;:::i;:::-;23622:53;;23509:85;274:71126;23509:85;;;23099:108;274:71126;23165:31;;;23150:46;23165:31;;;:::i;23150:46::-;23099:108;;;;22687:224;274:71126;;-1:-1:-1;;;22881:19:3;;274:71126;;22881:19;22704:145;274:71126;;;;;;22811:38;22704:145;;;;:91;-1:-1:-1;22505:16:3;22757:38;;;-1:-1:-1;274:71126:3;22704:91;;22488:155;274:71126;;-1:-1:-1;;;22604:28:3;;274:71126;;22604:28;21825:299;274:71126;;;21895:20;274:71126;;;;;;21959:7;274:71126;;;;;;;21861:15;:106;:184;;;;21825:299;21857:257;21825:299;21857:257;274:71126;;-1:-1:-1;;;22085:14:3;;274:71126;;22085:14;21861:184;274:71126;;;;21895:20;274:71126;;;;;;22005:40;274:71126;21861:15;21987:58;21861:184;;21655:102;21732:25;21713:44;;;;21655:102;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;65674:8;274:71126;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;67013:9;;:27;:9;;;274:71126;67025:8;274:71126;67013:27;274:71126;;67057:28;274:71126;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;67013:27;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;;67350:9;;;274:71126;67362:8;274:71126;67350:27;274:71126;;67394:18;274:71126;;;;;;;;:::i;67350:27::-;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;65351:10;274:71126;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;;;1198:19:4;274:71126:3;1198:19:4;274:71126:3;;;;;;;;;;1198:19:4;274:71126:3;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;:::i;:::-;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;4638:15;274:71126;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;5060:104;;58350:8;274:71126;;;;;;58329:20;274:71126;;;;;;58373:7;274:71126;;;;;;;58299:15;:82;:156;;;;274:71126;58282:242;;274:71126;58603:12;;:134;;;274:71126;58586:210;;58806:9;;274:71126;;58806:9;:::i;:::-;274:71126;;;;58920:10;274:71126;;58893:26;274:71126;;;;;;;;;;;;;;58893:53;58889:198;274:71126;;;59614:39;58920:10;59614:39;58920:10;;274:71126;;58893:26;274:71126;;;;;;;;;;;;;;59517:20;58350:8;274:71126;;;;;59267:28;274:71126;;59324:42;274:71126;;;;;;;;;;;;;;;;;59324:18;274:71126;;;;;59324:42;:::i;:::-;58350:8;274:71126;;;58329:20;274:71126;;59376:53;:39;274:71126;;;59376:39;274:71126;;59376:53;;:::i;:::-;274:71126;;;;;59467:14;;58920:10;-1:-1:-1;;;;;274:71126:3;;;;;;;;58920:10;274:71126;;59538:16;274:71126;;;;;;;;;5083:25;274:71126;;;;59517:81;274:71126;59504:10;;274:71126;;;;58920:10;;;;59614:39;274:71126;;;;;;;;;;;;;;;;;;;;;58889:198;274:71126;;-1:-1:-1;;;59058:18:3;;274:71126;;59058:18;58586:210;274:71126;;-1:-1:-1;;;58769:16:3;;274:71126;;58769:16;58603:134;58670:10;;274:71126;;58653:16;274:71126;;;;;;;;58632:20;274:71126;;58632:95;274:71126;;;58632:95;274:71126;;;;;;;;;;;58631:106;58603:134;;58282:242;274:71126;;-1:-1:-1;;;58487:26:3;;274:71126;;58487:26;58299:156;274:71126;;;;58329:20;274:71126;;;;;;58299:15;58397:58;58299:156;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;2466:103:2;;:::i;:::-;274:71126:3;60685:15;274:71126;;;;;;;;60704:25;60685:44;60704:25;60685:44;;;:92;;;;274:71126;60681:153;;;60859:8;274:71126;;;;;;;;60877:959;60912:3;274:71126;;60897:13;;;;;;274:71126;;;;;60958:20;274:71126;;;;;60995:19;61043;;;274:71126;;61043:42;274:71126;61065:20;;274:71126;;;61043:42;;:::i;:::-;61088:25;61043:70;274:71126;61088:25;;274:71126;;;61043:70;;:::i;:::-;61116:25;61043:98;61116:25;;;274:71126;;;61043:98;;:::i;:::-;61159:8;;274:71126;;;;61159:12;61155:487;60704:25;;;61295:26;274:71126;;;;;;61295:26;;61191:207;61236:3;274:71126;;-1:-1:-1;;274:71126:3;;;;;;;61217:17;;;;61280:44;274:71126;;;;;;;;;;;61280:44;;:::i;:::-;274:71126;;;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;61195:20;;61217:17;;;;274:71126;61217:17;;;;;;;;;;;274:71126;61217:17;;;61155:487;274:71126;;;;;60882:13;;;;;;61155:487;61525:26;274:71126;61440:9;;;;;;;61525:26;;61436:192;61466:3;274:71126;;61451:13;;;;61510:44;61466:3;274:71126;;;;;;;;;;;61510:44;;:::i;:::-;274:71126;;;;;;;;;;;;61466:3;:::i;:::-;61440:9;;;61451:13;;;;274:71126;61451:13;;;;;;;;;;;;274:71126;61451:13;;61155:487;;60685:92;274:71126;60733:44;;;;60685:92;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;;67684:9;;;274:71126;67696:8;274:71126;67684:27;274:71126;;67728:21;274:71126;;;;;;;;:::i;67684:27::-;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;2466:103:2;;:::i;:::-;64433:10:3;274:71126;;64416:16;274:71126;;;;;;;;64382:20;274:71126;;;;;64483:25;;;274:71126;;;64577:12;;;64573:62;;274:71126;;;;;64684:12;274:71126;64706:12;;;;;274:71126;;;;-1:-1:-1;;;64684:44:3;;-1:-1:-1;;;;;274:71126:3;;;;64684:44;;274:71126;;;;;;;;;;;;;;;;;;;;64684:44;;;;;;;64743:38;64684:44;;;274:71126;-1:-1:-1;274:71126:3;;;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;64743:38;274:71126;64684:44;;;274:71126;64684:44;274:71126;64684:44;;;;;;;:::i;:::-;;;;;64573:62;274:71126;;-1:-1:-1;;;64612:12:3;;274:71126;;64612:12;274:71126;;;;;;;;;;;;;;;920:70:4;;;:::i;:::-;4638:15:3;274:71126;;;;;;;;;;;4638:44;;4634:95;;5083:25;5064:44;;5060:104;;10359:107;;10560:8;274:71126;10560:13;10571:2;10560:13;;:31;;;;274:71126;10556:79;;274:71126;10665:5;274:71126;10665:5;;;;11096:46;274:71126;;11060:20;274:71126;;;;;;;4638:15;274:71126;;11002:25;274:71126;11060:20;;:::i;:::-;11046:34;274:71126;;;;;;11096:46;274:71126;10672:3;274:71126;;;10752:24;274:71126;;;;;;;10752:35;274:71126;10752:46;10748:110;;274:71126;;10650:13;;10748:110;274:71126;;-1:-1:-1;;;10825:18:3;;274:71126;;10825:18;10556:79;274:71126;;-1:-1:-1;;;10614:10:3;;274:71126;;10614:10;10560:31;274:71126;5083:25;10571:2;274:71126;10577:14;10560:31;;10359:107;274:71126;;-1:-1:-1;;;10435:20:3;;274:71126;;10435:20;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;;;70638:9;;;274:71126;70650:8;274:71126;70638:27;274:71126;;70688:25;274:71126;;;;;;;;;;;;;;;;;70638:27;;;274:71126;;;;;;-1:-1:-1;;274:71126:3;;;;2466:103:2;;:::i;:::-;274:71126:3;5064:15;274:71126;;;;;;;;5083:25;5064:44;;5060:104;;274:71126;4638:44;;4634:95;;274:71126;9177:42;9173:96;;9357:10;274:71126;;9340:16;274:71126;;;;;;;;9306:20;274:71126;;;;;9447:12;;;274:71126;;;;;;;;;;;;;9447:37;9443:90;;9615:11;274:71126;9306:20;274:71126;;;;;;9306:20;274:71126;;;;;;;9651:3;9615:40;274:71126;;9615:40;;:::i;:::-;9695:2;274:71126;;;;;;9695:2;274:71126;;;;;;;;;;;9714:20;274:71126;9714:20;;:31;274:71126;;;9714:31;:::i;:::-;274:71126;;-1:-1:-1;;274:71126:3;;;;9447:12;274:71126;;;-1:-1:-1;;;9858:61:3;;9357:10;274:71126;9858:61;;274:71126;9904:4;274:71126;;;;;;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;-1:-1:-1;;274:71126:3;;9858:61;;;;;;;9934:53;9858:61;9770:16;9858:61;;;274:71126;-1:-1:-1;9952:12:3;274:71126;;;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;9934:53;274:71126;9858:61;;;274:71126;9858:61;274:71126;9858:61;;;;;;;:::i;:::-;;;;;9443:90;274:71126;;-1:-1:-1;;;9507:15:3;;274:71126;;9507:15;9173:96;274:71126;;-1:-1:-1;;;9242:16:3;;274:71126;;9242:16;274:71126;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;:::o;:::-;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;-1:-1:-1;;;;;274:71126:3;;;;;;:::o;:::-;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;-1:-1:-1;274:71126:3;;-1:-1:-1;274:71126:3;;-1:-1:-1;274:71126:3;;;;;;;;;;;;;;;;:::i;:::-;:::o;:::-;;;;;;;;;;;;-1:-1:-1;274:71126:3;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;;;:::o;:::-;;;;;;;;;;:::o;:::-;29334:19;274:71126;;;;;;29334:19;-1:-1:-1;274:71126:3;;;;-1:-1:-1;274:71126:3;:::o;:::-;;;;;;;;;;;;;29334:19;274:71126;;;;29334:19;274:71126;;;;;;:::o;:::-;;;;;;;;-1:-1:-1;274:71126:3;;-1:-1:-1;274:71126:3;;;-1:-1:-1;274:71126:3;:::o;:::-;;;-1:-1:-1;;;274:71126:3;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;;;;;;;;;;;-1:-1:-1;274:71126:3;;-1:-1:-1;274:71126:3;;-1:-1:-1;274:71126:3;;;;;;;;;;;;;;;;:::i;:::-;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;-1:-1:-1;274:71126:3;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;29334:19;274:71126;;;;;-1:-1:-1;;274:71126:3;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;29334:19;274:71126;:::o;:::-;;;;;;;;;;;;;;;;;;;-1:-1:-1;;274:71126:3;;;;;;;:::i;:::-;;:::o;:::-;;;;;;;:::i;:::-;-1:-1:-1;274:71126:3;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;;:::o;:::-;;;;;;;;:::o;50847:7128::-;;51094:8;274:71126;;-1:-1:-1;274:71126:3;51073:20;274:71126;;;-1:-1:-1;274:71126:3;;51117:7;274:71126;;;;;;;51043:15;:82;:181;;;;50847:7128;51026:257;;274:71126;;;;;;;;;;;;-1:-1:-1;274:71126:3;51467:28;274:71126;;;-1:-1:-1;274:71126:3;51548:10;-1:-1:-1;274:71126:3;51521:26;274:71126;;;-1:-1:-1;274:71126:3;;;;;-1:-1:-1;274:71126:3;;;;-1:-1:-1;274:71126:3;;-1:-1:-1;274:71126:3;;;;-1:-1:-1;274:71126:3;;;;;;;51430:1;51609:14;;274:71126;;51548:10;;;51595:28;51591:79;;51684:18;;;274:71126;;;;;51683:19;51679:73;;274:71126;;;;;51761:69;;274:71126;-1:-1:-1;274:71126:3;51877:16;274:71126;;;-1:-1:-1;274:71126:3;;-1:-1:-1;274:71126:3;51856:20;274:71126;;;51856:61;274:71126;-1:-1:-1;274:71126:3;51856:61;274:71126;;;;;;;;51684:18;51856:95;51839:179;;-1:-1:-1;;274:71126:3;;;;;52059:138;;274:71126;;;;;-1:-1:-1;274:71126:3;52369:18;274:71126;;;;-1:-1:-1;274:71126:3;;:::i;:::-;-1:-1:-1;52439:13:3;-1:-1:-1;52472:3:3;274:71126;;52454:16;;;;;274:71126;;;;-1:-1:-1;274:71126:3;51467:28;274:71126;;;-1:-1:-1;274:71126:3;52553:8;;;;:::i;:::-;274:71126;-1:-1:-1;274:71126:3;;;;51684:18;274:71126;-1:-1:-1;274:71126:3;52512:63;274:71126;;52491:141;;52472:3;51430:1;274:71126;52439:13;;52491:141;52608:9;;51430:1;52608:9;;:::i;:::-;52491:141;;;;;52454:16;;52807:51;52454:16;;;274:71126;;;-1:-1:-1;274:71126:3;51073:20;274:71126;;52807:41;274:71126;-1:-1:-1;274:71126:3;52807:41;274:71126;52807:51;:::i;:::-;52868:28;-1:-1:-1;;52978:13:3;51430:1;274:71126;52997:8;274:71126;52973:167;53011:3;51430:1;274:71126;;;;;;51430:1;274:71126;;52993:16;;;;;274:71126;-1:-1:-1;274:71126:3;51856:20;274:71126;;;51856:61;274:71126;-1:-1:-1;274:71126:3;53034:30;274:71126;;;;;;;;51684:18;53034:52;53030:100;;53011:3;51430:1;274:71126;52978:13;;53030:100;53106:9;;51430:1;53106:9;;:::i;:::-;53030:100;;;;;52993:16;;;;;;;274:71126;;51094:8;274:71126;-1:-1:-1;274:71126:3;53371:25;274:71126;;;;-1:-1:-1;274:71126:3;;;53367:142;;52973:167;53547:17;;;;:::i;:::-;53574:21;-1:-1:-1;53619:13:3;51430:1;53652:3;52997:8;274:71126;51430:1;274:71126;;;;;;51430:1;274:71126;53634:16;;;;;274:71126;-1:-1:-1;274:71126:3;51856:20;274:71126;;;-1:-1:-1;274:71126:3;;51856:61;53739:12;;274:71126;;;;;;;;51684:18;53739:34;53735:647;;53652:3;;51430:1;274:71126;53619:13;;53735:647;52807:41;53797:19;274:71126;;53797:19;;;:30;;;53793:476;;53735:647;51430:1;54286:31;54335:32;54286:31;;;;;;:::i;:::-;274:71126;;54335:32;:::i;:::-;53735:647;;;;53793:476;51430:1;53869:30;53851:49;54335:32;53869:30;;;;54286:31;53869:30;;:::i;53851:49::-;54220:30;;53793:476;;;;;;;;53634:16;;;;;;;;;;274:71126;;54469:16;54465:2603;;53614:778;-1:-1:-1;;57092:31:3;;;;;-1:-1:-1;;;;57139:17:3;;;274:71126;;;51856:61;274:71126;;51609:14;;274:71126;;;-1:-1:-1;;;57180:46:3;;-1:-1:-1;;;;;274:71126:3;;;51684:18;57180:46;;274:71126;;;;;;;;57139:17;274:71126;;;;;;-1:-1:-1;274:71126:3;;;;57180:46;;;;;;;;;;57293;57180;;;57088:881;-1:-1:-1;274:71126:3;51609:14;;274:71126;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;;;;;;;;57293:46;;;;50847:7128::o;57180:46::-;;;274:71126;57180:46;274:71126;57180:46;;;;;;;:::i;:::-;;;;;57088:881;57396:7;57362:30;;;;:::i;:::-;57361:42;57396:7;;;-1:-1:-1;;;57471:17:3;;;274:71126;;;51856:61;274:71126;;51609:14;;274:71126;;;-1:-1:-1;;;57523:59:3;;-1:-1:-1;;;;;274:71126:3;;;51684:18;57523:59;;274:71126;;;;;;;;;;57471:17;274:71126;;;;;;-1:-1:-1;274:71126:3;;;;57523:59;274:71126;57357:612;57739:165;274:71126;;;;52807:41;274:71126;;4790:15;274:71126;;;4790:15;274:71126;;;;;;;;;;;;;;;;;;;;;;57739:165;-1:-1:-1;;;;;;;;;;;274:71126:3;;;51043:15;274:71126;;57923:35;274:71126::o;54465:2603::-;-1:-1:-1;54624:105:3;;;;;;;;;;:18;;;:105;:18;;;:105;;;;;;;;;54613:116;-1:-1:-1;54788:2270:3;54826:3;274:71126;;54808:16;;;;;55133:8;;;;:::i;:::-;274:71126;-1:-1:-1;274:71126:3;51856:20;274:71126;;;;;;;55112:37;274:71126;-1:-1:-1;274:71126:3;55112:37;274:71126;;-1:-1:-1;274:71126:3;55057:29;274:71126;;;-1:-1:-1;274:71126:3;;-1:-1:-1;274:71126:3;55011:24;274:71126;;;51430:1;274:71126;-1:-1:-1;274:71126:3;55236:13;274:71126;:::i;:::-;55299:23;-1:-1:-1;55268:13:3;-1:-1:-1;55395:13:3;-1:-1:-1;55432:3:3;274:71126;;55410:20;;;;;-1:-1:-1;;;;;55550:12:3;;;;:::i;:::-;274:71126;;-1:-1:-1;274:71126:3;51877:16;274:71126;;;-1:-1:-1;274:71126:3;;-1:-1:-1;274:71126:3;51856:20;274:71126;;;-1:-1:-1;274:71126:3;;51856:61;55611:13;;274:71126;;;;;;;;51684:18;55611:35;55607:501;;55432:3;;51430:1;274:71126;55395:13;;55607:501;55674:7;;;;;;:::i;:::-;55740:20;;;;;:91;;;55607:501;55707:379;;;55906:21;;51684:18;51430:1;55906:21;;274:71126;55707:379;;55607:501;;;55707:379;55960:126;;;;;;55707:379;;51430:1;55707:379;;;55960:126;51684:18;56034:21;;;;274:71126;;51430:1;274:71126;;;;;55112:37;274:71126;;;;;;;56016:43;51430:1;55960:126;;55740:91;55810:21;51684:18;55810:21;;274:71126;55792:39;;55740:91;;55410:20;;;;;;;;;;;;;56327:16;55410:20;56327:16;;:::i;:::-;56372:95;:26;;;;;;:95;;;-1:-1:-1;56667:3:3;274:71126;;56645:20;;;;;-1:-1:-1;;;;;56786:12:3;;;;:::i;:::-;274:71126;;-1:-1:-1;274:71126:3;51877:16;274:71126;;;-1:-1:-1;274:71126:3;;-1:-1:-1;274:71126:3;51856:20;274:71126;;;-1:-1:-1;274:71126:3;;51856:61;56847:14;;274:71126;;;;;;;;51684:18;56847:36;56843:183;;56667:3;;51430:1;274:71126;56630:13;;56843:183;56911:22;51430:1;56911:22;;51684:18;56971:32;56911:22;;:34;274:71126;;;56911:34;:::i;56971:32::-;56843:183;;;;56645:20;-1:-1:-1;56645:20:3;;;;;;-1:-1:-1;56645:20:3;;-1:-1:-1;56645:20:3;51430:1;274:71126;;;;56645:20;;54793:13;;56372:95;;;;;;54808:16;;;;;;;;;;54465:2603;;;;54624:105;54700:28;;54688:41;54700:28;;;:::i;54688:41::-;54624:105;;;;;;;;;53367:142;274:71126;;;53430:21;274:71126;;53475:23;274:71126;;-1:-1:-1;274:71126:3;;:::i;:::-;;;;53475:23;;:::i;:::-;53367:142;;;52059:138;-1:-1:-1;52088:17:3;;;274:71126;;;;;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;52088:17;;52128:38;;274:71126;;-1:-1:-1;274:71126:3;;;;52128:38;274:71126;51761:69;274:71126;;-1:-1:-1;;;51803:16:3;;51684:18;;51803:16;51679:73;274:71126;;-1:-1:-1;;;51725:16:3;;51684:18;;51725:16;51591:79;274:71126;;-1:-1:-1;;;51646:13:3;;;;;51026:257;274:71126;;-1:-1:-1;;;51256:16:3;;;;;51043:181;274:71126;;-1:-1:-1;274:71126:3;51073:20;274:71126;;;-1:-1:-1;274:71126:3;;51216:7;274:71126;;;;;;;51043:15;51141:83;;51043:181;;2575:307:2;1899:1;2702:7;274:71126:3;2702:18:2;2698:86;;1899:1;2702:7;274:71126:3;2575:307:2:o;2698:86::-;274:71126:3;;-1:-1:-1;;;2743:30:2;;;;;1933:184:4;1082:10;274:71126:3;-1:-1:-1;;;;;274:71126:3;735:10:1;1996:37:4;1992:119;;1933:184::o;1992:119::-;274:71126:3;;-1:-1:-1;;;2056:44:4;;735:10:1;2056:44:4;;;274:71126:3;;;2056:44:4;40908:324:3;;-1:-1:-1;41013:13:3;-1:-1:-1;41048:3:3;274:71126;;41028:18;;;;;41085:10;;;;:::i;:::-;274:71126;;41071:10;274:71126;;;;;;-1:-1:-1;;;;;274:71126:3;41071:24;41067:72;;41048:3;274:71126;;41013:13;;41067:72;41115:9;-1:-1:-1;41115:9:3;41067:72;;41028:18;;;274:71126;;;;;;;;;;;41212:11;41175:27;41158:14;41175:27;41158:44;41175:27;;;:::i;:::-;274:71126;;;41158:14;;;:::i;:::-;274:71126;;-1:-1:-1;;;;;274:71126:3;;;;;;;;;;;;;;;;;;;;;;;;;;;35903:310;-1:-1:-1;274:71126:3;36009:20;274:71126;;;-1:-1:-1;274:71126:3;;35991:15;;:56;:151;;;;;35903:310;35974:233;;;35903:310::o;35974:233::-;274:71126;;-1:-1:-1;;;36174:22:3;;;;;35991:151;274:71126;;36135:6;274:71126;;;;;;;35991:15;36063:79;35991:151;;;36330:178;-1:-1:-1;274:71126:3;36403:20;274:71126;;36403:37;274:71126;-1:-1:-1;274:71126:3;36403:37;274:71126;36403:49;36399:103;;36330:178::o;36399:103::-;274:71126;;-1:-1:-1;;;36475:16:3;;;;;2123:207:4;2219:10;274:71126:3;;-1:-1:-1;;;;;274:71126:3;;;-1:-1:-1;;;;;;274:71126:3;;;;;;;;;2279:44:4;;2219:10;2279:44;2123:207::o',
    linkReferences: {},
  },
  methodIdentifiers: {
    'EmergencyStartTime()': '7b47d7e8',
    'acceptSecretaryRole()': 'a504f809',
    'addMemberToCommunity(address)': 'f2ddec41',
    'advancePeriod()': 'c3a42297',
    'approveNewSubgroupMember(uint256,uint256,bool)': 'dbcd14f0',
    'approveSubgroupAssignment(bool)': '5c6af456',
    'assignMemberToSubgroup(address,uint256,bool)': 'be471206',
    'beginEmergency()': '756b01b6',
    'createSubgroup()': '4ee4a857',
    'defectFromCommunity()': '9e99d7c6',
    'defineSecretarySuccessorList(address[])': '42c1b0ef',
    'divideShortfall()': 'bc017b57',
    'emergencyRefund()': '16bfe25c',
    'emergencySecretaryHandoff(address)': 'd26a624b',
    'emergencyWithdraw(address,uint256)': '95ccea67',
    'endEmergency()': '3f1b3f8f',
    'extendPeriodByOneDay()': 'fb3944f1',
    'getBasePremium()': '5d86b8e1',
    'getClaimIdsInPeriod(uint256)': '26470923',
    'getClaimInfo(uint256,uint256)': '35bd2c5d',
    'getCommunityState()': '7985940d',
    'getCurrentClaimId()': 'f34cf775',
    'getCurrentMemberCount()': 'cb695ef4',
    'getCurrentPeriodId()': '396b6247',
    'getCurrentSubgroupCount()': '256b7e23',
    'getDefectorMemberIdsInPeriod(uint256)': '1401e6cc',
    'getEmergencyHandOverStartedPeriod()': 'ac115bbe',
    'getEmergencyHandoverStartedAt()': 'fef4c550',
    'getEmergencySecretaries()': '4ee9c6f7',
    'getHandoverStartedAt()': 'e15d69f3',
    'getIsAMemberDefectedInPeriod(uint256)': '0a5b34f2',
    'getIsAllMemberNotPaidInPeriod(uint256)': '66199808',
    'getIsHandingOver()': 'c2a41da0',
    'getMemberIdFromAddress(address)': '6b61aed9',
    'getMemberInfoFromAddress(address,uint256)': 'c1fb07fc',
    'getMemberInfoFromId(uint256,uint256)': 'a8fdb788',
    'getPaymentTokenAddress()': 'dea182c1',
    'getPeriodIdToPeriodInfo(uint256)': 'e329972d',
    'getSecretaryAddress()': '881d59be',
    'getSecretarySuccessorList()': '2250e166',
    'getSubgroupInfo(uint256)': '3cf1aa95',
    'getTotalCoverageAmount()': '953434ae',
    'getUpcomingSecretary()': '6d4da76d',
    'getWhitelistedClaimIdsInPeriod(uint256)': 'e26747c5',
    'handoverSecretaryRoleToSuccessor(address)': 'b87b1d0d',
    'initiateDefaultState(uint256)': '108f1d03',
    'injectFunds()': '50c8e1fd',
    'issueRefund(bool)': 'c4afc37a',
    'joinCommunity()': '00b16fee',
    'leaveSubgroup()': '4ae4ab48',
    'payPremium(bool)': '39786a96',
    'submitClaim()': '1afbd128',
    'updateCoverageAmount(uint256)': '72547ec9',
    'updateMemberStatus()': 'f3f02d03',
    'whitelistClaim(uint256)': 'ec15a890',
    'withdrawClaimFund(bool)': 'd98b2503',
    'withdrawRefund()': '110f8874',
  },
  rawMetadata:
    '{"compiler":{"version":"0.8.23+commit.f704f362"},"language":"Solidity","output":{"abi":[{"inputs":[{"internalType":"address","name":"_paymentToken","type":"address"},{"internalType":"address","name":"owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AlreadyAdded","type":"error"},{"inputs":[],"name":"AlreadyClaimed","type":"error"},{"inputs":[],"name":"AlreadySet","type":"error"},{"inputs":[],"name":"AlreadySubmitted","type":"error"},{"inputs":[],"name":"AmountZero","type":"error"},{"inputs":[],"name":"CannotBeZeroAddress","type":"error"},{"inputs":[],"name":"CannotEmergencyRefund","type":"error"},{"inputs":[],"name":"ClaimNoOccured","type":"error"},{"inputs":[],"name":"ClaimantNotValidMember","type":"error"},{"inputs":[],"name":"CommunityIsCollapsed","type":"error"},{"inputs":[],"name":"CoverageFullfilled","type":"error"},{"inputs":[],"name":"DFNotMet","type":"error"},{"inputs":[],"name":"DelayInitiated","type":"error"},{"inputs":[],"name":"EmergencyGracePeriod","type":"error"},{"inputs":[],"name":"HandoverAlreadyInProgress","type":"error"},{"inputs":[],"name":"InEmergency","type":"error"},{"inputs":[],"name":"InValidClaim","type":"error"},{"inputs":[],"name":"InsufficientFunds","type":"error"},{"inputs":[],"name":"InvalidMember","type":"error"},{"inputs":[],"name":"InvalidSubGroup","type":"error"},{"inputs":[],"name":"ManuallyCollapsed","type":"error"},{"inputs":[],"name":"NeedMoreSuccessor","type":"error"},{"inputs":[],"name":"NoClaimOccured","type":"error"},{"inputs":[],"name":"NoValiddMember","type":"error"},{"inputs":[],"name":"NotAssignedYet","type":"error"},{"inputs":[],"name":"NotClaimSubmittionWindow","type":"error"},{"inputs":[],"name":"NotClaimWindow","type":"error"},{"inputs":[],"name":"NotClaimant","type":"error"},{"inputs":[],"name":"NotDefectWindow","type":"error"},{"inputs":[],"name":"NotFirstSuccessor","type":"error"},{"inputs":[],"name":"NotHandingOver","type":"error"},{"inputs":[],"name":"NotInAssigned","type":"error"},{"inputs":[],"name":"NotInAssignmentSuccessfull","type":"error"},{"inputs":[],"name":"NotInCovereged","type":"error"},{"inputs":[],"name":"NotInDefOrFra","type":"error"},{"inputs":[],"name":"NotInEmergency","type":"error"},{"inputs":[],"name":"NotInInDefault","type":"error"},{"inputs":[],"name":"NotInIniOrDef","type":"error"},{"inputs":[],"name":"NotInInitilization","type":"error"},{"inputs":[],"name":"NotInInjectionWindow","type":"error"},{"inputs":[],"name":"NotInManualCollaps","type":"error"},{"inputs":[],"name":"NotInSuccessorList","type":"error"},{"inputs":[],"name":"NotIncluded","type":"error"},{"inputs":[],"name":"NotPaidInvalid","type":"error"},{"inputs":[],"name":"NotPayWindow","type":"error"},{"inputs":[],"name":"NotRefundWindow","type":"error"},{"inputs":[],"name":"NotReorged","type":"error"},{"inputs":[],"name":"NotValidMember","type":"error"},{"inputs":[],"name":"NotWhiteListed","type":"error"},{"inputs":[],"name":"NotWhitelistWindow","type":"error"},{"inputs":[],"name":"OutOfTheCommunity","type":"error"},{"inputs":[],"name":"PrevPeriodNotEnded","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"inputs":[],"name":"SGMNotFullfilled","type":"error"},{"inputs":[],"name":"SamePeriod","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"SecretaryInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"SecretaryUnauthorizedSecretary","type":"error"},{"inputs":[],"name":"TimeNotPassed","type":"error"},{"inputs":[],"name":"TurningTimePassed","type":"error"},{"inputs":[],"name":"WLCAvailable","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"}],"name":"AddedToCommunity","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"pEndTime","type":"uint256"}],"name":"AdditionalDayAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"address","name":"approver","type":"address"},{"indexed":false,"internalType":"uint256","name":"groupId","type":"uint256"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApproveNewGroupMember","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"uint256","name":"groupId","type":"uint256"},{"indexed":false,"internalType":"bool","name":"joined","type":"bool"}],"name":"ApprovedGroupAssignment","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"uint256","name":"groupId","type":"uint256"},{"indexed":false,"internalType":"bool","name":"isReOrging","type":"bool"}],"name":"AssignedToSubGroup","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"uint256","name":"claimId","type":"uint256"}],"name":"ClaimSubmitted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"cId","type":"uint256"}],"name":"ClaimWhiteListed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"collapsedAt","type":"uint256"}],"name":"CommunityCollapsed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"coverage","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"basePremium","type":"uint256"}],"name":"CoverageUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"coverage","type":"uint256"}],"name":"DefaultStateInitiatedAndCoverageSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"emergencyStartedAt","type":"uint256"}],"name":"EmergencyBegan","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EmergencyPayment","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"secretary","type":"address"}],"name":"EmergencyhandOverSecretary","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"uint256","name":"groupId","type":"uint256"}],"name":"ExitedFromSubGroup","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"claimant","type":"address"},{"indexed":false,"internalType":"uint256","name":"claimId","type":"uint256"}],"name":"ForfeitClaim","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalClaimableAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"cAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"vmCount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"pmAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"pmShortAmount","type":"uint256"}],"name":"FundClaimFailed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"claimant","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"cId","type":"uint256"}],"name":"FundClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FundInjected","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"uint256","name":"paidAmount","type":"uint256"}],"name":"JoinedToCommunity","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"uint256","name":"gId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"mId","type":"uint256"}],"name":"LeavedFromGroup","type":"event"},{"anonymous":false,"inputs":[],"name":"ManualCollapseCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"timee","type":"uint256"}],"name":"ManualCollapsedCancelled","type":"event"},{"anonymous":false,"inputs":[],"name":"ManualCollapsedHappenend","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"uint256","name":"periodId","type":"uint256"}],"name":"MemberDefected","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"enum TandaPayEvents.MemberStatus","name":"newStatus","type":"uint8"}],"name":"MemberStatusUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"periodId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"coverage","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"baseAmount","type":"uint256"}],"name":"NextPeriodInitiated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"uint256","name":"periodId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"bool","name":"usingATW","type":"bool"}],"name":"PremiumPaid","type":"event"},{"anonymous":false,"inputs":[],"name":"RefundIssued","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"member","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RefundWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"nSecretary","type":"address"}],"name":"SecretaryAccepted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"prefferedSuccessr","type":"address"}],"name":"SecretaryHandOverEnabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address[]","name":"successors","type":"address[]"}],"name":"SecretarySuccessorsDefined","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"SecretaryTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"pmAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"fromSecrretary","type":"uint256"}],"name":"ShortFallDivided","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"}],"name":"SubGroupCreated","type":"event"},{"inputs":[],"name":"EmergencyStartTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptSecretaryRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_member","type":"address"}],"name":"addMemberToCommunity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"advancePeriod","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_sId","type":"uint256"},{"internalType":"uint256","name":"_nMemberId","type":"uint256"},{"internalType":"bool","name":"_accepted","type":"bool"}],"name":"approveNewSubgroupMember","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_shouldJoin","type":"bool"}],"name":"approveSubgroupAssignment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_member","type":"address"},{"internalType":"uint256","name":"_sId","type":"uint256"},{"internalType":"bool","name":"_isReorging","type":"bool"}],"name":"assignMemberToSubgroup","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"beginEmergency","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"createSubgroup","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"defectFromCommunity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"_successors","type":"address[]"}],"name":"defineSecretarySuccessorList","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"divideShortfall","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"emergencyRefund","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_eSecretary","type":"address"}],"name":"emergencySecretaryHandoff","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"endEmergency","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"extendPeriodByOneDay","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getBasePremium","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pId","type":"uint256"}],"name":"getClaimIdsInPeriod","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pId","type":"uint256"},{"internalType":"uint256","name":"_cId","type":"uint256"}],"name":"getClaimInfo","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"claimant","type":"address"},{"internalType":"uint256","name":"claimAmount","type":"uint256"},{"internalType":"uint256","name":"SGId","type":"uint256"},{"internalType":"bool","name":"isWhitelistd","type":"bool"},{"internalType":"bool","name":"isClaimed","type":"bool"}],"internalType":"struct TandaPay.ClaimInfo","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCommunityState","outputs":[{"internalType":"enum TandaPay.CommunityStates","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentClaimId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentMemberCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentPeriodId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentSubgroupCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pId","type":"uint256"}],"name":"getDefectorMemberIdsInPeriod","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEmergencyHandOverStartedPeriod","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEmergencyHandoverStartedAt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getEmergencySecretaries","outputs":[{"internalType":"address[2]","name":"","type":"address[2]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getHandoverStartedAt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pId","type":"uint256"}],"name":"getIsAMemberDefectedInPeriod","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pId","type":"uint256"}],"name":"getIsAllMemberNotPaidInPeriod","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getIsHandingOver","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_member","type":"address"}],"name":"getMemberIdFromAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_member","type":"address"},{"internalType":"uint256","name":"_pId","type":"uint256"}],"name":"getMemberInfoFromAddress","outputs":[{"components":[{"internalType":"uint256","name":"memberId","type":"uint256"},{"internalType":"uint256","name":"associatedGroupId","type":"uint256"},{"internalType":"address","name":"member","type":"address"},{"internalType":"uint256","name":"cEscrowAmount","type":"uint256"},{"internalType":"uint256","name":"ISEscorwAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRefundAmount","type":"uint256"},{"internalType":"uint256","name":"availableToWithdraw","type":"uint256"},{"internalType":"bool","name":"eligibleForCoverageInPeriod","type":"bool"},{"internalType":"bool","name":"isPremiumPaid","type":"bool"},{"internalType":"uint256","name":"idToQuedRefundAmount","type":"uint256"},{"internalType":"enum TandaPayEvents.MemberStatus","name":"status","type":"uint8"},{"internalType":"enum TandaPay.AssignmentStatus","name":"assignment","type":"uint8"}],"internalType":"struct TandaPay.DemoMemberInfo","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_memberId","type":"uint256"},{"internalType":"uint256","name":"_pId","type":"uint256"}],"name":"getMemberInfoFromId","outputs":[{"components":[{"internalType":"uint256","name":"memberId","type":"uint256"},{"internalType":"uint256","name":"associatedGroupId","type":"uint256"},{"internalType":"address","name":"member","type":"address"},{"internalType":"uint256","name":"cEscrowAmount","type":"uint256"},{"internalType":"uint256","name":"ISEscorwAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRefundAmount","type":"uint256"},{"internalType":"uint256","name":"availableToWithdraw","type":"uint256"},{"internalType":"bool","name":"eligibleForCoverageInPeriod","type":"bool"},{"internalType":"bool","name":"isPremiumPaid","type":"bool"},{"internalType":"uint256","name":"idToQuedRefundAmount","type":"uint256"},{"internalType":"enum TandaPayEvents.MemberStatus","name":"status","type":"uint8"},{"internalType":"enum TandaPay.AssignmentStatus","name":"assignment","type":"uint8"}],"internalType":"struct TandaPay.DemoMemberInfo","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPaymentTokenAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pId","type":"uint256"}],"name":"getPeriodIdToPeriodInfo","outputs":[{"components":[{"internalType":"uint256","name":"startedAt","type":"uint256"},{"internalType":"uint256","name":"willEndAt","type":"uint256"},{"internalType":"uint256[]","name":"claimIds","type":"uint256[]"},{"internalType":"uint256","name":"coverage","type":"uint256"},{"internalType":"uint256","name":"totalPaid","type":"uint256"}],"internalType":"struct TandaPay.PeriodInfo","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSecretaryAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSecretarySuccessorList","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_sId","type":"uint256"}],"name":"getSubgroupInfo","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address[]","name":"members","type":"address[]"},{"internalType":"bool","name":"isValid","type":"bool"}],"internalType":"struct TandaPay.SubGroupInfo","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalCoverageAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUpcomingSecretary","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pId","type":"uint256"}],"name":"getWhitelistedClaimIdsInPeriod","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_prefferedSuccessor","type":"address"}],"name":"handoverSecretaryRoleToSuccessor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coverage","type":"uint256"}],"name":"initiateDefaultState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"injectFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_shouldTransfer","type":"bool"}],"name":"issueRefund","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"joinCommunity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"leaveSubgroup","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_useFromATW","type":"bool"}],"name":"payPremium","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"submitClaim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coverage","type":"uint256"}],"name":"updateCoverageAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"updateMemberStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_cId","type":"uint256"}],"name":"whitelistClaim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"isForfeit","type":"bool"}],"name":"withdrawClaimFund","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRefund","outputs":[],"stateMutability":"nonpayable","type":"function"}],"devdoc":{"errors":{"ReentrancyGuardReentrantCall()":[{"details":"Unauthorized reentrant call."}]},"kind":"dev","methods":{"acceptSecretaryRole()":{"details":"Allows a designated successor to accept the Secretary role, completing the handover process."},"addMemberToCommunity(address)":{"details":"Adds a new member to the community","params":{"_member":"address of new member to add"}},"advancePeriod()":{"details":"Advances the community to the next period, resetting the state and recalculating premiums if necessary."},"approveNewSubgroupMember(uint256,uint256,bool)":{"details":"Allows existing subgroup members to approve or reject a new member\'s assignment to their subgroup.","params":{"_accepted":"true if accepted, false if rejecet","_nMemberId":"new member id","_sId":"subgroup id"}},"approveSubgroupAssignment(bool)":{"details":"Allows a member to approve or reject their assignment to a subgroup.","params":{"_shouldJoin":"true to approve assignment, false to reject"}},"assignMemberToSubgroup(address,uint256,bool)":{"details":"assign a member to a subgroup, with reorg option","params":{"_isReorging":"flag that decides if this operation is part of a reorganization process","_member":"address of new member to add","_sId":"subgroup Id"}},"beginEmergency()":{"details":"Secretary enters emergency state"},"createSubgroup()":{"details":"creates new subgroup"},"defectFromCommunity()":{"details":"Allows a member to defect from the community during the defect window, altering their status and potentially affecting the community\'s state."},"defineSecretarySuccessorList(address[])":{"details":"Defines a list of successor candidates for the Secretary role based on the community\'s size.only callable by secretary","params":{"_successors":"list of successors to the secretary"}},"divideShortfall()":{"details":"Divides any shortfall in coverage among the valid members during the injection window."},"emergencyRefund()":{"details":"emergency refund. Makes all funds refundable to members."},"emergencySecretaryHandoff(address)":{"details":"Facilitates an emergency handover of the Secretary role when two designated successors agree.","params":{"_eSecretary":"emergency successor address"}},"emergencyWithdraw(address,uint256)":{"details":"Secretary sends out emergency funding","params":{"amount":"amount of tokens to send","to":"the address to send emergency fund"}},"endEmergency()":{"details":"Secretary Ends Emergency, collapses community"},"extendPeriodByOneDay()":{"details":"Extends the current period by adding an extra day."},"getBasePremium()":{"details":"returns the base premium"},"getClaimIdsInPeriod(uint256)":{"details":"returns array of claim Ids per period","params":{"_pId":"period Id"}},"getClaimInfo(uint256,uint256)":{"details":"returns claim info based on period and claim Id","params":{"_cId":"claim Id (specific to period)","_pId":"period Id"}},"getCommunityState()":{"details":"returns community states"},"getCurrentClaimId()":{"details":"returns the most recent claim Id"},"getCurrentMemberCount()":{"details":"returns the most recent memberId"},"getCurrentPeriodId()":{"details":"returns the most recent period Id"},"getCurrentSubgroupCount()":{"details":"returns the most recent subGroupId"},"getDefectorMemberIdsInPeriod(uint256)":{"details":"returns array of defectors IDs per period","params":{"_pId":"period Id"}},"getIsAMemberDefectedInPeriod(uint256)":{"details":"returns flag if member has defected at a give period","params":{"_pId":"period Id"}},"getIsAllMemberNotPaidInPeriod(uint256)":{"details":"returns flag whether all members in a period have paid","params":{"_pId":"period Id"}},"getMemberIdFromAddress(address)":{"details":"returns the member Id","params":{"_member":"user address"}},"getMemberInfoFromAddress(address,uint256)":{"details":"returns member info from address and member Id","params":{"_member":"user address","_pId":"member Id"}},"getPaymentTokenAddress()":{"details":"returns the address of the payment token"},"getPeriodIdToPeriodInfo(uint256)":{"details":"returns period information","params":{"_pId":"period Id"}},"getSubgroupInfo(uint256)":{"details":"returns subgroup information","params":{"_sId":"id of the subgroup"}},"getTotalCoverageAmount()":{"details":"returns the total coverage"},"getWhitelistedClaimIdsInPeriod(uint256)":{"details":"returns array of whitelisted claimIds per period","params":{"_pId":"period Id"}},"handoverSecretaryRoleToSuccessor(address)":{"details":"Initiates the handover process for the Secretary role to a preferred successor.only callable by secretary","params":{"_prefferedSuccessor":"address to be the new secretary"}},"initiateDefaultState(uint256)":{"details":"Transitions the community from INITIALIZATION to DEFAULT state and sets the total coverage amount.","params":{"_coverage":"amount of coverage"}},"injectFunds()":{"details":"Allows the Secretary to inject additional funds into the contract during the injection window to cover a shortfall."},"issueRefund(bool)":{"details":"Issues refunds to members during the refund window, optionally transferring the funds directly to the members.","params":{"_shouldTransfer":"whether refunds should be transferred to users or not"}},"joinCommunity()":{"details":"allows members (msg.sender) to join the community"},"leaveSubgroup()":{"details":"Allows a member to leave their subgroup, resetting their status and adjusting the subgroup\'s validity."},"payPremium(bool)":{"details":"Allows a member to pay their premium for the upcoming period, either from their available withdrawal balance or directly via transfer.","params":{"_useFromATW":"if true, pay from available balance, if false, must pay with token."}},"submitClaim()":{"details":"Allows a member to submit a claim during the claim submission window."},"updateCoverageAmount(uint256)":{"details":"Updates the total coverage amount for the community and recalculates the base premium accordingly.only callable by secretary","params":{"_coverage":"amount of coverage to assign"}},"updateMemberStatus()":{"details":"Updates the status of all members based on their premium payment status and the current community state."},"whitelistClaim(uint256)":{"details":"Whitelists a claim during the designated whitelist window, making it eligible for further processing.","params":{"_cId":"the claim id"}},"withdrawClaimFund(bool)":{"details":"Allows a member to withdraw their claim fund, either fully or forfeiting it, depending on the provided flag.","params":{"isForfeit":"allows member to choose to leave their claim instead"}},"withdrawRefund()":{"details":"Allows a member to withdraw their available refund amount."}},"version":1},"userdoc":{"kind":"user","methods":{"addMemberToCommunity(address)":{"notice":"only secretary can call"},"advancePeriod()":{"notice":"only secretary can call"},"approveNewSubgroupMember(uint256,uint256,bool)":{"notice":"new member must have \\"REORGED\\" status"},"assignMemberToSubgroup(address,uint256,bool)":{"notice":"only secretary can call"},"beginEmergency()":{"notice":"only secretary can call"},"createSubgroup()":{"notice":"only secretary can call"},"defectFromCommunity()":{"notice":"defecting can only happen if a claim occured in the previous period"},"divideShortfall()":{"notice":"only secretary can call"},"emergencyWithdraw(address,uint256)":{"notice":"only secretary can callcan only be called if 24 hours elapses post-emergency declaration"},"endEmergency()":{"notice":"only secretary can callcan only be called if 24 hours elapses post-emergency declaration"},"extendPeriodByOneDay()":{"notice":"only secretary can call"},"initiateDefaultState(uint256)":{"notice":"Can only be called by secretary"},"injectFunds()":{"notice":"only secretary can call"},"joinCommunity()":{"notice":"Can only join if community status is \\"DEFAULT\\""},"leaveSubgroup()":{"notice":"Removes the member from the subgroup, updates their eligibility and escrow amounts, and potentially invalidates the subgroup."},"payPremium(bool)":{"notice":"Validates the payment window, calculates the required payment, and updates the member\'s escrow amounts and eligibility for coverage in the next period."},"updateCoverageAmount(uint256)":{"notice":"can only update if community is not default or initializing"},"whitelistClaim(uint256)":{"notice":"only callable by secretary"}},"version":1}},"settings":{"compilationTarget":{"src/TandaPay.sol":"TandaPay"},"evmVersion":"shanghai","libraries":{},"metadata":{"bytecodeHash":"ipfs"},"optimizer":{"enabled":true,"runs":200},"remappings":[":@openzeppelin/contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/",":@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/",":aave-v3-core/=lib/aave-v3-core/",":ds-test/=lib/solmate/lib/ds-test/src/",":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/",":forge-std/=lib/forge-std/src/",":halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/",":openzeppelin-contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/",":openzeppelin-contracts/=lib/openzeppelin-contracts/",":solmate/=lib/solmate/src/"],"viaIR":true},"sources":{"lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol":{"keccak256":"0xe06a3f08a987af6ad2e1c1e774405d4fe08f1694b67517438b467cecf0da0ef7","license":"MIT","urls":["bzz-raw://df6f0c459663c9858b6cba2cda1d14a7d05a985bed6d2de72bd8e78c25ee79db","dweb:/ipfs/QmeTTxZ7qVk9rjEv2R4CpCwdf8UMCcRqDNMvzNxHc3Fnn9"]},"lib/openzeppelin-contracts/contracts/utils/Context.sol":{"keccak256":"0x493033a8d1b176a037b2cc6a04dad01a5c157722049bbecf632ca876224dd4b2","license":"MIT","urls":["bzz-raw://6a708e8a5bdb1011c2c381c9a5cfd8a9a956d7d0a9dc1bd8bcdaf52f76ef2f12","dweb:/ipfs/Qmax9WHBnVsZP46ZxEMNRQpLQnrdE4dK8LehML1Py8FowF"]},"lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol":{"keccak256":"0x11a5a79827df29e915a12740caf62fe21ebe27c08c9ae3e09abe9ee3ba3866d3","license":"MIT","urls":["bzz-raw://3cf0c69ab827e3251db9ee6a50647d62c90ba580a4d7bbff21f2bea39e7b2f4a","dweb:/ipfs/QmZiKwtKU1SBX4RGfQtY7PZfiapbbu6SZ9vizGQD9UHjRA"]},"src/TandaPay.sol":{"keccak256":"0x3a41f35df50e08ce99943449c832bc39c1c242062b877380aeded0087a981709","license":"MIT","urls":["bzz-raw://4a5c022a469ff7e8281adad224a7393ddac6a36038da639870d2e12210200cee","dweb:/ipfs/QmSTUcWtYR3Ub5a8p3kAVo2KfeRGnEb85oku2h6spkXL2k"]},"src/secretary.sol":{"keccak256":"0x8bcd55ba1c7d0ee3c42c959b6448a97957f4cbf61469f576f3b7035595913a19","license":"MIT","urls":["bzz-raw://bcde90c824099fe73e179c0f3601a7462cd6908539698228ceacf250c7115bcb","dweb:/ipfs/Qma78HS3vbV1cXSK6ibLZy2H2SXi9K1JDzUegRSTfD88mv"]},"src/util/TandaPayErrors.sol":{"keccak256":"0xf542aa8622c2114359f289c8cc582cdc5fdbc1d8654a0f7e4fcf9786820ef2e2","license":"MIT","urls":["bzz-raw://f4a758fb1ebe787b1555289053a24069e3dcda8524e3b92940e82dfd60eff93e","dweb:/ipfs/QmTQPowM6L7f7sswv5D6rMRDw6Dybgaq5roGT8Mx3L2Nt2"]},"src/util/TandaPayEvents.sol":{"keccak256":"0x9701311d9ca3c3fd051db8bca5e79093960d1963029ea14e07f82deaee6bda4d","license":"MIT","urls":["bzz-raw://127d95bdc72329a725af2262983e0bbca58963fa62b2956c990c686df10bc7fe","dweb:/ipfs/QmPSCXCAYcMREiqhApmm5eJK1QKrTGu53Y7cUdtaUW3yio"]}},"version":1}',
  metadata: {
    compiler: { version: '0.8.23+commit.f704f362' },
    language: 'Solidity',
    output: {
      abi: [
        {
          inputs: [
            { internalType: 'address', name: '_paymentToken', type: 'address' },
            { internalType: 'address', name: 'owner', type: 'address' },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        { inputs: [], type: 'error', name: 'AlreadyAdded' },
        { inputs: [], type: 'error', name: 'AlreadyClaimed' },
        { inputs: [], type: 'error', name: 'AlreadySet' },
        { inputs: [], type: 'error', name: 'AlreadySubmitted' },
        { inputs: [], type: 'error', name: 'AmountZero' },
        { inputs: [], type: 'error', name: 'CannotBeZeroAddress' },
        { inputs: [], type: 'error', name: 'CannotEmergencyRefund' },
        { inputs: [], type: 'error', name: 'ClaimNoOccured' },
        { inputs: [], type: 'error', name: 'ClaimantNotValidMember' },
        { inputs: [], type: 'error', name: 'CommunityIsCollapsed' },
        { inputs: [], type: 'error', name: 'CoverageFullfilled' },
        { inputs: [], type: 'error', name: 'DFNotMet' },
        { inputs: [], type: 'error', name: 'DelayInitiated' },
        { inputs: [], type: 'error', name: 'EmergencyGracePeriod' },
        { inputs: [], type: 'error', name: 'HandoverAlreadyInProgress' },
        { inputs: [], type: 'error', name: 'InEmergency' },
        { inputs: [], type: 'error', name: 'InValidClaim' },
        { inputs: [], type: 'error', name: 'InsufficientFunds' },
        { inputs: [], type: 'error', name: 'InvalidMember' },
        { inputs: [], type: 'error', name: 'InvalidSubGroup' },
        { inputs: [], type: 'error', name: 'ManuallyCollapsed' },
        { inputs: [], type: 'error', name: 'NeedMoreSuccessor' },
        { inputs: [], type: 'error', name: 'NoClaimOccured' },
        { inputs: [], type: 'error', name: 'NoValiddMember' },
        { inputs: [], type: 'error', name: 'NotAssignedYet' },
        { inputs: [], type: 'error', name: 'NotClaimSubmittionWindow' },
        { inputs: [], type: 'error', name: 'NotClaimWindow' },
        { inputs: [], type: 'error', name: 'NotClaimant' },
        { inputs: [], type: 'error', name: 'NotDefectWindow' },
        { inputs: [], type: 'error', name: 'NotFirstSuccessor' },
        { inputs: [], type: 'error', name: 'NotHandingOver' },
        { inputs: [], type: 'error', name: 'NotInAssigned' },
        { inputs: [], type: 'error', name: 'NotInAssignmentSuccessfull' },
        { inputs: [], type: 'error', name: 'NotInCovereged' },
        { inputs: [], type: 'error', name: 'NotInDefOrFra' },
        { inputs: [], type: 'error', name: 'NotInEmergency' },
        { inputs: [], type: 'error', name: 'NotInInDefault' },
        { inputs: [], type: 'error', name: 'NotInIniOrDef' },
        { inputs: [], type: 'error', name: 'NotInInitilization' },
        { inputs: [], type: 'error', name: 'NotInInjectionWindow' },
        { inputs: [], type: 'error', name: 'NotInManualCollaps' },
        { inputs: [], type: 'error', name: 'NotInSuccessorList' },
        { inputs: [], type: 'error', name: 'NotIncluded' },
        { inputs: [], type: 'error', name: 'NotPaidInvalid' },
        { inputs: [], type: 'error', name: 'NotPayWindow' },
        { inputs: [], type: 'error', name: 'NotRefundWindow' },
        { inputs: [], type: 'error', name: 'NotReorged' },
        { inputs: [], type: 'error', name: 'NotValidMember' },
        { inputs: [], type: 'error', name: 'NotWhiteListed' },
        { inputs: [], type: 'error', name: 'NotWhitelistWindow' },
        { inputs: [], type: 'error', name: 'OutOfTheCommunity' },
        { inputs: [], type: 'error', name: 'PrevPeriodNotEnded' },
        { inputs: [], type: 'error', name: 'ReentrancyGuardReentrantCall' },
        { inputs: [], type: 'error', name: 'SGMNotFullfilled' },
        { inputs: [], type: 'error', name: 'SamePeriod' },
        {
          inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
          type: 'error',
          name: 'SecretaryInvalidOwner',
        },
        {
          inputs: [
            { internalType: 'address', name: 'account', type: 'address' },
          ],
          type: 'error',
          name: 'SecretaryUnauthorizedSecretary',
        },
        { inputs: [], type: 'error', name: 'TimeNotPassed' },
        { inputs: [], type: 'error', name: 'TurningTimePassed' },
        { inputs: [], type: 'error', name: 'WLCAvailable' },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'member',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'id',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'AddedToCommunity',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'pEndTime',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'AdditionalDayAdded',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'member',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'address',
              name: 'approver',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'groupId',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'bool',
              name: 'approved',
              type: 'bool',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'ApproveNewGroupMember',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'member',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'groupId',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'bool',
              name: 'joined',
              type: 'bool',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'ApprovedGroupAssignment',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'member',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'groupId',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'bool',
              name: 'isReOrging',
              type: 'bool',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'AssignedToSubGroup',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'member',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'claimId',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'ClaimSubmitted',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'cId',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'ClaimWhiteListed',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'collapsedAt',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'CommunityCollapsed',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'coverage',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'basePremium',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'CoverageUpdated',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'coverage',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'DefaultStateInitiatedAndCoverageSet',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'emergencyStartedAt',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'EmergencyBegan',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'to',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'EmergencyPayment',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'secretary',
              type: 'address',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'EmergencyhandOverSecretary',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'member',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'groupId',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'ExitedFromSubGroup',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'claimant',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'claimId',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'ForfeitClaim',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'totalClaimableAmount',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'cAmount',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'vmCount',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'pmAmount',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'pmShortAmount',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'FundClaimFailed',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'claimant',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'cId',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'FundClaimed',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'FundInjected',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'member',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'paidAmount',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'JoinedToCommunity',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'member',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'gId',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'mId',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'LeavedFromGroup',
          anonymous: false,
        },
        {
          inputs: [],
          type: 'event',
          name: 'ManualCollapseCancelled',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'timee',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'ManualCollapsedCancelled',
          anonymous: false,
        },
        {
          inputs: [],
          type: 'event',
          name: 'ManualCollapsedHappenend',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'member',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'periodId',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'MemberDefected',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'member',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'enum TandaPayEvents.MemberStatus',
              name: 'newStatus',
              type: 'uint8',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'MemberStatusUpdated',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'periodId',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'coverage',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'baseAmount',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'NextPeriodInitiated',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'member',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'periodId',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'bool',
              name: 'usingATW',
              type: 'bool',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'PremiumPaid',
          anonymous: false,
        },
        { inputs: [], type: 'event', name: 'RefundIssued', anonymous: false },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'member',
              type: 'address',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'RefundWithdrawn',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'nSecretary',
              type: 'address',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'SecretaryAccepted',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'prefferedSuccessr',
              type: 'address',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'SecretaryHandOverEnabled',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address[]',
              name: 'successors',
              type: 'address[]',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'SecretarySuccessorsDefined',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'previousOwner',
              type: 'address',
              indexed: true,
            },
            {
              internalType: 'address',
              name: 'newOwner',
              type: 'address',
              indexed: true,
            },
          ],
          type: 'event',
          name: 'SecretaryTransferred',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'totalAmount',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'pmAmount',
              type: 'uint256',
              indexed: false,
            },
            {
              internalType: 'uint256',
              name: 'fromSecrretary',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'ShortFallDivided',
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: 'id',
              type: 'uint256',
              indexed: false,
            },
          ],
          type: 'event',
          name: 'SubGroupCreated',
          anonymous: false,
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'EmergencyStartTime',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'acceptSecretaryRole',
        },
        {
          inputs: [
            { internalType: 'address', name: '_member', type: 'address' },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'addMemberToCommunity',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'advancePeriod',
        },
        {
          inputs: [
            { internalType: 'uint256', name: '_sId', type: 'uint256' },
            { internalType: 'uint256', name: '_nMemberId', type: 'uint256' },
            { internalType: 'bool', name: '_accepted', type: 'bool' },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'approveNewSubgroupMember',
        },
        {
          inputs: [{ internalType: 'bool', name: '_shouldJoin', type: 'bool' }],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'approveSubgroupAssignment',
        },
        {
          inputs: [
            { internalType: 'address', name: '_member', type: 'address' },
            { internalType: 'uint256', name: '_sId', type: 'uint256' },
            { internalType: 'bool', name: '_isReorging', type: 'bool' },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'assignMemberToSubgroup',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'beginEmergency',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'createSubgroup',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'defectFromCommunity',
        },
        {
          inputs: [
            {
              internalType: 'address[]',
              name: '_successors',
              type: 'address[]',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'defineSecretarySuccessorList',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'divideShortfall',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'emergencyRefund',
        },
        {
          inputs: [
            { internalType: 'address', name: '_eSecretary', type: 'address' },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'emergencySecretaryHandoff',
        },
        {
          inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'emergencyWithdraw',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'endEmergency',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'extendPeriodByOneDay',
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getBasePremium',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        },
        {
          inputs: [{ internalType: 'uint256', name: '_pId', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
          name: 'getClaimIdsInPeriod',
          outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
        },
        {
          inputs: [
            { internalType: 'uint256', name: '_pId', type: 'uint256' },
            { internalType: 'uint256', name: '_cId', type: 'uint256' },
          ],
          stateMutability: 'view',
          type: 'function',
          name: 'getClaimInfo',
          outputs: [
            {
              internalType: 'struct TandaPay.ClaimInfo',
              name: '',
              type: 'tuple',
              components: [
                { internalType: 'uint256', name: 'id', type: 'uint256' },
                { internalType: 'address', name: 'claimant', type: 'address' },
                {
                  internalType: 'uint256',
                  name: 'claimAmount',
                  type: 'uint256',
                },
                { internalType: 'uint256', name: 'SGId', type: 'uint256' },
                { internalType: 'bool', name: 'isWhitelistd', type: 'bool' },
                { internalType: 'bool', name: 'isClaimed', type: 'bool' },
              ],
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getCommunityState',
          outputs: [
            {
              internalType: 'enum TandaPay.CommunityStates',
              name: '',
              type: 'uint8',
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getCurrentClaimId',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getCurrentMemberCount',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getCurrentPeriodId',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getCurrentSubgroupCount',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        },
        {
          inputs: [{ internalType: 'uint256', name: '_pId', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
          name: 'getDefectorMemberIdsInPeriod',
          outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getEmergencyHandOverStartedPeriod',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getEmergencyHandoverStartedAt',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getEmergencySecretaries',
          outputs: [
            { internalType: 'address[2]', name: '', type: 'address[2]' },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getHandoverStartedAt',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        },
        {
          inputs: [{ internalType: 'uint256', name: '_pId', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
          name: 'getIsAMemberDefectedInPeriod',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        },
        {
          inputs: [{ internalType: 'uint256', name: '_pId', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
          name: 'getIsAllMemberNotPaidInPeriod',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getIsHandingOver',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        },
        {
          inputs: [
            { internalType: 'address', name: '_member', type: 'address' },
          ],
          stateMutability: 'view',
          type: 'function',
          name: 'getMemberIdFromAddress',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        },
        {
          inputs: [
            { internalType: 'address', name: '_member', type: 'address' },
            { internalType: 'uint256', name: '_pId', type: 'uint256' },
          ],
          stateMutability: 'view',
          type: 'function',
          name: 'getMemberInfoFromAddress',
          outputs: [
            {
              internalType: 'struct TandaPay.DemoMemberInfo',
              name: '',
              type: 'tuple',
              components: [
                { internalType: 'uint256', name: 'memberId', type: 'uint256' },
                {
                  internalType: 'uint256',
                  name: 'associatedGroupId',
                  type: 'uint256',
                },
                { internalType: 'address', name: 'member', type: 'address' },
                {
                  internalType: 'uint256',
                  name: 'cEscrowAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'ISEscorwAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'pendingRefundAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'availableToWithdraw',
                  type: 'uint256',
                },
                {
                  internalType: 'bool',
                  name: 'eligibleForCoverageInPeriod',
                  type: 'bool',
                },
                { internalType: 'bool', name: 'isPremiumPaid', type: 'bool' },
                {
                  internalType: 'uint256',
                  name: 'idToQuedRefundAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'enum TandaPayEvents.MemberStatus',
                  name: 'status',
                  type: 'uint8',
                },
                {
                  internalType: 'enum TandaPay.AssignmentStatus',
                  name: 'assignment',
                  type: 'uint8',
                },
              ],
            },
          ],
        },
        {
          inputs: [
            { internalType: 'uint256', name: '_memberId', type: 'uint256' },
            { internalType: 'uint256', name: '_pId', type: 'uint256' },
          ],
          stateMutability: 'view',
          type: 'function',
          name: 'getMemberInfoFromId',
          outputs: [
            {
              internalType: 'struct TandaPay.DemoMemberInfo',
              name: '',
              type: 'tuple',
              components: [
                { internalType: 'uint256', name: 'memberId', type: 'uint256' },
                {
                  internalType: 'uint256',
                  name: 'associatedGroupId',
                  type: 'uint256',
                },
                { internalType: 'address', name: 'member', type: 'address' },
                {
                  internalType: 'uint256',
                  name: 'cEscrowAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'ISEscorwAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'pendingRefundAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'availableToWithdraw',
                  type: 'uint256',
                },
                {
                  internalType: 'bool',
                  name: 'eligibleForCoverageInPeriod',
                  type: 'bool',
                },
                { internalType: 'bool', name: 'isPremiumPaid', type: 'bool' },
                {
                  internalType: 'uint256',
                  name: 'idToQuedRefundAmount',
                  type: 'uint256',
                },
                {
                  internalType: 'enum TandaPayEvents.MemberStatus',
                  name: 'status',
                  type: 'uint8',
                },
                {
                  internalType: 'enum TandaPay.AssignmentStatus',
                  name: 'assignment',
                  type: 'uint8',
                },
              ],
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getPaymentTokenAddress',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
        },
        {
          inputs: [{ internalType: 'uint256', name: '_pId', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
          name: 'getPeriodIdToPeriodInfo',
          outputs: [
            {
              internalType: 'struct TandaPay.PeriodInfo',
              name: '',
              type: 'tuple',
              components: [
                { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
                { internalType: 'uint256', name: 'willEndAt', type: 'uint256' },
                {
                  internalType: 'uint256[]',
                  name: 'claimIds',
                  type: 'uint256[]',
                },
                { internalType: 'uint256', name: 'coverage', type: 'uint256' },
                { internalType: 'uint256', name: 'totalPaid', type: 'uint256' },
              ],
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getSecretaryAddress',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getSecretarySuccessorList',
          outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        },
        {
          inputs: [{ internalType: 'uint256', name: '_sId', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
          name: 'getSubgroupInfo',
          outputs: [
            {
              internalType: 'struct TandaPay.SubGroupInfo',
              name: '',
              type: 'tuple',
              components: [
                { internalType: 'uint256', name: 'id', type: 'uint256' },
                {
                  internalType: 'address[]',
                  name: 'members',
                  type: 'address[]',
                },
                { internalType: 'bool', name: 'isValid', type: 'bool' },
              ],
            },
          ],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getTotalCoverageAmount',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        },
        {
          inputs: [],
          stateMutability: 'view',
          type: 'function',
          name: 'getUpcomingSecretary',
          outputs: [{ internalType: 'address', name: '', type: 'address' }],
        },
        {
          inputs: [{ internalType: 'uint256', name: '_pId', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
          name: 'getWhitelistedClaimIdsInPeriod',
          outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_prefferedSuccessor',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'handoverSecretaryRoleToSuccessor',
        },
        {
          inputs: [
            { internalType: 'uint256', name: '_coverage', type: 'uint256' },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'initiateDefaultState',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'injectFunds',
        },
        {
          inputs: [
            { internalType: 'bool', name: '_shouldTransfer', type: 'bool' },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'issueRefund',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'joinCommunity',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'leaveSubgroup',
        },
        {
          inputs: [{ internalType: 'bool', name: '_useFromATW', type: 'bool' }],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'payPremium',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'submitClaim',
        },
        {
          inputs: [
            { internalType: 'uint256', name: '_coverage', type: 'uint256' },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'updateCoverageAmount',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'updateMemberStatus',
        },
        {
          inputs: [{ internalType: 'uint256', name: '_cId', type: 'uint256' }],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'whitelistClaim',
        },
        {
          inputs: [{ internalType: 'bool', name: 'isForfeit', type: 'bool' }],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'withdrawClaimFund',
        },
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
          name: 'withdrawRefund',
        },
      ],
      devdoc: {
        kind: 'dev',
        methods: {
          'acceptSecretaryRole()': {
            details:
              'Allows a designated successor to accept the Secretary role, completing the handover process.',
          },
          'addMemberToCommunity(address)': {
            details: 'Adds a new member to the community',
            params: { _member: 'address of new member to add' },
          },
          'advancePeriod()': {
            details:
              'Advances the community to the next period, resetting the state and recalculating premiums if necessary.',
          },
          'approveNewSubgroupMember(uint256,uint256,bool)': {
            details:
              "Allows existing subgroup members to approve or reject a new member's assignment to their subgroup.",
            params: {
              _accepted: 'true if accepted, false if rejecet',
              _nMemberId: 'new member id',
              _sId: 'subgroup id',
            },
          },
          'approveSubgroupAssignment(bool)': {
            details:
              'Allows a member to approve or reject their assignment to a subgroup.',
            params: {
              _shouldJoin: 'true to approve assignment, false to reject',
            },
          },
          'assignMemberToSubgroup(address,uint256,bool)': {
            details: 'assign a member to a subgroup, with reorg option',
            params: {
              _isReorging:
                'flag that decides if this operation is part of a reorganization process',
              _member: 'address of new member to add',
              _sId: 'subgroup Id',
            },
          },
          'beginEmergency()': { details: 'Secretary enters emergency state' },
          'createSubgroup()': { details: 'creates new subgroup' },
          'defectFromCommunity()': {
            details:
              "Allows a member to defect from the community during the defect window, altering their status and potentially affecting the community's state.",
          },
          'defineSecretarySuccessorList(address[])': {
            details:
              "Defines a list of successor candidates for the Secretary role based on the community's size.only callable by secretary",
            params: { _successors: 'list of successors to the secretary' },
          },
          'divideShortfall()': {
            details:
              'Divides any shortfall in coverage among the valid members during the injection window.',
          },
          'emergencyRefund()': {
            details: 'emergency refund. Makes all funds refundable to members.',
          },
          'emergencySecretaryHandoff(address)': {
            details:
              'Facilitates an emergency handover of the Secretary role when two designated successors agree.',
            params: { _eSecretary: 'emergency successor address' },
          },
          'emergencyWithdraw(address,uint256)': {
            details: 'Secretary sends out emergency funding',
            params: {
              amount: 'amount of tokens to send',
              to: 'the address to send emergency fund',
            },
          },
          'endEmergency()': {
            details: 'Secretary Ends Emergency, collapses community',
          },
          'extendPeriodByOneDay()': {
            details: 'Extends the current period by adding an extra day.',
          },
          'getBasePremium()': { details: 'returns the base premium' },
          'getClaimIdsInPeriod(uint256)': {
            details: 'returns array of claim Ids per period',
            params: { _pId: 'period Id' },
          },
          'getClaimInfo(uint256,uint256)': {
            details: 'returns claim info based on period and claim Id',
            params: {
              _cId: 'claim Id (specific to period)',
              _pId: 'period Id',
            },
          },
          'getCommunityState()': { details: 'returns community states' },
          'getCurrentClaimId()': {
            details: 'returns the most recent claim Id',
          },
          'getCurrentMemberCount()': {
            details: 'returns the most recent memberId',
          },
          'getCurrentPeriodId()': {
            details: 'returns the most recent period Id',
          },
          'getCurrentSubgroupCount()': {
            details: 'returns the most recent subGroupId',
          },
          'getDefectorMemberIdsInPeriod(uint256)': {
            details: 'returns array of defectors IDs per period',
            params: { _pId: 'period Id' },
          },
          'getIsAMemberDefectedInPeriod(uint256)': {
            details: 'returns flag if member has defected at a give period',
            params: { _pId: 'period Id' },
          },
          'getIsAllMemberNotPaidInPeriod(uint256)': {
            details: 'returns flag whether all members in a period have paid',
            params: { _pId: 'period Id' },
          },
          'getMemberIdFromAddress(address)': {
            details: 'returns the member Id',
            params: { _member: 'user address' },
          },
          'getMemberInfoFromAddress(address,uint256)': {
            details: 'returns member info from address and member Id',
            params: { _member: 'user address', _pId: 'member Id' },
          },
          'getPaymentTokenAddress()': {
            details: 'returns the address of the payment token',
          },
          'getPeriodIdToPeriodInfo(uint256)': {
            details: 'returns period information',
            params: { _pId: 'period Id' },
          },
          'getSubgroupInfo(uint256)': {
            details: 'returns subgroup information',
            params: { _sId: 'id of the subgroup' },
          },
          'getTotalCoverageAmount()': { details: 'returns the total coverage' },
          'getWhitelistedClaimIdsInPeriod(uint256)': {
            details: 'returns array of whitelisted claimIds per period',
            params: { _pId: 'period Id' },
          },
          'handoverSecretaryRoleToSuccessor(address)': {
            details:
              'Initiates the handover process for the Secretary role to a preferred successor.only callable by secretary',
            params: { _prefferedSuccessor: 'address to be the new secretary' },
          },
          'initiateDefaultState(uint256)': {
            details:
              'Transitions the community from INITIALIZATION to DEFAULT state and sets the total coverage amount.',
            params: { _coverage: 'amount of coverage' },
          },
          'injectFunds()': {
            details:
              'Allows the Secretary to inject additional funds into the contract during the injection window to cover a shortfall.',
          },
          'issueRefund(bool)': {
            details:
              'Issues refunds to members during the refund window, optionally transferring the funds directly to the members.',
            params: {
              _shouldTransfer:
                'whether refunds should be transferred to users or not',
            },
          },
          'joinCommunity()': {
            details: 'allows members (msg.sender) to join the community',
          },
          'leaveSubgroup()': {
            details:
              "Allows a member to leave their subgroup, resetting their status and adjusting the subgroup's validity.",
          },
          'payPremium(bool)': {
            details:
              'Allows a member to pay their premium for the upcoming period, either from their available withdrawal balance or directly via transfer.',
            params: {
              _useFromATW:
                'if true, pay from available balance, if false, must pay with token.',
            },
          },
          'submitClaim()': {
            details:
              'Allows a member to submit a claim during the claim submission window.',
          },
          'updateCoverageAmount(uint256)': {
            details:
              'Updates the total coverage amount for the community and recalculates the base premium accordingly.only callable by secretary',
            params: { _coverage: 'amount of coverage to assign' },
          },
          'updateMemberStatus()': {
            details:
              'Updates the status of all members based on their premium payment status and the current community state.',
          },
          'whitelistClaim(uint256)': {
            details:
              'Whitelists a claim during the designated whitelist window, making it eligible for further processing.',
            params: { _cId: 'the claim id' },
          },
          'withdrawClaimFund(bool)': {
            details:
              'Allows a member to withdraw their claim fund, either fully or forfeiting it, depending on the provided flag.',
            params: {
              isForfeit: 'allows member to choose to leave their claim instead',
            },
          },
          'withdrawRefund()': {
            details:
              'Allows a member to withdraw their available refund amount.',
          },
        },
        version: 1,
      },
      userdoc: {
        kind: 'user',
        methods: {
          'addMemberToCommunity(address)': {
            notice: 'only secretary can call',
          },
          'advancePeriod()': { notice: 'only secretary can call' },
          'approveNewSubgroupMember(uint256,uint256,bool)': {
            notice: 'new member must have "REORGED" status',
          },
          'assignMemberToSubgroup(address,uint256,bool)': {
            notice: 'only secretary can call',
          },
          'beginEmergency()': { notice: 'only secretary can call' },
          'createSubgroup()': { notice: 'only secretary can call' },
          'defectFromCommunity()': {
            notice:
              'defecting can only happen if a claim occured in the previous period',
          },
          'divideShortfall()': { notice: 'only secretary can call' },
          'emergencyWithdraw(address,uint256)': {
            notice:
              'only secretary can callcan only be called if 24 hours elapses post-emergency declaration',
          },
          'endEmergency()': {
            notice:
              'only secretary can callcan only be called if 24 hours elapses post-emergency declaration',
          },
          'extendPeriodByOneDay()': { notice: 'only secretary can call' },
          'initiateDefaultState(uint256)': {
            notice: 'Can only be called by secretary',
          },
          'injectFunds()': { notice: 'only secretary can call' },
          'joinCommunity()': {
            notice: 'Can only join if community status is "DEFAULT"',
          },
          'leaveSubgroup()': {
            notice:
              'Removes the member from the subgroup, updates their eligibility and escrow amounts, and potentially invalidates the subgroup.',
          },
          'payPremium(bool)': {
            notice:
              "Validates the payment window, calculates the required payment, and updates the member's escrow amounts and eligibility for coverage in the next period.",
          },
          'updateCoverageAmount(uint256)': {
            notice:
              'can only update if community is not default or initializing',
          },
          'whitelistClaim(uint256)': { notice: 'only callable by secretary' },
        },
        version: 1,
      },
    },
    settings: {
      remappings: [
        '@openzeppelin/contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/',
        '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/',
        'aave-v3-core/=lib/aave-v3-core/',
        'ds-test/=lib/solmate/lib/ds-test/src/',
        'erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/',
        'forge-std/=lib/forge-std/src/',
        'halmos-cheatcodes/=lib/openzeppelin-contracts/lib/halmos-cheatcodes/src/',
        'openzeppelin-contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/',
        'openzeppelin-contracts/=lib/openzeppelin-contracts/',
        'solmate/=lib/solmate/src/',
      ],
      optimizer: { enabled: true, runs: 200 },
      metadata: { bytecodeHash: 'ipfs' },
      compilationTarget: { 'src/TandaPay.sol': 'TandaPay' },
      evmVersion: 'shanghai',
      libraries: {},
      viaIR: true,
    },
    sources: {
      'lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol': {
        keccak256:
          '0xe06a3f08a987af6ad2e1c1e774405d4fe08f1694b67517438b467cecf0da0ef7',
        urls: [
          'bzz-raw://df6f0c459663c9858b6cba2cda1d14a7d05a985bed6d2de72bd8e78c25ee79db',
          'dweb:/ipfs/QmeTTxZ7qVk9rjEv2R4CpCwdf8UMCcRqDNMvzNxHc3Fnn9',
        ],
        license: 'MIT',
      },
      'lib/openzeppelin-contracts/contracts/utils/Context.sol': {
        keccak256:
          '0x493033a8d1b176a037b2cc6a04dad01a5c157722049bbecf632ca876224dd4b2',
        urls: [
          'bzz-raw://6a708e8a5bdb1011c2c381c9a5cfd8a9a956d7d0a9dc1bd8bcdaf52f76ef2f12',
          'dweb:/ipfs/Qmax9WHBnVsZP46ZxEMNRQpLQnrdE4dK8LehML1Py8FowF',
        ],
        license: 'MIT',
      },
      'lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol': {
        keccak256:
          '0x11a5a79827df29e915a12740caf62fe21ebe27c08c9ae3e09abe9ee3ba3866d3',
        urls: [
          'bzz-raw://3cf0c69ab827e3251db9ee6a50647d62c90ba580a4d7bbff21f2bea39e7b2f4a',
          'dweb:/ipfs/QmZiKwtKU1SBX4RGfQtY7PZfiapbbu6SZ9vizGQD9UHjRA',
        ],
        license: 'MIT',
      },
      'src/TandaPay.sol': {
        keccak256:
          '0x3a41f35df50e08ce99943449c832bc39c1c242062b877380aeded0087a981709',
        urls: [
          'bzz-raw://4a5c022a469ff7e8281adad224a7393ddac6a36038da639870d2e12210200cee',
          'dweb:/ipfs/QmSTUcWtYR3Ub5a8p3kAVo2KfeRGnEb85oku2h6spkXL2k',
        ],
        license: 'MIT',
      },
      'src/secretary.sol': {
        keccak256:
          '0x8bcd55ba1c7d0ee3c42c959b6448a97957f4cbf61469f576f3b7035595913a19',
        urls: [
          'bzz-raw://bcde90c824099fe73e179c0f3601a7462cd6908539698228ceacf250c7115bcb',
          'dweb:/ipfs/Qma78HS3vbV1cXSK6ibLZy2H2SXi9K1JDzUegRSTfD88mv',
        ],
        license: 'MIT',
      },
      'src/util/TandaPayErrors.sol': {
        keccak256:
          '0xf542aa8622c2114359f289c8cc582cdc5fdbc1d8654a0f7e4fcf9786820ef2e2',
        urls: [
          'bzz-raw://f4a758fb1ebe787b1555289053a24069e3dcda8524e3b92940e82dfd60eff93e',
          'dweb:/ipfs/QmTQPowM6L7f7sswv5D6rMRDw6Dybgaq5roGT8Mx3L2Nt2',
        ],
        license: 'MIT',
      },
      'src/util/TandaPayEvents.sol': {
        keccak256:
          '0x9701311d9ca3c3fd051db8bca5e79093960d1963029ea14e07f82deaee6bda4d',
        urls: [
          'bzz-raw://127d95bdc72329a725af2262983e0bbca58963fa62b2956c990c686df10bc7fe',
          'dweb:/ipfs/QmPSCXCAYcMREiqhApmm5eJK1QKrTGu53Y7cUdtaUW3yio',
        ],
        license: 'MIT',
      },
    },
    version: 1,
  },
  id: 3,
};
