// @flow strict-local

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import NavRow from '../common/NavRow';
import TextRow from '../common/TextRow';
import { IconTandaPayInfo } from '../common/Icons';
// $FlowFixMe - importing from untyped module
import { getAllWriteTransactions } from './contract/writeTransactionObjects';
import { TandaRibbon } from './components';
import ZulipText from '../common/ZulipText';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-actions'>,
  route: RouteProp<'tandapay-actions', void>,
|}>;

export default function TandaPayActionsScreen(props: Props): Node {
  // Get all write transactions with metadata
  // For production use with actual signer and contract:
  // import { getAllWriteMethodsWithMetadata } from './contract/write';
  // const writeTransactions = getAllWriteMethodsWithMetadata(signer, contractAddress);
  const writeTransactions = getAllWriteTransactions();

  // Helper function to create callback for each transaction
  const createTransactionCallback = useCallback((transactionName: string) => () => {
    // TODO: Implement transaction functionality
    // In production, you would:
    // 1. Get the writer methods: const writer = getTandaPayWriter(contractAddress, signer);
    // 2. Call the appropriate method: writer.member[transactionName]() or writer.secretary[transactionName]()
    // 3. Handle the transaction result, show loading states, etc.
  }, []);

  return (
    <Screen title="TandaPay Actions">
      <TandaRibbon label="Member Actions" marginTop={0}>
        {writeTransactions.filter((transaction) => transaction.role !== 'secretary').map((transaction) => (
          <NavRow
            key={transaction.functionName}
            leftElement={{ type: 'icon', Component: transaction.icon }}
            title={transaction.displayName}
            onPress={createTransactionCallback(transaction.functionName)}
            subtitle={transaction.description}
          />
        ))}
      </TandaRibbon>
      <TandaRibbon label="Secretary Actions" marginTop={0}>
        {writeTransactions.filter((transaction) => transaction.role === 'secretary').map((transaction) => (
          <NavRow
            key={transaction.functionName}
            leftElement={{ type: 'icon', Component: transaction.icon }}
            title={transaction.displayName}
            onPress={createTransactionCallback(transaction.functionName)}
            subtitle={transaction.description}
          />
        ))}
      </TandaRibbon>
    </Screen>
  );
}
