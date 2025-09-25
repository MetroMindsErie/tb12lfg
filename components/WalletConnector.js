// components/WalletConnector.js
// Component for connecting Web3 wallets using wagmi

import { useState } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';

export default function WalletConnector({ onConnect, onDisconnect }) {
  const [error, setError] = useState(null);
  
  // Use wagmi hooks
  const { connectors, connect, isPending, pendingConnector } = useConnect({
    onSuccess: (data) => handleConnectSuccess(data),
    onError: (error) => {
      console.error('Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
    }
  });
  
  const { disconnect } = useDisconnect({
    onSuccess: () => {
      if (onDisconnect) onDisconnect();
    }
  });
  
  const { address, connector: activeConnector } = useAccount();
  
  // Handle successful connection
  const handleConnectSuccess = (data) => {
    console.log("Wallet connected successfully:", data);
    
    if (onConnect && data.account) {
      // Create the wallet data object expected by our app
      const walletData = {
        address: data.account,
        chainId: data.chain?.id?.toString() || 'unknown',
        walletName: data.connector?.name || 'Web3 Wallet',
        connectedAt: new Date().toISOString()
      };
      
      // Pass the wallet data to the parent component
      onConnect(walletData);
    }
  };
  
  // Filter available connectors (we only want MetaMask for now)
  const availableConnectors = connectors.filter(connector => 
    connector.name === 'MetaMask' || connector.id === 'metaMask'
  );
  
  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-3">
        {availableConnectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => {
              setError(null);
              connect({ connector });
            }}
            disabled={!connector.ready || isPending}
            className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 mr-3">
                <svg viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M32.9583 1L19.8242 10.7183L22.2666 5.09944L32.9583 1Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.04175 1L15.0487 10.809L12.7335 5.09944L2.04175 1Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M28.2541 23.7363L24.7761 29.1487L32.1866 31.2213L34.3147 23.8542L28.2541 23.7363Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M0.699951 23.8542L2.81355 31.2213L10.224 29.1487L6.746 23.7363L0.699951 23.8542Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.83153 14.6152L7.73444 17.7682L15.0757 18.0969L14.8292 10.187L9.83153 14.6152Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M25.1686 14.6152L20.0993 10.0963L19.8242 18.0969L27.1655 17.7682L25.1686 14.6152Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.224 29.1487L14.6396 26.9582L10.8285 23.8998L10.224 29.1487Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.3604 26.9582L24.7761 29.1487L24.1716 23.8998L20.3604 26.9582Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-left">{connector.name}</h4>
                <p className="text-sm text-gray-500 text-left">
                  {!connector.ready ? 'Not installed' : 'Connect to wallet'}
                </p>
              </div>
            </div>
            <div>
              {isPending && connector.id === pendingConnector?.id ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
              ) : (
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        ))}
        
        {availableConnectors.length === 0 && (
          <div className="border border-gray-200 rounded-md p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-3">No Wallet Detected</h3>
            <p className="text-sm text-gray-600 mb-4">
              To connect your wallet, you'll need to install a Web3 wallet extension.
            </p>
            <div className="space-y-3">
              <a 
                href="https://metamask.io/download.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <div className="w-8 h-8 mr-3">
                  <svg viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32.9583 1L19.8242 10.7183L22.2666 5.09944L32.9583 1Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2.04175 1L15.0487 10.809L12.7335 5.09944L2.04175 1Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M28.2541 23.7363L24.7761 29.1487L32.1866 31.2213L34.3147 23.8542L28.2541 23.7363Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M0.699951 23.8542L2.81355 31.2213L10.224 29.1487L6.746 23.7363L0.699951 23.8542Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.83153 14.6152L7.73444 17.7682L15.0757 18.0969L14.8292 10.187L9.83153 14.6152Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M25.1686 14.6152L20.0993 10.0963L19.8242 18.0969L27.1655 17.7682L25.1686 14.6152Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.224 29.1487L14.6396 26.9582L10.8285 23.8998L10.224 29.1487Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.3604 26.9582L24.7761 29.1487L24.1716 23.8998L20.3604 26.9582Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Install MetaMask</h4>
                  <p className="text-sm text-gray-500">The most popular Web3 wallet</p>
                </div>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}