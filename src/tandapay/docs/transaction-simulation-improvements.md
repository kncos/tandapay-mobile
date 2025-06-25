# Transaction Simulation and Error Handling Improvements

## Overview

This document outlines the improvements made to the TandaPay transaction system to address UNPREDICTABLE_GAS_LIMIT errors and provide better user experience when transactions would fail.

## Problem Statement

Previously, when users tried to estimate gas for transactions that would revert (due to contract state not allowing the operation), they would get an UNPREDICTABLE_GAS_LIMIT error. This happened because:

1. Gas estimation cannot work on transactions that will revert
2. All transaction options were always available in the UI, regardless of contract state
3. Error messages were not user-friendly or helpful for debugging

## Solution

### 1. Simulate Before Gas Estimation

Modified the gas estimation flow to:
1. **First**: Simulate the transaction using `callStatic`
2. **Second**: Only estimate gas if simulation succeeds

This prevents UNPREDICTABLE_GAS_LIMIT errors by ensuring we only try to estimate gas on transactions that would actually succeed.

### 2. Enhanced Error Handling

#### Added UNPREDICTABLE_GAS_LIMIT Detection
Enhanced `ErrorHandler.js` to specifically detect and handle UNPREDICTABLE_GAS_LIMIT errors:

```javascript
// Check for UNPREDICTABLE_GAS_LIMIT specifically - this usually means the transaction will revert
if (errorCode === 'UNPREDICTABLE_GAS_LIMIT' || errorMessage.includes('unpredictable gas limit')) {
  return {
    message: 'Transaction would revert',
    userMessage: 'This transaction cannot be completed at this time. The contract state may not allow this operation right now.',
    type: 'CONTRACT_ERROR'
  };
}
```

#### Added TandaPay Contract Error Parsing
Added specific error parsing for common TandaPay contract errors like:
- `AlreadyAdded` → "This member has already been added to the community."
- `CommunityIsCollapsed` → "The community has collapsed and is no longer active."
- `PremiumNotPaid` → "Premium must be paid before performing this action."
- `NotSecretary` → "This action can only be performed by the secretary."
- And many more...

### 3. Improved User Experience

#### Copy Error Button
Added "Copy Error" buttons to all error dialogs, allowing users (and developers) to easily copy error details for debugging:

```javascript
Alert.alert(
  errorTitle,
  errorMessage,
  [
    {
      text: 'Copy Error',
      onPress: () => {
        Clipboard.setString(`${errorTitle}: ${errorMessage}`);
        showToast('Error details copied to clipboard');
      },
    },
    {
      text: 'OK',
      style: 'cancel',
    },
  ]
);
```

#### Context-Aware Error Messages
Error messages now provide specific context about why operations fail, making it easier for users to understand what they need to do.

## Implementation Details

### Files Modified

1. **`src/tandapay/errors/ErrorHandler.js`**
   - Added UNPREDICTABLE_GAS_LIMIT detection
   - Added `parseTandaPayContractError()` method
   - Enhanced gas estimation error handling

2. **`src/tandapay/components/TransactionModal.js`**
   - Modified `handleEstimateGas` to simulate first, then estimate gas
   - Improved error flow and messaging

3. **`src/tandapay/components/TransactionEstimateAndSend.js`**
   - Added "Copy Error" buttons to all error dialogs
   - Enhanced error message display

### Key Functions

#### `handleEstimateGas` Flow (TransactionModal.js)
```javascript
// FIRST: Simulate the transaction to check if it would succeed
const simulationResult = await transaction.simulateFunction(contract, ...paramValues);
if (!simulationResult.success) {
  return {
    success: false,
    error: simulationResult.error || 'Transaction simulation failed - this operation is not valid at this time',
  };
}

// SECOND: Only estimate gas if simulation succeeds
const gasEstimate = await gasEstimateFunction(contract, ...paramValues);
```

#### Enhanced Error Display
All error dialogs now include:
- Clear, user-friendly error message
- "Copy Error" button for debugging
- Toast confirmation when error is copied

## Benefits

1. **Prevents UNPREDICTABLE_GAS_LIMIT Errors**: By simulating first, we catch transactions that would revert before attempting gas estimation

2. **Better User Experience**: Users get clear, actionable error messages instead of cryptic blockchain errors

3. **Developer Debugging**: "Copy Error" buttons make it easy to capture and debug issues

4. **Maintains Existing Behavior**: Still simulates before actual transaction sending (as before), but now also simulates before gas estimation

5. **Context-Aware Messaging**: Specific error messages help users understand contract state requirements

## Usage

The improvements are transparent to existing code. The transaction flow remains the same:

1. User fills out transaction form
2. User clicks "Estimate Gas"
3. System simulates → estimates gas → shows estimate
4. User clicks "Send"  
5. System simulates → sends transaction

The difference is that step 3 now includes simulation, preventing gas estimation failures and providing better error messages when operations aren't valid.

## Testing

To test the improvements:

1. Try to perform actions that aren't valid for current contract state
2. Verify that helpful error messages appear instead of gas estimation failures
3. Test the "Copy Error" button functionality
4. Ensure that valid transactions still work normally

## Future Enhancements

1. **Proactive UI Filtering**: Could use simulation results to hide/disable invalid transaction options in real-time
2. **Contract State Indicators**: Show users why certain actions aren't available
3. **Retry Mechanisms**: For temporary state issues, provide automatic retry options
4. **Enhanced Logging**: Capture simulation results for analytics and debugging
