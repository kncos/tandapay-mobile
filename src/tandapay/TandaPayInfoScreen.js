// @flow strict-local

import React, { useEffect, useState, useCallback } from 'react';
import type { Node } from 'react';

import '@ethersproject/shims';
// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { RouteProp } from '../react-navigation';
import Screen from '../common/Screen';
import NavRow from '../common/NavRow';
import TextRow from '../common/TextRow';
import { IconServer, IconTandaPayInfo, IconAlertTriangle, IconGroup } from '../common/Icons';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'tandapay-info'>,
  route: RouteProp<'tandapay-info', void>,
|}>;

export default function TandaPayInfoScreen(props: Props): Node {
  const [blockchainData, setBlockchainData] = useState<?{|
    balance: string,
    blockNumber: string,
  |}>(null);
  const [error, setError] = useState<?string>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider('https://eth.merkle.io');
        const [balance, blockNumber] = await Promise.all([
          provider.getBalance('0x195605c92F0C875a98c7c144CF817A23D779C310'),
          provider.getBlockNumber(),
        ]);

        setBlockchainData({
          balance: ethers.utils.formatEther(balance),
          blockNumber: blockNumber.toString(),
        });
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockchainData();
  }, []);

  const handleViewContract = useCallback(() => {
    // TODO: Navigate to contract viewer or external link
  }, []);

  const handleViewCommunity = useCallback(() => {
    // TODO: Navigate to community info
  }, []);

  return (
    <Screen title="TandaPay Info">
      <NavRow
        leftElement={{ type: 'icon', Component: IconTandaPayInfo }}
        title="About TandaPay"
        onPress={handleViewCommunity}
        subtitle="Learn about decentralized insurance"
      />
      <NavRow
        leftElement={{ type: 'icon', Component: IconServer }}
        title="Smart Contract"
        onPress={handleViewContract}
        subtitle="View contract on Ethereum blockchain"
        type="external"
      />

      {loading ? (
        <TextRow
          icon={{ Component: IconServer }}
          title="Loading blockchain data..."
          subtitle="Fetching current information"
        />
      ) : error != null ? (
        <TextRow
          icon={{ Component: IconAlertTriangle }}
          title="Connection Error"
          subtitle={`Unable to connect: ${error}`}
        />
      ) : (
        <>
          <TextRow
            icon={{ Component: IconServer }}
            title="Current Block"
            subtitle={`Block #${blockchainData?.blockNumber || 'Unknown'}`}
          />
          <TextRow
            icon={{ Component: IconTandaPayInfo }}
            title="Demo Wallet Balance"
            subtitle={`${blockchainData?.balance || '0'} ETH`}
          />
        </>
      )}

      <TextRow icon={{ Component: IconGroup }} title="Active Groups" subtitle="0 groups joined" />
      <TextRow icon={{ Component: IconTandaPayInfo }} title="Network" subtitle="Ethereum Mainnet" />
    </Screen>
  );
}
