/* @flow strict-local */

import React, { useState, useCallback, useContext, useMemo } from 'react';
import type { Node } from 'react';
import { View, StyleSheet } from 'react-native';

// $FlowFixMe[untyped-import] - @react-native-picker/picker is a third-party library
import { Picker } from '@react-native-picker/picker';

// $FlowFixMe[untyped-import] - ethers.js imports
import { ethers } from 'ethers';

import { useSelector } from '../../react-redux';
import { getAvailableTokens } from '../tokens/tokenSelectors';
import { getTandaPaySelectedNetwork, getTandaPayContractAddressForNetwork } from '../redux/selectors';
import { getWalletInstance } from '../wallet/WalletManager';
import { getProvider } from '../web3';
// $FlowFixMe[untyped-import] - Erc20Abi is untyped
import { Erc20Abi } from '../contract/utils/Erc20Abi';
import ZulipText from '../../common/ZulipText';
import ZulipTextButton from '../../common/ZulipTextButton';
import Input from '../../common/Input';
import Card from './Card';
import AmountInput from './AmountInput';
import TransactionEstimateAndSend from './TransactionEstimateAndSend';
import type { EstimateGasCallback, SendTransactionCallback, TransactionParams, GasEstimate } from './TransactionEstimateAndSend';
import { ThemeContext } from '../../styles';
import { TandaPayColors, TandaPayTypography } from '../styles';

import type { TokenWithBalance } from '../tokens/tokenTypes';

type Props = $ReadOnly<{|
  disabled?: boolean,
|}>;

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    ...TandaPayTypography.sectionTitle,
    marginBottom: 8,
  },
  description: {
    ...TandaPayTypography.body,
    color: TandaPayColors.disabled,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...TandaPayTypography.label,
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  pickerCard: {
    alignSelf: 'stretch',
    width: '100%',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: TandaPayColors.primaryHighlight,
  },
  picker: {
    height: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  amountInputWrapper: {
    flex: 1,
    marginRight: 8,
  },
});

/**
 * A component for manually managing ERC20 token approvals.
 * Allows users to approve, revoke, or modify spending allowances for ERC20 tokens.
 */
