# TandaPay Error Handling Migration Plan

## **Overview**

This document outlines a step-by-step plan for gradually migrating TandaPay's existing error handling to use the new centralized error handling system (`TandaPayErrorHandler` and `TandaPayResult<T>` patterns).

## **Migration Strategy**

### **Phase 1: High-Impact Wallet Operations (Priority 1)**

**Target:** Critical wallet operations that users interact with daily

#### **1.1 Balance Fetching (Week 1)**

**Files:**
- `src/tandapay/web3.js` - `fetchBalance()` function
- `src/tandapay/wallet/hooks/useUpdateBalance.js`

**Current Issues:**
- Silent RPC failures
- Network timeout handling missing
- Inconsistent error propagation to UI

**Migration Steps:**

1. **Update `web3.js` fetchBalance function:**
```javascript
// Before
export async function fetchBalance(token: Token, address: string, network: string): Promise<string> {
  try {
    // ... existing logic
    return balance;
  } catch (e) {
    return '0'; // Silent failure!
  }
}

// After
export async function fetchBalance(token: Token, address: string, network: string): Promise<TandaPayResult<string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // ... existing logic with timeout
      return balance;
    },
    'NETWORK_ERROR',
    'Unable to fetch balance. Please check your network connection.',
    'BALANCE_FETCH_FAILED'
  );
}
```

2. **Update `useUpdateBalance` hook:**
```javascript
// Update to handle TandaPayResult pattern
const result = await fetchBalance(token, walletAddress, network);
if (result.success) {
  dispatch(updateTokenBalance(token.symbol, result.data));
} else {
  TandaPayErrorHandler.handleError(result.error, false); // Don't show alert in hook
  setError(result.error.userMessage);
}
```

**Testing Checklist:**
- [ ] Balance updates work correctly
- [ ] Network failures show appropriate user messages
- [ ] Loading states function properly
- [ ] Cache invalidation works

#### **1.2 Transaction History Fetching (Week 1)**

**Files:**
- `src/tandapay/wallet/TransactionService.js`
- `src/tandapay/wallet/useTransactionHistory.js`

**Current Issues:**
- Multiple error types not clearly differentiated
- Rate limiting not handled gracefully
- Partial data handling issues

**Migration Steps:**

1. **Update `fetchTransactionHistory` function:**
```javascript
export async function fetchTransactionHistory(
  walletAddress: string,
  page: number = 1,
  offset: number = 10,
): Promise<TandaPayResult<EtherscanTransaction[]>> {
  
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Check API key
      const apiKey = await getEtherscanApiKey();
      if (!apiKey) {
        throw TandaPayErrorHandler.createApiError(
          'No Etherscan API key configured',
          'NO_API_KEY',
          { userMessage: 'Configure Etherscan API key to view transaction history' }
        );
      }

      // ... rest of existing logic
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        if (response.status === 429) {
          throw TandaPayErrorHandler.createError(
            'RATE_LIMITED',
            'Too many requests to Etherscan API',
            { retryable: true }
          );
        }
        throw TandaPayErrorHandler.createNetworkError(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.result || [];
    },
    'API_ERROR',
    'Failed to load transaction history',
    'TRANSACTION_HISTORY_FETCH'
  );
}
```

2. **Update `useTransactionHistory` hook:**
```javascript
const result = await fetchTransactionHistory(walletAddress, 1, 10);
if (result.success) {
  setTransactionState({
    status: 'success',
    transactions: result.data,
    hasMore: result.data.length === 10,
  });
} else {
  const error = result.error;
  if (error.type === 'RATE_LIMITED' && error.retryable) {
    // Implement exponential backoff
    setTimeout(() => fetchInitialTransactions(), 2000);
  } else {
    setTransactionState({ status: 'error', error: error.userMessage });
  }
}
```

#### **1.3 Transaction Sending (Week 2)**

**Files:**
- `src/tandapay/web3.js` - `transferToken()` function
- `src/tandapay/wallet/WalletSendScreen.js`
- `src/tandapay/components/TransactionEstimateAndSend.js`

**Current Issues:**
- Network switching mid-transaction
- Insufficient gas handling
- Contract error parsing

