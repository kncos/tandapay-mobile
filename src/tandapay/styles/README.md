# TandaPay Styles Refactoring Guide

## Overview

This document outlines the refactoring of TandaPay component styles to eliminate duplication, standardize colors, and improve maintainability.

## New Style Structure

### `/src/tandapay/styles/` Directory

#### `colors.js`
- **Purpose**: Centralized color palette replacing hardcoded colors
- **Exports**: `TandaPayColors` object with semantic color names
- **Key Benefits**: 
  - Replaced hardcoded colors: `#4CAF50`, `#cccccc`, `#f44336`, `#fff`, etc.
  - Uses base colors from `../../styles/constants.js`
  - Semantic naming (success, error, warning, etc.)

#### `typography.js`
- **Purpose**: Standardized text styles
- **Exports**: `TandaPayTypography` object
- **Key Benefits**:
  - Eliminates repeated patterns like `fontSize: 18, fontWeight: 'bold', marginBottom: 12`
  - Consistent hierarchy (sectionTitle, subsectionTitle, body, etc.)

#### `layout.js`  
- **Purpose**: Common layout patterns and containers
- **Exports**: `TandaPayLayout` object with cards and containers
- **Key Benefits**:
  - Standardized card styles with elevation and shadows
  - Common containers (screen, scrollPadded, section, etc.)
  - Consistent spacing patterns

#### `components.js`
- **Purpose**: Component-specific reusable styles
- **Exports**: `TandaPayComponents` object
- **Key Benefits**:
  - Input styles with validation states
  - Button patterns
  - Chip styles for selection states
  - Indicator styles

#### `buttons.js` (existing)
- **Purpose**: Button layout patterns
- **Maintained**: Existing button row and base button styles

#### `index.js`
- **Purpose**: Main export point for all TandaPay styles
- **Exports**: Individual style modules + combined `TandaPayStyles` object

## Refactored Components

### ✅ Completed

1. **AddressInput.js**
   - **Before**: Hardcoded colors (`#cccccc`, `#f44336`, `rgba(0,0,0,0.6)`)
   - **After**: Uses `TandaPayColors.disabled`, `TandaPayColors.error`, `TandaPayColors.overlay`
   - **Benefits**: Color consistency, better theme support

2. **NetworkSelector.js**
   - **Before**: Hardcoded `#4CAF50`, `#ccc` for selection indicators
   - **After**: Uses `TandaPayComponents.selected`, `TandaPayComponents.unselected`
   - **Benefits**: Consistent selection UI across components

3. **WordChip.js**
   - **Before**: Mixed hardcoded and constants imports
   - **After**: Uses `TandaPayComponents.base`, `TandaPayComponents.selected`
   - **Benefits**: Consistent chip styling

4. **WalletSettingsScreen.js**
   - **Before**: Repeated patterns for sections, cards, inputs
   - **After**: Uses `TandaPayLayout.section`, `TandaPayTypography.sectionTitle`, etc.
   - **Benefits**: Reduced duplication, consistent styling

5. **TandaRibbon.js**
   - **Before**: Direct `BRAND_COLOR` import
   - **After**: Uses `TandaPayColors.primary`
   - **Benefits**: Consistent color usage

6. **AmountInput.js**
   - **Before**: StyleSheet.create with hardcoded padding and margins
   - **After**: Uses centralized styles with custom overrides
   - **Benefits**: Consistent input styling

7. **TransactionEstimateAndSend.js**
   - **Before**: Hardcoded colors `#999`, `#4CAF50`
   - **After**: Uses `TandaPayColors.disabled`, `TandaPayColors.success`
   - **Benefits**: Semantic color usage

8. **TokenManagementScreen.js**
   - **Before**: Hardcoded colors `#4CAF50`, `#f44336`
   - **After**: Uses `TandaPayColors.success`, `TandaPayColors.error`
   - **Benefits**: Consistent error/success states

9. **TandaPaySettingsScreen.js**
   - **Before**: Hardcoded error color `#f44336`
   - **After**: Uses `TandaPayColors.error`
   - **Benefits**: Consistent error styling

10. **NetworkInfo.js**
    - **Before**: StyleSheet.create with hardcoded `#007AFF`
    - **After**: Uses `TandaPayColors.primary` and centralized styles
    - **Benefits**: Eliminated StyleSheet, consistent colors

11. **WalletReceiveScreen.js**
    - **Before**: Hardcoded colors `#f39c12`, `#000`
    - **After**: Uses `TandaPayColors.warning`, `TandaPayColors.black`
    - **Benefits**: Semantic color usage

12. **WalletSendScreen.js**
    - **Before**: StyleSheet.create with hardcoded `#f5f5f5`
    - **After**: Uses `TandaPayColors.gray100` and centralized styles
    - **Benefits**: Eliminated StyleSheet, consistent colors

13. **WalletNetworkInfo.js**
    - **Before**: StyleSheet.create with repeated patterns
    - **After**: Uses centralized typography styles
    - **Benefits**: Eliminated StyleSheet, consistent typography

14. **VerificationRow.js**
    - **Before**: StyleSheet.create with hardcoded `#999`
    - **After**: Uses `TandaPayColors.disabled` and custom styles
    - **Benefits**: Eliminated StyleSheet, semantic colors

15. **WordGrid.js**
    - **Before**: StyleSheet.create for simple container
    - **After**: Inline styles for simple layout
    - **Benefits**: Eliminated unnecessary StyleSheet

