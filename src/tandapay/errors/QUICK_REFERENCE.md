# TandaPay Error Handling - Quick Reference Guide

## **Quick Start**

### **1. Import the Error Handler**
```javascript
import TandaPayErrorHandler from '../errors/ErrorHandler';
import type { TandaPayResult, TandaPayError } from '../errors/types';
```

### **2. Migrate Async Functions**

**Before:**
```javascript
async function fetchData() {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    console.log(error);
    return null; // Silent failure!
  }
}
```

**After:**
```javascript
async function fetchData(): Promise<TandaPayResult<DataType>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      const result = await apiCall();
      return result;
    },
    'API_ERROR',
    'Failed to fetch data. Please try again.',
    'DATA_FETCH_FAILED'
  );
}
```

### **3. Update Function Callers**

**Before:**
```javascript
const data = await fetchData();
if (data) {
  setData(data);
} else {
  setError('Something went wrong');
}
```

**After:**
```javascript
const result = await fetchData();
if (result.success) {
  setData(result.data);
  setError(null);
} else {
  setData(null);
  setError(result.error);
  
  // Optional: Show alert for critical errors
  if (result.error.type === 'CRITICAL_ERROR') {
    TandaPayErrorHandler.handleError(result.error, true);
  }
}
```

## **Error Types & When to Use**

| Error Type | Use Cases | Example |
|------------|-----------|---------|
| `NETWORK_ERROR` | RPC calls, API requests, connectivity issues | Provider failures, timeout |
| `API_ERROR` | External API failures | Etherscan API errors |
| `VALIDATION_ERROR` | Input validation, data validation | Invalid address format |
| `WALLET_ERROR` | Wallet operations | Private key access, signing |
| `CONTRACT_ERROR` | Smart contract interactions | Transaction failures, gas issues |
| `STORAGE_ERROR` | SecureStore, AsyncStorage operations | Storage quota, permissions |
| `USER_CANCELLED` | User-initiated cancellations | Transaction cancelled |
| `INSUFFICIENT_FUNDS` | Balance checks | Not enough ETH/tokens |
| `RATE_LIMITED` | API rate limiting | Too many requests |
| `TIMEOUT_ERROR` | Operation timeouts | Slow network responses |
| `PARSING_ERROR` | Data parsing issues | Invalid JSON, number parsing |
| `UNKNOWN_ERROR` | Unexpected errors | Fallback for unhandled cases |

## **Common Patterns**

### **Pattern 1: Wallet Operations**
```javascript
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

### **Pattern 2: Network Operations**
```javascript
export async function fetchBalance(token: Token, address: string): Promise<TandaPayResult<string>> {
  return TandaPayErrorHandler.withErrorHandling(
    async () => {
      if (!ethers.utils.isAddress(address)) {
        throw TandaPayErrorHandler.createValidationError(
          'Invalid address',
          'Please provide a valid Ethereum address'
        );
      }
      
      const provider = getProvider();
      const balance = await provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    },
    'NETWORK_ERROR',
    'Unable to fetch balance. Please check your connection.',
    'BALANCE_FETCH'
  );
}
```

### **Pattern 3: Hook Error Handling**
```javascript
export function useApiData(id: string) {
  const [data, setData] = useState(null);
  const [error, setError] = useState<?TandaPayError>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchApiData(id);
    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error);
      
      // Auto-retry for specific errors
      if (result.error.retryable && result.error.type === 'TIMEOUT_ERROR') {
        setTimeout(fetchData, 2000);
      }
    }
    setLoading(false);
  }, [id]);

  return { data, error, loading, retry: fetchData };
}
```

### **Pattern 4: Component Error Display**
```javascript
function DataComponent(): Node {
  const { data, error, loading, retry } = useApiData(id);

  if (error) {
    return (
      <Card>
        <Text>{error.userMessage}</Text>
        {error.retryable && (
          <Button onPress={retry}>Try Again</Button>
        )}
        {error.type === 'RATE_LIMITED' && (
          <Text style={{ fontSize: 12 }}>
            Please wait a moment before retrying
          </Text>
        )}
      </Card>
    );
  }

  // ... rest of component
}
```

## **Error Creation Shortcuts**

```javascript
// Network errors
TandaPayErrorHandler.createNetworkError('Connection failed', { timeout: true });

// Validation errors
TandaPayErrorHandler.createValidationError('Invalid input', 'Please check your input');

// Wallet errors
TandaPayErrorHandler.createWalletError('Signing failed', { operation: 'transfer' });

// Contract errors
TandaPayErrorHandler.createContractError('Transaction failed', { gasLimit: '21000' });

// API errors
TandaPayErrorHandler.createApiError('Rate limited', 'RATE_LIMIT', { retryAfter: 60 });
```

## **Best Practices**

### **✅ Do**
- Always use `TandaPayResult<T>` for async operations that can fail
- Provide user-friendly error messages
- Mark errors as retryable when appropriate
- Use specific error types for better categorization
- Include relevant context in error details
- Handle retryable errors automatically when possible

### **❌ Don't**
- Return `null` or `undefined` for error cases
- Use generic error messages like "Something went wrong"
- Show technical error details to users
- Ignore errors silently
- Use `UNKNOWN_ERROR` unless it's truly unexpected
- Block the UI indefinitely on retryable errors

## **Migration Checklist**

For each function you migrate:

- [ ] Function returns `TandaPayResult<T>` instead of raw data/null
- [ ] All error cases are handled with appropriate error types
- [ ] User-friendly error messages are provided
- [ ] Input validation is included where needed
- [ ] Retryable errors are marked appropriately
- [ ] Function callers are updated to handle the new pattern
- [ ] Tests are updated to verify error handling
- [ ] Error states are handled in UI components

## **Testing Error Handling**

```javascript
// Test successful case
const result = await fetchData();
expect(result.success).toBe(true);
expect(result.data).toBeDefined();

// Test error case
const errorResult = await fetchDataWithError();
expect(errorResult.success).toBe(false);
expect(errorResult.error.type).toBe('NETWORK_ERROR');
expect(errorResult.error.userMessage).toContain('connection');
expect(errorResult.error.retryable).toBe(true);
```

## **Debugging Tips**

1. **Check error.code** for specific error identification
2. **Use error.details** for debugging context
3. **Monitor error.timestamp** for timing issues
4. **Test error.retryable** behavior in different scenarios
5. **Verify error.userMessage** clarity for end users

## **Performance Considerations**

- Error handling adds minimal overhead
- Use timeouts to prevent hanging operations
- Implement exponential backoff for retries
- Cache error states to avoid repeated failures
- Log errors for monitoring but don't spam console
