# TandaPay Macro Implementation Guide

This guide provides a comprehensive approach for implementing new macros in the TandaPay mobile application. Macros are automated workflows that can analyze community state and generate multiple transactions to achieve a specific goal.

## Architecture Overview

The macro system follows a layered architecture:

1. **Core Logic Hook** (`useMacroName.js`) - Contains the business logic and data fetching
2. **Adapter** (`macroNameAdapter.js`) - Bridges the core logic with the UI component
3. **UI Integration** (`TandaPayActionsScreen.js`) - Displays the macro in the actions interface
4. **Workflow Component** (`MacroWorkflow.js`) - Handles the user interaction flow (shared)

## File Structure

For a new macro called "ExampleMacro", create these files:

```
src/tandapay/contract/macros/example-macro/
├── useExampleMacro.js          # Core business logic hook
├── exampleMacroAdapter.js      # UI adapter
└── index.js                    # (Optional) Public exports
```

## Available Constants

Always use constants from `../../constants` instead of magic numbers:

```javascript
import { 
  SubgroupConstants, 
  InitializationStateConstants, 
  CommunityStates,
  MemberStatuses,
  AssignmentStatuses 
} from '../../constants';

// Subgroup size validation
if (subgroupSize < SubgroupConstants.minSize || subgroupSize > SubgroupConstants.maxSize) {
  // Invalid subgroup size
}

// Community size requirements
if (memberCount < InitializationStateConstants.minCommunitySizeToExit) {
  // Not enough members to exit initialization
}

// State comparisons
if (communityState === CommunityStates.initialization) {
  // Community is in initialization state
}
```

## Step-by-Step Implementation

### Step 1: Implement the Core Logic Hook

Create `useExampleMacro.js` following this pattern:

```javascript
/* @flow strict-local */

import { useState, useCallback } from 'react';
import DataManagerName from '../../data-managers/DataManagerName';
import { SubgroupConstants, InitializationStateConstants, CommunityStates } from '../../constants';
// Import other data managers as needed

/**
 * Result types for the macro
 */
export type ExampleMacroResult = {|
  +success: boolean,
  +dataNeeded?: SomeDataType, // Define what data your macro produces
  +error?: string,
|};

/**
 * Hook state
 */
export type UseExampleMacroState = {|
  +loading: boolean,
  +result: ?ExampleMacroResult,
  +error: ?string,
|};

/**
 * Core hook for macro business logic
 */
export function useExampleMacro(): {|
  +state: UseExampleMacroState,
  +runExampleMacro: () => Promise<ExampleMacroResult>,
  +refresh: () => void,
  +reset: () => void,
|} {
  const [state, setState] = useState<UseExampleMacroState>({
    loading: false,
    result: null,
    error: null,
  });

  const reset = useCallback(() => {
    setState({
      loading: false,
      result: null,
      error: null,
    });
  }, []);

  const refresh = useCallback(() => {
    // Invalidate all data sources used by this macro
    DataManagerName.invalidate();
    // Add other data manager invalidations as needed
    reset();
  }, [reset]);

  const runExampleMacro = useCallback(async (): Promise<ExampleMacroResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch required data with forceRefresh: true
      const data = await DataManagerName.get({ forceRefresh: true });

      // Validate data
      if (data == null) {
        throw new Error('Failed to fetch required data');
      }

      // Apply business logic here
      // Determine what needs to be done based on current state
      
      const result: ExampleMacroResult = {
        success: true,
        dataNeeded: processedData, // Your processed result
      };

      setState({
        loading: false,
        result,
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = error?.message || 'Failed to run example macro';
      const errorResult: ExampleMacroResult = {
        success: false,
        error: errorMessage,
      };

      setState({
        loading: false,
        result: errorResult,
        error: errorMessage,
      });

      return errorResult;
    }
  }, []);

  return {
    state,
    runExampleMacro,
    refresh,
    reset,
  };
}
```

### Step 2: Create the Adapter

Create `exampleMacroAdapter.js`:

