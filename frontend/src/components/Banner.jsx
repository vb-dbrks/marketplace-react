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
  Divider
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import companyLogo from '../assets/company_logo.png';

const Banner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ 
        minHeight: '64px !important', 
        p: '0 !important',
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
          {/* Logo on the far left */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <img
              src={companyLogo}
              alt="Company Logo"
              style={{ 
                height: 40, 
                width: 'auto', 
                verticalAlign: 'middle',
              }}
            />
          </Box>

          {/* Centered title */}
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              color: '#333',
              margin: 0,
              padding: 0,
              fontWeight: 600,
            }}>
              Internal Data Marketplace
            </h1>
          </Box>

          {/* Navigation menu on the far right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Quick navigation buttons */}
            <Button
              component={Link}
              to="/"
              variant={isActive('/') ? "contained" : "text"}
              startIcon={<HomeIcon />}
              sx={{ 
                color: isActive('/') ? 'white' : '#333',
                '&:hover': {
                  backgroundColor: isActive('/') ? 'primary.dark' : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Browse
            </Button>
            
            <Button
              component={Link}
              to="/authoring"
              variant={isActive('/authoring') ? "contained" : "text"}
              startIcon={<EditIcon />}
              sx={{ 
                color: isActive('/authoring') ? 'white' : '#333',
                '&:hover': {
                  backgroundColor: isActive('/authoring') ? 'primary.dark' : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Authoring
            </Button>

            {/* Burger menu for additional options */}
            <IconButton
              color="inherit"
              aria-label="more options"
              onClick={handleMenuClick}
              sx={{ ml: 1, color: '#000' }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>

      {/* Dropdown menu */}
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
            mt: 1,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <MenuItem onClick={() => handleNavigation('/')}>
          <HomeIcon sx={{ mr: 2 }} />
          Browse Products
        </MenuItem>
        <MenuItem onClick={() => handleNavigation('/authoring')}>
          <EditIcon sx={{ mr: 2 }} />
          Data Product Authoring
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2" color="text.secondary">
            Close Menu
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Banner;
