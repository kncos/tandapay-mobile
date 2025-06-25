# Copy Error Button Improvements

## Overview
Enhanced the "Copy Error" button functionality to provide both user-friendly error messages and full technical details for debugging.

## Changes Made

### 1. Updated Type Definitions
- Enhanced `EstimateGasCallback`, `SendTransactionCallback`, and `TransactionFunction` types to include `originalError?: string`
- This allows preserving the full technical error from ethers.js while showing clean user messages

### 2. Enhanced Error Copying Logic
- The "Copy Error" button now includes both user-facing and technical error details
- Format: User message followed by "Technical Details:" section with original error
- Only includes technical details if they differ from the user message (avoids duplication)

### 3. Cleaned Up Error Message Layering
- Removed redundant "Transaction would revert:" prefixes that were being added in multiple places
- ErrorHandler now provides clean, single-level error messages
- Fixed the issue where errors like "Gas Estimation Failed: Transaction would revert: Smart contract operation failed..." had multiple prefixes

### 4. Updated Components
- **TransactionEstimateAndSend.js**: Enhanced copy functionality for both gas estimation and transaction errors
- **TransactionModal.js**: Now passes through originalError from simulation and transaction execution
- **WalletSendScreen.js**: Updated to provide originalError for wallet operations
- **writeTransactionObjects.js**: Cleaned up error message handling, removed duplicate prefixes

### 5. Improved Error Messages
- Gas estimation errors now show clean messages like "Transaction would revert" instead of layered messages
- Specific contract errors (like "Premium has already been paid") are preserved as-is
- Generic contract errors get user-friendly explanations

## User Experience

### Before
```
Gas Estimation Failed: Transaction would revert: Smart contract operation failed. This may be due to network congestion or insufficient gas.
```

### After - User Message
```
Transaction would revert
```

### After - Copy Error Content
```
Gas Estimation Failed: Transaction would revert

Technical Details:
execution reverted: invalid recipient address
```

## Technical Implementation

### Error Flow
1. **Simulation**: Contract simulation catches revert with specific reason
2. **ErrorHandler**: Parses ethers.js error and provides clean user message + preserves original
3. **UI Components**: Display clean message, copy both user and technical details
4. **Copy Button**: Formats both messages for developers

### Code Example
```javascript
// Enhanced copy logic in TransactionEstimateAndSend.js
{
  text: 'Copy Error',
  onPress: () => {
    let errorToCopy = `${errorTitle}: ${errorMessage}`;
    if (result.originalError != null && result.originalError !== errorMessage) {
      errorToCopy += `\n\nTechnical Details:\n${result.originalError}`;
    }
    Clipboard.setString(errorToCopy);
    showToast('Error details copied to clipboard');
  },
}
```

## Benefits
1. **User-Friendly**: Clean, understandable error messages for end users
2. **Developer-Friendly**: Full technical details available via copy button
3. **Debugging**: Developers can easily access original ethers.js error messages
4. **Consistency**: Unified error handling across all transaction flows
5. **No Duplication**: Technical details only included when different from user message
