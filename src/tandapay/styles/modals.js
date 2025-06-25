// @flow strict-local

import TandaPayColors from './colors';
import TandaPayTypography from './typography';

/**
 * Common modal styles used across various modal components
 */
export default {
  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: TandaPayColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main modal card container
  modalCard: {
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },

  // Modal header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },

  // Modal title
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },

  // Modal content area
  content: {
    flex: 1,
  },

  // Modal description text
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },

  // Disclaimer text
  disclaimer: {
    ...TandaPayTypography.caption,
    color: TandaPayColors.warning,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Section container
  section: {
    marginBottom: 20,
  },

  // Section title
  sectionTitle: {
    ...TandaPayTypography.label,
    marginBottom: 8,
  },
};