```javascript
/* @flow strict-local */

/**
 * Example Macro Adapter
 *
 * Adapts the useExampleMacro hook to work with the MacroWorkflow component.
 */

import { useExampleMacro } from './useExampleMacro';
import { getWriteTransactionByName } from '../../tandapay-writer/writeTransactionObjects';

import type { MacroDefinition } from '../../../components/MacroWorkflow';
import type { WriteTransaction } from '../../tandapay-writer/writeTransactionObjects';

export function useExampleMacroAdapter(): {|
  +macro: MacroDefinition,
  +refresh: () => void,
|} {
  const exampleMacro = useExampleMacro();

  const macro = {
    id: 'example-macro',
    name: 'Example Macro',
    description: 'Description of what this macro does for the user.',

    // Minimal data fetcher - real data fetching happens in executeFunction
    dataFetcher: async () => ({}),

    // Always allow execution - validation happens in executeFunction
    validateFunction: (data: mixed) => ({ canExecute: true }),

    executeFunction: async (data: mixed) => {
      try {
        const result = await exampleMacro.runExampleMacro();

        if (!result.success) {
          return {
            success: false,
            error: result.error ?? 'Example macro failed',
          };
        }

        // Determine if any transactions are needed
        const transactionsNeeded = determineTransactionsNeeded(result);

        if (transactionsNeeded === 0) {
          // Return empty transactions array for "nothing to do" cases
          return {
            success: true,
            transactions: [],
          };
        }

        // Create transactions based on your macro's needs
        return createTransactions(result);
      } catch (error) {
        return {
          success: false,
          error: error?.message ?? 'Failed to execute example macro',
        };
      }
    },
  };

  return {
    macro,
    refresh: exampleMacro.refresh,
  };
}

// Helper functions for transaction creation
function determineTransactionsNeeded(result: ExampleMacroResult): number {
  // Your logic to determine how many transactions are needed
  // Return 0 if nothing needs to be done
}

function createTransactions(result: ExampleMacroResult) {
  // See "Transaction Creation Patterns" section below
}
```

### Step 3: Integrate with UI

Add your macro to `TandaPayActionsScreen.js`:

```javascript
// Import your adapter
import { useExampleMacroAdapter } from './contract/macros/example-macro/exampleMacroAdapter';

// In the component:
const { macro: exampleMacro } = useExampleMacroAdapter();

// Add state for modal visibility
const [exampleMacroVisible, setExampleMacroVisible] = useState(false);

// Add handlers
const handleExampleMacroPress = useCallback(() => {
  setExampleMacroVisible(true);
}, []);

const handleExampleMacroClose = useCallback(() => {
  setExampleMacroVisible(false);
}, []);

// Add to UI
<NavRow
  leftElement={{ type: 'icon', Component: YourIcon }}
  title={exampleMacro.name}
  subtitle={exampleMacro.description}
  onPress={handleExampleMacroPress}
/>

// Add MacroWorkflow component
<MacroWorkflow
  macro={exampleMacro}
  visible={exampleMacroVisible}
  onClose={handleExampleMacroClose}
  onComplete={handleMacroWorkflowComplete}
/>
```

## Transaction Creation Patterns

### Pattern 1: Pre-filled Transactions (Like Auto-Reorg)

Use this when you know exactly what parameters each transaction needs:

```javascript
function createTransactions(result: ExampleMacroResult) {
  // Get the base transaction template
  const baseTransaction = getWriteTransactionByName('targetFunctionName');
  
  if (!baseTransaction) {
    return {
      success: false,
      error: 'Target transaction not found',
    };
  }

  // Create pre-filled transactions
  const transactions: WriteTransaction[] = result.data.map(item => ({
    ...baseTransaction,
    // $FlowFixMe - Adding prefilledParams to WriteTransaction
    prefilledParams: {
      param1: item.value1,
      param2: item.value2,
      // Include all required parameters
    },
  }));

  return {
    success: true,
    transactions,
  };
}
```

### Pattern 2: Non-filled Transactions (Like Add Required Members)

Use this when users need to provide parameters for each transaction:

```javascript
function createTransactions(result: ExampleMacroResult) {
  const baseTransaction = getWriteTransactionByName('targetFunctionName');
  
  if (!baseTransaction) {
    return {
      success: false,
      error: 'Target transaction not found',
    };
  }

  // Create transactions without pre-filled parameters
  const transactions: WriteTransaction[] = [];
  for (let i = 0; i < result.countNeeded; i++) {
    transactions.push({
      ...baseTransaction,
      displayName: `${baseTransaction.displayName} ${i + 1} of ${result.countNeeded}`,
      // No prefilledParams - user will fill these in the UI
    });
  }

  return {
    success: true,
    transactions,
  };
}
```

