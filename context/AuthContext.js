// context/AuthContext.js
// Authentication context for managing user auth state across the application

import { createContext, useState, useContext, useEffect } from 'react';
import { getSession } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { createProfile, getProfile, updateProfile } from '../lib/db';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for user session on initial load
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { session, error } = await getSession();
        if (session && !error) {
          setUser(session.user);
          
          // Get user profile
          const { profile } = await getProfile(session.user.id);
          
          if (profile) {
            setProfile(profile);
          } else {
            // Create profile if it doesn't exist
            const { profile: newProfile } = await createProfile(session.user);
            setProfile(newProfile);
          }
          
          // If wallet was previously connected, restore from localStorage
          const savedWallet = localStorage.getItem('tb12_wallet');
          if (savedWallet) {
            try {
              setWallet(JSON.parse(savedWallet));
            } catch (e) {
              console.error('Error parsing saved wallet:', e);
              localStorage.removeItem('tb12_wallet');
            }
          }
        }
      } catch (err) {
        console.error('Auth session check error:', err);
        setError(err.message || 'Authentication error');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          
          // For sign in events, ensure profile exists
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            try {
              // Get user profile
              const { profile: existingProfile } = await getProfile(session.user.id);
              
              if (existingProfile) {
                setProfile(existingProfile);
              } else {
                // Create profile if it doesn't exist
                const { profile: newProfile } = await createProfile(session.user);
                setProfile(newProfile);
              }
            } catch (err) {
              console.error('Error checking/creating profile:', err);
            }
          }
          
          // Check if user has wallet in metadata
          if (session.user.user_metadata?.walletAddress) {
            const walletData = {
              address: session.user.user_metadata.walletAddress,
              walletName: 'Web3 Wallet',
              connectedAt: session.user.user_metadata.wallet_last_signed
            };
            
            setWallet(walletData);
            localStorage.setItem('tb12_wallet', JSON.stringify(walletData));
          }
          
          setIsLoading(false);
        } else {
          setUser(null);
          setProfile(null);
          setWallet(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Update connected wallet
  const connectWallet = (walletData) => {
    console.log("Connecting wallet in AuthContext:", walletData);
    
    // Ensure we have at least the essential wallet data
    if (!walletData || !walletData.address) {
      console.error("Invalid wallet data provided to connectWallet");
      return;
    }
    
    const sanitizedWallet = {
      address: walletData.address,
      walletName: walletData.walletName || 'Web3 Wallet',
      chainId: walletData.chainId || null,
      connectedAt: walletData.connectedAt || new Date().toISOString()
    };
    
    setWallet(sanitizedWallet);
    
    // Store wallet info in localStorage for persistence
    // But only store the necessary data, not the provider
    localStorage.setItem('tb12_wallet', JSON.stringify(sanitizedWallet));
  };
  
  // Disconnect wallet
  const disconnectWallet = () => {
    console.log("Disconnecting wallet in AuthContext");
    setWallet(null);
    localStorage.removeItem('tb12_wallet');
  };  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (!user) return { error: { message: 'Not authenticated' } };
    
    try {
      const { profile: updatedProfile, error } = await updateProfile(user.id, profileData);
      
      if (error) {
        return { error };
      }
      
      setProfile(updatedProfile);
      return { profile: updatedProfile, error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { error: err };
    }
  };

  // Sign out user
  const signOut = () => {
    setUser(null);
    setProfile(null);
    setWallet(null);
    localStorage.removeItem('tb12_wallet');
    // Additional signout logic will be handled in auth.js
  };

  // Already imported updateProfile at the top
  const value = {
    user,
    profile,
    wallet,
    isLoading,
    error,
    updateUser,
    updateUserProfile,
    connectWallet,
    disconnectWallet,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};