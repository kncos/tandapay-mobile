// @flow strict-local

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import NavRow from '../common/NavRow';
import TextRow from '../common/TextRow';
import { IconSend, IconPlusCircle, IconGroup, IconTandaPayInfo } from '../common/Icons';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-actions'>,
  route: RouteProp<'tandapay-actions', void>,
|}>;

export default function TandaPayActionsScreen(props: Props): Node {
  const handleJoinGroup = useCallback(() => {
    // TODO: Implement join group functionality
  }, []);

  const handleSubmitClaim = useCallback(() => {
    // TODO: Implement submit claim functionality
  }, []);

  const handlePayPremium = useCallback(() => {
    // TODO: Implement pay premium functionality
  }, []);

  const handleViewContract = useCallback(() => {
    // TODO: Navigate to contract details or external viewer
  }, []);

  return (
    <Screen title="TandaPay Actions">
      <NavRow
        leftElement={{ type: 'icon', Component: IconGroup }}
        title="Join Group"
        onPress={handleJoinGroup}
        subtitle="Join a TandaPay insurance group"
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconPlusCircle }}
        title="Submit Claim"
        onPress={handleSubmitClaim}
        subtitle="Submit an insurance claim to your group"
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconSend }}
        title="Pay Premium"
        onPress={handlePayPremium}
        subtitle="Make your monthly premium payment"
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconTandaPayInfo }}
        title="View Smart Contract"
        onPress={handleViewContract}
        subtitle="View TandaPay contract on blockchain"
        type="external"
      />
      <TextRow
        icon={{ Component: IconTandaPayInfo }}
        title="Available Actions"
        subtitle="TandaPay blockchain actions require ETH for gas fees"
      />
    </Screen>
  );
}
