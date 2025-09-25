import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Chip, 
  Container, 
  Divider,
  Avatar,
  Stack
} from '@mui/material';
import {
  Info as InfoIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Verified as VerifiedIcon,
  Science as ScienceIcon,
  Label as LabelIcon,
  Launch as LaunchIcon,
  AccessTime as TimeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useData } from '../context/useData';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allProducts } = useData();
  const product = allProducts.find(p => p.id === id);

  if (!product) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Product not found.</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Return to Homepage
        </Button>
      </Container>
    );
  }

  const InfoRow = ({ icon, label, value, color = 'text.secondary' }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body2" color={color} sx={{ fontWeight: 400 }}>
          {value || 'Not specified'}
        </Typography>
      </Box>
    </Box>
  );

  // Consistent box styling for all sections
  const BoxStyle = ({ children, ...props }) => (
    <Box
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        height: '100%',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transform: 'translateY(-1px)'
        }
      }}
      {...props}
    >
      {children}
    </Box>
  );

  return (
    <Container maxWidth="lg">
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          mt: 4, 
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid #e3f2fd'
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 2, color: 'text.secondary' }}
          >
            Back to Products
          </Button>
          
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              color: 'primary.main',
              mb: 1,
              fontSize: { xs: '1.75rem', md: '2.125rem' }
            }}
          >
            {product.name}
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
            <Chip 
              icon={<InfoIcon />}
              label={`ID: ${product.id}`}
              size="small"
              variant="outlined"
              sx={{ borderColor: 'primary.main' }}
            />
            <Chip 
              icon={<TimeIcon />}
              label={`Updated: ${product.last_updated_date}`}
              size="small"
              variant="outlined"
              sx={{ borderColor: 'success.main' }}
            />
            <Chip 
              icon={<CategoryIcon />}
              label={`Domain: ${product.domain}`}
              size="small"
              variant="outlined"
              sx={{ borderColor: 'info.main' }}
            />
            <Chip 
              icon={<LocationIcon />}
              label={`Region: ${product.region || 'Global'}`}
              size="small"
              variant="outlined"
              sx={{ borderColor: 'warning.main' }}
            />
          </Stack>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<LaunchIcon />}
              sx={{ 
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)'
                }
              }}
              onClick={() => window.open(product.request_access_url || '#', '_blank')}
            >
              Request Access
            </Button>

            {/* External Action Buttons */}
            {product.databricks_url && (
              <Button 
                variant="outlined" 
                href={product.databricks_url}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<LaunchIcon />}
                size="large"
                sx={{ 
                  color: '#ff6600', 
                  borderColor: '#ff6600',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#ff6600',
                    backgroundColor: 'rgba(255, 102, 0, 0.04)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Databricks
              </Button>
            )}
            
            {product.ai_bi_genie_url && (
              <Button 
                variant="outlined" 
                href={product.ai_bi_genie_url}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<LaunchIcon />}
                size="large"
                color="primary"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Genie
              </Button>
            )}
            
            {product.tableau_url && (
              <Button 
                variant="outlined" 
                href={product.tableau_url}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<LaunchIcon />}
                size="large"
                sx={{ 
                  color: '#009688', 
                  borderColor: '#009688',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#009688',
                    backgroundColor: 'rgba(0, 150, 136, 0.04)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Tableau
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />
        
        {/* Overview Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 3
            }}
          >
            <DescriptionIcon color="primary" />
            Overview
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <BoxStyle>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Description
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.6 }}>
                  {product.description}
                </Typography>
                
                {product.purpose && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
                      Purpose
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ lineHeight: 1.6 }}>
                      {product.purpose}
                    </Typography>
                  </>
                )}
              </BoxStyle>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <BoxStyle>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Product Details
                </Typography>
                
                <Stack spacing={2}>
                  <InfoRow icon={<CategoryIcon />} label="Type" value={product.type} />
                  <InfoRow icon={<PersonIcon />} label="Owner" value={product.owner} />
                  {product.certified && (
                    <InfoRow 
                      icon={<VerifiedIcon />} 
                      label="Certified" 
                      value={product.certified}
                      color="success.main"
                    />
                  )}
                  {product.classification && (
                    <InfoRow icon={<LabelIcon />} label="Classification" value={product.classification} />
                  )}
                  {product.gxp && (
                    <InfoRow 
                      icon={<ScienceIcon />} 
                      label="GxP Status" 
                      value={product.gxp}
                      color="warning.main"
                    />
                  )}
                </Stack>
              </BoxStyle>
            </Grid>
          </Grid>
        </Box>

        {/* Additional Details Section - NEW SECTION FOR CONSISTENCY */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 3
            }}
          >
            <InfoIcon color="primary" />
            Additional Details
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <BoxStyle textAlign="center">
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                  <TimeIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Update Frequency
                </Typography>
                <Typography variant="body1" color="info.main" sx={{ fontWeight: 500 }}>
                  {product.interval_of_change || 'Not specified'}
                </Typography>
              </BoxStyle>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <BoxStyle textAlign="center">
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                  <TimeIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  First Published
                </Typography>
                <Typography variant="body1" color="warning.main" sx={{ fontWeight: 500 }}>
                  {product.first_publish_date || 'Not specified'}
                </Typography>
              </BoxStyle>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <BoxStyle textAlign="center">
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'secondary.main', mx: 'auto', mb: 2 }}>
                  <TimeIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Next Reassessment
                </Typography>
                <Typography variant="body1" color="secondary.main" sx={{ fontWeight: 500 }}>
                  {product.next_reassessment_date || 'Not specified'}
                </Typography>
              </BoxStyle>
            </Grid>
          </Grid>
        </Box>

        {/* Tags Section */}
        {product.tags && product.tags.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 3
              }}
            >
              <LabelIcon color="primary" />
              Tags
            </Typography>
            
            <BoxStyle>
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                flexWrap: 'wrap'
              }}>
                {product.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    size="medium"
                    sx={{ 
                      backgroundColor: 'primary.light',
                      color: 'white',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                ))}
              </Box>
            </BoxStyle>
          </Box>
        )}

      </Paper>
    </Container>
  );
};

export default ProductDetail;
