// // expo-secure-store is used for secure storage/retrieval of the wallet
// import * as SecureStore from 'expo-secure-store';
// 
// import { mnemonicToAccount, english, generateMnemonic } from 'viem/accounts';
// 
// // key that will be used for k-v secure storage of the wallet
// const MNEMONIC_STORAGE_KEY = 'mnemonic';
// 
// /**
//  * Fetches the securely stored wallet phrase and returns a viem HDAccount if the phrase exists
//  * @returns A viem HDAccount if the key exists and was successfully retrieved, otherwise this returns null
//  */
// export async function getAccount() {
//   // securely access the wallet mnemonic from storage
//   const phrase = await SecureStore.getItemAsync(MNEMONIC_STORAGE_KEY, { requireAuthentication: true });
// 
//   // if it doesn't exist, just return null
//   if (!phrase) {
//     return null;
//   }
// 
//   // get an HDAccount with the given mnemonic
//   const account = mnemonicToAccount(phrase);
//   return account;
// }
// 
// /**
//  * Securely generates a mnemonic, then stores it securely with expo-secure-store, requiring user authentication.
//  * @returns {string} The mnemonic phrase that was securely generated and stored using expo-secure-store
//  */
// export async function createSecurelyStoredMnemonic() {
//   // viem can securely generate mnemonics; this is a wrapper around @scure/bip39's generateMnemonic.
//   // https://github.com/wevm/viem/blob/71c424e217ffeca4b2d055619916eaf880deb868/src/accounts/generateMnemonic.ts#L2
//   const phrase = generateMnemonic(english);
// 
//   // store the mnemonic
//   await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, phrase, { requireAuthentication: true });
// 
//   // return the phrase, perhaps to be revealed to the user
//   return phrase;
// }
// 
// /**
//  * If there is a mnemonic that is securely stored, this method will delete it.
//  */
// export async function deleteSecurelyStoredMnemonic() {
//   // delete the wallet
//   await SecureStore.deleteItemAsync(MNEMONIC_STORAGE_KEY);
// }
// 