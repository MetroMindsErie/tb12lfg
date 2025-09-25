// pages/auth-debug.js
// Debug page to check authentication status

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function AuthDebug() {
  const { user, profile, isLoading } = useAuth();
  const [session, setSession] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [profileCreationResult, setProfileCreationResult] = useState(null);
  const [showFixButton, setShowFixButton] = useState(false);
  
  useEffect(() => {
    // Get session
    const getSessionInfo = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    // Check tables
    const checkTables = async () => {
      setTableLoading(true);
      try {
        // Check if profiles table exists
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('count()')
          .limit(1);
          
        // Check if nfts table exists
        const { data: nftsData, error: nftsError } = await supabase
          .from('nfts')
          .select('count()')
          .limit(1);
          
        // Check if merchandise table exists
        const { data: merchData, error: merchError } = await supabase
          .from('merchandise')
          .select('count()')
          .limit(1);
          
        // Check if challenges table exists
        const { data: challengesData, error: challengesError } = await supabase
          .from('challenges')
          .select('count()')
          .limit(1);
          
        setTables([
          { 
            name: 'profiles', 
            exists: !profilesError, 
            error: profilesError?.message,
            count: profilesData?.length ? profilesData[0].count : 0
          },
          { 
            name: 'nfts', 
            exists: !nftsError, 
            error: nftsError?.message,
            count: nftsData?.length ? nftsData[0].count : 0
          },
          { 
            name: 'merchandise', 
            exists: !merchError, 
            error: merchError?.message,
            count: merchData?.length ? merchData[0].count : 0
          },
          { 
            name: 'challenges', 
            exists: !challengesError, 
            error: challengesError?.message,
            count: challengesData?.length ? challengesData[0].count : 0
          }
        ]);
      } catch (error) {
        console.error('Error checking tables:', error);
      } finally {
        setTableLoading(false);
      }
    };
    
    getSessionInfo();
    checkTables();
    
    // Check if profile needs to be created
    if (user && !profile) {
      setShowFixButton(true);
    } else {
      setShowFixButton(false);
    }
  }, [user, profile]);
  
  const handleCreateProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          username: user.email.split('@')[0],
          avatar_url: null,
          wallet_address: null,
          has_nft: false
        }])
        .select();
        
      if (error) {
        setProfileCreationResult({ success: false, message: error.message });
      } else {
        setProfileCreationResult({ success: true, message: 'Profile created successfully' });
        setShowFixButton(false);
        window.location.reload();
      }
    } catch (error) {
      setProfileCreationResult({ success: false, message: error.message });
    }
  };
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Authentication Debug</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Technical information to help diagnose login issues.
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">Authentication State</h4>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Logged in:</strong> {user ? 'Yes' : 'No'}</p>
              <p><strong>User Email:</strong> {user?.email || 'Not logged in'}</p>
              <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
              <p><strong>Profile loaded:</strong> {profile ? 'Yes' : 'No'}</p>
              {profile && (
                <div className="mt-2">
                  <p><strong>Username:</strong> {profile.username}</p>
                  <p><strong>Has NFT:</strong> {profile.has_nft ? 'Yes' : 'No'}</p>
                  <p><strong>Wallet connected:</strong> {profile.wallet_address ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
            
            {showFixButton && user && !profile && (
              <div className="mt-4">
                <button 
                  onClick={handleCreateProfile}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Fix Profile Issue
                </button>
                {profileCreationResult && (
                  <div className={`mt-2 p-2 rounded ${
                    profileCreationResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {profileCreationResult.message}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">Session Information</h4>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>Session active:</strong> {session ? 'Yes' : 'No'}</p>
              {session && (
                <>
                  <p><strong>Session expires:</strong> {new Date(session.expires_at * 1000).toLocaleString()}</p>
                  <p><strong>Session created:</strong> {new Date(session.created_at).toLocaleString()}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">Database Tables</h4>
            {tableLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Table
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Row Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tables.map((table) => (
                      <tr key={table.name}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {table.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {table.exists ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              OK
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Error
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {table.exists ? table.count : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tables.some(table => !table.exists) && (
                  <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded">
                    <p className="font-medium">Some tables are missing!</p>
                    <p className="text-sm mt-1">Run the SQL commands from supabase/schema.sql in your Supabase SQL Editor.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">Actions</h4>
            <div className="space-x-4">
              <button 
                onClick={() => window.location.href = '/login'}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh Page
              </button>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}