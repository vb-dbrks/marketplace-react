import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Alert, Button, CircularProgress } from '@mui/material';
import { AdminPanelSettings as AdminIcon, Home as HomeIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAdmin, loading, error, username, retry } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Checking permissions...
        </Typography>
      </Box>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={retry}>
              Retry
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Authentication Error
          </Typography>
          <Typography variant="body2">
            Unable to verify your permissions: {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Check admin access if required
  if (requireAdmin && !isAdmin) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            <AdminIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Admin Access Required
          </Typography>
          <Typography variant="body2" gutterBottom>
            You need to be a member of the <strong>marketplace_app_admins</strong> group to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current user: <strong>{username}</strong>
          </Typography>
        </Alert>
        
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => window.location.href = '/'}
          sx={{ mt: 2 }}
        >
          Return to Browse
        </Button>
      </Box>
    );
  }

  // User has required permissions, render the protected content
  return children;
};

export default ProtectedRoute;
