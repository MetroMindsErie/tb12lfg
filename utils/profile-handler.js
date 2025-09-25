// utils/profile-handler.js
// Utility for handling user profiles with proper error handling

import { supabase } from '../lib/supabase';

/**
 * Fetch a user's profile, ensuring one exists
 * @returns {Promise<{profile: Object|null, error: Object|null}>}
 */
export const fetchUserProfile = async () => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('No authenticated user found');
      return { profile: null, error: userError || { message: 'No authenticated user' } };
    }
    
    console.log('Fetching profile for user:', user.id);
    
    // Try to get the profile
    const { data: profile, error: profileError } = await supabase
      .from('tb12_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle to avoid errors with non-existent profiles
      
    // If there was a real error (not just "not found")
    if (profileError && !profileError.message?.includes('contains 0 rows')) {
      console.error('Error fetching profile:', profileError);
      return { profile: null, error: profileError };
    }
    
    // If profile doesn't exist, we'll create one
    if (!profile) {
      console.log('Profile not found, creating one...');
      
      // Create a new profile
      const { data: newProfile, error: createError } = await supabase
        .from('tb12_profiles')
        .insert([{
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || `user_${Date.now().toString(36)}`,
          avatar_url: user.user_metadata?.avatar_url || '',
          bio: '',
          has_nft: false,
          notifications: { email: true, marketing: false },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .maybeSingle();
        
      if (createError) {
        console.error('Error creating profile:', createError);
        return { profile: null, error: createError };
      }
      
      console.log('Profile created successfully:', newProfile);
      return { profile: newProfile, error: null };
    }
    
    console.log('Profile found:', profile);
    return { profile, error: null };
  } catch (error) {
    console.error('Unexpected error in fetchUserProfile:', error);
    return { profile: null, error };
  }
};

/**
 * Update a user's profile
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export const updateUserProfile = async (profileData) => {
  try {
    // First fetch the current user to get the ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('No authenticated user found');
      return { data: null, error: userError || { message: 'No authenticated user' } };
    }
    
    // Make sure we have an ID for the profile
    const profileWithId = {
      ...profileData,
      id: profileData.id || user.id,
      updated_at: new Date().toISOString()
    };
    
    // Check if the profile exists
    const { data: existingProfile } = await supabase
      .from('tb12_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
      
    // If the profile doesn't exist, create it
    if (!existingProfile) {
      console.log('Profile not found, creating one before update...');
      
      // Use fetchUserProfile to create a profile first
      const { profile: newProfile, error: createError } = await fetchUserProfile();
      
      if (createError) {
        console.error('Error creating profile:', createError);
        return { data: null, error: createError };
      }
    }
    
    // Now update the profile
    const { data, error } = await supabase
      .from('tb12_profiles')
      .update(profileWithId)
      .eq('id', user.id)
      .select();
      
    if (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
    
    return { data: data?.[0] || null, error: null };
  } catch (error) {
    console.error('Unexpected error in updateUserProfile:', error);
    return { data: null, error };
  }
};

/**
 * Check if a user has a profile and create one if needed
 * This is useful to call at app initialization
 */
export const ensureUserProfile = async () => {
  try {
    const { profile, error } = await fetchUserProfile();
    
    if (error) {
      console.error('Error ensuring profile:', error);
      return { success: false, error };
    }
    
    return { success: true, profile };
  } catch (error) {
    console.error('Unexpected error in ensureUserProfile:', error);
    return { success: false, error };
  }
};