### Pattern 3: Address Array Configuration

Use this pattern when you need to configure the number of addresses a user should input:

```javascript
function createTransactions(result: ExampleMacroResult) {
  const baseTransaction = getWriteTransactionByName('defineSecretarySuccessorList');
  
  if (!baseTransaction) {
    return {
      success: false,
      error: 'Target transaction not found',
    };
  }

  // Method 1: Configure via prefilledParams.maxAddresses
  const transactions: WriteTransaction[] = [{
    ...baseTransaction,
    displayName: `Define Secretary Successor List (${result.successorCount} needed)`,
    // $FlowFixMe - Adding prefilledParams to WriteTransaction
    prefilledParams: {
      maxAddresses: result.successorCount, // This controls the address array limit
      // Can also include pre-filled addresses if known:
      // successorListWalletAddresses: result.knownAddresses || [],
    },
  }];

  // Method 2: Configure via displayName (fallback approach)
  // The TransactionParameterForm will parse "(N addresses)" from displayName
  const alternativeTransaction = {
    ...baseTransaction,
    displayName: `Define Secretary Successor List (${result.successorCount} addresses)`,
    // No prefilledParams needed when using displayName method
  };

  return {
    success: true,
    transactions,
  };
}
```

### Pattern 4: Mixed Transactions

Some transactions pre-filled, others require user input:

```javascript
function createTransactions(result: ExampleMacroResult) {
  const transactions: WriteTransaction[] = [];

  // Add pre-filled transactions
  result.prefilledActions.forEach(action => {
    const baseTransaction = getWriteTransactionByName(action.functionName);
    if (baseTransaction) {
      transactions.push({
        ...baseTransaction,
        prefilledParams: action.params,
      });
    }
  });

  // Add user-input transactions
  for (let i = 0; i < result.userInputNeeded; i++) {
    const baseTransaction = getWriteTransactionByName('userInputFunction');
    if (baseTransaction) {
      transactions.push({
        ...baseTransaction,
        displayName: `Manual Action ${i + 1}`,
      });
    }
  }

  return {
    success: true,
    transactions,
  };
}
```

### Pattern 5: Prerequisites + Main Actions (Like Enhanced Auto-Reorg)

When your macro needs to create resources before using them:

```javascript
function createTransactions(result: ExampleMacroResult) {
  const transactions: WriteTransaction[] = [];

  // Calculate what resources are needed
  const maxResourceIdNeeded = Math.max(...result.actions.map(action => action.resourceId));
  const currentResourceCount = result.existingResources.length;
  const resourcesToCreate = Math.max(0, maxResourceIdNeeded - currentResourceCount);

  // Get transaction templates
  const createResourceTransaction = getWriteTransactionByName('createResource');
  const useResourceTransaction = getWriteTransactionByName('useResource');

  // Add resource creation transactions first
  for (let i = 0; i < resourcesToCreate; i++) {
    transactions.push({
      ...createResourceTransaction,
      displayName: `Create Resource ${currentResourceCount + i + 1}`,
    });
  }

  // Add main action transactions
  result.actions.forEach(action => {
    transactions.push({
      ...useResourceTransaction,
      prefilledParams: action.params,
    });
  });

  return {
    success: true,
    transactions,
  };
}
```

## Key Design Principles

### 1. Handle "Nothing to Do" Cases Gracefully

Always check if your macro actually needs to do anything:

```javascript
// In your executeFunction
if (nothingToDo) {
  return {
    success: true,
    transactions: [], // Empty array = 0 transactions needed
  };
}
```

The UI will automatically show "No transactions needed" to the user.

### 2. Proper Error Handling

```javascript
try {
  // Your logic
} catch (error) {
  return {
    success: false,
    error: error?.message ?? 'Descriptive error message',
  };
}
```

### 3. Data Manager Integration

- Use `forceRefresh: true` when fetching data in your core hook
- Invalidate relevant data managers in your `refresh` function
- The MacroWorkflow's refresh button will call `invalidateAllTandaPayData()` which covers most cases

### 4. State Management

- Keep loading states in your core hook
- Let the adapter handle the MacroDefinition interface
- The MacroWorkflow component manages the overall workflow state

## Testing Your Macro

1. **Zero Transaction Case**: Ensure your macro handles cases where no transactions are needed
2. **Error Handling**: Test with invalid data or network failures  
3. **Refresh Functionality**: Verify the refresh button invalidates cache and refetches data
4. **Flow Type Checking**: Ensure no Flow errors in your implementation

