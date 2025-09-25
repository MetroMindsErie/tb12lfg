// utils/nft-utils.js
// Utility functions for NFT operations

import { supabase } from '../lib/supabase';

/**
 * Check if a wallet has any NFTs and update the user's profile accordingly
 * @param {string} userId - The user's ID
 * @param {string} walletAddress - The wallet address to check
 * @returns {Promise<{hasNft: boolean, error: any}>}
 */
export async function checkAndUpdateNftStatus(userId, walletAddress) {
  if (!userId || !walletAddress) {
    return { hasNft: false, error: 'Missing required parameters' };
  }

  try {
    // First, check if the wallet has already minted an NFT in our system
    const { data: existingNfts } = await supabase
      .from('nfts')
      .select('id')
      .eq('owner_address', walletAddress);

    const hasNft = existingNfts && existingNfts.length > 0;
    
    // Update the profile based on what we found
    const { data, error } = await supabase
      .from('tb12_profiles')
      .update({ has_nft: hasNft })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating NFT status:', error);
      return { hasNft, error };
    }
    
    // If there are no NFTs in our database, we could check external APIs here
    // This would be where you call Alchemy, Moralis, or another service
    // For now, we'll just return the result from our database check
    
    return { hasNft, error: null };
  } catch (error) {
    console.error('Error in checkAndUpdateNftStatus:', error);
    return { hasNft: false, error };
  }
}

/**
 * Fetch a user's NFTs from their profile or from the nfts table
 * @param {string} userId - The user's ID
 * @returns {Promise<{nfts: Array, error: any}>}
 */
export async function fetchUserNfts(userId) {
  if (!userId) {
    return { nfts: [], error: 'Missing user ID' };
  }
  
  try {
    // Try to get NFTs from the profile first (should be faster)
    const { data: profileData, error: profileError } = await supabase
      .from('tb12_profiles')
      .select('nfts')
      .eq('id', userId)
      .single();
      
    if (profileError || !profileData || !profileData.nfts) {
      // Fall back to querying the nfts table directly
      const { data: nftsData, error: nftsError } = await supabase
        .from('nfts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (nftsError) {
        return { nfts: [], error: nftsError };
      }
      
      return { nfts: nftsData || [], error: null };
    }
    
    return { nfts: profileData.nfts || [], error: null };
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    return { nfts: [], error };
  }
}

/**
 * Updates an NFT's image URL in both the nfts table and the user's profile
 * @param {number} nftId - The ID of the NFT
 * @param {string} userId - The UUID of the user who owns the NFT
 * @param {string} imageUrl - The new image URL (typically from storage bucket)
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function updateNftImageUrl(nftId, userId, imageUrl) {
  if (!nftId || !userId || !imageUrl) {
    return { success: false, error: 'Missing required parameters' };
  }

  try {
    // Option 1: Use the SQL function if available
    const { data, error } = await supabase.rpc('update_nft_image_url', {
      nft_id: nftId,
      user_id: userId,
      new_image_url: imageUrl
    });

    if (error) {
      console.error('Error using RPC function:', error);
      
      // Option 2: Fall back to manual updates
      // First update the nfts table
      const { error: nftError } = await supabase
        .from('nfts')
        .update({ image_url: imageUrl })
        .eq('id', nftId)
        .eq('user_id', userId);
        
      if (nftError) {
        console.error('Error updating nft table:', nftError);
        return { success: false, error: nftError };
      }
      
      // Then fetch the user's profile to update the nfts array
      const { data: profileData, error: profileFetchError } = await supabase
        .from('tb12_profiles')
        .select('nfts')
        .eq('id', userId)
        .single();
        
      if (profileFetchError || !profileData) {
        console.error('Error fetching profile:', profileFetchError);
        return { success: false, error: profileFetchError };
      }
      
      // Update the NFT in the array
      const updatedNfts = profileData.nfts.map(nft => {
        if (nft.id === nftId) {
          return { ...nft, image_url: imageUrl };
        }
        return nft;
      });
      
      // Save the updated array back to the profile
      const { error: updateError } = await supabase
        .from('tb12_profiles')
        .update({ nfts: updatedNfts })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating profile nfts array:', updateError);
        return { success: false, error: updateError };
      }
      
      return { success: true, error: null };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateNftImageUrl:', error);
    return { success: false, error };
  }
}