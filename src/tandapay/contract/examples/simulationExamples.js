/* flow */

/**
 * Example usage of TandaPay write method simulations
 * This demonstrates how to simulate transactions before executing them on-chain
 */

import { ethers } from 'ethers';
import getTandaPayWriter from '../write';
import getTandaPaySimulator from '../writeSim';

// Example usage function
export async function exampleSimulationUsage() {
  // Setup your provider and signer
  const provider = new ethers.providers.JsonRpcProvider('https://your-rpc-endpoint');
  const signer = new ethers.Wallet('your-private-key', provider);
  const contractAddress = '0x1234567890123456789012345678901234567890';

  // Method 1: Use the standalone simulator
  const simulator = getTandaPaySimulator(contractAddress, signer);

  try {
    // Simulate joining community before actually doing it
    const joinResult = await simulator.member.joinCommunity();

    if (joinResult.success) {
      // Join community simulation successful
      // Estimated gas: joinResult.gasEstimate
      // Result: joinResult.result

      // Now execute the actual transaction
      const writer = getTandaPayWriter(contractAddress, signer);
      const tx = await writer.member.joinCommunity();
      await tx.wait();
      // Transaction executed successfully
    } else {
      console.log('❌ Simulation failed:', joinResult.error);
      // Don't execute the transaction
    }
  } catch (error) {
    console.error('Error during simulation:', error);
  }

  // Method 2: Use writer with simulations included
  const writerWithSim = getTandaPayWriter(contractAddress, signer, { includeSimulations: true });

  try {
    // Simulate paying premium
    const payResult = await writerWithSim.simulations.member.payPremium(false);

    if (payResult.success) {
      console.log('✅ Pay premium simulation successful');
      console.log('📊 Estimated gas:', payResult.gasEstimate);

      // Execute actual transaction
      const tx = await writerWithSim.member.payPremium(false);
      await tx.wait();
      console.log('✅ Premium paid successfully');
    } else {
      console.log('❌ Payment simulation failed:', payResult.error);
    }
  } catch (error) {
    console.error('Error during payment simulation:', error);
  }
}

/**
 * Simulate multiple operations in batch
 */
export async function batchSimulationExample(contractAddress, signer) {
  const simulator = getTandaPaySimulator(contractAddress, signer);

  const operations = [
    { name: 'Join Community', fn: () => simulator.member.joinCommunity() },
    { name: 'Pay Premium', fn: () => simulator.member.payPremium(false) },
    { name: 'Submit Claim', fn: () => simulator.member.submitClaim() },
  ];

  const results = await Promise.allSettled(
    operations.map(async (op) => {
      const result = await op.fn();
      return { ...result, operationName: op.name };
    })
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { operationName, success, gasEstimate, error } = result.value;
      if (success) {
        console.log(`✅ ${operationName}: Success (Gas: ${gasEstimate})`);
      } else {
        console.log(`❌ ${operationName}: Failed - ${error}`);
      }
    } else {
      console.log(`💥 ${operations[index].name}: Exception - ${result.reason}`);
    }
  });

  return results;
}

/**
 * Simulate with custom gas price estimation
 */
export async function simulateWithGasPrice(contractAddress, signer, gasPriceGwei = 20) {
  const simulator = getTandaPaySimulator(contractAddress, signer);

  const result = await simulator.member.joinCommunity();

  if (result.success) {
    const gasPrice = ethers.utils.parseUnits(gasPriceGwei.toString(), 'gwei');
    const estimatedCost = gasPrice.mul(result.gasEstimate);

    console.log('Simulation Results:');
    console.log('📊 Gas Estimate:', result.gasEstimate);
    console.log('💰 Gas Price:', gasPriceGwei, 'gwei');
    console.log('💸 Estimated Cost:', ethers.utils.formatEther(estimatedCost), 'ETH');

    return {
      ...result,
      gasPrice: gasPriceGwei,
      estimatedCostWei: estimatedCost.toString(),
      estimatedCostEth: ethers.utils.formatEther(estimatedCost)
    };
  }

  return result;
}
