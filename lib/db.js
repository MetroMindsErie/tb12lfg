// lib/db.js
// Database operations for user profiles

import { supabase } from './supabase';

/**
 * Create a new profile for a user
 * @param {object} userData - User data from auth
 * @returns {object} - Created profile or error
 */
export async function createProfile(userData) {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('tb12_profiles')
      .select('*')
      .eq('id', userData.id)
      .single();

    if (existingProfile) {
      return { profile: existingProfile, error: null };
    }
    
    // Create a new profile
    const { data, error } = await supabase
      .from('tb12_profiles')
      .insert([
        { 
          id: userData.id,
          email: userData.email,
          username: userData.email?.split('@')[0], // Default username
          avatar_url: null,
          wallet_address: userData.user_metadata?.walletAddress || null,
          has_nft: false,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating profile:', error);
      return { profile: null, error };
    }
    
    return { profile: data, error: null };
  } catch (error) {
    console.error('Create profile error:', error);
    return { profile: null, error };
  }
}

/**
 * Get a user's profile by ID
 * @param {string} userId - The user's ID
 * @returns {object} - User profile or error
 */
export async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('tb12_profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error getting profile:', error);
      return { profile: null, error };
    }
    
    return { profile: data, error: null };
  } catch (error) {
    console.error('Get profile error:', error);
    return { profile: null, error };
  }
}

/**
 * Update a user's profile
 * @param {string} userId - The user's ID
 * @param {object} updates - The profile updates
 * @returns {object} - Updated profile or error
 */
export async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('tb12_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating profile:', error);
      return { profile: null, error };
    }
    
    return { profile: data, error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return { profile: null, error };
  }
}

/**
 * Link a wallet to a user profile
 * @param {string} userId - The user's ID
 * @param {string|null} walletAddress - The wallet address or null to remove
 * @returns {object} - Updated profile or error
 */
export async function linkWalletToProfile(userId, walletAddress) {
  try {
    console.log(`${walletAddress ? 'Linking' : 'Removing'} wallet ${walletAddress || ''} for user ${userId}`);
    
    // Update the profile with wallet address (or null to remove)
    const { data, error } = await supabase
      .from('tb12_profiles')
      .update({ 
        wallet_address: walletAddress,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating wallet in profile:', error);
      return { profile: null, error };
    }
    
    // If we're adding a wallet, check for NFTs
    if (walletAddress) {
      await checkAndUpdateNftStatus(userId, walletAddress);
    } else {
      // If removing wallet, remove NFT status too
      await updateNftStatus(userId, false);
    }
    
    return { profile: data, error: null };
  } catch (error) {
    console.error('Link/unlink wallet error:', error);
    return { profile: null, error };
  }
}

/**
 * Update a user's NFT status
 * @param {string} userId - The user's ID
 * @param {boolean} hasNft - Whether the user has an NFT
 */
export async function updateNftStatus(userId, hasNft) {
  try {
    console.log(`${hasNft ? 'Setting' : 'Removing'} NFT status for user ${userId}`);
    
    const { data, error } = await supabase
      .from('tb12_profiles')
      .update({
        has_nft: hasNft,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating NFT status:', error);
    }
    
    return { success: !error, error };
  } catch (error) {
    console.error('Update NFT status error:', error);
    return { success: false, error };
  }
}

/**
 * Check if a wallet has any NFTs and update user status
 * @param {string} userId - The user's ID
 * @param {string} walletAddress - The wallet address to check
 */
export async function checkAndUpdateNftStatus(userId, walletAddress) {
  try {
    console.log(`Checking NFT status for wallet ${walletAddress}`);
    
    // In a real implementation, you would call an API to check for NFTs
    // For now, we'll just simulate it with a random check (30% chance)
    const hasNft = Math.random() < 0.3;
    
    if (hasNft) {
      console.log(`NFT found for wallet ${walletAddress}`);
      
      // Also create a record in the tb12_nfts table
      const { error: nftError } = await supabase
        .from('tb12_nfts')
        .insert({
          user_id: userId,
          name: "TB12 Membership NFT",
          description: "Member access token for TB12.LFG",
          image_url: "/images/nft-membership.png",
          owner_address: walletAddress,
          created_at: new Date().toISOString()
        });
        
      if (nftError) {
        console.error('Error creating NFT record:', nftError);
      }
    }
    
    // Update the user's NFT status
    await updateNftStatus(userId, hasNft);
    
    return { hasNft };
  } catch (error) {
    console.error('Check NFT status error:', error);
    return { hasNft: false, error };
  }
}