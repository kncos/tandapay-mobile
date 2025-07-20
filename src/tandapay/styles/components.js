// @flow strict-local

import TandaPayColors from './colors';

// Common input styles for TandaPay components
const inputs = Object.freeze({
  // Base input
  base: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },

  // Large input (for multiline)
  large: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },

  // Input with validation states
  valid: {
    borderColor: TandaPayColors.success,
  },

  invalid: {
    borderColor: TandaPayColors.error,
  },

  // Address input row
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Address input (flex to take remaining space)
  address: {
    flex: 1,
    marginRight: 8,
  },
});

// Common button styles
const buttons = Object.freeze({
  // Base button (from existing buttons.js)
  base: {
    flex: 1,
    margin: 8,
  },

  // QR button
  qr: {
    padding: 10,
    borderRadius: 4,
    backgroundColor: TandaPayColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // QR button disabled
  qrDisabled: {
    backgroundColor: TandaPayColors.disabled,
  },

  // Close button for modals
  close: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: TandaPayColors.overlay,
    borderRadius: 25,
    padding: 10,
    zIndex: 1,
  },

  // Refresh button
  refresh: {
    marginLeft: 12,
    marginTop: 18,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
  },
});

// Common chip styles
const chips = Object.freeze({
  // Base chip
  base: {
    backgroundColor: TandaPayColors.subtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TandaPayColors.primary,
    margin: 4,
  },

  // Selected chip
  selected: {
    backgroundColor: TandaPayColors.primaryHighlight,
    borderColor: TandaPayColors.primary,
  },

  // Picker chip
  picker: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignSelf: 'center',
    minWidth: 150,
    maxWidth: 260,
    overflow: 'hidden',
    marginTop: 18,
    borderWidth: 2,
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});

// Common indicator styles
const indicators = Object.freeze({
  // Selection indicators
  selected: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: TandaPayColors.success,
    backgroundColor: TandaPayColors.success,
  },

  unselected: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: TandaPayColors.disabled,
    backgroundColor: TandaPayColors.transparent,
  },
});

export default {
  ...inputs,
  ...buttons,
  ...chips,
  ...indicators,
};
