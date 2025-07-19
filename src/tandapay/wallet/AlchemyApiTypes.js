// @flow strict-local

/**
 * JSON-RPC request structure
 */
export type JsonRpcRequest = {|
  id: number | string,
  jsonrpc: '2.0',
  method: string,
  params: Array<mixed>,
|};

/**
 * JSON-RPC response structure
 */
export type JsonRpcResponse = {|
  id: number | string,
  jsonrpc: '2.0',
  result?: mixed,
  error?: {|
    code: number,
    message: string,
    data?: mixed,
  |},
|};

/**
 * Response for alchemy_getAssetTransfers API call.
 * Retrieved from https://www.alchemy.com/docs/reference/sdk-getassettransfers.
 * Verified on 2025-07-08
 */
export type Transfer = {
  category: 'external' | 'internal' | 'erc20' | 'erc721' | 'erc1155' | 'specialnft',
  blockNum: string | null,  // block number of the transfer (hex string)
  from: string | null,      // from address (hex string).
  to: string | null,        // to address (hex string). null if contract creation.
  value: number | null,     // asset transfer value. null if it's ERC721 or unknown decimals
  asset: string | null,     // ETH or the token's symbol, null if unavailable
  uniqueId: string | null,  // unique identifier for the transfer; will be a hash plus a suffix
  hash: string | null,      // transaction hash, null if unavailable
  rawContract: {|
    value: string | null,   // raw hex transfer value. null for NFT transfers
    address: string | null, // contract address, null for external or internal transfers
    decimal: string | null, // contract decimal in hex. null if not known
  |} | null,
  metadata: {|
    blockTimestamp: string | null, // timestamp of the block in ISO format, null if unavailable
  |} | null,

  // erc721TokenId -- omitted because we don't use it in this app
  // erc1155Metadata -- omitted because we don't use it in this app
  // tokenId: string | null -- for NFT tokens, we don't use it in this app
};

/**
 * Parameters for alchemy_getAssetTransfers API call.
 * Retrieved from https://www.alchemy.com/docs/reference/sdk-getassettransfers.
 * Verified on 2025-07-08
 */
export type AssetTransferParams = {|
  fromBlock?: string,                 // starting block to check for transfers (hex string). 0x0 if omitted
  toBlock?: string,                   // inclusive to block (hex string, int, or 'latest'). 'latest' if omitted
  order?: string,                     // whether to return results in ascending or descending order. Defaults to 'ascending' if omitted
  fromAddress?: string,               // from address to filter transfers. Defaults to a wildcard if omitted
  toAddress?: string,                 // to address to filter transfers. Defaults to a wildcard if omitted
  contractAddresses?: Array<string>,  // list of contract addresses to filter for. Only applies to erc20/erc721/erc1155 transfers. Defaults to all if omitted
  category: Array<string>,            // list of transfer categories to include. Options: 'external', 'internal', 'erc20', 'erc721', 'erc1155', 'specialnft'.
  excludeZeroValue?: boolean,         // whether to exclude transfers with zero value. Defaults to false if omitted
  pageKey?: string,                   // page key from previous response. `null` if omitted which retrieves 1st page. Otherwise, retrieves next page
  maxCount?: number,                  // maximum number of transfers to return per page. Defaults to `1000` if omitted.
  withMetadata?: boolean,             // whether to include metadata in the response. Defaults to true if omitted
|};

export type SignedLegacyTransaction = {|
  // The 'type' field is explicitly '0x0' for legacy transactions
  type: "0x0",
  // Hexadecimal string representing the transaction count of the sender
  nonce: string,
  // Hexadecimal string representing the maximum gas units the transaction can consume
  gas: string,
  // Hexadecimal string representing the value (in Wei) transferred with the transaction
  value: string,
  // Hexadecimal string representing the data (input) sent with the transaction.
  // For contract calls, this is the encoded function call data. For simple transfers, it's '0x'.
  input: string,
  // Hexadecimal string representing the gas price (in Wei) willing to be paid by the sender
  gasPrice: string,
  // Hexadecimal string representing the 'v' component of the transaction signature
  v: string,
  // Hexadecimal string representing the 'r' component of the transaction signature
  r: string,
  // Hexadecimal string representing the 's' component of the transaction signature
  s: string,
  // The hash of the block this transaction was included in, or null if pending
  blockHash: string | null,
  // The number of the block this transaction was included in, or null if pending
  blockNumber: string | null,
  // The address of the sender (from) of the transaction
  from: string | null,
  // The hash of the transaction
  hash: string | null,
  // The index of the transaction within the block, or null if pending
  transactionIndex: string | null,
  // The address of the receiver (to) of the transaction, or null for contract creation transactions
  to: string | null,
  // The chain ID this transaction is valid on, or null if not explicitly set (e.g., pre-EIP-155)
  chainId: string | null,
|};

export type Eip2930AccessListItem = {|
  // The address in the access list
  address: string,
  // List of storage keys for the address in the access list
  storageKeys: Array<string>,
|};

