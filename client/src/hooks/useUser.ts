import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  shopId?: number;
}

/**
 * Custom hook to access and refresh user data
 * 
 * This hook provides:
 * - Current user data from AuthContext
 * - Loading state while refreshing
 * - Methods to refresh user data from the server
 */
export const useUser = () => {
  const { user, isAuthenticated, refreshUserData, updateUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh user data from the server
  const refresh = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await refreshUserData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh user data');
      console.error('Error refreshing user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update specific user fields
  const updateUser = (updates: Partial<User>) => {
    updateUserData(updates);
  };

  return {
    user,
    isLoading,
    error,
    refresh,
    updateUser,
  };
};

export default useUser; 