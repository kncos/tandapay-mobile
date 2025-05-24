// @flow

import React, { useEffect, useState } from 'react';
import type { Node } from 'react';

import { View, Text, StyleSheet } from 'react-native';
// eslint-disable-next-line import/no-extraneous-dependencies

import '@ethersproject/shims';
import { ethers } from 'ethers';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-info'>,
  route: RouteProp<'tandapay-info', void>,
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

export default function TandaPayInfoScreen(props: Props): Node {
  const [blockNumber, setBlockNumber] = useState<?number>(null);
  const [error, setError] = useState<?string>(null);

  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com');
    provider.getBlockNumber()
      .then(setBlockNumber)
      .catch(e => setError(e.message));
  }, []);

  return (
    <Screen title="TandaPay Info">
      <View style={styles.container}>
        <Text style={styles.placeholderText}>
          {error
            ? `Error: ${error}`
            : blockNumber == null
            ? 'Fetching current block number...'
            : `Current block number: ${blockNumber}`}
        </Text>
      </View>
    </Screen>
  );
}
