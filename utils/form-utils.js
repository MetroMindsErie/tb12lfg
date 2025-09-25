// utils/form-utils.js
// Utilities for working with forms and inputs

/**
 * Ensures a form value is never undefined to prevent React controlled component warnings
 * @param {any} value - The value to check
 * @param {any} defaultValue - The default value to use if value is undefined/null
 * @returns {any} - The value or defaultValue
 */
export function ensureFormValue(value, defaultValue = '') {
  return value !== undefined && value !== null ? value : defaultValue;
}

/**
 * Safely gets a nested property from an object with a default value
 * @param {Object} obj - The object to check
 * @param {string} path - The path to the property (dot notation)
 * @param {any} defaultValue - The default value to return if property is not found
 * @returns {any} - The property value or defaultValue
 */
export function getNestedValue(obj, path, defaultValue) {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined && current !== null ? current : defaultValue;
}

/**
 * Safely updates a profile object with new values
 * @param {Object} currentProfile - The current profile object
 * @param {Object} updates - The updates to apply
 * @returns {Object} - A new profile object with the updates applied
 */
export function updateProfileSafely(currentProfile, updates) {
  // Start with a base profile with default values for all fields
  const baseProfile = {
    username: '',
    avatar_url: '',
    bio: '',
    wallet_address: '',
    has_nft: false,
    notifications: {
      email: true,
      marketing: false
    }
  };
  
  // Merge the current profile, ensuring we have defaults
  const safeCurrentProfile = {
    ...baseProfile,
    ...currentProfile,
    // Ensure nested objects are merged properly
    notifications: {
      ...baseProfile.notifications,
      ...(currentProfile?.notifications || {})
    }
  };
  
  // Apply updates on top of the safe current profile
  return {
    ...safeCurrentProfile,
    ...updates,
    // Handle special case for nested updates
    ...(updates.notifications ? {
      notifications: {
        ...safeCurrentProfile.notifications,
        ...updates.notifications
      }
    } : {})
  };
}