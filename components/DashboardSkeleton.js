// components/DashboardSkeleton.js
// Loading skeleton for dashboard while data is being fetched

import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* User info section skeleton */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="p-6">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-gray-200 mr-4"></div>
            <div className="flex-1">
              <div className="h-5 w-48 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 w-36 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Stats section skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white shadow rounded-lg p-6">
            <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
            <div className="h-8 w-24 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Challenges section skeleton */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="p-6">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 w-48 bg-gray-200 rounded"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity skeleton */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center py-2">
                <div className="h-10 w-10 rounded-full bg-gray-200 mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;