/* @flow strict-local */

import React, { useState, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View, Modal, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';

// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';
import { useSelector, useDispatch } from '../../react-redux';
import { getTandaPaySelectedNetwork, getTandaPayContractAddresses } from '../redux/selectors';
import { getAvailableTokens } from '../tokens/tokenSelectors';
import { updateTandaPaySettings } from '../redux/actions';
import { createProvider } from '../providers/ProviderManager';
import { getWalletInstance } from '../wallet/WalletManager';
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
  estimateSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: TandaPayColors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TandaPayColors.subtle,
  },
  estimateTitle: {
    ...TandaPayTypography.label,
    marginBottom: 8,
  },
  estimateValue: {
    ...TandaPayTypography.body,
    fontWeight: 'bold',
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

export default function ContractDeploymentModal(props: Props): Node {
  const { visible, onClose, onDeploymentComplete } = props;

  const dispatch = useDispatch();
  const themeData = useContext(ThemeContext);
  const selectedNetwork = useSelector(getTandaPaySelectedNetwork);
  const contractAddresses = useSelector(getTandaPayContractAddresses);
  const availableTokens = useSelector(getAvailableTokens);

  const [selectedToken, setSelectedToken] = useState<?Token>(null);
  const [secretaryAddress, setSecretaryAddress] = useState('');
  const [customGasLimit, setCustomGasLimit] = useState('15000000'); // 15M default
  const [isEstimating, setIsEstimating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<?string>(null);
  const [errorMessage, setErrorMessage] = useState<?string>(null);

  // Validation
  const isValidSecretaryAddress = secretaryAddress.trim() === '' || /^0x[a-fA-F0-9]{40}$/.test(secretaryAddress.trim());
  const isValidGasLimit = customGasLimit.trim() !== '' && parseInt(customGasLimit, 10) >= 1000000; // At least 1M gas
  const canEstimate = selectedToken != null
    && secretaryAddress.trim() !== ''
    && isValidSecretaryAddress
    && isValidGasLimit
    && selectedNetwork !== 'custom';
  const canDeploy = canEstimate && gasEstimate != null;

  const handleClose = useCallback(() => {
    if (!isDeploying && !isEstimating) {
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
    if (!selectedToken || !secretaryAddress.trim() || selectedNetwork === 'custom') {
      return;
    }

    setIsEstimating(true);
    setErrorMessage(null);

    // Wrap the entire estimation process with error handling
    const estimationResult = await TandaPayErrorHandler.withErrorHandling(
      async () => {
        // Create provider
        const providerResult = await createProvider(selectedNetwork);
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

        // Create contract factory with error handling
        const factory = new ethers.ContractFactory(
          TandaPayInfo.abi,
          TandaPayInfo.bytecode.object,
          signer
        );

        // Get token address (use zero address for native token)
        const tokenAddress = (selectedToken.address != null && selectedToken.address !== '')
          ? selectedToken.address
          : ethers.constants.AddressZero;        // Create deployment transaction data
        const deployTransaction = factory.getDeployTransaction(tokenAddress, secretaryAddress.trim());

        // Use custom gas limit for estimation
        const userGasLimit = ethers.BigNumber.from(customGasLimit);

        // Validate that the custom gas limit is sufficient by estimating
        await signer.estimateGas({
          ...deployTransaction,
          gasLimit: userGasLimit,
        });

        // Get gas price
        // $FlowFixMe[incompatible-use] - provider.getGasPrice exists on ethers provider
        const gasPrice = await provider.getGasPrice();
        const totalCost = userGasLimit.mul(gasPrice);

        return {
          gasLimit: userGasLimit.toString(),
          gasPrice: gasPrice.toString(),
          totalCost: ethers.utils.formatEther(totalCost),
        };
      },
      'CONTRACT_ERROR',
      'Failed to estimate contract deployment cost. This may be due to high gas prices or network congestion.',
      'GAS_ESTIMATION_FAILED'
    );

    setIsEstimating(false);

    if (estimationResult.success) {
      const { totalCost, gasLimit } = estimationResult.data;
      setGasEstimate(`${totalCost} ETH (Gas: ${gasLimit})`);
    } else {
      // Show user-friendly error alert
      TandaPayErrorHandler.handleError(estimationResult.error, true);
      setErrorMessage(estimationResult.error.userMessage ?? 'Gas estimation failed');
    }
  }, [selectedToken, secretaryAddress, selectedNetwork, customGasLimit]);

  const handleDeploy = useCallback(async () => {
    if (!selectedToken || !secretaryAddress.trim() || selectedNetwork === 'custom') {
      return;
    }

    setIsDeploying(true);
    setErrorMessage(null);

    // Wrap the entire deployment process with error handling
    const deploymentResult = await TandaPayErrorHandler.withErrorHandling(
      async () => {
        // Create provider
        const providerResult = await createProvider(selectedNetwork);
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

        // Use the custom gas limit set by user
        const userGasLimit = ethers.BigNumber.from(customGasLimit);

        // Deploy contract with explicit gas limit
        const contract = await factory.deploy(tokenAddress, secretaryAddress.trim(), {
          gasLimit: userGasLimit,
        });

        // Wait for deployment
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
  }, [selectedToken, secretaryAddress, selectedNetwork, customGasLimit, contractAddresses, dispatch, onDeploymentComplete, onClose]);

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
                label="Gas Limit"
                placeholder="15000000"
                min={1000000}
                max={50000000}
                disabled={isDeploying || isEstimating}
              />
              <ZulipText style={styles.gasLimitHelper}>
                Default: 15M gas. Increase if deployment fails due to insufficient gas.
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

            {(gasEstimate != null && gasEstimate !== '') && !isEstimating && (
              <View style={styles.estimateSection}>
                <ZulipText style={styles.estimateTitle}>
                  Estimated Deployment Cost
                </ZulipText>
                <ZulipText style={styles.estimateValue}>
                  {gasEstimate}
                </ZulipText>
              </View>
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
