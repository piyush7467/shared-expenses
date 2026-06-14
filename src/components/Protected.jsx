import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Protected = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-themeBg transition-colors duration-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-themeBorder rounded-full opacity-60"></div>
            <div className="absolute inset-0 border-4 border-accentCyan border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm font-semibold text-themeTextSecondary animate-pulse">Checking credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protected;
