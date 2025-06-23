export const sepolia = Object.freeze({
  id: 11_155_111,
  name: 'Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io',
      apiUrl: 'https://api-sepolia.etherscan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 751532,
    },
    ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' },
    ensUniversalResolver: {
      address: '0xc8Af999e38273D658BE1b921b88A9Ddf005769cC',
      blockCreated: 5_317_080,
    },
  },
  tokens: {
    usdc: {
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      decimals: 6,
      symbol: 'USDC',
      name: 'USD Coin',
    },
    dai: {
      address: '0x511243992D17992E34125EF1274C7DCA4a94C030',
      decimals: 18,
      symbol: 'DAI',
      name: 'Dai Stablecoin',
    },
    usdt: {
      address: '0xfe80d187f052C18532DfEFD0152647786fb0A7c6',
      decimals: 6,
      symbol: 'USDT',
      name: 'Tether USD',
    },
  },
  testnet: true,
});
