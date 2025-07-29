/* @flow strict-local */

import React, { useState, useCallback, useContext, useEffect } from 'react';
import type { Node } from 'react';
import { View, Modal, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';

// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';
import { useSelector, useDispatch } from '../../react-redux';
import { getTandaPaySelectedNetwork, getTandaPayContractAddresses } from '../redux/selectors';
import { getAvailableTokens } from '../tokens/tokenSelectors';
import { updateTandaPaySettings } from '../redux/actions';
import { createProviderWithState } from '../providers/ProviderManager';
import { getWalletInstance } from '../wallet/WalletManager';
import { estimateContractDeploymentGas } from '../web3';
// $FlowFixMe[untyped-import] - TandaPay contract import
import { TandaPayInfo } from '../contract/utils/TandaPay';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import AddressInput from './AddressInput';
import TokenPicker from './TokenPicker';
import NumberInput from './NumberInput';
import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import { ThemeContext } from '../../styles';
import TandaPayStyles, { TandaPayColors, TandaPayTypography } from '../styles';
import CloseButton from './CloseButton';
import type { Token } from '../tokens/tokenTypes';
import Card from './Card';

type Props = $ReadOnly<{|
  visible: boolean,
  onClose: () => void,
  onDeploymentComplete?: (contractAddress: string) => void,
|}>;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: TandaPayColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  disclaimer: {
    ...TandaPayTypography.caption,
    color: TandaPayColors.warning,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...TandaPayTypography.label,
    marginBottom: 8,
  },
  errorText: {
    ...TandaPayTypography.body,
    color: TandaPayColors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingText: {
    ...TandaPayTypography.body,
    marginTop: 8,
  },
  gasLimitHelper: {
    ...TandaPayTypography.caption,
    color: TandaPayColors.disabled,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

/**
 * A modal component for deploying TandaPay smart contracts to blockchain networks.
 * Provides UI for contract deployment with parameter configuration and deployment tracking.
 */
export default function ContractDeploymentModal(props: Props): Node {
  const { visible, onClose, onDeploymentComplete } = props;

  const dispatch = useDispatch();
  const themeData = useContext(ThemeContext);
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const contractAddresses = useSelector(getTandaPayContractAddresses);
  const availableTokens = useSelector(getAvailableTokens);
  // Get full Redux state for provider creation with custom networks
  const perAccountState = useSelector((state) => state);

  const [selectedToken, setSelectedToken] = useState<?Token>(null);
  const [secretaryAddress, setSecretaryAddress] = useState('');
  const [customGasLimit, setCustomGasLimit] = useState(''); // Empty by default, uses estimation
  const [isEstimating, setIsEstimating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<?{|
    gasLimit: string,
    gasPrice: string,
    totalCost: string,
    isEIP1559: boolean,
    maxPriorityFeePerGas: string,
    baseFeePerGas: ?string,
  |}>(null);
  const [errorMessage, setErrorMessage] = useState<?string>(null);

  // Reset state when modal becomes visible to ensure clean form
  useEffect(() => {
    if (visible) {
      setSelectedToken(null);
      setSecretaryAddress('');
      setCustomGasLimit(''); // Reset to empty (uses estimation)
      setGasEstimate(null);
      setErrorMessage(null);
      setIsEstimating(false);
      setIsDeploying(false);
    }
  }, [visible]);

  // Validation
  const isValidSecretaryAddress = secretaryAddress.trim() === '' || /^0x[a-fA-F0-9]{40}$/.test(secretaryAddress.trim());
  const isValidGasLimit = customGasLimit.trim() === '' || (customGasLimit.trim() !== '' && parseInt(customGasLimit, 10) >= 1000000); // Empty is valid (uses estimation), or at least 1M gas
  const canEstimate = selectedToken != null
    && secretaryAddress.trim() !== ''
    && isValidSecretaryAddress
    && isValidGasLimit;
  const canDeploy = canEstimate && gasEstimate != null;

  const handleClose = useCallback(() => {
    if (!isDeploying && !isEstimating) {
      // Reset all state when closing the modal
      setSelectedToken(null);
      setSecretaryAddress('');
      setCustomGasLimit(''); // Reset to empty (uses estimation)
      setGasEstimate(null);
      setErrorMessage(null);
      setIsEstimating(false);
      setIsDeploying(false);

      onClose();
    }
  }, [onClose, isDeploying, isEstimating]);

  const handleTokenSelect = useCallback((token: Token) => {
    setSelectedToken(token);
    setGasEstimate(null);
    setErrorMessage(null);
  }, []);

  const handleGasLimitChange = useCallback((gasLimit: string) => {
    setCustomGasLimit(gasLimit);
    setGasEstimate(null); // Reset estimate when gas limit changes
    setErrorMessage(null);
  }, []);

  const handleEstimateGas = useCallback(async () => {
    if (!selectedToken || !secretaryAddress.trim()) {
      return;
    }

    setIsEstimating(true);
    setErrorMessage(null);

    // Wrap the entire estimation process with error handling
    const estimationResult = await TandaPayErrorHandler.withErrorHandling(
      async () => {
        // Create provider with automatic custom network support
        const providerResult = await createProviderWithState(selectedNetwork, perAccountState);
        if (!providerResult.success) {
          throw new Error(providerResult.error.userMessage ?? 'Failed to connect to network');
        }

        const provider = providerResult.data;

        // Get wallet instance
        const walletResult = await getWalletInstance(provider);
        if (!walletResult.success) {
          throw new Error(walletResult.error.userMessage ?? 'Failed to connect wallet');
        }

        const signer = walletResult.data;

        // Create contract factory
        const factory = new ethers.ContractFactory(
          TandaPayInfo.abi,
          TandaPayInfo.bytecode.object,
          signer
        );

        // Get token address (use zero address for native token)
        const tokenAddress = (selectedToken.address != null && selectedToken.address !== '')
          ? selectedToken.address
          : ethers.constants.AddressZero;

        // Use our EIP-1559 aware gas estimation
        const gasEstimationResult = await estimateContractDeploymentGas(
          signer,
          factory,
          [tokenAddress, secretaryAddress.trim()]
        );

        if (!gasEstimationResult.success) {
          throw new Error(gasEstimationResult.error.userMessage ?? 'Gas estimation failed');
        }

        const gasData = gasEstimationResult.data;

        return {
          gasLimit: gasData.gasLimit,
          gasPrice: gasData.maxFeePerGas, // Use maxFeePerGas for display
          totalCost: gasData.estimatedTotalCostETH,
          isEIP1559: gasData.isEIP1559,
          maxPriorityFeePerGas: gasData.maxPriorityFeePerGas,
          baseFeePerGas: gasData.baseFeePerGas,
        };
      },
      'CONTRACT_ERROR'
    );

    setIsEstimating(false);

    if (estimationResult.success) {
      setGasEstimate(estimationResult.data);
    } else {
      setErrorMessage(estimationResult.error.userMessage ?? 'Failed to estimate gas costs');
    }
  }, [selectedToken, secretaryAddress, selectedNetwork, perAccountState]);

  const handleDeploy = useCallback(async () => {
    if (!selectedToken || !secretaryAddress.trim()) {
      return;
    }

    setIsDeploying(true);
    setErrorMessage(null);

    // Wrap the entire deployment process with error handling
    const deploymentResult = await TandaPayErrorHandler.withErrorHandling(
      async () => {
        // Create provider with automatic custom network support
        const providerResult = await createProviderWithState(selectedNetwork, perAccountState);
        if (!providerResult.success) {
          throw new Error(providerResult.error.userMessage ?? 'Failed to connect to network');
        }

        const provider = providerResult.data;

        // Get wallet instance
        const walletResult = await getWalletInstance(provider);
        if (!walletResult.success) {
          throw new Error(walletResult.error.userMessage ?? 'Failed to connect wallet');
        }

        const signer = walletResult.data;

        // Create contract factory
        const factory = new ethers.ContractFactory(
          TandaPayInfo.abi,
          TandaPayInfo.bytecode.object,
          signer
        );        // Get token address (use zero address for native token)
        const tokenAddress = (selectedToken.address != null && selectedToken.address !== '')
          ? selectedToken.address
          : ethers.constants.AddressZero;

        // Use the estimated gas limit from gasEstimate, or custom if provided
        if (!gasEstimate) {
          throw new Error('Gas estimate is required for deployment');
        }

        const gasLimitToUse = customGasLimit.trim() !== ''
          ? ethers.BigNumber.from(customGasLimit)
          : ethers.BigNumber.from(gasEstimate.gasLimit);

        // Deploy contract with proper EIP-1559 parameters
        // $FlowFixMe[unclear-type] - ethers.js transaction options
        const deployOptions: any = {
          gasLimit: gasLimitToUse,
        };

        // Add EIP-1559 parameters if available
        if (gasEstimate.isEIP1559) {
          deployOptions.maxFeePerGas = ethers.utils.parseUnits(gasEstimate.gasPrice, 'gwei');
          deployOptions.maxPriorityFeePerGas = ethers.utils.parseUnits(gasEstimate.maxPriorityFeePerGas, 'gwei');
        } else {
          // Legacy network
          deployOptions.gasPrice = ethers.utils.parseUnits(gasEstimate.gasPrice, 'gwei');
        }

        const contract = await factory.deploy(tokenAddress, secretaryAddress.trim(), deployOptions);

        await contract.deployed();
        return {
          contractAddress: contract.address,
          txHash: contract.deployTransaction.hash,
        };
      },
      'CONTRACT_ERROR',
      'Failed to deploy contract. This may be due to insufficient gas, network congestion, or invalid parameters.',
      'CONTRACT_DEPLOYMENT_FAILED'
    );

    setIsDeploying(false);

    if (deploymentResult.success) {
      const { contractAddress } = deploymentResult.data;

      // Update Redux state with new contract address
      const newContractAddresses = { ...contractAddresses };
      if (selectedNetwork === 'mainnet') {
        newContractAddresses.mainnet = contractAddress;
      } else if (selectedNetwork === 'sepolia') {
        newContractAddresses.sepolia = contractAddress;
      } else if (selectedNetwork === 'arbitrum') {
        newContractAddresses.arbitrum = contractAddress;
      } else if (selectedNetwork === 'polygon') {
        newContractAddresses.polygon = contractAddress;
      }

      dispatch(updateTandaPaySettings({
        contractAddresses: newContractAddresses,
      }));

      // Notify parent component
      if (onDeploymentComplete) {
        onDeploymentComplete(contractAddress);
      }

      onClose();
    } else {
      // Show user-friendly error alert
      TandaPayErrorHandler.handleError(deploymentResult.error, true);
      setErrorMessage(deploymentResult.error.userMessage ?? 'Contract deployment failed');
    }
  }, [selectedToken, secretaryAddress, selectedNetwork, customGasLimit, gasEstimate, contractAddresses, dispatch, onDeploymentComplete, onClose, perAccountState]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Card style={styles.modalCard}>
          <View style={[styles.header, { borderBottomColor: themeData.dividerColor }]}>
            <ZulipText style={[styles.title, { color: themeData.color }]}>
              Deploy TandaPay Contract
            </ZulipText>
            <CloseButton onPress={handleClose} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <ZulipText style={[styles.description, { color: themeData.color }]}>
              Deploy a new TandaPay contract for your community on
              {' '}
              {selectedNetwork}
              .
            </ZulipText>

            <ZulipText style={styles.disclaimer}>
              Warning: Contract deployment is permanent and cannot be undone.
              Make sure you have the correct token and secretary address.
            </ZulipText>

            <View style={styles.section}>
              <ZulipText style={styles.sectionTitle}>
                Token for Contract
              </ZulipText>
              <TokenPicker
                // $FlowFixMe[prop-missing] -- this will work with TokenWithBalance because that type is just Token but with balance info
                tokens={availableTokens}
                selectedToken={selectedToken}
                onTokenSelect={handleTokenSelect}
                placeholder="Select ERC20 token for TandaPay contract"
                disabled={isDeploying || isEstimating}
                erc20Only
              />
            </View>

            <View style={styles.section}>
              <AddressInput
                value={secretaryAddress}
                onChangeText={setSecretaryAddress}
                placeholder="0x..."
                label="Secretary Address"
                disabled={isDeploying || isEstimating}
                showQRButton
              />
            </View>

            <View style={styles.section}>
              <NumberInput
                value={customGasLimit}
                onChangeText={handleGasLimitChange}
                label="Gas Limit (Optional)"
                placeholder="Leave empty to use estimated gas"
                min={1000000}
                max={50000000}
                disabled={isDeploying || isEstimating}
              />
              <ZulipText style={styles.gasLimitHelper}>
                Leave empty to use the estimated gas limit. Only set manually if deployment fails.
              </ZulipText>
            </View>

            {(errorMessage != null && errorMessage !== '') && (
              <ZulipText style={styles.errorText}>
                {errorMessage}
              </ZulipText>
            )}

            {(isEstimating || isDeploying) && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={TandaPayColors.primary} />
                <ZulipText style={styles.loadingText}>
                  {isEstimating ? 'Estimating deployment cost...' : 'Deploying contract...'}
                </ZulipText>
              </View>
            )}

            {gasEstimate != null && !isEstimating && (
              <Card style={{ marginBottom: 16, marginTop: 16 }}>
                <ZulipText style={styles.sectionTitle}>
                  Gas Estimate
                </ZulipText>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <ZulipText style={{ fontWeight: 'bold' }}>Gas Limit:</ZulipText>
                  <ZulipText>
                    {gasEstimate.gasLimit}
                    {' '}
                    units
                  </ZulipText>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <ZulipText style={{ fontWeight: 'bold' }}>
                    {gasEstimate.isEIP1559 ? 'Max Fee:' : 'Gas Price:'}
                  </ZulipText>
                  <ZulipText>
                    {gasEstimate.gasPrice}
                    {' '}
                    gwei
                  </ZulipText>
                </View>

                {gasEstimate.isEIP1559 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <ZulipText style={{ fontWeight: 'bold' }}>Priority Fee:</ZulipText>
                    <ZulipText>
                      {gasEstimate.maxPriorityFeePerGas}
                      {' '}
                      gwei
                    </ZulipText>
                  </View>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <ZulipText style={{ fontWeight: 'bold' }}>Estimated Cost:</ZulipText>
                  <ZulipText>
                    {gasEstimate.totalCost}
                    {' '}
                    ETH
                  </ZulipText>
                </View>
              </Card>
            )}

            <View style={TandaPayStyles.buttonRow}>
              <ZulipButton
                style={TandaPayStyles.button}
                text="Estimate Cost"
                onPress={handleEstimateGas}
                disabled={!canEstimate || isEstimating || isDeploying}
              />

              <ZulipButton
                style={TandaPayStyles.button}
                text={isDeploying ? 'Deploying...' : 'Deploy Contract'}
                onPress={handleDeploy}
                disabled={!canDeploy || isDeploying || isEstimating}
              />
            </View>

            <View style={TandaPayStyles.buttonRow}>
              <ZulipButton
                style={TandaPayStyles.button}
                text="Cancel"
                onPress={handleClose}
                disabled={isDeploying || isEstimating}
              />
            </View>
          </ScrollView>
        </Card>
      </View>
    </Modal>
  );
}
