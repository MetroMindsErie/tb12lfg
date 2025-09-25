// components/MerchCard.js
// Component for displaying individual merchandise items

export default function MerchCard({ item, hasNFT = false }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      {hasNFT && item.nftPerks && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
          NFT PERK
        </div>
      )}

      <div className="h-48 relative overflow-hidden">
        <img 
          src={item.image_url || '/images/default-merch.png'} 
          alt={item.name}
          className="w-full h-full object-cover object-center transition-transform duration-300 transform hover:scale-110"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
        
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center">
            {hasNFT && item.nftDiscount ? (
              <>
                <span className="text-gray-400 line-through mr-2">${item.price.toFixed(2)}</span>
                <span className="text-xl font-bold text-green-600">
                  ${(item.price * (1 - item.nftDiscount / 100)).toFixed(2)}
                </span>
                <span className="ml-2 text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {item.nftDiscount}% OFF
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
            )}
          </div>
          
          {hasNFT && item.earlyAccess && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Early Access
            </span>
          )}
        </div>
        
        <div className="mt-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}