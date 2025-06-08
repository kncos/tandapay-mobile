# TandaPay Components

This folder contains reusable React Native components for the TandaPay mobile application.

## Components

### AddressInput

A reusable component for inputting and validating Ethereum addresses with QR code scanning functionality.

#### Features

- **Address Input**: Text input field with Ethereum address validation
- **QR Code Scanner**: Built-in camera scanner for QR codes containing Ethereum addresses
- **Address Validation**: Real-time validation with error display
- **Ethereum URI Support**: Handles `ethereum:` URI format from QR codes
- **Customizable**: Configurable label, placeholder, and styling
- **Accessibility**: Supports disabled state and proper form controls

#### Props

```javascript
type Props = {
  value: string,                    // Current address value
  onChangeText: (address: string) => void,  // Callback when address changes
  placeholder?: string,             // Input placeholder text (default: "0x...")
  label?: string,                   // Input label (default: "Address")
  style?: ?{},                      // Custom container styles
  disabled?: boolean,               // Disable input and QR scanner (default: false)
  showQRButton?: boolean,           // Show QR code scanner button (default: true)
}
```

#### Usage

```javascript
import { AddressInput } from '../components';

function MyComponent() {
  const [address, setAddress] = useState('');

  return (
    <AddressInput
      value={address}
      onChangeText={setAddress}
      label="Recipient Address"
      placeholder="Enter Ethereum address..."
    />
  );
}
```

### AmountInput

A reusable component for inputting and validating token amounts with configurable decimal precision.

#### Features

- **Token Amount Input**: Numeric input field with decimal validation
- **Dynamic Decimal Validation**: Enforces maximum decimal places based on token configuration
- **Real-time Validation**: Instant feedback for invalid amounts
- **Input Filtering**: Only allows numeric input and single decimal point
- **Token-Aware**: Dynamic placeholder and validation based on token symbol and decimals
- **Error Display**: Clear error messages for validation failures

#### Props

```javascript
type Props = {
  value: string,                    // Current amount value
  onChangeText: (amount: string) => void,   // Callback when amount changes
  tokenSymbol: string,              // Token symbol (e.g., "ETH", "USDC")
  tokenDecimals: number,            // Maximum decimal places (e.g., 18 for ETH, 6 for USDC)
  label?: string,                   // Input label (default: "Amount")
  placeholder?: string,             // Custom placeholder (auto-generated if not provided)
  style?: ?{},                      // Custom container styles
  disabled?: boolean,               // Disable input (default: false)
}
```

#### Usage

```javascript
import { AmountInput } from '../components';

function MyComponent() {
  const [amount, setAmount] = useState('');
  const selectedToken = { symbol: 'ETH', decimals: 18 };

  return (
    <AmountInput
      value={amount}
      onChangeText={setAmount}
      tokenSymbol={selectedToken.symbol}
      tokenDecimals={selectedToken.decimals}
      label="Send Amount"
    />
  );
}
```

#### Validation Examples

- **ETH (18 decimals)**: Allows up to 18 decimal places (e.g., "1.123456789012345678")
- **USDC (6 decimals)**: Allows up to 6 decimal places (e.g., "100.123456")
- **Input Filtering**: "abc123.45.67" becomes "123.45" (removes letters and extra decimals)
- **Error Messages**: "Maximum 6 decimal places allowed for USDC"

#### Validation Functions

Both components export validation functions for external use:

```javascript
import { validateEthereumAddress, validateTokenAmount } from '../components';

// Address validation
const isValidAddress = validateEthereumAddress('0x742d35Cc6635C0532925a3b8D40468e2b0F255B8');

// Amount validation
const amountError = validateTokenAmount('123.456789', 'USDC', 6);
// Returns: "Maximum 6 decimal places allowed for USDC"
```

#### Dependencies

- `ethers`: For Ethereum address validation and checksumming
- `expo-barcode-scanner`: For QR code scanning functionality (AddressInput only)
- `react-native-vector-icons/MaterialIcons`: For the QR scanner icon (AddressInput only)
