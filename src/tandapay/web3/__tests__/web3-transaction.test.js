/* @flow strict-local */

/**
 * Tests for migrated transaction functions in web3.js (Phase 1.3)
 * Tests the new TandaPayResult<T> error handling patterns
 */

import { transferToken, estimateTransferGas, getTokenInfo } from '../../web3';
import type { Token } from '../../tokens/tokenTypes';

// Mock dependencies
jest.mock('../providers/ProviderManager');
jest.mock('../../boot/store');
jest.mock('@ethersproject/shims');

// Increase timeout for async tests
jest.setTimeout(15000);

// Mock token data
const mockETHToken: Token = {
  symbol: 'ETH',
  name: 'Ethereum',
  address: null, // ETH has no contract address
  decimals: 18,
  isCustom: false,
  isDefault: true,
};

const mockERC20Token: Token = {
  symbol: 'USDC',
  name: 'USD Coin',
  address: '0xa0b86a33e6dc391d0165b8b7e0e5a53ff8d6eeb6',
  decimals: 6,
  isCustom: false,
  isDefault: false,
};

// Mock provider methods
const mockProvider = {
  getBalance: jest.fn(),
  getGasPrice: jest.fn(),
  estimateGas: jest.fn(),
};

const mockContract = {
  transfer: jest.fn(),
  estimateGas: {
    transfer: jest.fn(),
  },
  symbol: jest.fn(),
  name: jest.fn(),
  decimals: jest.fn(),
};

const mockWallet = {
  sendTransaction: jest.fn(),
};

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    utils: {
      getAddress: jest.fn((addr) => addr.toLowerCase()), // Simple mock checksum
      parseEther: jest.fn((val) => ({ toString: () => `${val}000000000000000000` })),
      parseUnits: jest.fn((val, decimals) => ({ toString: () => `${val}${'0'.repeat(decimals)}` })),
      formatUnits: jest.fn((val, unit) => {
        if (unit === 'gwei') return '20.5';
        return '0.1';
      }),
      formatEther: jest.fn(() => '1.0'),
      isAddress: jest.fn(() => true),
    },
    Wallet: jest.fn(() => mockWallet),
    Contract: jest.fn(() => mockContract),
    BigNumber: {
      from: jest.fn((val) => ({ toString: () => String(val) })),
    },
  },
}));

// Mock getProvider to return our mock provider
jest.doMock('../web3', () => ({
  ...jest.requireActual('../web3'),
  getProvider: jest.fn(() => mockProvider),
}));

