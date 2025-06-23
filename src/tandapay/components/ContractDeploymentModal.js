/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, Modal, ScrollView, ActivityIndicator } from 'react-native';

// $FlowFixMe[untyped-import] - ethers is a third-party library
import { ethers } from 'ethers';
import { useSelector, useDispatch } from '../../react-redux';
import { getTandaPaySelectedNetwork, getTandaPayContractAddresses } from '../redux/selectors';
import { getAvailableTokens } from '../tokens/tokenSelectors';
import { updateTandaPaySettings } from '../redux/actions';
import { createProvider } from '../providers/ProviderManager';
import { getWalletInstance } from '../wallet/WalletManager';
// $FlowFixMe[untyped-import] - TandaPay contract import
import { TandaPayInfo } from '../contract/TandaPay';
import TandaPayErrorHandler from '../errors/ErrorHandler';
import AddressInput from './AddressInput';
import TokenPicker from './TokenPicker';
import NumberInput from './NumberInput';
import ModalContainer from './ModalContainer';
import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import TandaPayStyles, { TandaPayColors, TandaPayTypography } from '../styles';
import type { Token } from '../tokens/tokenTypes';

type Props = $ReadOnly<{|
  visible: boolean,
  onClose: () => void,
  onDeploymentComplete?: (contractAddress: string) => void,
|}>;

const customStyles = {
  title: {
    ...TandaPayTypography.sectionTitle,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    ...TandaPayTypography.body,
    color: TandaPayColors.disabled,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...TandaPayTypography.label,
    marginBottom: 8,
  },
  disclaimer: {
    ...TandaPayTypography.caption,
    color: TandaPayColors.warning,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
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
};

export default function ContractDeploymentModal(props: Props): Node {
  const { visible, onClose, onDeploymentComplete } = props;

  const dispatch = useDispatch();
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

  const handleClose = useCallback(() => {
    if (!isDeploying && !isEstimating) {
      onClose();
    }
  }, [onClose, isDeploying, isEstimating]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ModalContainer onClose={handleClose}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <ZulipText style={customStyles.title}>
            Deploy TandaPay Contract
          </ZulipText>

          <ZulipText style={customStyles.description}>
            Deploy a new TandaPay contract for your community on
            {' '}
            {selectedNetwork}
            .
          </ZulipText>

          <ZulipText style={customStyles.disclaimer}>
            Warning: Contract deployment is permanent and cannot be undone.
            Make sure you have the correct token and secretary address.
          </ZulipText>

          <View style={customStyles.section}>
            <ZulipText style={customStyles.sectionTitle}>
              Token for Contract
            </ZulipText>
            <TokenPicker
              tokens={availableTokens}
              selectedToken={selectedToken}
              onTokenSelect={handleTokenSelect}
              placeholder="Select token for TandaPay contract"
              disabled={isDeploying || isEstimating}
            />
          </View>

          <View style={customStyles.section}>
            <AddressInput
              value={secretaryAddress}
              onChangeText={setSecretaryAddress}
              placeholder="0x..."
              label="Secretary Address"
              disabled={isDeploying || isEstimating}
              showQRButton
            />
          </View>

          <View style={customStyles.section}>
            <NumberInput
              value={customGasLimit}
              onChangeText={handleGasLimitChange}
              label="Gas Limit"
              placeholder="15000000"
              min={1000000}
              max={50000000}
              disabled={isDeploying || isEstimating}
            />
            <ZulipText style={customStyles.gasLimitHelper}>
              Default: 15M gas. Increase if deployment fails due to insufficient gas.
            </ZulipText>
          </View>

          {(errorMessage != null && errorMessage !== '') && (
            <ZulipText style={customStyles.errorText}>
              {errorMessage}
            </ZulipText>
          )}

          {(isEstimating || isDeploying) && (
            <View style={customStyles.loadingContainer}>
              <ActivityIndicator size="large" color={TandaPayColors.primary} />
              <ZulipText style={customStyles.loadingText}>
                {isEstimating ? 'Estimating deployment cost...' : 'Deploying contract...'}
              </ZulipText>
            </View>
          )}

          {(gasEstimate != null && gasEstimate !== '') && !isEstimating && (
            <View style={customStyles.estimateSection}>
              <ZulipText style={customStyles.estimateTitle}>
                Estimated Deployment Cost
              </ZulipText>
              <ZulipText style={customStyles.estimateValue}>
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
      </ModalContainer>
    </Modal>
  );
}