## Common Patterns from Existing Macros

### Auto-Reorg Pattern
- Fetches member and subgroup data
- Runs algorithm to determine optimal assignments
- Calculates if additional subgroups need to be created first
- Creates `createSubgroup` transactions if needed, followed by pre-filled `assignMemberToSubgroup` transactions
- Returns empty array when no reassignments needed
- **Key insight**: Ensures prerequisites (subgroups) exist before using them in assignments

### Add Required Members Pattern
- Fetches community data
- Calculates how many members needed to reach minimum
- Creates multiple instances of `addMemberToCommunity` transaction
- Returns empty array when community already has enough members

## Flow Type Considerations

- Define clear result types for your macro
- Use `$FlowFixMe` sparingly and document why it's needed
- Type your data properly, especially when working with BigNumbers from contracts
- The existing `WriteTransaction` type supports both filled and unfilled parameters

## Best Practices

1. **Single Responsibility**: Each macro should have one clear purpose
2. **Descriptive Naming**: Use clear, action-oriented names for your macro
3. **User-Friendly Messages**: Provide clear descriptions and error messages
4. **Data Efficiency**: Only fetch the data you actually need
5. **Graceful Degradation**: Handle edge cases and network issues properly
6. **Consistent Patterns**: Follow the established architecture patterns

This guide should provide everything needed to implement new macros consistently within the TandaPay ecosystem. The key is following the established patterns while adapting the business logic to your specific use case.

## Complete Example: Secretary Successor Macro

Here's a complete example of how a macro would dynamically configure the address array limit:

```javascript
// useSecretarySuccessorMacro.js
export function useSecretarySuccessorMacro() {
  // ... macro logic ...
  
  const runSecretarySuccessorMacro = useCallback(async () => {
    try {
      const communityData = await CommunityDataManager.get({ forceRefresh: true });
      
      if (!communityData) {
        throw new Error('Failed to fetch community data');
      }
      
      // Determine how many successors are needed based on community size
      const successorCount = ExpectedSuccessorCounts.getExpectedSuccessorCount(
        communityData.memberCount
      );
      
      const result = {
        success: true,
        successorCount,
        communitySize: communityData.memberCount,
      };
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to analyze successor requirements',
      };
    }
  }, []);
  
  return { runSecretarySuccessorMacro, /* ... other methods ... */ };
}

// secretarySuccessorMacroAdapter.js
export function useSecretarySuccessorMacroAdapter() {
  const successorMacro = useSecretarySuccessorMacro();
  
  const macro = {
    id: 'secretary-successor',
    name: 'Configure Secretary Successors',
    description: 'Set up the required number of secretary successors based on community size.',
    
    dataFetcher: async () => ({}),
    validateFunction: (data) => ({ canExecute: true }),
    
    executeFunction: async (data) => {
      try {
        const result = await successorMacro.runSecretarySuccessorMacro();
        
        if (!result.success) {
          return {
            success: false,
            error: result.error ?? 'Secretary successor macro failed',
          };
        }
        
        const baseTransaction = getWriteTransactionByName('defineSecretarySuccessorList');
        
        if (!baseTransaction) {
          return {
            success: false,
            error: 'defineSecretarySuccessorList transaction not found',
          };
        }
        
        // Configure the transaction with the dynamic successor count
        const transaction = {
          ...baseTransaction,
          displayName: `Define Secretary Successor List (${result.successorCount} needed)`,
          // $FlowFixMe - Adding prefilledParams to WriteTransaction
          prefilledParams: {
            // This tells TransactionParameterForm how many addresses to allow
            maxAddresses: result.successorCount,
          },
        };
        
        return {
          success: true,
          transactions: [transaction],
        };
      } catch (error) {
        return {
          success: false,
          error: error?.message ?? 'Failed to configure secretary successors',
        };
      }
    },
  };
  
  return { macro, refresh: successorMacro.refresh };
}
```

In this example:
- The macro analyzes the community size
- Determines the appropriate number of successors using `ExpectedSuccessorCounts.getExpectedSuccessorCount()`
- Creates a transaction with `prefilledParams.maxAddresses` set to the required count
- The UI will automatically limit the address inputs to exactly that number
- The secretary sees a clear indication of how many addresses they need to provide

## Flow Type Considerations
