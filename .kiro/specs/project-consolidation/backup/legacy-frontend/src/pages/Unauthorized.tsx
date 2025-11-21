import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Unauthorized page shown when user tries to access restricted content
 */
const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-700 mb-4">
            {user ? (
              <>
                You are currently logged in as <strong>{user.username}</strong> with role{' '}
                <strong className="capitalize">{user.role}</strong>.
              </>
            ) : (
              'You are not logged in.'
            )}
          </p>
          <p className="text-sm text-gray-600">
            If you believe this is an error, please contact the administrator.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
          >
            Go to Dashboard
          </Link>
          {!user && (
            <Link
              to="/login"
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition duration-200"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
