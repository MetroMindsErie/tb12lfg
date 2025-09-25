// Updated AuthContext.js - merge this with your existing AuthContext
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchUserProfile, updateUserProfile, ensureUserProfile } from '../utils/profile-handler';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session?.user) {
          setUser(session.user);
          
          // Ensure user has a profile and load it
          const { profile: userProfile, error: profileError } = await fetchUserProfile();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else if (userProfile) {
            setProfile(userProfile);
            
            // If user has a wallet address in their profile, set it
            if (userProfile.wallet_address) {
              setWallet({
                address: userProfile.wallet_address,
                lastConnected: userProfile.updated_at
              });
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthError(error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        // Ensure user has a profile and load it
        const { profile: userProfile } = await fetchUserProfile();
        if (userProfile) {
          setProfile(userProfile);
          
          // If user has a wallet address in their profile, set it
          if (userProfile.wallet_address) {
            setWallet({
              address: userProfile.wallet_address,
              lastConnected: userProfile.updated_at
            });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setWallet(null);
      } else if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user);
        
        // Refresh profile data
        const { profile: userProfile } = await fetchUserProfile();
        if (userProfile) {
          setProfile(userProfile);
        }
      }
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Function to update user profile
  const updateProfile = async (profileData) => {
    const { data, error } = await updateUserProfile(profileData);
    
    if (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
    
    setProfile(data);
    return { data, error: null };
  };
  
  // Function to connect a wallet
  const connectWallet = async (walletData) => {
    if (!user || !profile) {
      console.error('Cannot connect wallet: No authenticated user or profile');
      return { error: { message: 'No authenticated user or profile' } };
    }
    
    try {
      // Update profile with wallet address
      const { error: updateError } = await updateProfile({
        wallet_address: walletData.address,
        updated_at: new Date().toISOString()
      });
      
      if (updateError) {
        throw updateError;
      }
      
      // Set wallet in state
      setWallet({
        address: walletData.address,
        lastConnected: new Date().toISOString()
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return { success: false, error };
    }
  };
  
  // Function to disconnect a wallet
  const disconnectWallet = async () => {
    if (!user || !profile) {
      console.error('Cannot disconnect wallet: No authenticated user or profile');
      return { error: { message: 'No authenticated user or profile' } };
    }
    
    try {
      // Update profile to remove wallet address
      const { error: updateError } = await updateProfile({
        wallet_address: null,
        updated_at: new Date().toISOString()
      });
      
      if (updateError) {
        throw updateError;
      }
      
      // Clear wallet from state
      setWallet(null);
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    profile,
    wallet,
    loading,
    authError,
    updateProfile,
    connectWallet,
    disconnectWallet
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);