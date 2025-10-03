import React, { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Button, 
  Menu, 
  MenuItem, 
  IconButton,
  Typography,
  Divider,
  Chip,
  Avatar,
  Badge
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import companyLogo from '../assets/logo-placeholder.svg';
import { useAuth } from '../context/AuthContext';

const Banner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { isAdmin, username, email, loading, error } = useAuth();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Determine if we should show the go back button
  const shouldShowGoBack = () => {
    return !isActive('/'); // Show go back button on any page except home
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Get user initials for avatar
  const getUserInitials = (userIdentifier) => {
    if (!userIdentifier) return 'U';
    
    // If it's an email address, extract initials from the name part
    if (userIdentifier.includes('@')) {
      const emailPart = userIdentifier.split('@')[0];
      const parts = emailPart.split('.');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return emailPart.substring(0, 2).toUpperCase();
    }
    
    // If it's not an email (UUID), just use first 2 characters
    return userIdentifier.substring(0, 2).toUpperCase();
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // Subtle shadow at the bottom
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ 
        minHeight: '72px !important', 
        px: { xs: 2, sm: 3, md: 4 },
        width: '100%',
      }}>
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo and Brand */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <Box
              sx={{
                backgroundColor: 'transparent',
                borderRadius: '8px',
                p: 1,
                mr: 2
              }}
            >
              <img
                src={companyLogo}
                alt="Company Logo"
                style={{ 
                  height: 28, 
                  width: 'auto', 
                  verticalAlign: 'middle'
                  // Removed filter to keep original logo colors
                }}
              />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#333',
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                  lineHeight: 1.2
                }}
              >
                Data Marketplace
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#666',
                  fontSize: '0.75rem',
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 500
                }}
              >
                Discover • Analyze • Innovate
              </Typography>
            </Box>
          </Box>

          {/* Navigation and User Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Go Back button - shows on non-home pages */}
            {shouldShowGoBack() && (
              <Button
                onClick={handleGoBack}
                variant="text"
                startIcon={<ArrowBackIcon />}
                sx={{ 
                  color: '#666',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  px: 1.5,
                  py: 0.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'rgba(227, 24, 55, 0.05)',
                    color: '#E31837'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Go Back
              </Button>
            )}

            {/* Only show authoring button for admin users on home page */}
            {isAdmin && isActive('/') && (
              <Button
                component={Link}
                to="/authoring"
                variant="text"
                startIcon={<EditIcon />}
                sx={{ 
                  color: '#666',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  px: 1.5,
                  py: 0.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'rgba(227, 24, 55, 0.05)',
                    color: '#E31837'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Authoring
              </Button>
            )}

            {/* User Avatar and Menu */}
            <Box sx={{ ml: 2 }}>
              <IconButton
                onClick={handleMenuClick}
                sx={{ 
                  p: 0,
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s ease-in-out'
                  }
                }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    isAdmin ? (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: '#00A651', // Astellas complementary green
                          border: '2px solid white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <AdminIcon sx={{ fontSize: 10, color: 'white' }} />
                      </Box>
                    ) : null
                  }
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: '#E31837',
                      border: '2px solid rgba(227, 24, 55, 0.2)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1rem'
                    }}
                  >
                    {getUserInitials(email || username)}
                  </Avatar>
                </Badge>
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Toolbar>

      {/* Enhanced Dropdown menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 280,
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          }
        }}
      >
        {/* User Profile Header */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                backgroundColor: '#E31837', // Astellas red
                mr: 2,
                fontWeight: 700,
                color: 'white'
              }}
            >
              {getUserInitials(email || username)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {email ? 
                  email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                  'User'
                }
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                {email || username}
              </Typography>
              {isAdmin && (
                <Chip
                  icon={<AdminIcon />}
                  label="Administrator"
                  size="small"
                  sx={{ 
                    mt: 0.5,
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: '#00A651', // Astellas green
                    color: 'white',
                    '& .MuiChip-icon': { fontSize: 12, color: 'white' }
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ mx: 2 }} />
        
        {/* Navigation Items */}
        <Box sx={{ py: 1 }}>
          <MenuItem 
            onClick={() => handleNavigation('/')}
            sx={{ 
              mx: 1, 
              borderRadius: '8px',
              '&:hover': { backgroundColor: 'rgba(227, 24, 55, 0.08)' }
            }}
          >
            <HomeIcon sx={{ mr: 2, color: '#E31837' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Browse Products</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Explore data marketplace
              </Typography>
            </Box>
          </MenuItem>
          
          {/* Only show authoring menu item for admin users */}
          {isAdmin && (
            <MenuItem 
              onClick={() => handleNavigation('/authoring')}
              sx={{ 
                mx: 1, 
                borderRadius: '8px',
                '&:hover': { backgroundColor: 'rgba(227, 24, 55, 0.08)' }
              }}
            >
              <EditIcon sx={{ mr: 2, color: '#E31837' }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Data Product Authoring</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Create and manage products
                </Typography>
              </Box>
            </MenuItem>
          )}
        </Box>
        
        <Divider sx={{ mx: 2 }} />
        
        {/* Additional Options */}
        <Box sx={{ py: 1 }}>
          <MenuItem 
            onClick={handleMenuClose}
            sx={{ 
              mx: 1, 
              borderRadius: '8px',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
            }}
          >
            <SettingsIcon sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Settings</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Preferences and configuration
              </Typography>
            </Box>
          </MenuItem>
          
          <MenuItem 
            onClick={handleMenuClose}
            sx={{ 
              mx: 1, 
              borderRadius: '8px',
              '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.08)' }
            }}
          >
            <LogoutIcon sx={{ mr: 2, color: 'error.main' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>Sign Out</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                End your session
              </Typography>
            </Box>
          </MenuItem>
        </Box>
      </Menu>
    </AppBar>
  );
};

export default Banner;
