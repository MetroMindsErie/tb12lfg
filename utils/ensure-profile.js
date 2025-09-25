// utils/ensure-profile.js
// Utility functions to ensure a user has a profile

import { supabase } from '../lib/supabase';

/**
 * Ensures the current user has a profile record in tb12_profiles
 * Creates one if it doesn't exist
 * @returns {Promise<{profile: Object|null, error: Object|null}>}
 */
export async function ensureUserProfile() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('No authenticated user found:', userError);
      return { profile: null, error: userError || { message: 'No authenticated user' } };
    }
    
    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('tb12_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    // If profile exists, return it
    if (existingProfile) {
      return { profile: existingProfile, error: null };
    }
    
    // If there was an error other than "not found", return it
    if (profileError && !profileError.message.includes('contains 0 rows')) {
      console.error('Error checking for profile:', profileError);
      return { profile: null, error: profileError };
    }
    
    // Create profile if it doesn't exist
    const { data: newProfile, error: createError } = await supabase
      .from('tb12_profiles')
      .insert([
        { 
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || `user_${Date.now().toString(36)}`,
          avatar_url: user.user_metadata?.avatar_url || '',
          bio: '',
          notifications: { email: true, marketing: false },
        }
      ])
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating profile:', createError);
      return { profile: null, error: createError };
    }
    
    return { profile: newProfile, error: null };
  } catch (error) {
    console.error('Unexpected error in ensureUserProfile:', error);
    return { profile: null, error };
  }
}

/**
 * Helper function to run in the browser console to fix profiles
 */
export async function fixProfiles() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error('You need to be logged in to fix profiles');
    return;
  }
  
  const { error } = await supabase.rpc('create_profiles_for_existing_users');
  
  if (error) {
    console.error('Error fixing profiles:', error);
    return;
  }
  
  console.log('Profiles fixed successfully!');
}