describe('Phase 1.3: Transaction Functions Migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockProvider.getBalance.mockResolvedValue({ toString: () => '1000000000000000000' });
    mockProvider.getGasPrice.mockResolvedValue({ toString: () => '20000000000' });
    mockProvider.estimateGas.mockResolvedValue({ toString: () => '21000' });
    mockContract.transfer.mockResolvedValue({ hash: '0xtest123', wait: jest.fn() });
    mockContract.estimateGas.transfer.mockResolvedValue({ toString: () => '65000' });
    mockContract.symbol.mockResolvedValue('USDC');
    mockContract.name.mockResolvedValue('USD Coin');
    mockContract.decimals.mockResolvedValue(6);
    mockWallet.sendTransaction.mockResolvedValue({ hash: '0xtest456', wait: jest.fn() });
  });

  describe('transferToken', () => {
    test('successfully transfers ETH and returns TandaPayResult<string>', async () => {
      const result = await transferToken(
        mockETHToken,
        '0x1234567890123456789012345678901234567890123456789012345678901234',
        '0xrecipient123456789012345678901234567890',
        '1.5',
        'sepolia'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('0xtest456');
        expect(typeof result.data).toBe('string');
      }
    });

    test('successfully transfers ERC20 and returns TandaPayResult<string>', async () => {
      const result = await transferToken(
        mockERC20Token,
        '0x1234567890123456789012345678901234567890123456789012345678901234',
        '0xrecipient123456789012345678901234567890',
        '100',
        'sepolia'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('0xtest123');
        expect(typeof result.data).toBe('string');
      }
    });

    test('returns validation error for missing token', async () => {
      // $FlowFixMe[incompatible-call] - Intentionally passing null for testing
      const result = await transferToken(
        null,
        '0x1234567890123456789012345678901234567890123456789012345678901234',
        '0xrecipient123456789012345678901234567890',
        '1.0',
        'sepolia'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.userMessage).toContain('token');
      }
    });

    test('returns validation error for empty private key', async () => {
      const result = await transferToken(
        mockETHToken,
        '',
        '0xrecipient123456789012345678901234567890',
        '1.0',
        'sepolia'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('WALLET_ERROR');
        expect(result.error.userMessage).toContain('wallet');
      }
    });

    test('returns validation error for invalid amount', async () => {
      const result = await transferToken(
        mockETHToken,
        '0x1234567890123456789012345678901234567890123456789012345678901234',
        '0xrecipient123456789012345678901234567890',
        '0',
        'sepolia'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.userMessage).toContain('amount');
      }
    });
  });

  describe('estimateTransferGas', () => {
    test('successfully estimates gas for ETH transfer and returns TandaPayResult<GasEstimateData>', async () => {
      const result = await estimateTransferGas(
        mockETHToken,
        '0xsender123456789012345678901234567890',
        '0xrecipient123456789012345678901234567890',
        '1.0',
        'sepolia'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gasLimit).toBe('21000');
        expect(result.data.gasPrice).toBe('20.5');
        expect(result.data.estimatedCost).toMatch(/^\d+\.\d{8}$/); // Should be formatted to 8 decimals
        expect(typeof result.data.gasLimit).toBe('string');
        expect(typeof result.data.gasPrice).toBe('string');
        expect(typeof result.data.estimatedCost).toBe('string');
      }
    });

    test('successfully estimates gas for ERC20 transfer and returns TandaPayResult<GasEstimateData>', async () => {
      const result = await estimateTransferGas(
        mockERC20Token,
        '0xsender123456789012345678901234567890',
        '0xrecipient123456789012345678901234567890',
        '100',
        'sepolia'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gasLimit).toBe('65000');
        expect(result.data.gasPrice).toBe('20.5');
        expect(typeof result.data.estimatedCost).toBe('string');
      }
    });

    test('returns validation error for missing addresses', async () => {
      const result = await estimateTransferGas(
        mockETHToken,
        '',
        '0xrecipient123456789012345678901234567890',
        '1.0',
        'sepolia'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.userMessage).toContain('sender');
      }
    });
  });

  describe('getTokenInfo', () => {
    test('successfully fetches token info and returns TandaPayResult<TokenInfo>', async () => {
      const result = await getTokenInfo(
        '0xa0b86a33e6dc391d0165b8b7e0e5a53ff8d6eeb6',
        'sepolia'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.symbol).toBe('USDC');
        expect(result.data.name).toBe('USD Coin');
        expect(result.data.decimals).toBe(6);
        expect(typeof result.data.symbol).toBe('string');
        expect(typeof result.data.name).toBe('string');
        expect(typeof result.data.decimals).toBe('number');
      }
    });

    test('returns validation error for empty contract address', async () => {
      const result = await getTokenInfo('', 'sepolia');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.userMessage).toContain('contract address');
      }
    });

    test('handles network errors gracefully', async () => {
      // Mock network failure
      mockContract.symbol.mockRejectedValue(new Error('Network timeout'));

      const result = await getTokenInfo(
        '0xa0b86a33e6dc391d0165b8b7e0e5a53ff8d6eeb6',
        'sepolia'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('NETWORK_ERROR');
        expect(result.error.retryable).toBe(true);
      }
    });
  });

  describe('Error Structure Validation', () => {
    test('all error results follow TandaPayError structure', async () => {
      const result = await transferToken(
        mockETHToken,
        '', // Invalid private key
        '0xrecipient123456789012345678901234567890',
        '1.0',
        'sepolia'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        // Verify TandaPayError structure
        expect(result.error).toHaveProperty('type');
        expect(result.error).toHaveProperty('message');
        expect(result.error).toHaveProperty('userMessage');
        expect(result.error).toHaveProperty('timestamp');
        expect(typeof result.error.timestamp).toBe('number');
        expect(result.error.timestamp).toBeGreaterThan(0);
      }
    });

    test('success results follow TandaPayResult<T> structure', async () => {
      const result = await getTokenInfo(
        '0xa0b86a33e6dc391d0165b8b7e0e5a53ff8d6eeb6',
        'sepolia'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result).toHaveProperty('data');
        expect(result).not.toHaveProperty('error');
        expect(typeof result.data).toBe('object');
      }
    });
  });
});
