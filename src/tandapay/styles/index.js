// @flow strict-local
import buttons from './buttons';
import layout from './layout';
import components from './components';
import typography from './typography';

// Export individual style modules for direct access
export { default as TandaPayColors } from './colors';
export { default as TandaPayTypography } from './typography';
export { default as TandaPayLayout } from './layout';
export { default as TandaPayComponents } from './components';
// Note: ModalStyles and FormStyles are imported directly to avoid circular dependencies

// Export all of the TandaPay styles as a combined object
const TandaPayStyles = Object.freeze({
  ...buttons,
  ...layout,
  ...components,
  ...typography,
});

export default TandaPayStyles;
