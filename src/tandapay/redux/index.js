/* @flow strict-local */

// Re-export everything for easy imports
export { default as tandaPayReducer } from './reducer';
export * from './actions';
export * from './selectors';

// Re-export types
export type { TandaPayState, TandaPaySettingsState } from './reducer';
