// @flow strict-local

// Common typography styles for TandaPay components
const typography = Object.freeze({
  // Section titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  // Subsection titles
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  // Body text
  body: {
    fontSize: 16,
    lineHeight: 24,
  },

  // Small text
  small: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Extra small text
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Labels
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },

  // Input labels
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },

  // Description text
  description: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },

  descriptionCompact: {
    fontSize: 14,
    opacity: 0.7,
  },

  // Error text
  error: {
    fontSize: 14,
    marginTop: 8,
  },

  // Monospace text (for addresses, keys, etc.)
  monospace: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
});

export default typography;
