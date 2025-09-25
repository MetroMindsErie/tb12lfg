// pages/profile.js
// User profile page where users can manage their account settings

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import WalletConnector from '../components/WalletConnector';
import WalletStatus from '../components/WalletStatus';
import { linkWalletToAccount } from '../lib/auth';
import { linkWalletToProfile, checkAndUpdateNftStatus } from '../lib/db';
import { supabase } from '../lib/supabase';
import { signMessageWithWagmi, createSecureMessage } from '../utils/wagmi-utils';
import { useAccount } from 'wagmi';

export default function Profile() {
  const router = useRouter();
  const { 
    user, 
    profile: userProfile, 
    wallet, 
    isLoading, 
    updateUserProfile,
    connectWallet: updateAuthWallet, 
    disconnectWallet 
  } = useAuth();
  
  // Use wagmi's account hook to get the current account status
  const { address: connectedAddress, isConnected } = useAccount();
  
  const [profile, setProfile] = useState({
    username: '',
    avatar_url: '',
    bio: '',
    notifications: {
      email: true,
      marketing: false
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user && userProfile) {
      // Initialize profile form with user data
      setProfile({
        username: userProfile.username || '',
        avatar_url: userProfile.avatar_url || '',
        bio: userProfile.bio || '',
        notifications: {
          email: userProfile.notifications?.email !== false,
          marketing: userProfile.notifications?.marketing === true
        }
      });
    }
  }, [isLoading, user, userProfile, router]);

  // Fetch the latest user profile data
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      console.log("Fetching updated user profile...");
      const { data, error } = await supabase
        .from('tb12_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (data) {
        console.log("Fetched user profile:", data);
        // Update local state
        setProfile({
          username: data.username || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || '',
          wallet_address: data.wallet_address || '',
          has_nft: data.has_nft || false,
          notifications: data.notifications || {
            email: true,
            marketing: false
          }
        });
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };
  
  // Check if the user has any NFTs in their wallet
  const checkForUserNfts = async (walletAddress) => {
    if (!walletAddress) return;
    
    try {
      console.log("Checking for NFTs in wallet:", walletAddress);
      // This would typically involve calling an API like Alchemy, Moralis, or OpenSea
      // For now, we'll just log that we would check
      
      // For demonstration, we'll simulate finding an NFT 30% of the time
      const hasNft = Math.random() < 0.3;
      
      if (hasNft) {
        console.log("NFT found in wallet!");
        // Update the user's profile to indicate they have an NFT
        const { data, error } = await supabase
          .from('tb12_profiles')
          .update({ 
            has_nft: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select();
          
        if (error) {
          console.error("Error updating NFT status:", error);
        } else {
          console.log("Updated NFT status:", data);
          // Update local profile state
          setProfile(prev => ({
            ...prev,
            has_nft: true
          }));
        }
      } else {
        console.log("No NFTs found in wallet");
      }
    } catch (error) {
      console.error("Error checking for NFTs:", error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Format profile data for update
      const profileData = {
        username: profile.username,
        avatar_url: profile.avatar_url || userProfile?.avatar_url,
        bio: profile.bio,
        notifications: profile.notifications,
        updated_at: new Date().toISOString()
      };
      
      // Update profile using context function
      const { error } = await updateUserProfile(profileData);

      if (error) {
        throw new Error(error.message || 'Failed to update profile');
      }

      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle wallet connection for linking to account using wagmi
  const handleWalletLink = async (walletData) => {
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      
      console.log("Wallet data received from wagmi:", walletData);
      
      // Validate wallet data
      if (!walletData || !walletData.address) {
        throw new Error('Invalid wallet data. Please try connecting again.');
      }
      
      // Create a secure message for signing
      const secureMessage = createSecureMessage(walletData.address, user.id, 'link');
      
      try {
        // Sign the message using wagmi
        console.log("Requesting signature using wagmi...");
        const signature = await signMessageWithWagmi(secureMessage);
        console.log("Signature received:", signature);
      } catch (signError) {
        console.error("Signature error:", signError);
        if (signError.code === 4001) {
          setMessage({ text: 'You rejected the signature request. Please try again.', type: 'error' });
        } else {
          setMessage({ text: `Signature error: ${signError.message}`, type: 'error' });
        }
        setLoading(false);
        return;
      }
      
      console.log("Linking wallet address:", walletData.address);
      
      // First update the profile table directly for the connected user
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
        setMessage({ text: `Failed to save wallet address: ${profileDbError.message}`, type: 'error' });
        setLoading(false);
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
        setMessage({ text: userUpdateError.message, type: 'error' });
        setLoading(false);
        return;
      }
      
      // Also use the utility function for consistency
      const { profile: walletProfile, error: walletProfileError } = await linkWalletToProfile(
        user.id,
        walletData.address
      );
      
      if (walletProfileError) {
        console.error("Error updating profile with wallet:", walletProfileError);
        // Don't show this error since we already updated directly
      } 
      
      console.log("Profile updated successfully with wallet");
      
      // Check if user has an NFT using our db function
      const { hasNft } = await checkAndUpdateNftStatus(user.id, walletData.address);
      
      // Update wallet in auth context
      updateAuthWallet(walletData);
      
      // Show appropriate message
      if (hasNft) {
        setMessage({ 
          text: 'Wallet linked successfully! NFT detected - benefits activated.',
          type: 'success' 
        });
      } else {
        setMessage({ 
          text: 'Wallet linked successfully!', 
          type: 'success' 
        });
      }
      
      // Refresh the profile data to show the updated information
      fetchUserProfile();
    } catch (error) {
      console.error('Wallet linking error:', error);
      
      // More specific error messages
      if (error.code === 4001) {
        setMessage({ text: 'You rejected the connection request. Please try again and approve the connection.', type: 'error' });
      } else if (error.message && error.message.includes('already exists')) {
        setMessage({ text: 'This wallet is already linked to another account.', type: 'error' });
      } else {
        setMessage({ text: error.message || 'Failed to link wallet', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle wallet disconnection
  const handleWalletDisconnect = async () => {
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      
      console.log("Disconnecting wallet...");
      
      // Update user metadata in Supabase to clear wallet info
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          walletAddress: null,
          wallet_last_signed: null
        }
      });
      
      if (userUpdateError) {
        console.error("Error updating user metadata:", userUpdateError);
      }
      
      // Update profile in database to remove wallet
      if (user) {
        const { error: profileError } = await linkWalletToProfile(user.id, null);
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
      }
      
      // Call auth context to disconnect wallet
      disconnectWallet();
      
      // Disconnect using wagmi's hook will happen automatically
      // This is handled by the useDisconnect hook in the WalletConnector component
      
      setMessage({ text: 'Wallet disconnected', type: 'success' });
    } catch (error) {
      console.error('Wallet disconnect error:', error);
      setMessage({ text: error.message || 'Failed to disconnect wallet', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Effect to update profile when user data is loaded
  useEffect(() => {
    // If user profile is loaded, populate form
    if (userProfile) {
      setProfile({
        username: userProfile.username || '',
        avatar_url: userProfile.avatar_url || '',
        bio: userProfile.bio || '',
        wallet_address: userProfile.wallet_address || '',
        has_nft: userProfile.has_nft || false,
        notifications: userProfile.notifications || {
          email: true,
          marketing: false
        }
      });
    }
  }, [userProfile]);
  
  // Effect to detect wallet connections and sync with profile
  useEffect(() => {
    if (user && isConnected && connectedAddress) {
      console.log("Detected connected wallet:", connectedAddress);
      
      // Check if this wallet is already saved to the profile
      if (userProfile?.wallet_address !== connectedAddress) {
        console.log("Wallet address differs from profile, updating...");
        
        // Automatically update the wallet in the profile
        (async () => {
          try {
            const { data, error } = await supabase
              .from('tb12_profiles')
              .update({ 
                wallet_address: connectedAddress,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)
              .select();
              
            if (error) {
              console.error("Error auto-updating wallet:", error);
            } else {
              console.log("Auto-updated profile with connected wallet:", data);
              
              // Update user metadata in Supabase
              await supabase.auth.updateUser({
                data: {
                  walletAddress: connectedAddress,
                  wallet_last_signed: new Date().toISOString()
                }
              });
              
              // Check if user has NFTs
              await checkAndUpdateNftStatus(user.id, connectedAddress);
              
              // Refresh profile data
              fetchUserProfile();
              
              // Update wallet in auth context
              updateAuthWallet({
                address: connectedAddress,
                walletName: "MetaMask",
                connectedAt: new Date().toISOString()
              });
              
              setMessage({ text: 'Wallet automatically linked to your profile', type: 'success' });
            }
          } catch (error) {
            console.error("Error in auto wallet update:", error);
          }
        })();
      }
    }
  }, [user, isConnected, connectedAddress, userProfile]);

  // Render NFT status badge
  const renderNftBadge = () => {
    if (profile.has_nft) {
      return (
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <svg className="h-4 w-4 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          NFT Benefits Active
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-pulse">Loading...</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-blue-700 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Your Profile</h1>
            </div>
            
            {message.text && (
              <div className={`m-6 p-3 rounded ${
                message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {message.text}
              </div>
            )}
            
            <div className="px-6 py-4">
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="username"
                        id="username"
                        value={profile.username}
                        onChange={(e) => setProfile({...profile, username: e.target.value})}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={user?.email || ''}
                        disabled={true}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 bg-gray-50 rounded-md"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Email is managed by your authentication provider and cannot be changed here.
                      </p>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
                      Profile Image URL
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="avatar_url"
                        id="avatar_url"
                        placeholder="https://example.com/your-image.jpg"
                        value={profile.avatar_url || ''}
                        onChange={(e) => setProfile({...profile, avatar_url: e.target.value})}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Brief description for your profile. URLs are hyperlinked.
                      </p>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <fieldset>
                      <legend className="text-base font-medium text-gray-700">Notifications</legend>
                      <div className="mt-4 space-y-4">
                        <div className="relative flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="email-notifications"
                              name="email-notifications"
                              type="checkbox"
                              checked={profile.notifications.email}
                              onChange={(e) => setProfile({
                                ...profile, 
                                notifications: {
                                  ...profile.notifications, 
                                  email: e.target.checked
                                }
                              })}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="email-notifications" className="font-medium text-gray-700">
                              Email notifications
                            </label>
                            <p className="text-gray-500">
                              Get notified about account activity and updates.
                            </p>
                          </div>
                        </div>
                        
                        <div className="relative flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="marketing"
                              name="marketing"
                              type="checkbox"
                              checked={profile.notifications.marketing}
                              onChange={(e) => setProfile({
                                ...profile, 
                                notifications: {
                                  ...profile.notifications, 
                                  marketing: e.target.checked
                                }
                              })}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="marketing" className="font-medium text-gray-700">
                              Marketing communications
                            </label>
                            <p className="text-gray-500">
                              Receive updates about new features and offerings.
                            </p>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Wallet Section */}
          <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-blue-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Wallet Connection</h2>
            </div>
            
            <div className="px-6 py-6">
              {isConnected && connectedAddress ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Connected Wallet</h3>
                      <p className="text-sm text-gray-500">MetaMask</p>
                    </div>
                    <button
                      onClick={handleWalletDisconnect}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Disconnect
                    </button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm font-mono break-all">
                      Address: {connectedAddress}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      This wallet is linked to your account and can be used for authentication and NFT transactions.
                    </p>
                  </div>
                </div>
              ) : wallet ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Connected Wallet</h3>
                      <p className="text-sm text-gray-500">{wallet.walletName}</p>
                    </div>
                    <button
                      onClick={handleWalletDisconnect}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Disconnect
                    </button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm font-mono break-all">
                      Address: {wallet.address}
                    </p>
                    <p className="text-sm mt-1 text-gray-600">
                      Network: {wallet.chainId === '0x1' ? 'Ethereum Mainnet' : wallet.chainId === '0x89' ? 'Polygon' : wallet.chainId ? `Chain ID: ${wallet.chainId}` : 'Unknown'}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      This wallet is linked to your account and can be used for authentication and NFT transactions.
                    </p>
                  </div>
                </div>
              ) : userProfile?.wallet_address ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Wallet Linked</h3>
                      <p className="text-sm text-gray-500">From previous session</p>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm font-mono break-all">
                      Address: {userProfile.wallet_address}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Your wallet is linked to your account. To use this wallet, please connect it again.
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <WalletConnector onConnect={handleWalletLink} />
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Connect a wallet to enable NFT purchases, authentication, and more.
                  </p>
                  
                  <WalletConnector onConnect={handleWalletLink} />
                </div>
              )}
            </div>
          </div>
          
          {/* Security Section */}
          <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-blue-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Security</h2>
            </div>
            
            <div className="px-6 py-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Password</h3>
                <p className="text-sm text-gray-500">Update your password to keep your account secure.</p>
              </div>
              
              {user?.authProvider === 'email' ? (
                <button
                  onClick={() => router.push('/change-password')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Change Password
                </button>
              ) : (
                <p className="text-sm text-gray-600">
                  Your account uses {user?.authProvider} authentication. Password management is handled by your provider.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}