// lib/withAuth.js
// Higher-order component for protected routes

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import dynamic from 'next/dynamic';

export default function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [timeoutExpired, setTimeoutExpired] = useState(false);
    
    // Setup timeout to prevent infinite loading - always called
    useEffect(() => {
      const timer = setTimeout(() => {
        setTimeoutExpired(true); // Force-proceed after timeout
        setCheckingAuth(false);
        console.log('Loading timeout reached, forcing render');
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(timer);
    }, []);
    
    // Main auth effect - always called
    useEffect(() => {
      // Add debugging to track state
      console.log('withAuth state:', { isLoading, user: !!user, checkingAuth, timeoutExpired });
      
      // Only run the redirect logic when auth state is settled
      if (!isLoading) {
        if (!user) {
          // Redirect to login page if no user
          console.log('No user found, redirecting to login');
          router.push('/login');
        } else {
          // Auth check complete, can render the component
          setCheckingAuth(false);
        }
      }
    }, [isLoading, user, router, timeoutExpired]);
    
    // Content to render
    const renderContent = () => {
      // If still loading or checking auth
      if (isLoading || checkingAuth) {
        // Show the dashboard skeleton for dashboard route, simple spinner for others
        if (router.pathname === '/dashboard') {
          // Load the dashboard skeleton component
          const LoadingSkeleton = () => {
            // We're using require here to avoid hooks-related issues with dynamic imports
            const DashboardSkeleton = require('../components/DashboardSkeleton').default;
            return (
              <div className="bg-gray-50 min-h-screen">
                <DashboardSkeleton />
              </div>
            );
          };
          
          return <LoadingSkeleton />;
        }
        
        // Default loader for non-dashboard routes
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        );
      }
      
      // If user is authenticated, render the component
      return <Component {...props} />;
    };
    
    // Always return from the main function body
    return renderContent();
  };
}