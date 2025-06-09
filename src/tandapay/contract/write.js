/* flow */

import { ethers } from 'ethers';
import { TandaPayInfo } from './TandaPay';
import { getWriteSimulations } from './writeSim';
import * as allTransactions from './writeTransactions';

/**
 * Get all write methods organized by access level with preserved metadata
 * @param client An ethers.js Signer instance
 * @param contractAddress The address of the TandaPay contract
 * @returns An object with public, member, and secretary write methods with metadata
 */
export function getWriteMethods(client, contractAddress) {
  const contract = new ethers.Contract(contractAddress, TandaPayInfo.abi, client);

  const publicWriteMethods = {};
  const memberWriteMethods = {};
  const secretaryWriteMethods = {};

  // Get all transactions with metadata
  const allTransactionsList = allTransactions.getAllWriteTransactions();

  allTransactionsList.forEach((transaction) => {
    const { functionName, func, role } = transaction;

    // Create bound method with preserved metadata
    const boundMethod = (...args) => func(contract, ...args);
    boundMethod.meta = {
      displayName: transaction.displayName,
      description: transaction.description,
      role: transaction.role,
      requiresParams: transaction.requiresParams,
    };

    // Organize by role
    switch (role) {
      case 'public':
        publicWriteMethods[functionName] = boundMethod;
        break;
      case 'member':
        memberWriteMethods[functionName] = boundMethod;
        break;
      case 'secretary':
        secretaryWriteMethods[functionName] = boundMethod;
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
 * create a TandaPay contract writer, a thin wrapper around tandapay write methods.
 * All of the methods returned will simulate the transaction to catch errors before writing
 * to the blockchain.
 * @param contractAddress The address of the TandaPay contract
 * @param signer An ethers.js Signer instance
 * @param options Configuration options
 * @param options.includeSimulations Whether to include simulation methods (default: false)
 * @returns returns an object with all the TandaPay contract write methods organized by access level
 */
export default function getTandaPayWriter(contractAddress, signer, options = {}) {
  if (!ethers.utils.isAddress(contractAddress)) {
    throw new Error('Invalid TandaPay contract address');
  }
  if (!ethers.Signer.isSigner(signer)) {
    throw new Error('Invalid signer provided');
  }
  // this one shouldn't happen but will catch a programming mistake
  if (!TandaPayInfo.abi || !Array.isArray(TandaPayInfo.abi)) {
    throw new Error('Invalid TandaPay ABI');
  }

  const writeMethods = getWriteMethods(signer, contractAddress);

  // Optionally include simulation methods
  if (options.includeSimulations) {
    const simulations = getWriteSimulations(signer, contractAddress);
    return {
      ...writeMethods,
      simulations
    };
  }

  return writeMethods;
}
