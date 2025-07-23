/* @flow strict-local */

import {
  formatTokenAmount,
  findTokenByAddress,
  findTokenBySymbol,
  getTokensForNetwork,
  getNativeTokenForNetwork,
} from '../index';

describe('Token Utilities', () => {
  describe('formatTokenAmount', () => {
    it('should format ETH amounts correctly', () => {
      const ethToken = {
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        address: null,
      };

      const result = formatTokenAmount(ethToken, '1000000000000000000');
      expect(result.amount).toBe('1');
      expect(result.symbol).toBe('ETH');
      expect(result.formattedDisplay).toBe('1 ETH');
    });

    it('should handle null token gracefully', () => {
      const result = formatTokenAmount(null, '1000000000000000000');
      expect(result.amount).toBe('1000000000000000000');
      expect(result.symbol).toBe('units');
      expect(result.formattedDisplay).toBe('1000000000000000000 units');
    });

    it('should format USDC amounts correctly', () => {
      const usdcToken = {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        address: '0x1234',
      };

      const result = formatTokenAmount(usdcToken, '1000000');
      expect(result.amount).toBe('1');
      expect(result.symbol).toBe('USDC');
      expect(result.formattedDisplay).toBe('1 USDC');
    });
  });

  describe('findTokenByAddress', () => {
    it('should find ETH by null address', () => {
      const result = findTokenByAddress('sepolia', null);
      expect(result).not.toBeNull();
      expect(result?.symbol).toBe('ETH');
      expect(result?.address).toBeNull();
    });

    it('should find USDC by address on sepolia', () => {
      const result = findTokenByAddress('sepolia', '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238');
      expect(result).not.toBeNull();
      expect(result?.symbol).toBe('USDC');
    });

    it('should return null for unknown address', () => {
      const result = findTokenByAddress('sepolia', '0x1234567890123456789012345678901234567890');
      expect(result).toBeNull();
    });
  });

  describe('findTokenBySymbol', () => {
    it('should find ETH by symbol', () => {
      const result = findTokenBySymbol('sepolia', 'ETH');
      expect(result).not.toBeNull();
      expect(result?.symbol).toBe('ETH');
      expect(result?.address).toBeNull();
    });

    it('should find USDC by symbol on sepolia', () => {
      const result = findTokenBySymbol('sepolia', 'USDC');
      expect(result).not.toBeNull();
      expect(result?.symbol).toBe('USDC');
    });

    it('should return null for unknown symbol', () => {
      const result = findTokenBySymbol('sepolia', 'UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe('getTokensForNetwork', () => {
    it('should return all tokens for sepolia including native', () => {
      const tokens = getTokensForNetwork('sepolia');
      expect(tokens.length).toBeGreaterThan(0);

      // First token should be native ETH
      expect(tokens[0].symbol).toBe('ETH');
      expect(tokens[0].address).toBeNull();

      // Should include USDC
      const usdc = tokens.find(t => t.symbol === 'USDC');
      expect(usdc).toBeDefined();
    });
  });

  describe('getNativeTokenForNetwork', () => {
    it('should return ETH for sepolia', () => {
      const native = getNativeTokenForNetwork('sepolia');
      expect(native.symbol).toBe('ETH');
      expect(native.address).toBeNull();
      expect(native.decimals).toBe(18);
    });

    it('should return POL for polygon', () => {
      const native = getNativeTokenForNetwork('polygon');
      expect(native.symbol).toBe('POL');
      expect(native.address).toBeNull();
      expect(native.decimals).toBe(18);
    });
  });
});
