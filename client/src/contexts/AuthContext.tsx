import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isSeller: boolean;
  isInitialized: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUserData: (userData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
  token: string | null;
  userId: number | null;
  userObjectId: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Token getter from localStorage
  const token = useMemo(() => localStorage.getItem('token'), [isAuthenticated]);
  
  // Extract userId from token for consistent API access
  const userId = useMemo(() => {
    if (!token) return null;
    
    // Token format is "<userId>_<username>_<timestamp>"
    const parts = token.split('_');
    if (parts.length < 1) return null;
    
    // Make sure we return a number for consistency
    return parseInt(parts[0], 10) || null;
  }, [token]);

  // Fallback to user object id if needed
  const userObjectId = useMemo(() => user?.id || null, [user]);
  
  // Check if user is a seller
  const isSeller = useMemo(() => user?.role === 'seller', [user]);

  // Check for existing auth on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    const loadAuthState = async () => {
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('Authentication restored from localStorage');
          
          // If we have a token but need to refresh user data
          if (!parsedUser.id || !parsedUser.role) {
            console.log('User data incomplete, refreshing from server');
            await refreshUserData();
          }
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          // Clear invalid storage data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else if (storedToken) {
        // We have a token but no user data, try to refresh
        try {
          console.log('Token found but no user data, attempting to refresh');
          await refreshUserData();
        } catch (error) {
          console.error('Failed to refresh user data on init:', error);
          // Don't clear token here, let refreshUserData handle that if needed
        }
      }
      setIsInitialized(true);
    };
    
    loadAuthState();
    // We're using refreshUserData inside an async function, so we need to include it in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login function - stores user data in localStorage
  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Validate token format
    const parts = token.split('_');
    if (parts.length >= 1 && parts[0]) {
      const tokenUserId = parseInt(parts[0], 10);
      // If token userId doesn't match user object id, log a warning
      if (tokenUserId !== userData.id) {
        console.warn('Token userId does not match user object id!', 
          { tokenId: tokenUserId, objectId: userData.id });
      }
    }
    
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout function - removes user data from localStorage
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Function to update user data after changes
  const updateUserData = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Function to fetch the latest user data from the server
  const refreshUserData = async (): Promise<void> => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      console.log('No token found in localStorage');
      logout();
      return;
    }

    try {
      // Extract user ID from token (format: "<userId>_<username>_<timestamp>")
      const parts = storedToken.split('_');
      if (parts.length < 1) {
        console.error('Invalid token format');
        logout();
        return;
      }

      const userIdFromToken = parts[0];
      console.log('Refreshing data for user ID:', userIdFromToken);

      const response = await fetch(`http://localhost:8080/api/users/${userIdFromToken}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication expired or invalid');
          logout();
          return;
        }
        throw new Error(`Failed to refresh user data: ${response.status}`);
      }

      const data = await response.json();

      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('User data refreshed successfully');
      } else {
        console.error('No user data in response');
        throw new Error('No user data returned from server');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If there's a stored user but refresh fails, keep the stored user
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('Falling back to stored user data');
        } catch (err) {
          console.error('Failed to parse stored user as fallback:', err);
        }
      }
    }
  };

  // Return context value with computed properties
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isSeller,
        isInitialized,
        login,
        logout,
        updateUserData,
        refreshUserData,
        token,
        userId,
        userObjectId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 