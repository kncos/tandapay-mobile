/* @flow strict-local */

// Debug test to check what's actually exported
const definitions = require('./src/tandapay/definitions/index.js');

console.log('Available exports:', Object.keys(definitions));
console.log('formatTokenAmount:', typeof definitions.formatTokenAmount);
console.log('getChainByNetwork:', typeof definitions.getChainByNetwork);