export default function ManualErc20Approval(props: Props): Node {
  const { disabled = false } = props;

  const themeData = useContext(ThemeContext);
  const availableTokens = useSelector(getAvailableTokens);
  const erc20Tokens = availableTokens.filter(token => token.address != null && token.address !== '');
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const defaultSpender = useSelector(state => getTandaPayContractAddressForNetwork(state, selectedNetwork));

  const [selectedToken, setSelectedToken] = useState<TokenWithBalance | null>(null);
  const [spenderAddress, setSpenderAddress] = useState<string>(defaultSpender || '');
  const [amount, setAmount] = useState<string>('');

  const handleTokenSelect = useCallback((token: TokenWithBalance) => {
    setSelectedToken(token);
  }, []);

  const handleMaxPress = useCallback(() => {
    if (selectedToken) {
      // Set to MaxUint256 for infinite approval using ethers constant
      setAmount(ethers.constants.MaxUint256.toString());
    }
  }, [selectedToken]);

  // Prepare transaction parameters for TransactionEstimateAndSend
  const transactionParams = useMemo(() => ({
    tokenAddress: selectedToken?.address || '',
    spenderAddress: spenderAddress.trim(),
    amount,
    tokenDecimals: selectedToken?.decimals || 18,
  }), [selectedToken, spenderAddress, amount]);

  // Gas estimation callback for ERC20 approval
  const handleEstimateGas: EstimateGasCallback = useCallback(async (params: TransactionParams) => {
    const { tokenAddress, spenderAddress: spender, amount: approvalAmount, tokenDecimals } = params;

    if (
      tokenAddress == null || tokenAddress === ''
      || spender == null || spender === ''
      || approvalAmount == null || approvalAmount === ''
    ) {
      return {
        success: false,
        error: 'Missing required parameters for gas estimation',
      };
    }

    try {
      // Get provider and wallet instance
      const provider = await getProvider();
      const walletResult = await getWalletInstance(provider);

      if (!walletResult.success) {
        return {
          success: false,
          error: (walletResult.error != null && walletResult.error.userMessage != null && walletResult.error.userMessage !== '')
            ? walletResult.error.userMessage
            : 'Failed to get wallet instance',
        };
      }

      const signer = walletResult.data;      // Create ERC20 contract instance
      const tokenContract = new ethers.Contract(tokenAddress, Erc20Abi, signer);

      // Parse the amount to proper BigNumber format
      // Handle MaxUint256 special case to avoid parseUnits precision issues
      let amountBN;
      if (approvalAmount === ethers.constants.MaxUint256.toString()) {
        amountBN = ethers.constants.MaxUint256;
      } else {
        amountBN = ethers.utils.parseUnits(approvalAmount, tokenDecimals);
      }

      // Estimate gas for the approval transaction
      const gasLimit = await tokenContract.estimateGas.approve(spender, amountBN);

      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.utils.parseUnits('20', 'gwei');

      // Calculate estimated cost
      const estimatedCost = gasLimit.mul(gasPrice);
      const estimatedCostETH = ethers.utils.formatEther(estimatedCost);

      return {
        success: true,
        gasEstimate: {
          gasLimit: gasLimit.toString(),
          gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
          estimatedCost: estimatedCostETH,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to estimate gas for approval',
      };
    }
  }, []);

  // Transaction sending callback for ERC20 approval
  const handleSendTransaction: SendTransactionCallback = useCallback(async (params: TransactionParams, gasEstimate: GasEstimate) => {
    const { tokenAddress, spenderAddress: spender, amount: approvalAmount, tokenDecimals } = params;

    try {
      // Get provider and wallet instance
      const provider = await getProvider();
      const walletResult = await getWalletInstance(provider);

      if (!walletResult.success) {
        return {
          success: false,
          error: (walletResult.error != null && walletResult.error.userMessage != null && walletResult.error.userMessage !== '')
            ? walletResult.error.userMessage
            : 'Failed to get wallet instance',
        };
      }

      const signer = walletResult.data;      // Create ERC20 contract instance
      const tokenContract = new ethers.Contract(tokenAddress, Erc20Abi, signer);

      // Parse the amount to proper BigNumber format
      // Handle MaxUint256 special case to avoid parseUnits precision issues
      let amountBN;
      if (approvalAmount === ethers.constants.MaxUint256.toString()) {
        amountBN = ethers.constants.MaxUint256;
      } else {
        amountBN = ethers.utils.parseUnits(approvalAmount, tokenDecimals);
      }

      // Send the approval transaction
      const tx = await tokenContract.approve(spender, amountBN, {
        gasLimit: gasEstimate.gasLimit,
        gasPrice: ethers.utils.parseUnits(gasEstimate.gasPrice, 'gwei'),
      });

      return {
        success: true,
        txHash: tx.hash,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send approval transaction',
      };
    }
  }, []);

  // Form validation
  const isFormValid = Boolean(selectedToken && spenderAddress && amount && !disabled);

  // Success callback - reset form after successful approval
  const handleTransactionSuccess = useCallback((txHash: string) => {
    setAmount('');
  }, []);

  return (
    <Card style={styles.card}>
      <ZulipText style={styles.title}>Manual ERC20 Approval</ZulipText>
      <ZulipText style={styles.description}>
        Manually approve ERC20 token spending for any contract address. Use this to pre-approve tokens for TandaPay operations or other contracts.
      </ZulipText>

      <View style={styles.inputGroup}>
        <ZulipText style={styles.label}>Token</ZulipText>
        <View style={styles.pickerContainer}>
          <Card
            style={styles.pickerCard}
            borderRadius={16}
            padding={2}
          >
            <Picker
              enabled={!disabled}
              selectedValue={selectedToken?.symbol || ''}
              style={styles.picker}
              mode="dropdown"
              onValueChange={(symbol) => {
                if (symbol === '') {
                  // Placeholder selected, clear selection
                  setSelectedToken(null);
                } else {
                  const token = erc20Tokens.find(t => t.symbol === symbol);
                  if (token) {
                    handleTokenSelect(token);
                  }
                }
              }}
            >
              <Picker.Item
                key="placeholder"
                label="Select ERC20 token"
                value=""
                style={{ color: themeData.color, backgroundColor: themeData.cardColor }}
              />
              {erc20Tokens.map(token => (
                <Picker.Item
                  key={token.symbol}
                  label={`${token.symbol} (${token.name})`}
                  value={token.symbol}
                  style={{ color: themeData.color, backgroundColor: themeData.cardColor }}
                />
              ))}
            </Picker>
          </Card>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ZulipText style={styles.label}>Spender Address</ZulipText>
        <Input
          value={spenderAddress}
          onChangeText={setSpenderAddress}
          placeholder="0x..."
          editable={!disabled}
        />
      </View>

      <View style={styles.inputGroup}>
        <ZulipText style={styles.label}>Amount to Approve</ZulipText>
        <View style={styles.buttonRow}>
          <View style={styles.amountInputWrapper}>
            <AmountInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.0"
              tokenSymbol={selectedToken?.symbol || ''}
              tokenDecimals={selectedToken?.decimals || 18}
              disabled={disabled}
            />
          </View>
          {selectedToken && !disabled && (
            <ZulipTextButton
              label="MAX"
              onPress={handleMaxPress}
            />
          )}
        </View>
      </View>

      {/* Transaction Estimate and Send Component */}
      <TransactionEstimateAndSend
        transactionParams={transactionParams}
        onEstimateGas={handleEstimateGas}
        onSendTransaction={handleSendTransaction}
        estimateButtonText="Estimate Gas"
        sendButtonText="Send Approval"
        transactionDescription="ERC20 approval"
        isFormValid={isFormValid}
        disabled={disabled}
        confirmationTitle="Confirm ERC20 Approval"
        getConfirmationMessage={(params, gasEstimate) =>
          `Are you sure you want to approve ${String(params.amount)} ${selectedToken?.symbol || 'tokens'} for ${String(params.spenderAddress)}?\n\nEstimated Gas: ${gasEstimate.gasLimit} units\nGas Price: ${gasEstimate.gasPrice} gwei\nEstimated Cost: ${gasEstimate.estimatedCost} ETH`
        }
        onTransactionSuccess={handleTransactionSuccess}
      />
    </Card>
  );
}
