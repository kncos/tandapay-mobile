/* @flow strict-local */

import React, { useState, useContext, useCallback, useMemo } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';
import { useSelector } from '../../react-redux';
import { getSelectedToken } from '../tokens/tokenSelectors';
import { getTandaPaySelectedNetwork, getTandaPayCustomRpcConfig } from '../redux/selectors';
import { transferToken, estimateTransferGas } from '../web3';
import { getWalletInstance } from './WalletManager';
import {
  AddressInput,
  AmountInput,
  validateEthereumAddress,
  TransactionEstimateAndSend,
  WalletNetworkInfo,
} from '../components';
import type {
  TransactionParams,
  EstimateGasCallback,
  SendTransactionCallback,
  GasEstimate,
} from '../components';
import { TandaPayColors, TandaPayLayout } from '../styles';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet-send'>,
  route: RouteProp<'wallet-send', void>,
|}>;

const customStyles = {
  container: {
    flex: 1,
    padding: 16,
  },
  tokenInfo: {
    backgroundColor: TandaPayColors.gray100,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
};

export default function WalletSendScreen(props: Props): Node {
  const { navigation } = props;
  const themeData = useContext(ThemeContext);
  const selectedToken = useSelector(getSelectedToken);
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const customRpcConfig = useSelector(getTandaPayCustomRpcConfig);

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [walletInstance, setWalletInstance] = useState(null);

  // Load wallet instance lazily (only when needed)
  const getWallet = useCallback(async () => {
    if (walletInstance) {
      return walletInstance;
    }

    try {
      const wallet = await getWalletInstance();
      setWalletInstance(wallet);
      return wallet;
    } catch (error) {
      throw new Error('Failed to load wallet. Please try again.');
    }
  }, [walletInstance]);

  // Memoize form validation to prevent unnecessary re-renders
  const isFormValid = useMemo(() =>
    Boolean(toAddress.trim() && amount.trim() && validateEthereumAddress(toAddress.trim())),
  [toAddress, amount]);

  // Prepare transaction parameters
  const transactionParams: TransactionParams = useMemo(() => ({
    toAddress: toAddress.trim(),
    amount: amount.trim(),
    token: selectedToken,
    network: selectedNetwork,
  }), [toAddress, amount, selectedToken, selectedNetwork]);

  // Gas estimation callback
  const handleEstimateGas: EstimateGasCallback = useCallback(async (params: TransactionParams) => {
    try {
      const wallet = await getWallet();
      if (!wallet?.address) {
        throw new Error('Wallet not loaded properly. Please try again.');
      }

      if (!selectedToken) {
        throw new Error('No token selected. Please select a token first.');
      }

      const { toAddress: to, amount: amt } = params;
      if (typeof to !== 'string' || typeof amt !== 'string') {
        throw new Error('Invalid transaction parameters');
      }

      const result = await estimateTransferGas(
        selectedToken,
        ethers.utils.getAddress(wallet.address.toLowerCase()),
        ethers.utils.getAddress(to.toLowerCase()),
        amt,
        selectedNetwork,
      );

      if (result.success && result.gasEstimate != null && result.gasPrice != null) {
        const gasLimitValue = result.gasEstimate;
        const gasPriceValue = result.gasPrice;
        const estimatedCost = ((parseFloat(gasLimitValue) * parseFloat(gasPriceValue)) / 1e9).toFixed(8);

        return {
          success: true,
          gasEstimate: {
            gasLimit: gasLimitValue,
            gasPrice: gasPriceValue,
            estimatedCost,
          },
        };
      } else {
        return {
          success: false,
          error: result.error ?? 'Unable to estimate gas costs.',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message ?? 'Unable to estimate gas costs.',
      };
    }
  }, [getWallet, selectedToken, selectedNetwork]);

  // Transaction sending callback
  const handleSendTransaction: SendTransactionCallback = useCallback(async (params: TransactionParams, gasEstimate: GasEstimate) => {
    try {
      const wallet = await getWallet();
      if (!wallet?.privateKey) {
        throw new Error('Unable to access wallet private key');
      }

      if (!selectedToken) {
        throw new Error('No token selected');
      }

      const { toAddress: to, amount: amt } = params;
      if (typeof to !== 'string' || typeof amt !== 'string') {
        throw new Error('Invalid transaction parameters');
      }

      const result = await transferToken(
        selectedToken,
        wallet.privateKey,
        ethers.utils.getAddress(to.toLowerCase()),
        amt,
        selectedNetwork,
      );

      if (result.success && result.txHash != null) {
        return {
          success: true,
          txHash: result.txHash,
        };
      } else {
        return {
          success: false,
          error: result.error ?? 'Unknown error occurred.',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message ?? 'An unexpected error occurred.',
      };
    }
  }, [getWallet, selectedToken, selectedNetwork]);

  // Custom confirmation message
  const getConfirmationMessage = useCallback((params: TransactionParams, gasEstimate: GasEstimate) => {
    const { toAddress: to, amount: amt } = params;
    return `Send ${String(amt)} ${selectedToken?.symbol || 'tokens'} to ${String(to)}?\n\nEstimated Gas: ${gasEstimate.gasLimit} units\nGas Price: ${gasEstimate.gasPrice} gwei\nEstimated Cost: ${gasEstimate.estimatedCost} ETH`;
  }, [selectedToken]);

  // Transaction success callback
  const handleTransactionSuccess = useCallback((txHash: string) => {
    // Navigate back to wallet after successful transaction
    navigation.goBack();
  }, [navigation]);

  // Return early if no token is selected
  if (!selectedToken) {
    return (
      <Screen title="Send" canGoBack>
        <View style={customStyles.container}>
          <ZulipText style={{ textAlign: 'center', marginTop: 50, fontSize: 16 }}>
            No token selected. Please select a token in your wallet first.
          </ZulipText>
          <ZulipButton
            text="Go Back"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 20 }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Send" canGoBack>
      <View style={customStyles.container}>
        {/* Token Info */}
        <View style={[customStyles.tokenInfo, { backgroundColor: themeData.cardColor }]}>
          <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
            Sending
            {' '}
            {selectedToken.symbol}
          </ZulipText>
          <ZulipText style={{ opacity: 0.7, fontSize: 14 }}>
            {selectedToken.name}
          </ZulipText>
        </View>

        {/* Network Info */}
        <WalletNetworkInfo
          selectedNetwork={selectedNetwork}
          customRpcConfig={customRpcConfig}
        />

        {/* Send Form */}
        <View style={TandaPayLayout.section}>
          <AddressInput
            value={toAddress}
            onChangeText={setToAddress}
            label="Recipient Address"
            placeholder="0x..."
          />

          <AmountInput
            value={amount}
            onChangeText={setAmount}
            tokenSymbol={selectedToken.symbol}
            tokenDecimals={selectedToken.decimals}
            label="Amount"
          />
        </View>

        {/* Transaction Estimate and Send Component */}
        <TransactionEstimateAndSend
          transactionParams={transactionParams}
          onEstimateGas={handleEstimateGas}
          onSendTransaction={handleSendTransaction}
          estimateButtonText="Estimate Gas"
          sendButtonText={`Send ${selectedToken.symbol}`}
          transactionDescription="token transfer"
          isFormValid={isFormValid}
          confirmationTitle="Confirm Transaction"
          getConfirmationMessage={getConfirmationMessage}
          onTransactionSuccess={handleTransactionSuccess}
        />
      </View>
    </Screen>
  );
}
