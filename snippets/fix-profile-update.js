/**
 * Copy this code to where you're updating profiles (likely in a hook or context)
 * First import the utility:
 * import { updateProfileSafely } from '../utils/profile-utils';
 */

// Replace your existing updateUserProfile function with this:
const updateUserProfile = async (profileData) => {
  try {
    // Make sure profileData has an id
    if (!profileData.id && user) {
      profileData.id = user.id;
    }
    
    if (!profileData.id) {
      console.error('Cannot update profile: Missing ID');
      return { error: { message: 'Missing profile ID' } };
    }
    
    // Use the safe update function instead of direct Supabase call
    const { data, error } = await updateProfileSafely(profileData);
    
    if (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
    
    // Update the local state if needed
    if (data && setProfile) {
      setProfile(data);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in updateUserProfile:', error);
    return { error };
  }
};