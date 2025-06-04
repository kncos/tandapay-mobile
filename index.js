/* @flow strict-local */
// React Navigation requires this react-native-gesture-handler import,
// as the very first import of this entry-point file.  See our #5373.
import 'fast-text-encoding';
import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import ZulipMobile from './src/ZulipMobile';

AppRegistry.registerComponent('ZulipMobile', () => ZulipMobile);
