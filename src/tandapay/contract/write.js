/* flow */

import { ethers } from 'ethers';
import { TandaPayInfo } from './TandaPay';

/**
 * create a TandaPay contract writer, a thin wrapper around tandapay write methods.
 * All of the methods returned will simulate the transaction to catch errors before writing
 * to the blockchain.
 * @param contractAddress The address of the TandaPay contract
 * @param signer An ethers.js Signer instance
 * @returns returns an object with all the TandaPay contract write methods
 */
export default function getTandaPayWriter(contractAddress, signer) {
  if (!ethers.utils.isAddress(contractAddress)) {
    throw new Error('Invalid TandaPay contract address');
  }
  if (ethers.Signer.isSigner(signer)) {
    throw new Error('Invalid signer provided');
  }
  // this one shouldn't happen but will catch a programming mistake
  if (!TandaPayInfo.abi || !Array.isArray(TandaPayInfo.abi)) {
    throw new Error('Invalid TandaPay ABI');
  }

  // console.log all the methods in the TandaPay contract
  // eslint-disable-next-line no-console
  console.log('TandaPay contract methods:', TandaPayInfo.abi.map((item) => item.name).filter((name) => name));

  const contract = new ethers.Contract(
    contractAddress,
    TandaPayInfo.abi,
    signer,
  );

  // test that each method on the ABI exists on the ethersjs contract
  TandaPayInfo.abi.forEach((item) => {
    if (item.type === 'function' && !contract[item.name]) {
      console.log(`Warning: TandaPay contract method ${item.name} does not exist on the ethers.js contract instance.`);
    } else {
      console.log(`TandaPay contract method ${item.name} exists.`);
    }
  });

  return contract;
}