16. **CustomRpcForm.js**
    - **Before**: StyleSheet.create with repeated form patterns
    - **After**: Uses `TandaPayTypography.sectionTitle` and custom styles
    - **Benefits**: Eliminated StyleSheet, consistent typography

17. **WalletScreen.js**
    - **Before**: StyleSheet.create for simple container
    - **After**: Inline styles for simple layout
    - **Benefits**: Eliminated unnecessary StyleSheet

18. **WalletImportScreen.js**
    - **Before**: Multiple hardcoded colors (`#ddd`, `#4CAF50`, `#f44336`, `#999`)
    - **After**: Uses `TandaPayColors.gray300`, `TandaPayColors.success`, `TandaPayColors.error`, `TandaPayColors.disabled`
    - **Benefits**: All colors now semantic

19. **WalletBalanceCard.js**
    - **Before**: Hardcoded colors `#fff`, `rgba(255, 255, 255, 0.1)`, `rgba(255, 255, 255, 0.2)`
    - **After**: Uses `TandaPayColors.white`, `TandaPayColors.whiteOverlay10`, `TandaPayColors.whiteOverlay20`
    - **Benefits**: Semantic colors including transparent overlays

## Usage Examples

### Before (Old Pattern)
```javascript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold', 
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
});

// Usage
<View style={styles.container}>
  <ZulipText style={styles.title}>Title</ZulipText>
  <View style={styles.card}>
    <ZulipText style={styles.errorText}>Error message</ZulipText>
  </View>
</View>
```

### After (New Pattern)
```javascript
import { TandaPayColors, TandaPayTypography, TandaPayLayout } from '../styles';

// Only create custom styles when needed, as plain objects
const customStyles = {
  specialButton: {
    backgroundColor: TandaPayColors.primary,
    borderRadius: 20, // Custom radius not in centralized styles
  },
};

// Usage - directly use centralized styles
<View style={TandaPayLayout.section}>
  <ZulipText style={TandaPayTypography.sectionTitle}>Title</ZulipText>
  <View style={TandaPayLayout.base}>
    <ZulipText style={[TandaPayTypography.error, { color: TandaPayColors.error }]}>
      Error message
    </ZulipText>
  </View>
</View>
```

## Key Principles

### ✅ DO:
- Use centralized styles directly: `style={TandaPayLayout.section}`
- Import only what you need: `import { TandaPayColors, TandaPayLayout } from '../styles'`
- Create plain objects for component-specific styles: `const customStyles = { ... }`
- Combine centralized styles with inline styles: `style={[TandaPayTypography.error, { color: TandaPayColors.error }]}`

### ❌ DON'T:
- Use `StyleSheet.create()` in components (only in `/src/tandapay/styles/`)
- Create local style objects that duplicate centralized patterns
- Use hardcoded colors like `#4CAF50`, `#fff`, `rgba(0,0,0,0.6)`
- Repeat common patterns like section titles, cards, input containers

## Next Steps

### Remaining Components to Refactor
- `CustomRpcForm.js` - Has section titles and form patterns
- `NetworkPerformanceSettings.js` - Has repeated form and input patterns
- `WalletBalanceCard.js` - Has card styling and color usage  
- `WalletGenerateScreen.js` - Has repeated container and text patterns
- `WalletImportScreen.js` - Has input validation and error patterns
- Other wallet-setup components

### Benefits of Continued Refactoring
1. **Consistency**: All components use the same visual patterns
2. **Maintainability**: Colors and styles centralized in one place
3. **Theme Support**: Easier to implement dark/light themes
4. **Performance**: Reduced bundle size from fewer duplicate styles
5. **Development Speed**: Faster to create new components using existing patterns

### Migration Strategy
1. Import the new style modules: `import { TandaPayColors, TandaPayTypography, TandaPayLayout, TandaPayComponents } from '../styles'`
2. Replace hardcoded colors with semantic names from `TandaPayColors`
3. Replace repeated patterns with spread syntax: `...TandaPayTypography.sectionTitle`
4. Remove old unused style properties
5. Test that visual appearance remains unchanged

## Color Mapping Reference

| Old Hardcoded Color | New Semantic Name | Usage |
|-------------------|------------------|-------|
| `#4CAF50` | `TandaPayColors.success` | Success states, selected items |
| `#f44336` | `TandaPayColors.error` | Error messages, validation |
| `#cccccc` | `TandaPayColors.disabled` | Disabled button states |
| `#fff` | `TandaPayColors.white` | White text, backgrounds |
| `#000` | `TandaPayColors.black` | Black text, backgrounds |
| `rgba(0,0,0,0.6)` | `TandaPayColors.overlay` | Modal overlays |

## Typography Patterns

| Old Pattern | New Semantic Name | Usage |
|-------------|------------------|-------|
| `fontSize: 18, fontWeight: 'bold', marginBottom: 12` | `TandaPayTypography.sectionTitle` | Section headings |
| `fontSize: 14, fontWeight: '600', marginBottom: 6` | `TandaPayTypography.inputLabel` | Form labels |
| `fontSize: 14, marginBottom: 16, opacity: 0.7` | `TandaPayTypography.description` | Descriptive text |
| `fontFamily: 'monospace', fontSize: 14` | `TandaPayTypography.monospace` | Addresses, keys |
