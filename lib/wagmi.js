// lib/wagmi.js
// Configuration for wagmi wallet connections

import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';

// Configure chains & providers with public provider.
// This is a robust way to connect to various networks
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

// Set up wagmi config with our desired connectors
export const config = createConfig({
  autoConnect: false, // Don't auto-connect, we'll handle this manually
  publicClient,
  webSocketPublicClient,
  connectors: [
    new MetaMaskConnector({ 
      chains,
      options: {
        shimDisconnect: true,
      }
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'TB12.LFG',
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Browser Wallet',
        shimDisconnect: true,
      },
    })
  ],
});

// Export configured items for use in our app
export { chains };