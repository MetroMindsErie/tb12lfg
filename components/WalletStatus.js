// components/WalletStatus.js
// Component to display wallet connection status and information

import { useAccount } from 'wagmi';

export default function WalletStatus({ profile }) {
  const { address, isConnected } = useAccount();
  
  // Format address for display (0x1234...5678)
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // If no wallet is connected, show nothing
  if (!isConnected && !profile?.wallet_address) {
    return null;
  }
  
  return (
    <div className="bg-white p-4 shadow rounded-lg mb-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full">
            <svg className="h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">
              {isConnected ? 'Wallet Connected' : 'Wallet Saved'}
            </h3>
            <p className="text-xs text-gray-500">
              {isConnected ? formatAddress(address) : formatAddress(profile?.wallet_address)}
            </p>
          </div>
        </div>
        
        {profile?.has_nft && (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            NFT Benefits Active
          </div>
        )}
      </div>
    </div>
  );
}