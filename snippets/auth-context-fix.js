/**
 * Add this code to your AuthContext.js file
 * Import the ensureUserProfile utility at the top:
 * import { ensureUserProfile } from '../utils/ensure-profile';
 * 
 * Then add this code to your fetchUserProfile function:
 */

// Updated fetchUserProfile function for AuthContext.js
const fetchUserProfile = async () => {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // First try to get the profile
    const { data: profile, error } = await supabase
      .from('tb12_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // If we get an error about the profile not existing
    if (error && error.message.includes('contains 0 rows')) {
      console.log('Profile does not exist, creating one...');
      
      // Use our utility to ensure a profile exists
      const { profile: newProfile, error: createError } = await ensureUserProfile();
      
      if (createError) {
        console.error('Error creating profile:', createError);
        return null;
      }
      
      return newProfile;
    } else if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};