// @flow strict-local

// Common card styles for TandaPay components
const cards = Object.freeze({
  // Base card
  base: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Small card
  small: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  // Large card
  large: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  // Status card (with border)
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
  },

  // Balance card
  balance: {
    alignItems: 'stretch',
    marginVertical: 24,
    width: '90%',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 18,
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    borderWidth: 2,
  },
});

// Common layout containers
const containers = Object.freeze({
  // Screen container
  screen: {
    flex: 1,
  },

  // Scroll container with padding
  scrollPadded: {
    flex: 1,
    padding: 16,
  },

  // Section container
  section: {
    marginBottom: 24,
  },

  // Form section
  formSection: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },

  // Center content
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Row container
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Button row
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },

  // Input container
  inputContainer: {
    marginBottom: 16,
  },
});

export default {
  ...cards,
  ...containers,
};
