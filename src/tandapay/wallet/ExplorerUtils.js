/* @flow strict-local */

import { getNetworkDisplayInfo } from '../providers/ProviderManager';
import { getTandaPaySelectedNetwork, getTandaPayCustomRpcConfig } from '../redux/selectors';
import store from '../../boot/store';
import { tryGetActiveAccountState } from '../../selectors';

/**
 * Get blockchain explorer URL for an address using current network settings
 */
export function getExplorerAddressUrl(address: string): ?string {
  try {
    const globalState = store.getState();
    const perAccountState = tryGetActiveAccountState(globalState);

    if (!perAccountState) {
      return null;
    }

    const selectedNetwork = getTandaPaySelectedNetwork(perAccountState);
    const customRpcConfig = getTandaPayCustomRpcConfig(perAccountState);

    if (selectedNetwork === 'custom' && customRpcConfig?.blockExplorerUrl != null && customRpcConfig.blockExplorerUrl !== '') {
      return `${customRpcConfig.blockExplorerUrl}/address/${address}`;
    } else if (selectedNetwork !== 'custom') {
      const networkConfig = getNetworkDisplayInfo(selectedNetwork);
      if (networkConfig.blockExplorerUrl != null && networkConfig.blockExplorerUrl !== '') {
        return `${networkConfig.blockExplorerUrl}/address/${address}`;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get blockchain explorer URL for a transaction using current network settings
 */
export function getExplorerTransactionUrl(txHash: string): ?string {
  try {
    const globalState = store.getState();
    const perAccountState = tryGetActiveAccountState(globalState);

    if (!perAccountState) {
      return null;
    }

    const selectedNetwork = getTandaPaySelectedNetwork(perAccountState);
    const customRpcConfig = getTandaPayCustomRpcConfig(perAccountState);

    if (selectedNetwork === 'custom' && customRpcConfig?.blockExplorerUrl != null && customRpcConfig.blockExplorerUrl !== '') {
      return `${customRpcConfig.blockExplorerUrl}/tx/${txHash}`;
    } else if (selectedNetwork !== 'custom') {
      const networkConfig = getNetworkDisplayInfo(selectedNetwork);
      if (networkConfig.blockExplorerUrl != null && networkConfig.blockExplorerUrl !== '') {
        return `${networkConfig.blockExplorerUrl}/tx/${txHash}`;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get blockchain explorer name for the current network
 */
export function getExplorerName(): string {
  try {
    const globalState = store.getState();
    const perAccountState = tryGetActiveAccountState(globalState);

    if (!perAccountState) {
      return 'Explorer';
    }

    const selectedNetwork = getTandaPaySelectedNetwork(perAccountState);
    const customRpcConfig = getTandaPayCustomRpcConfig(perAccountState);

    if (selectedNetwork === 'custom' && customRpcConfig?.name != null && customRpcConfig.name !== '') {
      return `${customRpcConfig.name} Explorer`;
    }

    switch (selectedNetwork) {
      case 'mainnet':
      case 'sepolia':
        return 'Etherscan';
      case 'arbitrum':
        return 'Arbiscan';
      case 'polygon':
        return 'Polygonscan';
      default:
        return 'Explorer';
    }
  } catch (error) {
    return 'Explorer';
  }
}
