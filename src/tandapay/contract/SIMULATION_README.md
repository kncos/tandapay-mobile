# TandaPay Write Method Simulations

This module provides simulation capabilities for all TandaPay write methods using ethers.js `callStatic` functionality. You can test transactions before executing them on-chain to:

- **Validate transactions** - Check if a transaction would succeed
- **Estimate gas costs** - Get accurate gas estimates 
- **Preview results** - See return values without executing
- **Catch errors early** - Detect reverts before spending gas

## Files Structure

```
src/tandapay/contract/
├── writePublicSim.js      # Public method simulations
├── writeMemberSim.js      # Member method simulations  
├── writeSecretarySim.js   # Secretary method simulations
├── writeSim.js            # Main simulation wrapper
└── examples/
    └── simulationExamples.js  # Usage examples
```

## Quick Usage

### Standalone Simulator

```javascript
import getTandaPaySimulator from './writeSim';

const simulator = getTandaPaySimulator(contractAddress, signer);

// Simulate joining community
const result = await simulator.member.joinCommunity();

if (result.success) {
  console.log('✅ Simulation successful');
  console.log('📊 Gas estimate:', result.gasEstimate);
  // Now execute the real transaction
} else {
  console.log('❌ Would fail:', result.error);
}
```

### Integrated with Writer

```javascript
import getTandaPayWriter from './write';

const writer = getTandaPayWriter(contractAddress, signer, { 
  includeSimulations: true 
});

// Simulate first
const simResult = await writer.simulations.member.payPremium(false);

if (simResult.success) {
  // Execute real transaction
  const tx = await writer.member.payPremium(false);
  await tx.wait();
}
```

## Simulation Response Format

Each simulation method returns:

```javascript
{
  success: boolean,        // Whether simulation succeeded
  result: any,             // Return value from contract call
  gasEstimate: string,     // Estimated gas usage
  error: string | null     // Error message if failed
}
```

## Available Methods

### Public Simulations
- `simulateIssueRefund()`

### Member Simulations  
- `simulateJoinCommunity()`
- `simulateApproveSubgroupAssignment(approve)`
- `simulateApproveNewSubgroupMember(subgroupId, newMemberId, approve)`
- `simulateLeaveSubgroup()`
- `simulateDefectFromCommunity()`
- `simulatePayPremium(useAvailableBalance)`
- `simulateAcceptSecretaryRole()`
- `simulateEmergencySecretaryHandoff(newSecretaryWalletAddress)`
- `simulateWithdrawRefund()`
- `simulateSubmitClaim()`
- `simulateWithdrawClaimFund(forfeit)`

### Secretary Simulations
- `simulateAddMemberToCommunity(memberWalletAddress)`
- `simulateCreateSubgroup()`
- `simulateAssignMemberToSubgroup(memberWalletAddress, subgroupId, isReorging)`
- `simulateInitiateDefaultState(totalCoverage)`
- `simulateWhitelistClaim(claimId)`
- `simulateUpdateCoverageAmount(totalCoverage)`
- `simulateDefineSecretarySuccessorList(successorListWalletAddresses)`
- `simulateHandoverSecretaryRoleToSuccessor(successorWalletAddress)`
- `simulateInjectFunds()`
- `simulateDivideShortfall()`
- `simulateExtendPeriodByOneDay()`
- `simulateAdvancePeriod()`

## Best Practices

1. **Always simulate first** - Check transactions before execution
2. **Handle errors gracefully** - Check `success` field before proceeding
3. **Use gas estimates** - Plan for transaction costs
4. **Batch simulations** - Test multiple operations together
5. **Provider vs Signer** - Simulations work with both, but you need a signer for actual transactions

## Error Handling

Common simulation failures:
- **Insufficient balance** - Not enough ETH or tokens
- **Invalid state** - Contract state doesn't allow operation  
- **Access control** - Wrong account permissions
- **Parameter validation** - Invalid inputs
- **Business logic** - Contract-specific requirements not met

See `examples/simulationExamples.js` for complete usage examples.
