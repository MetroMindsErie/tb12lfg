// components/NFTCard.js
// Component for displaying individual NFT cards

import { useState } from 'react';

export default function NFTCard({ nft }) {
  const [imageError, setImageError] = useState(false);
  
  // Safety check - if nft is null/undefined, show placeholder
  if (!nft) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative pb-2/3">
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">NFT data unavailable</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800">Unknown NFT</h3>
          <p className="text-sm text-gray-500 mt-1">Data could not be loaded</p>
        </div>
      </div>
    );
  }
  
  // Format date safely
  const formattedDate = nft.created_at ? 
    new Date(nft.created_at).toLocaleDateString() : 
    'Unknown date';
  
  // Handle display of wallet address
  const displayAddress = nft.owner_address ? 
    `${nft.owner_address.substring(0, 6)}...${nft.owner_address.substring(nft.owner_address.length - 4)}` : 
    'Unknown';
    
  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition transform hover:scale-105 hover:shadow-xl">
      <div className="relative" style={{ paddingBottom: '66.67%' }}> {/* 2:3 aspect ratio */}
        {!imageError ? (
          <img 
            src={nft.image_url || '/images/default-nft.png'} 
            alt={nft.name || 'NFT'}
            className="absolute h-full w-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="absolute h-full w-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Image unavailable</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{nft.name || 'Unnamed NFT'}</h3>
        <p className="text-sm text-gray-500 mt-1">{nft.description || 'No description available'}</p>
        
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            #{nft.token_id || '0000'}
          </span>
          <span className="text-xs text-gray-500">
            Minted: {formattedDate}
          </span>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 truncate">
            Owner: {displayAddress}
          </p>
        </div>
      </div>
    </div>
  );
}