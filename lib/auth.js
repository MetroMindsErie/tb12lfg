// lib/auth.js
// Authentication library for handling user authentication and wallet connections

import { supabase } from './supabase';

// Use local Next.js API routes for custom functionality
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Get current session
export async function getSession() {
  try {
    // Use Supabase to get the session
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Supabase session error:', error);
      return { 
        session: null, 
        error: { message: error.message || 'Session error' } 
      };
    }

    // Return the session data
    return { 
      session: data.session ? {
        user: data.session.user,
        token: data.session.access_token
      } : null, 
      error: null 
    };
  } catch (error) {
    console.error('Session check error:', error);
    return { 
      session: null, 
      error: { message: 'Failed to validate session' } 
    };
  }
}

// Sign in with email/password
export async function signIn(email, password) {
  try {
    // Use Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase signin error:', error);
      return { 
        user: null, 
        error: { message: error.message || 'Invalid email or password' } 
      };
    }
    
    // No need to store token - Supabase handles this automatically
    
    return { 
      user: data.user, 
      session: data.session, 
      error: null 
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      user: null, 
      error: { message: 'An error occurred during sign in' } 
    };
  }
}

// Sign up with email/password
export async function signUp(email, password) {
  try {
    // Use Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return { 
        user: null, 
        error: { message: error.message || 'Sign up failed' } 
      };
    }
    
    // Create a profile for the new user
    if (data.user) {
      // We'll handle profile creation in auth state change listener in AuthContext
      // This ensures profile creation happens even with OAuth or other auth methods
    }

    return { 
      user: data.user, 
      session: data.session, 
      error: null 
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      user: null, 
      error: { message: 'An error occurred during sign up' } 
    };
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    // Use Supabase OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('Supabase Google sign in error:', error);
      return { 
        user: null, 
        error: { message: error.message || 'Google authentication failed' } 
      };
    }
    
    // No need to handle redirect here - Supabase handles it
    
    return { data, error: null };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { 
      user: null, 
      error: { message: 'Google authentication failed' } 
    };
  }
}

// Sign in with wallet
export async function signInWithWallet(walletAddress, signedMessage, signature) {
  try {
    // We'll use Supabase custom claims to handle wallet auth
    // This requires a server function in Supabase Edge Functions
    // For now, we'll use a temporary approach with metadata

    // First check if a user with this wallet exists in our user metadata
    // If not, we'll create one
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // User is already logged in, update metadata with wallet
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          walletAddress: walletAddress,
          wallet_last_signed: new Date().toISOString()
        }
      });

      if (updateError) {
        console.error('Error updating wallet metadata:', updateError);
        return {
          user: session.user,
          error: null // Still return the user but log the error
        };
      }
      
      return { user: session.user, error: null };
    } else {
      // No session, try to sign up with a random email/password and store wallet in metadata
      const email = `wallet_${walletAddress.slice(0, 8)}${Math.floor(Math.random() * 10000)}@tb12lfg.com`;
      const password = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            walletAddress: walletAddress,
            wallet_auth: true,
            wallet_last_signed: new Date().toISOString(),
            signedMessage,
            // Don't store signature in metadata for security reasons
          }
        }
      });

      if (error) {
        console.error('Wallet signup error:', error);
        return { 
          user: null, 
          error: { message: error.message || 'Wallet authentication failed' } 
        };
      }
      
      // Store wallet in localStorage for the UI
      localStorage.setItem('tb12_wallet', JSON.stringify({
        address: walletAddress,
        walletName: 'Web3 Wallet',
        connectedAt: new Date().toISOString()
      }));
      
      return { user: data.user, error: null };
    }
  } catch (error) {
    console.error('Wallet sign in error:', error);
    return { 
      user: null, 
      error: { message: 'An error occurred during wallet authentication' } 
    };
  }
}

// Link wallet to existing account
export async function linkWalletToAccount(walletAddress, signedMessage, signature) {
  try {
    const token = localStorage.getItem('tb12_auth_token');
    
    if (!token) {
      return {
        success: false,
        error: { message: 'Not authenticated' }
      };
    }

    // Call API endpoint
    const response = await fetch(`${API_URL}/api/user/link-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        walletAddress, 
        signedMessage, 
        signature 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: { message: data.message || 'Failed to link wallet' } 
      };
    }
    
    return { success: true, user: data.user, error: null };
  } catch (error) {
    console.error('Link wallet error:', error);
    return { 
      success: false, 
      error: { message: 'An error occurred while linking wallet' } 
    };
  }
}

// Sign out
export async function signOut() {
  try {
    // Use Supabase to sign out
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase sign out error:', error);
      return { error: { message: error.message || 'Error during sign out' } };
    }
    
    // Clear any wallet data we're storing locally
    localStorage.removeItem('tb12_wallet');
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: { message: 'Error during sign out' } };
  }
}

// Request password reset
export async function requestPasswordReset(email) {
  try {
    // For now, just simulate success (we'll implement this API endpoint later)
    return { success: true, error: null };
    
    // In a real app:
    // const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ email })
    // });
    //
    // const data = await response.json();
    //
    // if (!response.ok) {
    //   return { 
    //     success: false, 
    //     error: { message: data.message || 'Password reset request failed' } 
    //   };
    // }
    //
    // return { success: true, error: null };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { 
      success: false, 
      error: { message: 'An error occurred during password reset request' } 
    };
  }
}

// Get nonce for wallet signing
export async function getWalletNonce(walletAddress) {
  try {
    const response = await fetch(`${API_URL}/api/auth/wallet-nonce?address=${walletAddress}`);
    
    const data = await response.json();

    if (!response.ok) {
      return { 
        nonce: null, 
        error: { message: data.message || 'Failed to get nonce' } 
      };
    }

    return { nonce: data.nonce, error: null };
  } catch (error) {
    console.error('Get wallet nonce error:', error);
    return { 
      nonce: null, 
      error: { message: 'An error occurred while getting nonce' } 
    };
  }
}