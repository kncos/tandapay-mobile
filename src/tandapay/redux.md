Looking at your Redux architecture and the existing TandaPay integration, here are **all the files outside of tandapay** that you need to modify when adding new reducers/actions/states:

## 📋 **Required File Modifications**

### 1. **actionConstants.js** ⭐
```javascript
// Add new action constants
export const TANDAPAY_NEW_ACTION: 'TANDAPAY_NEW_ACTION' = 'TANDAPAY_NEW_ACTION';
```

### 2. **actionTypes.js** ⭐
```javascript
// Import new constants
import { TANDAPAY_NEW_ACTION } from './actionConstants';

// Define new action types
type TandaPayNewAction = $ReadOnly<{|
  type: typeof TANDAPAY_NEW_ACTION,
  // ... payload properties
|}>;

// Add to TandaPayAction union
type TandaPayAction =
  | TandaPaySettingsUpdateAction
  | TandaPayNewAction  // ← Add here
  | ...

// Add to isPerAccountApplicableAction function
case TANDAPAY_NEW_ACTION:
  (action: PerAccountAction);
  (action: PerAccountApplicableAction);
  return true;
```

### 3. **reduxTypes.js** 
**Only if adding new top-level state properties to TandaPayState**
```javascript
// Import new state types if needed
import type { NewTandaPayFeatureState } from './tandapay/newFeature/types';
```

### 4. **migrations.js** 
**Only if changing state structure**
```javascript
// Add migration for new state fields
'68': state => ({
  ...state,
  tandaPay: {
    ...state.tandaPay,
    newFeature: initialNewFeatureState,
  },
}),
```

## 🚫 **Files You DON'T Need to Modify**

- **reducers.js** - Already handles all TandaPay actions via existing integration
- **store.js** - TandaPay state already in `storeKeys` for persistence
- **directSelectors.js** - No TandaPay selectors here (they're in `tandapay/` folder)
- **types.js** - Uses types from reduxTypes.js, no direct TandaPay types

## 🎯 **Summary by Scenario**

### **Adding Simple Actions (most common)**
**Files to modify:** 2 files
1. actionConstants.js - Add constants
2. actionTypes.js - Add types & switch cases

### **Adding New State Properties**
**Files to modify:** 3 files  
1. actionConstants.js - Add constants
2. actionTypes.js - Add types & switch cases
3. migrations.js - Add migration

### **Adding Complex Sub-State**
**Files to modify:** 4 files
1. actionConstants.js - Add constants
2. actionTypes.js - Add types & switch cases  
3. reduxTypes.js - Import new state types
4. migrations.js - Add migration

## ✅ **Your Current Setup**

Your existing TandaPay integration already handles the infrastructure correctly. The reducer composition in reducers.js uses this pattern:

```javascript
tandaPay: applyReducer('tandaPay', tandaPay, state.tandaPay, action, state)
```

```javascript
tandaPay: applyReducer('tandaPay', tandaPay, state.tandaPay, action, state)
```

This means **any new action you add will automatically flow through your `tandaPayCombinedReducer`** without needing to modify the reducer composition logic. The combined reducer internally delegates to separate `settingsReducer` and `tokensReducer` for better maintainability.

The key insight is that your TandaPay integration is **already fully wired** with a modular reducer architecture - you just need to extend the action definitions in the appropriate domain-specific reducer and handle migrations for state changes.