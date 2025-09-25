// pages/signup-success.js
// Page shown after successful signup to guide users to check their email

import Link from 'next/link';
import Layout from '../components/Layout';

export default function SignupSuccess() {
  return (
    <Layout hideNav={true}>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/">
            <div className="flex justify-center">
              <h1 className="text-3xl font-bold text-blue-900">TB12.LFG</h1>
            </div>
          </Link>
          
          <div className="mt-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          
          <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-md text-gray-600">
            We've sent you a confirmation link to complete your signup.
            <br />
            Please check your inbox and click the link to activate your account.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">What happens next?</h3>
                <ul className="mt-4 space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      Check your email for a confirmation link
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      Click the link to confirm your email address
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      You'll be automatically redirected to your dashboard
                    </p>
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-center">
                  <span className="text-sm text-gray-500">
                    Didn't receive an email?
                  </span>
                  <button className="ml-2 text-sm font-medium text-blue-600 hover:text-blue-500">
                    Resend email
                  </button>
                </div>
              </div>

              <div>
                <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Return to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}