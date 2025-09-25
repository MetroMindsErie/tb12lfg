// pages/auth/callback.js
// Handle authentication callbacks from OAuth providers

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Process the OAuth callback
    const handleAuthCallback = async () => {
      // The hash contains the access token
      const { error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error during OAuth callback:', error);
        router.push('/login?error=oauth');
      } else {
        // Successful authentication, redirect to dashboard
        router.push('/dashboard');
      }
    };

    handleAuthCallback();
  }, [router]);

  // Display a loading indicator
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}