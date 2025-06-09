// @flow strict-local

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import NavRow from '../common/NavRow';
import TextRow from '../common/TextRow';
import { IconSend, IconGroup, IconTandaPayInfo, IconSettings } from '../common/Icons';
// $FlowFixMe - importing from untyped module
import { getAllWriteTransactions } from './contract/writeTransactions';

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

  // Helper function to get icon based on role
  const getIconForRole = (role: string) => {
    switch (role) {
      case 'member':
        return IconGroup;
      case 'secretary':
        return IconSettings;
      case 'public':
        return IconTandaPayInfo;
      default:
        return IconSend;
    }
  };

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
      {writeTransactions.map((transaction) => (
        <NavRow
          key={transaction.functionName}
          leftElement={{ type: 'icon', Component: getIconForRole(transaction.role) }}
          title={transaction.displayName}
          onPress={createTransactionCallback(transaction.functionName)}
          subtitle={transaction.description}
        />
      ))}
      <TextRow
        icon={{ Component: IconTandaPayInfo }}
        title="Available Actions"
        subtitle="TandaPay blockchain actions require ETH for gas fees"
      />
    </Screen>
  );
}
