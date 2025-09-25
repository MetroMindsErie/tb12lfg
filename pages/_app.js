// pages/_app.js
// Main application wrapper with auth provider

import '../styles/globals.css';
import { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import WagmiProvider from '../components/WagmiProvider';

function MyApp({ Component, pageProps }) {
  // Setup Supabase auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <WagmiProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </WagmiProvider>
  );
}

export default MyApp;