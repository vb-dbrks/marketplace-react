import React, { createContext, useState, useContext, useEffect } from 'react';

// Use same API configuration as utils/api.js
const getApiUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return '';
};
const API_URL = getApiUrl();

// Create the auth context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user information from the backend
  const fetchUserInfo = async () => {
    try {
      console.log('AuthContext: Fetching user info from:', `${API_URL}/api/user-info`);
      const response = await fetch(`${API_URL}/api/user-info`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
      }
      
      const userData = await response.json();
      console.log('AuthContext: Received user data:', userData);
      
      // Extract email from response headers
      const email = response.headers.get('gap-auth');
      console.log('AuthContext: Extracted email from headers:', email);
      
      // Enhance user data with email
      const enhancedUserData = {
        ...userData,
        email: email,
        displayName: email || userData.username // Prefer email for display
      };
      
      setUser(enhancedUserData);
      setError(null);
    } catch (err) {
      console.error('AuthContext: Error fetching user info:', err);
      setError(err.message);
      // Set default non-admin user on error
      setUser({
        username: 'unknown',
        is_admin: false,
        groups: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Load user info on component mount
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Retry function for error recovery
  const retry = () => {
    setLoading(true);
    setError(null);
    fetchUserInfo();
  };

  const value = {
    user,
    loading,
    error,
    isAdmin: user?.is_admin || false,
    username: user?.displayName || user?.username || 'unknown', // Use email if available
    email: user?.email,
    groups: user?.groups || [],
    retry,
    refetch: fetchUserInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
