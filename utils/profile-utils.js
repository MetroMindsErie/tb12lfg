// utils/profile-utils.js
// Utility functions for handling profile updates and error handling

import { supabase } from '../lib/supabase';
import { ensureUserProfile } from './ensure-profile';

/**
 * Update a user profile with error handling for missing profiles
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function updateProfileSafely(profileData) {
  try {
    if (!profileData || !profileData.id) {
      console.error('Missing profile data or ID');
      return { data: null, error: { message: 'Missing profile data or ID' } };
    }

    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('tb12_profiles')
      .select('id')
      .eq('id', profileData.id)
      .maybeSingle(); // Use maybeSingle instead of single

    // If profile doesn't exist, create it first
    if (!existingProfile) {
      console.log('Profile does not exist, creating one first...');
      const { profile: newProfile, error: createError } = await ensureUserProfile();
      
      if (createError) {
        console.error('Error creating profile:', createError);
        return { data: null, error: createError };
      }
      
      // If we successfully created a profile, continue with the update
      console.log('Profile created successfully, now updating it...');
    }

    // Now update the profile
    const { data, error } = await supabase
      .from('tb12_profiles')
      .update(profileData)
      .eq('id', profileData.id)
      .select();
    
    if (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
    
    return { data: data[0] || null, error: null };
  } catch (error) {
    console.error('Unexpected error in updateProfileSafely:', error);
    return { data: null, error };
  }
}

/**
 * Get a user profile by ID with proper error handling
 * @param {string} userId - The user ID to get the profile for
 * @returns {Promise<{profile: Object|null, error: Object|null}>}
 */
export async function getProfileSafely(userId) {
  try {
    if (!userId) {
      console.error('Missing user ID');
      return { profile: null, error: { message: 'Missing user ID' } };
    }
    
    // Try to get the profile
    const { data, error } = await supabase
      .from('tb12_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to prevent errors
      
    if (error) {
      console.error('Error fetching profile:', error);
      return { profile: null, error };
    }
    
    if (!data) {
      // Profile doesn't exist, try to create it
      return await ensureUserProfile();
    }
    
    return { profile: data, error: null };
  } catch (error) {
    console.error('Unexpected error in getProfileSafely:', error);
    return { profile: null, error };
  }
}