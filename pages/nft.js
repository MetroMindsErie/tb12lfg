// pages/nft.js
// NFT page to display user's NFTs and provide minting functionality

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import NFTCard from '../components/NFTCard';
import { supabase } from '../lib/supabase';
import { mintNFT } from '../lib/web3';
import { useAuth } from '../context/AuthContext';
import { useAccount } from 'wagmi';
import WalletConnector from '../components/WalletConnector';

export default function NFTPage() {
  const router = useRouter();
  const { 
    user, 
    profile: userProfile, 
    wallet,
    connectWallet: updateAuthWallet,
    disconnectWallet
  } = useAuth();
  const { address: connectedAddress, isConnected } = useAccount();
  
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mintLoading, setMintLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null); // null, 'pending', 'success', 'error'
  const [txHash, setTxHash] = useState(null);

  useEffect(() => {
    // Check if user is logged in and fetch NFTs
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          router.push('/login');
          return;
        }

        // Option 1: Fetch user's NFTs from their profile where we now store the NFTs array
        if (userProfile && userProfile.nfts && Array.isArray(userProfile.nfts)) {
          // If we already have the nfts array in the userProfile from the Auth context
          setNfts(userProfile.nfts);
        } else {
          // Option 2: Fetch user profile with NFTs array
          const { data: profileData, error: profileError } = await supabase
            .from('tb12_profiles')
            .select('nfts')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile NFTs:', profileError.message);
            
            // Fallback to direct NFTs table query
            const { data: userNfts } = await supabase
              .from('nfts')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
              
            if (userNfts) {
              setNfts(userNfts);
            }
          } else if (profileData && profileData.nfts) {
            // Use the NFTs array from the profile
            setNfts(profileData.nfts);
          }
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userProfile, router]);

  const handleWalletLink = async (walletData) => {
    try {
      // Validate wallet data
      if (!walletData || !walletData.address) {
        throw new Error('Invalid wallet data. Please try connecting again.');
      }
      
      console.log("Linking wallet address:", walletData.address);
      
      // Update the profile table for the connected user
      const { data: updatedProfile, error: profileDbError } = await supabase
        .from('tb12_profiles')
        .update({ 
          wallet_address: walletData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();
        
      if (profileDbError) {
        console.error("Error saving wallet to profile:", profileDbError);
        alert(`Failed to save wallet address: ${profileDbError.message}`);
        return;
      }
      
      console.log("Updated tb12_profiles with wallet address:", updatedProfile);
      
      // Update user metadata in Supabase
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          walletAddress: walletData.address,
          wallet_last_signed: new Date().toISOString()
        }
      });
      
      if (userUpdateError) {
        console.error("Error updating user metadata:", userUpdateError);
        alert(userUpdateError.message);
        return;
      }
      
      // Check for NFTs in the connected wallet
      try {
        // Import the utility function if it's available
        const { checkAndUpdateNftStatus } = await import('../utils/nft-utils');
        if (checkAndUpdateNftStatus) {
          await checkAndUpdateNftStatus(user.id, walletData.address);
        }
      } catch (err) {
        console.log("NFT check not available, skipping:", err);
      }
      
      // Update wallet in auth context
      updateAuthWallet(walletData);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const handleMintNFT = async () => {
    if (!isConnected && !wallet) {
      alert('Please connect your wallet first.');
      return;
    }
    
    const walletAddress = connectedAddress || wallet?.address;
    
    try {
      setMintLoading(true);
      setTxStatus('pending');
      
      // Call the mintNFT function from web3.js
      const result = await mintNFT(walletAddress);
      
      if (result.success) {
        setTxStatus('success');
        setTxHash(result.transactionHash);
        
        // Create a new NFT object
        const newNFT = {
          user_id: user.id,
          name: 'TB12.LFG Membership NFT',
          description: 'Exclusive membership NFT for TB12.LFG community',
          image_url: 'https://rpzponmtyxxzuvffhzdn.supabase.co/storage/v1/object/public/nfts/f6d671cb-f340-450d-a656-ef66bf8a9874.png',
          token_id: Math.floor(Math.random() * 10000) + 1, // This is just a placeholder
          owner_address: walletAddress,
          transaction_hash: result.transactionHash,
          created_at: new Date().toISOString()
        };
        
        // Add the new NFT to the nfts table
        const { data: savedNFT, error: nftError } = await supabase
          .from('nfts')
          .insert([newNFT])
          .select();
          
        if (nftError) {
          console.error('Error saving NFT:', nftError);
          setTxStatus('error');
          return;
        }
        
        if (savedNFT) {
          // Update the local state with the new NFT
          setNfts([...nfts, savedNFT[0]]);
          
          // The triggers we created will automatically update the tb12_profiles.nfts array
          // and set has_nft to true, but we can double-check by fetching the updated profile
          
          // Allow some time for the database triggers to execute
          setTimeout(async () => {
            const { data: updatedProfile } = await supabase
              .from('tb12_profiles')
              .select('nfts, has_nft')
              .eq('id', user.id)
              .single();
              
            if (updatedProfile) {
              // If our triggers didn't work for some reason, update manually
              if (!updatedProfile.has_nft) {
                await supabase
                  .from('tb12_profiles')
                  .update({ has_nft: true })
                  .eq('id', user.id);
              }
            }
          }, 500);
        }
      } else {
        setTxStatus('error');
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      setTxStatus('error');
    } finally {
      setMintLoading(false);
    }
  };

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
          <div className="bg-blue-700 rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="px-6 py-12 sm:px-12 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900 opacity-90"></div>
              <div className="relative z-10 max-w-3xl">
                <h1 className="text-white text-3xl font-bold sm:text-4xl">Your NFT Collection</h1>
                <p className="text-blue-100 mt-2 text-lg">
                  Your TB12.LFG NFT membership unlocks exclusive perks and benefits across the platform.
                </p>
              </div>
            </div>
          </div>
          
          {/* Wallet Connection Status */}
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl font-bold text-gray-900">Wallet Status</h2>
                {isConnected || wallet ? (
                  <p className="text-sm text-gray-600 mt-1">
                    Connected: <span className="font-mono text-gray-800">
                      {(connectedAddress || wallet?.address) && 
                        `${(connectedAddress || wallet?.address).substring(0, 6)}...${(connectedAddress || wallet?.address).substring((connectedAddress || wallet?.address).length - 4)}`}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    No wallet connected. Connect your wallet to mint and manage NFTs.
                  </p>
                )}
              </div>
              
              {!isConnected && !wallet && (
                <div>
                  <WalletConnector onConnect={handleWalletLink} />
                </div>
              )}
            </div>
          </div>
          
          {/* Mint NFT Section */}
          <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="px-6 py-5 sm:px-8">
                <h2 className="text-xl font-bold text-gray-900">Mint New NFT</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Mint your TB12.LFG membership NFT to unlock exclusive benefits
                </p>
              </div>
            </div>
            
            <div className="px-6 py-5 sm:px-8">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="sm:w-1/3">
                  <img
                    src="/images/tb12-nft.png"
                    alt="TB12.LFG Membership NFT"
                    className="w-full rounded-lg shadow-md"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=TB12+NFT+Preview' }}
                  />
                </div>
                
                <div className="sm:w-2/3 space-y-4">
                  <h3 className="text-lg font-bold">TB12.LFG Membership NFT</h3>
                  <p className="text-gray-600">
                    This exclusive NFT grants you access to premium features, early merchandise drops, 
                    special discounts, and unique fan experiences within the TB12.LFG community.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Early access to merchandise drops</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Special discounts on merchandise</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Exclusive community events</span>
                    </div>
                  </div>
                  
                  {/* Minting Button and Status */}
                  {nfts.length === 0 ? (
                    <div className="pt-4">
                      <button
                        onClick={handleMintNFT}
                        disabled={mintLoading || (!isConnected && !wallet)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {mintLoading ? 'Minting...' : 'Mint NFT'}
                      </button>
                      
                      {txStatus && (
                        <div className={`mt-4 p-3 rounded text-sm ${
                          txStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          txStatus === 'success' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {txStatus === 'pending' && 'Transaction is pending. Please wait...'}
                          {txStatus === 'success' && (
                            <span>
                              Transaction successful!{' '}
                              {txHash && (
                                <a 
                                  href={`https://etherscan.io/tx/${txHash}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="underline"
                                >
                                  View on Etherscan
                                </a>
                              )}
                            </span>
                          )}
                          {txStatus === 'error' && 'Transaction failed. Please try again.'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-4">
                      <div className="p-3 rounded bg-green-100 text-green-800 flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>You already own the TB12.LFG Membership NFT!</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* NFT Collection */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Collection</h2>
            
            {nfts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">No NFTs Found</h3>
                <p className="text-gray-500 mt-2">
                  You don't have any NFTs yet. Mint your first TB12.LFG NFT to start your collection!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}