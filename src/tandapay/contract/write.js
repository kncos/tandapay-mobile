/* flow */

import { ethers } from 'ethers';
import { TandaPayInfo } from './TandaPay';
import { getAllWriteTransactions } from './writeTransactionObjects';

/**
 * Get all write methods organized by access level with full transaction metadata
 * @param client An ethers.js Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns An object with public, member, and secretary write methods with metadata
 */
export function getWriteMethods(client, contractAddress) {
  const contract = new ethers.Contract(contractAddress, TandaPayInfo.abi, client);

  const publicWriteMethods = {};
  const memberWriteMethods = {};
  const secretaryWriteMethods = {};

  // Get all standardized write transactions
  const allTransactions = getAllWriteTransactions();

  allTransactions.forEach((transaction) => {
    const { functionName, writeFunction, simulateFunction, role } = transaction;

    // Create bound write method with full metadata
    const boundWriteMethod = (...args) => writeFunction(contract, ...args);
    boundWriteMethod.meta = {
      displayName: transaction.displayName,
      description: transaction.description,
      role: transaction.role,
      requiresParams: transaction.requiresParams,
      icon: transaction.icon,
    };

    // Create bound simulation method
    const boundSimulateMethod = (...args) => simulateFunction(contract, ...args);

    // Add simulation method to write method
    boundWriteMethod.simulate = boundSimulateMethod;

    // Organize by role
    switch (role) {
      case 'public':
        publicWriteMethods[functionName] = boundWriteMethod;
        break;
      case 'member':
        memberWriteMethods[functionName] = boundWriteMethod;
        break;
      case 'secretary':
        secretaryWriteMethods[functionName] = boundWriteMethod;
        break;
    }
  });

  return {
    public: publicWriteMethods,
    member: memberWriteMethods,
    secretary: secretaryWriteMethods,
  };
}

/**
 * Get all write methods as a flat array with metadata for UI purposes
 * @param client An ethers.js Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns Array of all write methods with metadata
 */
export function getAllWriteMethodsWithMetadata(client, contractAddress) {
  const writeMethods = getWriteMethods(client, contractAddress);
  const allMethods = [];

  // Flatten all methods from all roles
  Object.keys(writeMethods).forEach(role => {
    Object.keys(writeMethods[role]).forEach(methodName => {
      const method = writeMethods[role][methodName];
      if (method.meta) {
        allMethods.push({
          functionName: methodName,
          method,
          ...method.meta,
        });
      }
    });
  });

  return allMethods;
}

/**
 * Create a TandaPay contract writer with integrated simulations and full metadata.
 * Each write method includes:
 * - Full transaction metadata (displayName, description, role, requiresParams, icon)
 * - Integrated simulation method accessible via writeMethod.simulate()
 * - Consistent error handling and parameter validation
 *
 * @param contractAddress The address of the TandaPay contract
 * @param signer An ethers.js Signer instance
 * @returns An object with all TandaPay contract write methods organized by access level
 */
export default function getTandaPayWriter(contractAddress, signer) {
  if (!ethers.utils.isAddress(contractAddress)) {
    throw new Error('Invalid TandaPay contract address');
  }
  if (!ethers.Signer.isSigner(signer)) {
    throw new Error('Invalid signer provided');
  }
  if (!TandaPayInfo.abi || !Array.isArray(TandaPayInfo.abi)) {
    throw new Error('Invalid TandaPay ABI');
  }

  return getWriteMethods(signer, contractAddress);
}