**Migration Steps:**

1. **Update `transferToken` function:**
```javascript
export async function transferToken(
  token: Token,
  fromPrivateKey: string,
  toAddress: string,
  amount: string,
  network: string,
): Promise<TandaPayResult<{| txHash: string, success: true |}>> {

  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      // Validate inputs
      if (!ethers.utils.isAddress(toAddress)) {
        throw TandaPayErrorHandler.createValidationError(
          'Invalid recipient address',
          'Please enter a valid Ethereum address'
        );
      }

      const provider = getProvider(network);
      const wallet = new ethers.Wallet(fromPrivateKey, provider);

      // Check balance before transfer
      const balance = await wallet.getBalance();
      const amountWei = ethers.utils.parseEther(amount);
      
      if (balance.lt(amountWei)) {
        throw TandaPayErrorHandler.createError(
          'INSUFFICIENT_FUNDS',
          'Insufficient balance for transfer',
          { userMessage: 'Not enough balance to complete this transaction' }
        );
      }

      const tx = await wallet.sendTransaction({
        to: toAddress,
        value: amountWei,
      });

      return { txHash: tx.hash, success: true };
    },
    'CONTRACT_ERROR',
    'Transaction failed. Please try again.',
    'TOKEN_TRANSFER'
  );
}
```

### **Phase 2: Storage Operations (Priority 2)**

#### **2.1 Wallet Manager Operations (Week 2)**

**Files:**
- `src/tandapay/wallet/WalletManager.js`

**Current Issues:**
- Silent SecureStore failures
- Inconsistent error handling across storage operations

**Migration Steps:**

1. **Update wallet storage functions:**
```javascript
export async function generateWallet(): Promise<TandaPayResult<WalletInfo>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const wallet = ethers.Wallet.createRandom();
      
      await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, wallet.mnemonic.phrase, {
        requireAuthentication: true,
      });
      
      await SecureStore.setItemAsync(WALLET_ADDRESS_STORAGE_KEY, wallet.address, {
        requireAuthentication: false,
      });
      
      return {
        mnemonic: wallet.mnemonic.phrase,
        address: wallet.address,
      };
    },
    'STORAGE_ERROR',
    'Failed to create wallet. Please ensure you have sufficient device storage.',
    'WALLET_GENERATION'
  );
}

export async function getWalletAddress(): Promise<TandaPayResult<string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const address = await SecureStore.getItemAsync(WALLET_ADDRESS_STORAGE_KEY);
      if (!address) {
        throw TandaPayErrorHandler.createWalletError('No wallet found');
      }
      return address;
    },
    'STORAGE_ERROR',
    'Unable to access wallet. Please try restarting the app.',
    'WALLET_ADDRESS_FETCH'
  );
}
```

### **Phase 3: Network Operations (Priority 3)**

#### **3.1 Provider Management (Week 3)**

**Files:**
- `src/tandapay/providers/ProviderManager.js`

**Current Issues:**
- Provider creation failures not handled
- Network switching edge cases

**Migration Steps:**

1. **Update provider creation:**
```javascript
export function createProvider(network: string): TandaPayResult<ethers.providers.Provider> {
  return TandaPayErrorHandler.withSyncErrorHandling(
    () => {
      const config = getNetworkConfig(network);
      if (!config) {
        throw TandaPayErrorHandler.createValidationError(
          `Unknown network: ${network}`,
          'Please select a valid network'
        );
      }
      
      return new ethers.providers.JsonRpcProvider(config.rpcUrl);
    },
    'NETWORK_ERROR',
    'Failed to connect to network. Please check your network settings.',
    'PROVIDER_CREATION'
  );
}
```

### **Phase 4: Contract Operations (Priority 4)**

#### **4.1 TandaPay Contract Interactions (Week 4)**

**Files:**
- `src/tandapay/contract/read.js`
- `src/tandapay/contract/write.js`

**Current Issues:**
- Contract errors not properly parsed
- Gas estimation failures
- Network congestion handling

**Migration Steps:**

