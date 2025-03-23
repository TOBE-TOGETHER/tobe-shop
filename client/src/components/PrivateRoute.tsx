import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles = [] }) => {
  const { isAuthenticated, user, isInitialized } = useAuth();
  const { t } = useTranslation();

  // Show loading state while authentication is initializing
  if (!isInitialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          {t('common.loading')}
        </Typography>
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If roles are specified, check if user has required role
  if (roles.length > 0) {
    const hasRequiredRole = roles.includes(user?.role || '');
    if (!hasRequiredRole) {
      // Redirect to homepage if user doesn't have required role
      return <Navigate to="/" />;
    }
  }

  // If user is authenticated and has required role (if specified), render children
  return <>{children}</>;
};

export default PrivateRoute; 