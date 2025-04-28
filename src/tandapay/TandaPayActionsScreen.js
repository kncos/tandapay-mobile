// @flow strict-local

import React from 'react';
import type { Node } from 'react';

import { View, Text, StyleSheet } from 'react-native';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-actions'>,
  route: RouteProp<'tandapay-actions', void>,
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

export default function TandaPayActionsScreen(props: Props): Node {
  return (
    <Screen title="TandaPay Actions">
      <View style={styles.container}>
        <Text style={styles.placeholderText}>
          TandaPay Actions Screen Placeholder
        </Text>
      </View>
    </Screen>
  );
}
