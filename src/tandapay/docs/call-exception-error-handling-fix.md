# CALL_EXCEPTION Error Handling Enhancement

## Overview
This enhancement addresses the specific issue where CALL_EXCEPTION errors with known error names (like "NotValidMember") were showing generic "Transaction would revert" messages instead of specific, user-friendly error messages.

## Problem
When a transaction reverts with a specific error name (e.g., `NotValidMember`), the error handling was catching it in the gas estimation logic and showing:
```
Gas Estimation Failed: Unable to estimate transaction cost. This may be due to insufficient funds or an invalid transaction.
```

Instead of the specific error message:
```
You are not authorized to perform this action.
```

## Solution
The error handling logic has been reordered and enhanced to:

1. **First**: Handle general network/infrastructure errors
2. **Second**: Handle obvious insufficient funds errors (not embedded in contract errors)
3. **Third**: Parse TandaPay contract-specific errors (including from CALL_EXCEPTION messages)
4. **Fourth**: Handle general CALL_EXCEPTION and revert patterns
5. **Fifth**: Handle true gas estimation failures

## Error Name Extraction
The `parseTandaPayContractError` method now extracts error names from multiple formats:

1. **Direct errorName field**: `error.errorName` from the error object
2. **Quoted reason string**: `reverted with reason string "NotValidMember"`
3. **ErrorName parameter**: `errorName="NotValidMember"`
4. **Execution reverted**: `execution reverted: NotValidMember`

## Specific Improvements

### Before:
```javascript
// CALL_EXCEPTION with "NotValidMember" error
const error = {
  code: 'CALL_EXCEPTION',
  message: 'call revert exception (errorName="NotValidMember")',
  errorName: 'NotValidMember'
};

// Result: Generic message
{
  type: 'CONTRACT_ERROR',
  userMessage: 'Transaction would revert',
  message: 'Transaction would revert'
}
```

### After:
```javascript
// Same CALL_EXCEPTION with "NotValidMember" error
const error = {
  code: 'CALL_EXCEPTION',
  message: 'call revert exception (errorName="NotValidMember")',
  errorName: 'NotValidMember'
};

// Result: Specific message
{
  type: 'CONTRACT_ERROR',
  userMessage: 'You are not authorized to perform this action.',
  message: 'TandaPay contract error: NotValidMember'
}
```

## Supported TandaPay Error Names
The following error names are now properly recognized and show specific user messages:

- `NotValidMember` → "You are not authorized to perform this action."
- `AlreadyAdded` → "This member has already been added to the community."
- `InsufficientFunds` → "Insufficient funds to complete this transaction."
- `NotAuthorized` → "You are not authorized to perform this action."
- `PremiumNotPaid` → "Premium must be paid before performing this action."
- And many more...

## Fallback Behavior
If a CALL_EXCEPTION occurs but the error name is not recognized, it will still show:
```
"Transaction would revert"
```

This ensures that users always see an explicit revert message rather than generic gas estimation failures.

## Testing
- Added comprehensive tests for CALL_EXCEPTION error handling
- All existing tests continue to pass (78/78)
- Specific test for the original issue error format
- Tests for multiple error name extraction patterns

## Impact
Users will now see specific, actionable error messages when transactions would revert due to contract logic, rather than generic gas estimation failures. This improves the user experience by providing clear feedback about why their transaction cannot be completed.
