// @flow strict-local

/**
 * JSON-RPC request structure
 */
export type JsonRpcRequest = {|
  /** Request identifier */
  id: number | string,
  /** JSON-RPC version, always '2.0' */
  jsonrpc: '2.0',
  /** RPC method name */
  method: string,
  /** Array of parameters for the RPC method */
  params: Array<mixed>,
|};

/**
 * JSON-RPC response structure
 */
export type JsonRpcResponse = {|
  /** Response identifier matching the request */
  id: number | string,
  /** JSON-RPC version, always '2.0' */
  jsonrpc: '2.0',
  /** Response result data (present on success) */
  result?: mixed,
  /** Error object (present on failure) */
  error?: {|
    /** Error code */
    code: number,
    /** Error message */
    message: string,
    /** Additional error data */
    data?: mixed,
  |},
|};

/**
 * Response for alchemy_getAssetTransfers API call.
 * Retrieved from https://www.alchemy.com/docs/reference/sdk-getassettransfers.
 * Verified on 2025-07-08
 */
export type Transfer = {
  /** Transfer category type */
  category: 'external' | 'internal' | 'erc20' | 'erc721' | 'erc1155' | 'specialnft',
  /** Block number of the transfer (hex string) */
  blockNum: string | null,
  /** From address (hex string) */
  from: string | null,
  /** To address (hex string). null if contract creation */
  to: string | null,
  /** Asset transfer value. null if it's ERC721 or unknown decimals */
  value: number | null,
  /** ETH or the token's symbol, null if unavailable */
  asset: string | null,
  /** Unique identifier for the transfer; will be a hash plus a suffix */
  uniqueId: string | null,
  /** Transaction hash, null if unavailable */
  hash: string | null,
  /** Raw contract information */
  rawContract: {|
    /** Raw hex transfer value. null for NFT transfers */
    value: string | null,
    /** Contract address, null for external or internal transfers */
    address: string | null,
    /** Contract decimal in hex. null if not known */
    decimal: string | null,
  |} | null,
  /** Transfer metadata */
  metadata: {|
    /** Timestamp of the block in ISO format, null if unavailable */
    blockTimestamp: string | null,
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
  /** Starting block to check for transfers (hex string). 0x0 if omitted */
  fromBlock?: string,
  /** Inclusive to block (hex string, int, or 'latest'). 'latest' if omitted */
  toBlock?: string,
  /** Whether to return results in ascending or descending order. Defaults to 'ascending' if omitted */
  order?: string,
  /** From address to filter transfers. Defaults to a wildcard if omitted */
  fromAddress?: string,
  /** To address to filter transfers. Defaults to a wildcard if omitted */
  toAddress?: string,
  /** List of contract addresses to filter for. Only applies to erc20/erc721/erc1155 transfers. Defaults to all if omitted */
  contractAddresses?: Array<string>,
  /** List of transfer categories to include. Options: 'external', 'internal', 'erc20', 'erc721', 'erc1155', 'specialnft' */
  category: Array<string>,
  /** Whether to exclude transfers with zero value. Defaults to false if omitted */
  excludeZeroValue?: boolean,
  /** Page key from previous response. `null` if omitted which retrieves 1st page. Otherwise, retrieves next page */
  pageKey?: string,
  /** Maximum number of transfers to return per page. Defaults to `1000` if omitted */
  maxCount?: number,
  /** Whether to include metadata in the response. Defaults to true if omitted */
  withMetadata?: boolean,
|};

/**
 * Legacy transaction type (pre-EIP-1559)
 */
export type SignedLegacyTransaction = {|
  /** The 'type' field is explicitly '0x0' for legacy transactions */
  type: "0x0",
  /** Hexadecimal string representing the transaction count of the sender */
  nonce: string,
  /** Hexadecimal string representing the maximum gas units the transaction can consume */
  gas: string,
  /** Hexadecimal string representing the value (in Wei) transferred with the transaction */
  value: string,
  /** Hexadecimal string representing the data (input) sent with the transaction. For contract calls, this is the encoded function call data. For simple transfers, it's '0x' */
  input: string,
  /** Hexadecimal string representing the gas price (in Wei) willing to be paid by the sender */
  gasPrice: string,
  /** Hexadecimal string representing the 'v' component of the transaction signature */
  v: string,
  /** Hexadecimal string representing the 'r' component of the transaction signature */
  r: string,
  /** Hexadecimal string representing the 's' component of the transaction signature */
  s: string,
  /** The hash of the block this transaction was included in, or null if pending */
  blockHash: string | null,
  /** The number of the block this transaction was included in, or null if pending */
  blockNumber: string | null,
  /** The address of the sender (from) of the transaction */
  from: string | null,
  /** The hash of the transaction */
  hash: string | null,
  /** The index of the transaction within the block, or null if pending */
  transactionIndex: string | null,
  /** The address of the receiver (to) of the transaction, or null for contract creation transactions */
  to: string | null,
  /** The chain ID this transaction is valid on, or null if not explicitly set (e.g., pre-EIP-155) */
  chainId: string | null,
|};

/**
 * EIP-2930 access list item structure
 */
export type Eip2930AccessListItem = {|
  /** The address in the access list */
  address: string,
  /** List of storage keys for the address in the access list */
  storageKeys: Array<string>,
|};

/**
 * EIP-1559 transaction type (with dynamic fee)
 */
export type Signed1559Transaction = {|
  /** The transaction type, explicitly "0x2" for EIP-1559 */
  type: "0x2",
  /** Hexadecimal string representing the transaction count of the sender */
  nonce: string,
  /** Hexadecimal string representing the maximum gas units the transaction can consume */
  gas: string,
  /** Hexadecimal string representing the value (in Wei) transferred with the transaction */
  value: string,
  /** Hexadecimal string representing the data (input) sent with the transaction */
  input: string,
  /** Maximum fee per gas the sender is willing to pay to miners in wei (tip) */
  maxPriorityFeePerGas: string,
  /** The maximum total fee per gas the sender is willing to pay (includes network / base fee and miner / priority fee) in wei */
  maxFeePerGas: string,
  /** The effective gas price paid by the sender in wei. DEPRECATED for unincluded transactions, use in receipt object */
  gasPrice: string,
  /** EIP-2930 access list (though typically empty for EIP-1559 unless combined) */
  accessList: Array<Eip2930AccessListItem>,
  /** Chain ID that this transaction is valid on */
  chainId: string,
  /** The parity (0 for even, 1 for odd) of the y-value of the secp256k1 signature */
  yParity: string,
  /** Hexadecimal string representing the 'r' component of the transaction signature */
  r: string,
  /** Hexadecimal string representing the 's' component of the transaction signature */
  s: string,
  /** The hash of the block this transaction was included in, or null if pending */
  blockHash: string | null,
  /** The number of the block this transaction was included in, or null if pending */
  blockNumber: string | null,
  /** The address of the sender (from) of the transaction */
  from: string | null,
  /** The hash of the transaction */
  hash: string | null,
  /** The index of the transaction within the block, or null if pending */
  transactionIndex: string | null,
  /** The address of the receiver (to) of the transaction, or null for contract creation */
  to: string | null,
  /** For backwards compatibility, v is optionally provided as an alternative to yParity. This field is DEPRECATED and all use of it should migrate to yParity */
  v: string | null,
|};

/**
 * EIP-2930 transaction type (with access list)
 */
export type Signed2930Transaction = {|
  /** The transaction type, explicitly "0x1" for EIP-2930 */
  type: "0x1",
  /** Hexadecimal string representing the transaction count of the sender */
  nonce: string,
  /** Hexadecimal string representing the maximum gas units the transaction can consume */
  gas: string,
  /** Hexadecimal string representing the value (in Wei) transferred with the transaction */
  value: string,
  /** Hexadecimal string representing the data (input) sent with the transaction */
  input: string,
  /** Hexadecimal string representing the gas price (in Wei) willing to be paid by the sender */
  gasPrice: string,
  /** EIP-2930 access list */
  accessList: Array<Eip2930AccessListItem>,
  /** Chain ID that this transaction is valid on */
  chainId: string,
  /** The parity (0 for even, 1 for odd) of the y-value of the secp256k1 signature */
  yParity: string,
  /** Hexadecimal string representing the 'r' component of the transaction signature */
  r: string,
  /** Hexadecimal string representing the 's' component of the transaction signature */
  s: string,
  /** The hash of the block this transaction was included in, or null if pending */
  blockHash: string | null,
  /** The number of the block this transaction was included in, or null if pending */
  blockNumber: string | null,
  /** The address of the sender (from) of the transaction */
  from: string | null,
  /** The hash of the transaction */
  hash: string | null,
  /** The index of the transaction within the block, or null if pending */
  transactionIndex: string | null,
  /** The address of the receiver (to) of the transaction, or null for contract creation */
  to: string | null,
  /** For backwards compatibility, v is optionally provided as an alternative to yParity. This field is DEPRECATED and all use of it should migrate to yParity */
  v: string | null,
|};

/**
 * EIP-4844 transaction type (with blob data)
 */
export type Signed4844Transaction = {|
  /** The transaction type, explicitly "0x3" for EIP-4844 (or potentially "0x03") */
  type: string, // Regex suggests "0x(0-9a-f){1,2}" which is usually "0x3" or "0x03" for 4844
  /** Hexadecimal string representing the transaction count of the sender */
  nonce: string,
  /** The address of the receiver (to) of the transaction, or null for contract creation */
  to: string | null,
  /** Hexadecimal string representing the maximum gas units the transaction can consume */
  gas: string,
  /** Hexadecimal string representing the value (in Wei) transferred with the transaction */
  value: string,
  /** Hexadecimal string representing the data (input) sent with the transaction */
  input: string,
  /** Maximum fee per gas the sender is willing to pay to miners in wei (tip) */
  maxPriorityFeePerGas: string,
  /** The maximum total fee per gas the sender is willing to pay (includes network / base fee and miner / priority fee) in wei */
  maxFeePerGas: string,
  /** The maximum total fee per gas the sender is willing to pay for blob gas in wei */
  maxFeePerBlobGas: string,
  /** EIP-2930 access list (though typically empty for EIP-4844 unless combined) */
  accessList: Array<Eip2930AccessListItem>, // Assuming Eip2930AccessListItem is defined as per previous responses
  /** List of versioned blob hashes associated with the transaction's EIP-4844 data blobs */
  blobVersionedHashes: Array<string>,
  /** Chain ID that this transaction is valid on */
  chainId: string,
  /** The parity (0 for even, 1 for odd) of the y-value of the secp256k1 signature */
  yParity: string,
  /** Hexadecimal string representing the 'r' component of the transaction signature */
  r: string,
  /** Hexadecimal string representing the 's' component of the transaction signature */
  s: string,
  /** The hash of the block this transaction was included in, or null if pending */
  blockHash: string | null,
  /** The number of the block this transaction was included in, or null if pending */
  blockNumber: string | null,
  /** The address of the sender (from) of the transaction */
  from: string | null,
  /** The hash of the transaction */
  hash: string | null,
  /** The index of the transaction within the block, or null if pending */
  transactionIndex: string | null,
|};

/**
 * Union type for all possible signed transaction types
 */
export type SignedTransaction =
  | SignedLegacyTransaction
  | Signed4844Transaction
  | Signed1559Transaction
  | Signed2930Transaction;

/**
 * Transaction receipt log entry
 */
export type TransactionReceiptLog = {
  /** Hash of the transaction containing this log */
  transactionHash: string,
  /** Whether this log was removed due to a chain reorganization */
  removed: boolean | null,
  /** Index of this log within the block */
  logIndex: string | null,
  /** Index of the transaction within the block */
  transactionIndex: string | null,
  /** Hash of the block containing this log */
  blockHash: string | null,
  /** Number of the block containing this log */
  blockNumber: string | null,
  /** Address of the contract that emitted this log */
  address: string | null,
  /** Data payload of the log */
  data: string | null,
  /** Array of indexed log topics */
  topics: Array<string> | null,
};

/**
 * Transaction receipt from blockchain
 */
export type TransactionReceipt = {|
  /** Hash of the block containing this transaction */
  blockHash: string,
  /** Number of the block containing this transaction (either an ethers.BigNumber or a hex string) */
  blockNumber: mixed | string,
  /** Address of the newly created contract (if this was a contract creation transaction) */
  contractAddress: string | null,
  /** Total amount of gas used in the block up to and including this transaction */
  cumulativeGasUsed: mixed | string,
  /** Address that sent this transaction */
  from: string,
  /** Amount of gas used by this specific transaction (either an ethers.BigNumber or a hex string) */
  gasUsed: mixed | string,
  /** Effective gas price paid for this transaction (either an ethers.BigNumber or a hex string) */
  effectiveGasPrice: mixed | string,
  /** Array of log entries generated by this transaction */
  logs: Array<TransactionReceiptLog>,
  /** Bloom filter for the logs in this transaction */
  logsBloom: string,
  /** Status of the transaction execution (either an ethers.BigNumber or a hex string) */
  status: mixed | string,
  /** Address that received this transaction */
  to: string,
  /** Hash of the transaction */
  transactionHash: string,
  /** Index of this transaction within the block (either an ethers.BigNumber or a hex string) */
  transactionIndex: mixed | string,
  /** Transaction type identifier */
  type: string,
|};
