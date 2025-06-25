// @flow strict-local

import TandaPayColors from './colors';
import TandaPayTypography from './typography';

/**
 * Common form styles used across various form components
 */
export default {
  // Container styles
  container: {
    marginBottom: 16,
  },

  section: {
    marginBottom: 20,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  // Label styles
  label: {
    ...TandaPayTypography.label,
    marginBottom: 8,
  },

  sectionTitle: {
    ...TandaPayTypography.label,
    marginBottom: 8,
  },

  // Description styles
  description: {
    ...TandaPayTypography.description,
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 12,
  },

  // Input container styles
  inputContainer: {
    flex: 1,
    marginRight: 8,
  },

  // Button styles
  addButton: {
    marginTop: 8,
  },

  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: TandaPayColors.error,
  },

  removeIcon: {
    color: TandaPayColors.white,
  },

  // State styles
  disabledContainer: {
    opacity: 0.6,
  },

  // Empty state styles
  emptyState: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 8,
  },

  emptyText: {
    ...TandaPayTypography.description,
    textAlign: 'center',
  },

  // Helper text styles
  helperText: {
    ...TandaPayTypography.caption,
    color: TandaPayColors.disabled,
    marginTop: 4,
    fontStyle: 'italic',
  },
};
