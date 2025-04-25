// @flow strict-local
// TandaPayMenuScreen.js
import React from 'react';
import type { Node } from 'react'; // Import Node type for component return
import { View, Text, StyleSheet } from 'react-native';

// Import the necessary types from React Navigation
// You might need to adjust the path based on your project structure
import type { RouteProp } from '@react-navigation/native';
// You might also need the navigation prop type, even if you don't use it yet
import Screen from '../common/Screen';

import type {
  AppNavigationProp,
} from '../nav/AppNavigator'; // Or whatever navigator type is appropriate

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-menu'>,
  route: RouteProp<'tandapay-menu', void>,
|}>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#888',
  },
});

export default function TandaPayMenuScreen(props: Props): Node {
  return (
    <Screen title="TandaPay Menu">
      <View style={styles.container}>
        <Text style={styles.placeholderText}>TandaPay Menu Content Goes Here</Text>
      </View>
    </Screen>
  );
}
