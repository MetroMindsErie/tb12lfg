// components/WagmiProvider.js
// Provider component to wrap the application with wagmi functionality

import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../lib/wagmi';

// Create a client for React Query
const queryClient = new QueryClient();

// Wrap children with the necessary providers for wagmi to work
export default function WagmiProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        {children}
      </WagmiConfig>
    </QueryClientProvider>
  );
}