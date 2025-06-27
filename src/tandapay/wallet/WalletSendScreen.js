/* @flow strict-local */

import React, { useState, useContext, useCallback, useMemo } from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

// $FlowFixMe[untyped-import]
import { ethers } from 'ethers';

import type { RouteProp } from '../../react-navigation';
import type { AppNavigationProp } from '../../nav/AppNavigator';
import Screen from '../../common/Screen';
import ZulipButton from '../../common/ZulipButton';
import ZulipText from '../../common/ZulipText';
import { ThemeContext } from '../../styles';
import { useSelector } from '../../react-redux';
import { getSelectedToken, getSelectedTokenBalance } from '../tokens/tokenSelectors';
import { getTandaPaySelectedNetwork, getTandaPayCustomRpcConfig } from '../redux/selectors';
import { transferToken, estimateETHTransferGas, estimateERC20TransferGas, getProvider } from '../web3';
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
} from '../components/TransactionEstimateAndSend';
import { TandaPayLayout } from '../styles';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'wallet-send'>,
  route: RouteProp<'wallet-send', void>,
|}>;

export default function WalletSendScreen(props: Props): Node {
  const { navigation } = props;
  const themeData = useContext(ThemeContext);
  const selectedToken = useSelector(getSelectedToken);
  const selectedTokenBalance = useSelector(getSelectedTokenBalance);
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const customRpcConfig = useSelector(getTandaPayCustomRpcConfig);

  // Create static styles (non-theme dependent)
  const customStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    tokenInfo: {
      padding: 16,
      borderRadius: 8,
      marginBottom: 24,
      alignItems: 'center',
    },
    errorText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
    },
    errorButton: {
      marginTop: 20,
    },
    tokenSymbol: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    tokenName: {
      opacity: 0.7,
      fontSize: 14,
    },
  });

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [walletInstance, setWalletInstance] = useState(null);

  // Helper function to calculate the maximum sendable amount for ETH given gas costs
  const calculateSendableAmount = useCallback(async (requestedAmount: string, gasEstimate: GasEstimate): Promise<string> => {
    if (selectedToken?.address != null || selectedTokenBalance == null || selectedTokenBalance.trim() === '') {
      // For ERC20 tokens or when no balance, return as-is
      return requestedAmount;
    }

    try {
      const requested = ethers.utils.parseEther(requestedAmount);
      const totalBalance = ethers.utils.parseEther(selectedTokenBalance);

      // Use the estimated cost directly from our comprehensive gas estimation
      // This already accounts for EIP-1559 maxFeePerGas and proper gas calculations
      const estimatedGasCost = ethers.utils.parseEther(gasEstimate.estimatedCost);

      // Check if requested amount + gas cost exceeds balance
      const totalRequired = requested.add(estimatedGasCost);

      if (totalRequired.gt(totalBalance)) {
        // Return adjusted amount
        const adjustedAmount = totalBalance.sub(estimatedGasCost);
        if (adjustedAmount.gt(0)) {
          return ethers.utils.formatEther(adjustedAmount);
        } else {
          throw new Error('Insufficient balance to cover gas costs');
        }
      }

      // If no adjustment needed, return original amount
      return requestedAmount;
    } catch (error) {
      // If calculation fails, return original amount
      return requestedAmount;
    }
  }, [selectedToken, selectedTokenBalance]);

  // Load wallet instance lazily (only when needed)
  const getWallet = useCallback(async () => {
    if (walletInstance) {
      return walletInstance;
    }

    const walletResult = await getWalletInstance();
    if (walletResult.success) {
      setWalletInstance(walletResult.data);
      return walletResult.data;
    } else {
      throw new Error(walletResult.error.userMessage);
    }
  }, [walletInstance]);

  // Handle MAX button press
  const handleMaxPress = useCallback(() => {
    if (selectedTokenBalance == null || selectedTokenBalance.trim() === '') {
      return;
    }

    // For both ETH and ERC20 tokens, just use the full available balance
    // Gas adjustment will happen during the actual send process
    let tokenAmount = selectedTokenBalance;

    if (selectedToken?.address == null) {
      // For ETH, use the exact balance as-is to maintain maximum precision
      // Only clean up obvious formatting issues but preserve precision
      try {
        // Remove any leading/trailing whitespace
        tokenAmount = tokenAmount.trim();

        // If it's a valid number, use it as-is (preserves all decimal places)
        const parsed = parseFloat(tokenAmount);
        if (Number.isNaN(parsed) || parsed <= 0) {
          tokenAmount = '0';
        }
        // Otherwise keep tokenAmount as-is to preserve precision
      } catch (error) {
        // Use as-is if parsing fails
      }
    } else {
      // For ERC20 tokens, use appropriate decimal precision with rounding down
      try {
        const tokenFloat = parseFloat(tokenAmount);
        const decimalPlaces = Math.min(8, selectedToken.decimals);
        // Use Math.floor to round down for ERC20
        const multiplier = 10 ** decimalPlaces;
        const roundedDown = Math.floor(tokenFloat * multiplier) / multiplier;
        tokenAmount = roundedDown.toFixed(decimalPlaces);

        // Remove trailing zeros for cleaner display
        tokenAmount = parseFloat(tokenAmount).toString();
      } catch (error) {
        // Use as-is if parsing fails
      }
    }

    setAmount(tokenAmount);
  }, [selectedToken, selectedTokenBalance]);

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
  const handleEstimateGas: EstimateGasCallback = useCallback(async (params: TransactionParams) => {    try {
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

      // Get provider for gas estimation
      const provider = await getProvider();
      const connectedWallet = wallet.connect(provider);

      // Use comprehensive gas estimation for accurate EIP-1559 costs
      let gasEstimationResult;
      if (selectedToken.address == null) {
        // ETH transfer - for MAX calculations, use a smaller amount for gas estimation
        // to avoid "insufficient balance" errors, then calculate the real max amount
        const estimationAmount = '0.001'; // Use small amount for gas estimation
        gasEstimationResult = await estimateETHTransferGas(connectedWallet, to, estimationAmount);
      } else {
        // ERC20 transfer
        gasEstimationResult = await estimateERC20TransferGas(
          connectedWallet,
          selectedToken.address,
          to,
          amt,
          selectedToken.decimals,
        );
      }

      if (gasEstimationResult.success) {
        const gasData = gasEstimationResult.data;

        return {
          success: true,
          gasEstimate: {
            gasLimit: gasData.gasLimit,
            gasPrice: gasData.maxFeePerGas, // Use maxFeePerGas for display
            estimatedCost: gasData.estimatedTotalCostETH, // Real maximum cost
          },
        };
      } else {
        return {
          success: false,
          error: gasEstimationResult.error.userMessage ?? gasEstimationResult.error.message,
          originalError: gasEstimationResult.error.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message ?? 'Unable to estimate gas costs.',
        originalError: error.message ?? String(error),
      };
    }
  }, [getWallet, selectedToken]);

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

      // Calculate the actual sendable amount (handles ETH gas adjustment automatically)
      const finalAmount = await calculateSendableAmount(amt, gasEstimate);

      const result = await transferToken(
        selectedToken,
        wallet.privateKey,
        ethers.utils.getAddress(to.toLowerCase()),
        finalAmount,
        selectedNetwork,
      );

      if (result.success) {
        return {
          success: true,
          txHash: result.data,
        };
      } else {
        return {
          success: false,
          error: result.error.userMessage ?? result.error.message,
          originalError: result.error.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message ?? 'An unexpected error occurred.',
        originalError: error.message ?? String(error),
      };
    }
  }, [getWallet, selectedToken, selectedNetwork, calculateSendableAmount]);

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
            availableBalance={selectedTokenBalance}
            onMaxPress={handleMaxPress}
            showMaxButton
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
