// @flow strict-local

// Import base colors from constants
import {
  BRAND_COLOR,
  HIGHLIGHT_COLOR,
  HALF_COLOR,
  QUARTER_COLOR,
  kWarningColor,
  kErrorColor
} from '../../styles/constants';

// TandaPay specific color palette
const TandaPayColors = Object.freeze({
  // Brand colors
  primary: BRAND_COLOR,
  primaryHighlight: HIGHLIGHT_COLOR,

  // Semantic colors
  success: '#4CAF50',
  warning: kWarningColor,
  error: kErrorColor,

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Alpha colors (for overlays and disabled states)
  overlay: 'rgba(0, 0, 0, 0.6)',
  disabled: '#CCCCCC',
  whiteOverlay10: 'rgba(255, 255, 255, 0.1)',
  whiteOverlay20: 'rgba(255, 255, 255, 0.2)',

  // Theme-aware colors (use these with ThemeContext)
  backdrop: HALF_COLOR,
  subtle: QUARTER_COLOR,
});

export default TandaPayColors;
