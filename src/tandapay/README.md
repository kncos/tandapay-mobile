# TandaPay Redux Integration

This document describes the complete Redux integration for TandaPay features in the Zulip Mobile app.

## Overview

The TandaPay Redux integration provides persistent storage for:
- **Wallet data**: Addresses, keys, and wallet metadata
- **Settings**: User preferences for TandaPay features
- **Transactions**: History of contributions, claims, and withdrawals
- **Pools**: Information about active insurance pools

## Architecture

### Storage Layer
TandaPay state is persisted using the same robust storage system as the main Zulip app:
- **SQLite Database**: Reliable storage with transaction safety
- **Compression**: Data is compressed before storage to save space
- **Migration Support**: Schema updates are handled through the migration system
- **Persistence Category**: `storeKeys` - persisted as local device data

### State Structure

```javascript
type TandaPayState = {
  wallet: {
    address: string | null,
    privateKey: string | null,  // Encrypted in production
    publicKey: string | null,
    mnemonic: string | null,    // Encrypted in production
    isImported: boolean,
    createdAt: number | null,
  },
  settings: {
    defaultNetwork: string,
    notificationsEnabled: boolean,
    biometricAuthEnabled: boolean,
    autoBackupEnabled: boolean,
    currency: string,
  },
  transactions: Array<{
    id: string,
    type: 'contribution' | 'claim' | 'withdrawal',
    amount: string,
    txHash: string | null,
    status: 'pending' | 'confirmed' | 'failed',
    timestamp: number,
    poolId: string | null,
  }>,
  pools: Array<{
    id: string,
    name: string,
    memberCount: number,
    totalPool: string,
    userContribution: string | null,
    status: 'active' | 'paused' | 'closed',
    lastUpdated: number,
  }>
}
```

## Files

### Core Redux Files
- **`src/tandapay/tandaPayReducer.js`**: Main reducer with state types and action handling
- **`src/tandapay/tandaPayActions.js`**: Action creators for all TandaPay operations
- **`src/tandapay/tandaPaySelectors.js`**: Selectors for accessing TandaPay state

### Integration Files
- **`src/actionTypes.js`**: TandaPay action types added to main action union
- **`src/actionConstants.js`**: TandaPay action constants
- **`src/boot/reducers.js`**: TandaPay reducer integrated into main reducer composition
- **`src/boot/store.js`**: TandaPay state added to persistence configuration
- **`src/reduxTypes.js`**: TandaPay types added to PerAccountState

### Example Usage
- **`src/tandapay/TandaPayExample.js`**: Complete example showing Redux integration

## Usage

### Action Creators

```javascript
import { 
  setTandaPayWallet, 
  updateTandaPaySettings, 
  addTandaPayTransaction,
  updateTandaPayPoolData 
} from '../tandapay/tandaPayActions';

// Set wallet data
dispatch(setTandaPayWallet({
  address: '0x1234...',
  isImported: false,
}));

// Update settings
dispatch(updateTandaPaySettings({
  notificationsEnabled: true,
  currency: 'USD',
}));

// Add transaction
dispatch(addTandaPayTransaction({
  id: 'tx_123',
  type: 'contribution',
  amount: '100.00',
  status: 'pending',
  timestamp: Date.now(),
  poolId: 'pool_1',
}));
```

### Selectors

```javascript
import { 
  getTandaPayWallet, 
  getTandaPaySettings, 
  getTandaPayTransactions,
  getTandaPayActivePools 
} from '../tandapay/tandaPaySelectors';

// In your React component
const mapStateToProps = (state) => ({
  walletAddress: getTandaPayWallet(state).address,
  isNotificationsEnabled: getTandaPaySettings(state).notificationsEnabled,
  pendingTransactions: getTandaPayPendingTransactions(state),
  activePools: getTandaPayActivePools(state),
});
```

### React Component Integration

```javascript
import React from 'react';
import { connect } from 'react-redux';
import { getTandaPayWallet } from '../tandapay/tandaPaySelectors';
import { setTandaPayWallet } from '../tandapay/tandaPayActions';

const WalletScreen = ({ wallet, dispatch }) => {
  const handleSetupWallet = () => {
    dispatch(setTandaPayWallet({
      address: '0x1234...',
      isImported: false,
    }));
  };

  return (
    <View>
      <Text>Wallet: {wallet.address || 'Not connected'}</Text>
      <Button title="Setup Wallet" onPress={handleSetupWallet} />
    </View>
  );
};

export default connect(
  state => ({ wallet: getTandaPayWallet(state) }),
  dispatch => ({ dispatch })
)(WalletScreen);
```

## Data Flow

1. **User Action**: User interacts with TandaPay UI
2. **Action Dispatch**: Component dispatches TandaPay action
3. **Reducer Processing**: TandaPay reducer processes action and updates state
4. **State Persistence**: Updated state is automatically persisted to SQLite
5. **Component Update**: Connected components re-render with new state
6. **UI Update**: User sees updated information

## Security Considerations

⚠️ **Important**: The current implementation stores sensitive data (private keys, mnemonics) in plaintext. For production use, implement encryption:

1. Use device keychain/keystore for sensitive data
2. Encrypt data before storing in Redux state
3. Implement biometric authentication for wallet access
4. Consider hardware security modules for key storage

## Testing

The Redux integration can be tested using the existing test infrastructure:

```javascript
import { createStore } from 'redux';
import rootReducer from '../boot/reducers';
import { setTandaPayWallet } from '../tandapay/tandaPayActions';
import { getTandaPayWallet } from '../tandapay/tandaPaySelectors';

const store = createStore(rootReducer);
store.dispatch(setTandaPayWallet({ address: '0x123' }));
const wallet = getTandaPayWallet(store.getState());
expect(wallet.address).toBe('0x123');
```

## Migration Strategy

When adding new fields to TandaPay state:

1. Add migration in `src/storage/migrations.js`
2. Update type definitions in `tandaPayReducer.js`
3. Update selectors as needed
4. Test migration with existing data

## Performance

The TandaPay Redux integration is optimized for performance:

- **Selective Updates**: Only affected components re-render
- **Compression**: State is compressed before persistence
- **Efficient Selectors**: Memoized selectors prevent unnecessary recalculations
- **Minimal State**: Only essential data is stored in Redux

## Next Steps

1. **Encryption**: Implement encryption for sensitive wallet data
2. **Middleware**: Add middleware for API synchronization
3. **Offline Support**: Ensure TandaPay works offline with Redux state
4. **Testing**: Add comprehensive test coverage for all actions/reducers
5. **Documentation**: Add JSDoc comments to all functions
