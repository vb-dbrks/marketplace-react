import React from 'react';
import { Breadcrumbs as MUIBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { useLocation, Link as RouterLink, useParams } from 'react-router-dom';
import {
  Home as HomeIcon,
  Edit as EditIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon
} from '@mui/icons-material';

const Breadcrumbs = () => {
  const location = useLocation();
  const { id } = useParams();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Custom labels for specific routes
  const getCustomLabel = (pathname) => {
    switch (pathname) {
      case 'authoring':
        return 'Data Product Authoring';
      case 'browse':
        return 'Browse Products';
      case 'add':
        return 'Add New Product';
      default:
        return decodeURIComponent(pathname);
    }
  };

  // Custom icons for specific routes
  const getCustomIcon = (pathname) => {
    switch (pathname) {
      case 'authoring':
        return <EditIcon sx={{ fontSize: 18, mr: 0.5 }} />;
      case 'browse':
        return <DashboardIcon sx={{ fontSize: 18, mr: 0.5 }} />;
      case 'add':
        return <AddIcon sx={{ fontSize: 18, mr: 0.5 }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      backgroundColor: '#f8f9fa', 
      borderBottom: '1px solid #e9ecef',
      py: 1.5,
      px: 3
    }}>
      <MUIBreadcrumbs 
        aria-label="breadcrumb" 
        sx={{ 
          '& .MuiBreadcrumbs-ol': { 
            alignItems: 'center' 
          },
          '& .MuiBreadcrumbs-li': {
            display: 'flex',
            alignItems: 'center'
          }
        }}
      >
        <Link 
          component={RouterLink} 
          underline="hover" 
          color="inherit" 
          to="/"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          <HomeIcon sx={{ fontSize: 18, mr: 0.5 }} />
          Home
        </Link>
        
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const customLabel = getCustomLabel(value);
          const customIcon = getCustomIcon(value);

          // If we're on a product page, show "Data Product ID"
          if (isLast && id) {
            return (
              <Typography 
                color="text.primary" 
                key={to}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 500
                }}
              >
                <DashboardIcon sx={{ fontSize: 18, mr: 0.5 }} />
                Data Product {id}
              </Typography>
            );
          }

          // For other pages, show custom labels and icons
          return isLast ? (
            <Typography 
              color="text.primary" 
              key={to}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 500
              }}
            >
              {customIcon}
              {customLabel}
            </Typography>
          ) : (
            <Link 
              component={RouterLink} 
              underline="hover" 
              color="inherit" 
              to={to} 
              key={to}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {customIcon}
              {customLabel}
            </Link>
          );
        })}
      </MUIBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
