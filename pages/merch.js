// pages/merch.js
// Merchandise page displaying products with special perks for NFT holders

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import MerchCard from '../components/MerchCard';
import { supabase } from '../lib/supabase';

export default function MerchPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hasNFT, setHasNFT] = useState(false);
  const [merchItems, setMerchItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'clothing', 'accessories', 'collectibles'

  useEffect(() => {
    // Check if user is logged in and fetch merchandise data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current session and user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Fetch user profile to check NFT status
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profile) {
            setHasNFT(profile.has_nft || false);
          }
        }
        
        // Fetch merchandise items from Supabase
        const { data: items } = await supabase
          .from('merchandise')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (items) {
          setMerchItems(items);
        } else {
          // If no items in DB, create dummy data
          const dummyItems = generateDummyMerchItems();
          setMerchItems(dummyItems);
        }
      } catch (error) {
        console.error('Error fetching merchandise data:', error.message);
        // If error, use dummy data
        const dummyItems = generateDummyMerchItems();
        setMerchItems(dummyItems);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate dummy merchandise data for display purposes
  const generateDummyMerchItems = () => {
    return [
      {
        id: 1,
        name: "TB12 Vintage Jersey",
        description: "Limited edition vintage style jersey with TB12 logo and signature.",
        price: 129.99,
        image_url: "/images/merch-jersey.png",
        category: "clothing",
        nftDiscount: 15,
        nftPerks: true,
        earlyAccess: true,
        in_stock: true,
      },
      {
        id: 2,
        name: "Game Day Hoodie",
        description: "Premium quality hoodie with embroidered TB12.LFG logo, perfect for game days.",
        price: 89.99,
        image_url: "/images/merch-hoodie.png",
        category: "clothing",
        nftDiscount: 10,
        nftPerks: true,
        earlyAccess: false,
        in_stock: true,
      },
      {
        id: 3,
        name: "Commemorative Football",
        description: "Collector's football with career highlights and signature.",
        price: 149.99,
        image_url: "/images/merch-football.png",
        category: "collectibles",
        nftDiscount: 20,
        nftPerks: true,
        earlyAccess: true,
        in_stock: true,
      },
      {
        id: 4,
        name: "TB12.LFG Cap",
        description: "Adjustable cap with embroidered TB12.LFG logo.",
        price: 34.99,
        image_url: "/images/merch-cap.png",
        category: "accessories",
        nftDiscount: 10,
        nftPerks: true,
        earlyAccess: false,
        in_stock: true,
      },
      {
        id: 5,
        name: "GOAT T-Shirt",
        description: "Premium cotton t-shirt with GOAT graphic design.",
        price: 39.99,
        image_url: "/images/merch-tshirt.png",
        category: "clothing",
        nftDiscount: 10,
        nftPerks: false,
        earlyAccess: false,
        in_stock: true,
      },
      {
        id: 6,
        name: "TB12 Signed Photo",
        description: "Limited edition framed photo with authentic signature.",
        price: 299.99,
        image_url: "/images/merch-photo.png",
        category: "collectibles",
        nftDiscount: 0,
        nftPerks: false,
        earlyAccess: false,
        in_stock: true,
      },
    ];
  };

  const filteredItems = filter === 'all' 
    ? merchItems 
    : merchItems.filter(item => item.category === filter);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="px-6 py-12 sm:px-12 relative">
              <div className="relative z-10 max-w-3xl">
                <h1 className="text-white text-3xl font-bold sm:text-4xl">TB12.LFG Merchandise</h1>
                <p className="text-blue-100 mt-2 text-lg">
                  Exclusive merchandise for the ultimate Brady fans
                  {hasNFT && (
                    <span className="ml-2 bg-yellow-400 text-blue-900 text-xs font-bold px-2 py-1 rounded-full">
                      NFT HOLDER PERKS ACTIVE
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          {/* NFT Benefits Banner */}
          {!hasNFT && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <div className="sm:flex-1">
                  <h3 className="text-lg font-medium text-blue-800">Unlock NFT Member Benefits</h3>
                  <p className="mt-1 text-blue-600 text-sm">
                    Mint a TB12.LFG NFT to receive early access and exclusive discounts on merchandise!
                  </p>
                </div>
                <div className="mt-3 sm:mt-0">
                  <button 
                    onClick={() => router.push('/nft')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium text-sm"
                  >
                    Mint NFT
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Filter Bar */}
          <div className="mb-8 bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-700 font-medium mr-2">Filter:</span>
              <button 
                onClick={() => setFilter('all')} 
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Products
              </button>
              <button 
                onClick={() => setFilter('clothing')} 
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'clothing' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Clothing
              </button>
              <button 
                onClick={() => setFilter('accessories')} 
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'accessories' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Accessories
              </button>
              <button 
                onClick={() => setFilter('collectibles')} 
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'collectibles' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Collectibles
              </button>
            </div>
          </div>
          
          {/* Merchandise Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <MerchCard key={item.id} item={item} hasNFT={hasNFT} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex justify-center mb-4">
                <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900">No Products Found</h3>
              <p className="text-gray-500 mt-2">
                We couldn't find any products matching your filter. Try selecting a different category.
              </p>
              <button
                onClick={() => setFilter('all')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Show All Products
              </button>
            </div>
          )}

          {/* Coming Soon Section */}
          <div className="mt-12 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Coming Soon</h2>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-xl overflow-hidden">
              <div className="px-6 py-12 sm:px-12 relative">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-2/3">
                    <h3 className="text-white text-2xl font-bold">Limited Edition Collector's Box</h3>
                    <p className="text-gray-300 mt-2">
                      A premium collection of exclusive TB12 memorabilia, coming this fall. 
                      NFT holders will get first access and a significant discount.
                    </p>
                    <div className="mt-6">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium">
                        Get Notified
                      </button>
                    </div>
                  </div>
                  <div className="md:w-1/3 mt-6 md:mt-0 flex justify-center">
                    <div className="bg-gray-700 p-2 rounded-lg transform rotate-3">
                      <img
                        src="/images/coming-soon.png"
                        alt="Coming Soon"
                        className="w-full max-w-xs rounded"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Coming+Soon' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}