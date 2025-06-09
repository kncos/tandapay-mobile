# TandaPay Write Transaction Objects

This module provides a unified approach to TandaPay write transactions that couples write functions, simulation capabilities, metadata, and UI elements into standardized transaction objects.

## Architecture Overview

The new system replaces separate simulation files with integrated transaction objects that include:

- **Write functions** - Actual blockchain transactions  
- **Simulation functions** - Pre-execution testing via `callStatic`
- **Rich metadata** - Display names, descriptions, role requirements
- **Custom icons** - Specific UI icons for each transaction type
- **Type safety** - Full Flow type integration

## Key Files

- `writeTransactionObjects.js` - Core transaction definitions with integrated simulations
- `write.js` - Writer factory that creates methods with metadata and simulation access

## Usage Examples

### Basic Write Method with Simulation

```javascript
import getTandaPayWriter from './write';

const writer = getTandaPayWriter(contractAddress, signer);
const joinMethod = writer.member.joinCommunity;

// Simulate first (recommended)
const simResult = await joinMethod.simulate();
if (simResult.success) {
  console.log(`Gas estimate: ${simResult.gasEstimate}`);
  const tx = await joinMethod();
  await tx.wait();
} else {
  console.log(`Simulation failed: ${simResult.error}`);
}
```

### UI Generation from Transaction Metadata

```javascript
import { getAllWriteTransactions } from './writeTransactionObjects';

const transactions = getAllWriteTransactions();
transactions.forEach(transaction => {
  // Each transaction has: displayName, description, icon, role, requiresParams
  console.log(`${transaction.displayName}: ${transaction.description}`);
});
```

## Migration from Old System

The old separate simulation files have been replaced:
- `writeSim.js` ❌ → Integrated into `writeTransactionObjects.js` ✅
- `writeMemberSim.js` ❌ → Individual simulation functions per transaction ✅  
- `writeSecretarySim.js` ❌ → Consistent simulation pattern ✅
- `writePublicSim.js` ❌ → Better type safety ✅

## Benefits

- **Reduced complexity** - One source of truth per transaction
- **Better DX** - Simulation built into every write method
- **UI consistency** - Standardized metadata for dynamic UI generation  
- **Type safety** - Proper Flow types throughout
- **Maintainability** - Easier to add new transactions
