// @flow strict-local

import { getDefaultTokens, validateCustomToken } from '../tokenConfig';
import { selectToken, addCustomToken, updateTokenBalance } from '../tokenActions';
import { getSelectedToken, getAvailableTokens, getTokenBalance } from '../tokenSelectors';
import { TANDAPAY_TOKEN_SELECT, TANDAPAY_TOKEN_ADD_CUSTOM, TANDAPAY_TOKEN_UPDATE_BALANCE } from '../../../actionConstants';

describe('Token System Integration', () => {
  describe('tokenConfig', () => {
    test('getDefaultTokens returns ETH and common ERC20 tokens', () => {
      const tokens = getDefaultTokens('sepolia');

      expect(tokens.length).toBeGreaterThan(0);

      const ethToken = tokens.find(t => t.symbol === 'ETH');
      expect(ethToken).toBeDefined();
      expect(ethToken?.address).toBeNull();
      expect(ethToken?.isDefault).toBe(true);

      const usdcToken = tokens.find(t => t.symbol === 'USDC');
      expect(usdcToken).toBeDefined();
      expect(usdcToken?.address).toBeTruthy();
      expect(usdcToken?.isDefault).toBe(true);
    });

    test('validateCustomToken works correctly', () => {
      // Valid token
      expect(validateCustomToken({
        symbol: 'TEST',
        address: '0x1234567890123456789012345678901234567890',
        name: 'Test Token',
        decimals: 18,
      }).isValid).toBe(true);

      // Invalid address
      expect(validateCustomToken({
        symbol: 'TEST',
        address: 'invalid',
        name: 'Test Token',
        decimals: 18,
      }).isValid).toBe(false);

      // Empty symbol
      expect(validateCustomToken({
        symbol: '',
        address: '0x1234567890123456789012345678901234567890',
        name: 'Test Token',
        decimals: 18,
      }).isValid).toBe(false);
    });
  });

  describe('tokenActions', () => {
    test('selectToken creates correct action', () => {
      const action = selectToken('USDC');
      expect(action).toEqual({
        type: TANDAPAY_TOKEN_SELECT,
        tokenSymbol: 'USDC',
      });
    });

    test('addCustomToken creates correct action', () => {
      const token = {
        symbol: 'TEST',
        address: '0x1234567890123456789012345678901234567890',
        name: 'Test Token',
        decimals: 18,
      };

      const action = addCustomToken(token);
      expect(action).toEqual({
        type: TANDAPAY_TOKEN_ADD_CUSTOM,
        token,
      });
    });

    test('updateTokenBalance creates correct action', () => {
      const action = updateTokenBalance('ETH', '1.5');
      expect(action).toEqual({
        type: TANDAPAY_TOKEN_UPDATE_BALANCE,
        tokenSymbol: 'ETH',
        balance: '1.5',
      });
    });
  });

  describe('tokenSelectors', () => {
    const mockState = {
      // Required PerAccountState structure
      alertWords: [],
      caughtUp: {},
      drafts: {},
      fetching: {},
      flags: {},
      messages: {},
      mute: {},
      mutedUsers: [],
      narrows: {},
      outbox: [],
      pmConversations: {},
      presence: {},
      realm: {},
      streams: [],
      subscriptions: [],
      topics: {},
      typing: {},
      unread: {},
      userGroups: [],
      userStatuses: {},
      users: [],
      session: {},
      settings: {},
      tandaPay: {
        tokens: {
          selectedTokenSymbol: 'USDC',
          customTokens: [],
          balances: {
            'ETH': { balance: '1.0', lastUpdated: Date.now() },
            'USDC': { balance: '100.0', lastUpdated: Date.now() - 120000 }, // 2 minutes old
          },
        },
        settings: {
          selectedTokenSymbol: 'USDC',
          defaultNetwork: 'sepolia',
        },
      },
    };

    test('getSelectedToken returns correct token', () => {
      // $FlowFixMe[unclear-type] - Mock state for testing
      const selected = getSelectedToken((mockState: any));
      expect(selected).toBeTruthy();
      expect(selected?.symbol).toBe('USDC');
      expect(selected?.isDefault).toBe(true);
    });

    test('getAvailableTokens returns default and custom tokens', () => {
      // $FlowFixMe[unclear-type] - Mock state for testing
      const tokens = getAvailableTokens((mockState: any));
      expect(tokens.length).toBeGreaterThan(0);

      const ethToken = tokens.find(t => t.symbol === 'ETH');
      expect(ethToken).toBeDefined();

      const usdcToken = tokens.find(t => t.symbol === 'USDC');
      expect(usdcToken).toBeDefined();
    });

    test('getTokenBalance returns cached balance', () => {
      // $FlowFixMe[unclear-type] - Mock state for testing
      const ethBalance = getTokenBalance((mockState: any), 'ETH');
      expect(ethBalance).toEqual({
        balance: '1.0',
        lastUpdated: expect.any(Number),
      });

      // $FlowFixMe[unclear-type] - Mock state for testing
      const usdcBalance = getTokenBalance((mockState: any), 'USDC');
      expect(usdcBalance).toEqual({
        balance: '100.0',
        lastUpdated: expect.any(Number),
      });

      // $FlowFixMe[unclear-type] - Mock state for testing
      const unknownBalance = getTokenBalance((mockState: any), 'UNKNOWN');
      expect(unknownBalance).toBeNull();
    });
  });
});
