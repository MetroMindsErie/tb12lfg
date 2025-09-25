// pages/dashboard.js
// User dashboard with personalized content and features

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { user, wallet } = useAuth();
  const [userNFTs, setUserNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch user's NFTs from profile
    const fetchNFTs = async () => {
      setIsLoading(true);
      try {
        // Get profile data from AuthContext which should include the nfts array
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No user found, cannot fetch NFTs');
          setUserNFTs([]);
          return;
        }
        
        // Fetch profile with nfts array
        const { data: profile, error } = await supabase
          .from('tb12_profiles')
          .select('nfts')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile NFTs:', error);
          setUserNFTs([]);
          return;
        }
        
        if (profile && profile.nfts && Array.isArray(profile.nfts)) {
          // Use the NFTs from the profile
          console.log('NFTs found in profile:', profile.nfts);
          setUserNFTs(profile.nfts);
        } else {
          console.log('No NFTs found in profile');
          setUserNFTs([]);
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setUserNFTs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  // Content is wrapped in ProtectedRoute for authentication check
  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900">
                Welcome back, {user?.name || 'Fan'}!
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Here's your personal TB12.LFG dashboard
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Account Summary Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900">Your Account</h2>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 text-sm">
                        <p className="text-gray-500">Email</p>
                        <p className="text-gray-700">{user?.email || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 text-sm">
                        <p className="text-gray-500">Membership</p>
                        <p className="text-gray-700">Free Member</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 text-sm">
                        <p className="text-gray-500">Wallet</p>
                        <p className="text-gray-700">
                          {wallet ? (
                            <span className="truncate">{wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 6)}</span>
                          ) : (
                            'Not connected'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <a href="/profile" className="font-medium text-blue-600 hover:text-blue-500">
                      View profile <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Recent Activity Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                  <div className="mt-4 space-y-4">
                    <div className="border-l-4 border-blue-400 pl-3 py-2">
                      <p className="text-sm text-gray-700">Welcome to TB12.LFG! Your account has been created.</p>
                      <p className="text-xs text-gray-500">Today</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-3 py-2">
                      <p className="text-sm text-gray-700">Explore our exclusive NFT collections</p>
                      <p className="text-xs text-gray-500">Today</p>
                    </div>
                    <div className="border-l-4 border-gray-200 pl-3 py-2">
                      <p className="text-sm text-gray-700">Complete your profile to personalize your experience</p>
                      <p className="text-xs text-gray-500">Action needed</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      View all activity <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Featured Content Card */}
              {/* <div className="bg-gradient-to-br from-blue-700 to-blue-900 overflow-hidden shadow rounded-lg text-white">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium">Featured Content</h2>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src="/images/f6d671cb-f340-450d-a656-ef66bf8a9874.png" 
                        alt="Featured NFT" 
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4 bg-blue-800">
                        <h3 className="text-white font-medium">New NFT Collection</h3>
                        <p className="text-blue-100 text-sm mt-1">Exclusive collection dropping soon. Get early access as a member!</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-800 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-100 hover:text-white">
                      Learn more <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div> */}
            </div>

            {/* NFT Collection Section */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900">Your NFT Collection</h2>
              
              {isLoading ? (
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : userNFTs.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {userNFTs.map((nft) => (
                    <div key={nft.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                      <div className="relative pb-[100%]">
                        <img
                          src={nft.image_url || '/images/default-nft.png'}
                          alt={nft.name}
                          className="absolute h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/default-nft.png';
                          }}
                        />
                      </div>
                      <div className="px-4 py-4">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{nft.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{nft.description}</p>
                        <div className="mt-4">
                          <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            View details
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : wallet ? (
                <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-gray-500">You don't have any NFTs yet.</p>
                  <a href="#" className="mt-2 inline-block text-blue-600 hover:text-blue-500 font-medium">
                    Browse NFT collections
                  </a>
                </div>
              ) : (
                <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-gray-500">Connect your wallet to see your NFTs.</p>
                  <a href="/profile" className="mt-2 inline-block text-blue-600 hover:text-blue-500 font-medium">
                    Connect wallet
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}