1. **Update contract read operations:**
```javascript
export async function getCommunityInfo(
  contract: EthersContract
): Promise<TandaPayResult<CommunityInfo>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const result = await contract.getCommunityState();
      return parseCommunityInfo(result);
    },
    'CONTRACT_ERROR',
    'Unable to fetch community information. The network may be congested.',
    'COMMUNITY_INFO_FETCH'
  );
}
```

## **Implementation Guidelines**

### **Migration Patterns**

#### **Pattern 1: Async Function Migration**
```javascript
// Before
async function oldFunction() {
  try {
    const result = await someOperation();
    return result;
  } catch (error) {
    console.log(error); // Silent failure
    return null;
  }
}

// After
async function newFunction(): Promise<TandaPayResult<DataType>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const result = await someOperation();
      return result;
    },
    'APPROPRIATE_ERROR_TYPE',
    'User-friendly message',
    'OPERATION_CODE'
  );
}
```

#### **Pattern 2: Hook Migration**
```javascript
// Before
const [data, setData] = useState(null);
const [error, setError] = useState(null);

useEffect(() => {
  async function fetchData() {
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
    }
  }
  fetchData();
}, []);

// After
const [data, setData] = useState(null);
const [error, setError] = useState<?TandaPayError>(null);

useEffect(() => {
  async function fetchData() {
    const result = await apiCall();
    if (result.success) {
      setData(result.data);
      setError(null);
    } else {
      setData(null);
      setError(result.error);
      // Optionally show user alert for critical errors
      if (result.error.type === 'CRITICAL_ERROR') {
        TandaPayErrorHandler.handleError(result.error, true);
      }
    }
  }
  fetchData();
}, []);
```

#### **Pattern 3: Component Error Handling**
```javascript
// Error boundary integration
if (error) {
  return (
    <ErrorBoundary error={error}>
      <Card>
        <Text>{error.userMessage}</Text>
        {error.retryable && (
          <Button onPress={retry}>Try Again</Button>
        )}
      </Card>
    </ErrorBoundary>
  );
}
```

### **Testing Strategy**

#### **Per-Phase Testing**

1. **Unit Tests:**
   - Test error creation with various error types
   - Verify TandaPayResult pattern handling
   - Validate user message generation

2. **Integration Tests:**
   - Test error propagation through component hierarchy
   - Verify error handling in hooks
   - Test retry mechanisms

3. **User Experience Tests:**
   - Verify appropriate error messages shown to users
   - Test error recovery flows
   - Validate loading states during error conditions

#### **Regression Testing Checklist**

- [ ] Existing functionality continues to work
- [ ] Error states don't break UI layout
- [ ] Loading indicators work correctly
- [ ] User can recover from error states
- [ ] No silent failures occur

### **Rollback Strategy**

Each phase includes a rollback plan:

1. **Feature Flags:** Use conditional compilation for new error handling
2. **Gradual Migration:** Keep old patterns alongside new ones initially
3. **Monitoring:** Track error rates and user experience metrics
4. **Quick Revert:** Ability to revert individual functions if issues arise

## **Success Metrics**

1. **Error Visibility:** Reduce silent failures by 95%
2. **User Experience:** Improve error recovery rate by 80%
3. **Developer Experience:** Reduce debugging time for error-related issues
4. **Code Quality:** Achieve consistent error handling across all modules

## **Timeline Summary**

- **Week 1:** Balance fetching + Transaction history (Phase 1.1-1.2)
- **Week 2:** Transaction sending + Wallet storage (Phase 1.3 + 2.1)
- **Week 3:** Provider management (Phase 3.1)
- **Week 4:** Contract operations (Phase 4.1)
- **Week 5:** Testing, optimization, and documentation

## **Post-Migration Tasks**

1. **Documentation Updates:** Update all code documentation
2. **Error Analytics:** Implement error tracking and monitoring
3. **Performance Review:** Analyze impact on app performance
4. **Team Training:** Train team on new error handling patterns
5. **Maintenance Plan:** Establish ongoing error handling best practices

---

**Note:** This migration plan prioritizes user-facing operations first, ensuring that critical wallet functionality has robust error handling before moving to internal operations.