export type Signed1559Transaction = {|
  // The transaction type, explicitly "0x2" for EIP-1559
  type: "0x2",
  // Hexadecimal string representing the transaction count of the sender
  nonce: string,
  // Hexadecimal string representing the maximum gas units the transaction can consume
  gas: string,
  // Hexadecimal string representing the value (in Wei) transferred with the transaction
  value: string,
  // Hexadecimal string representing the data (input) sent with the transaction
  input: string,
  // Maximum fee per gas the sender is willing to pay to miners in wei (tip)
  maxPriorityFeePerGas: string,
  // The maximum total fee per gas the sender is willing to pay (includes network / base fee and miner / priority fee) in wei
  maxFeePerGas: string,
  // The effective gas price paid by the sender in wei. DEPRECATED for unincluded transactions, use in receipt object.
  gasPrice: string,
  // EIP-2930 access list (though typically empty for EIP-1559 unless combined)
  accessList: Array<Eip2930AccessListItem>,
  // Chain ID that this transaction is valid on
  chainId: string,
  // The parity (0 for even, 1 for odd) of the y-value of the secp256k1 signature
  yParity: string,
  // Hexadecimal string representing the 'r' component of the transaction signature
  r: string,
  // Hexadecimal string representing the 's' component of the transaction signature
  s: string,
  // The hash of the block this transaction was included in, or null if pending
  blockHash: string | null,
  // The number of the block this transaction was included in, or null if pending
  blockNumber: string | null,
  // The address of the sender (from) of the transaction
  from: string | null,
  // The hash of the transaction
  hash: string | null,
  // The index of the transaction within the block, or null if pending
  transactionIndex: string | null,
  // The address of the receiver (to) of the transaction, or null for contract creation
  to: string | null,
  // For backwards compatibility, v is optionally provided as an alternative to yParity.
  // This field is DEPRECATED and all use of it should migrate to yParity.
  v: string | null,
|};

export type Signed2930Transaction = {|
  // The transaction type, explicitly "0x1" for EIP-2930
  type: "0x1",
  // Hexadecimal string representing the transaction count of the sender
  nonce: string,
  // Hexadecimal string representing the maximum gas units the transaction can consume
  gas: string,
  // Hexadecimal string representing the value (in Wei) transferred with the transaction
  value: string,
  // Hexadecimal string representing the data (input) sent with the transaction
  input: string,
  // Hexadecimal string representing the gas price (in Wei) willing to be paid by the sender
  gasPrice: string,
  // EIP-2930 access list
  accessList: Array<Eip2930AccessListItem>,
  // Chain ID that this transaction is valid on
  chainId: string,
  // The parity (0 for even, 1 for odd) of the y-value of the secp256k1 signature
  yParity: string,
  // Hexadecimal string representing the 'r' component of the transaction signature
  r: string,
  // Hexadecimal string representing the 's' component of the transaction signature
  s: string,
  // The hash of the block this transaction was included in, or null if pending
  blockHash: string | null,
  // The number of the block this transaction was included in, or null if pending
  blockNumber: string | null,
  // The address of the sender (from) of the transaction
  from: string | null,
  // The hash of the transaction
  hash: string | null,
  // The index of the transaction within the block, or null if pending
  transactionIndex: string | null,
  // The address of the receiver (to) of the transaction, or null for contract creation
  to: string | null,
  // For backwards compatibility, v is optionally provided as an alternative to yParity.
  // This field is DEPRECATED and all use of it should migrate to yParity.
  v: string | null,
|};

export type Signed4844Transaction = {|
  // The transaction type, explicitly "0x3" for EIP-4844 (or potentially "0x03")
  type: string, // Regex suggests "0x(0-9a-f){1,2}" which is usually "0x3" or "0x03" for 4844
  // Hexadecimal string representing the transaction count of the sender
  nonce: string,
  // The address of the receiver (to) of the transaction, or null for contract creation
  to: string | null,
  // Hexadecimal string representing the maximum gas units the transaction can consume
  gas: string,
  // Hexadecimal string representing the value (in Wei) transferred with the transaction
  value: string,
  // Hexadecimal string representing the data (input) sent with the transaction
  input: string,
  // Maximum fee per gas the sender is willing to pay to miners in wei (tip)
  maxPriorityFeePerGas: string,
  // The maximum total fee per gas the sender is willing to pay (includes network / base fee and miner / priority fee) in wei
  maxFeePerGas: string,
  // The maximum total fee per gas the sender is willing to pay for blob gas in wei
  maxFeePerBlobGas: string,
  // EIP-2930 access list (though typically empty for EIP-4844 unless combined)
  accessList: Array<Eip2930AccessListItem>, // Assuming Eip2930AccessListItem is defined as per previous responses
  // List of versioned blob hashes associated with the transaction's EIP-4844 data blobs
  blobVersionedHashes: Array<string>,
  // Chain ID that this transaction is valid on
  chainId: string,
  // The parity (0 for even, 1 for odd) of the y-value of the secp256k1 signature
  yParity: string,
  // Hexadecimal string representing the 'r' component of the transaction signature
  r: string,
  // Hexadecimal string representing the 's' component of the transaction signature
  s: string,
  // The hash of the block this transaction was included in, or null if pending
  blockHash: string | null,
  // The number of the block this transaction was included in, or null if pending
  blockNumber: string | null,
  // The address of the sender (from) of the transaction
  from: string | null,
  // The hash of the transaction
  hash: string | null,
  // The index of the transaction within the block, or null if pending
  transactionIndex: string | null,
|};

// Union type for all possible signed transaction types
export type SignedTransaction =
  | SignedLegacyTransaction
  | Signed4844Transaction
  | Signed1559Transaction
  | Signed2930Transaction;
