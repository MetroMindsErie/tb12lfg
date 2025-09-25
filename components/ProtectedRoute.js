// components/ProtectedRoute.js
// Higher-order component to protect routes that require authentication

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth has been checked and user is not logged in
    if (!isLoading && !user) {
      // Redirect to login page with return URL
      router.push({
        pathname: '/login',
        query: { returnUrl: router.asPath }
      });
    }
  }, [user, isLoading, router]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Show children only if user is logged in
  return user ? children : null;
}