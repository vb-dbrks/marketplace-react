import { Grid, Box, Pagination, Typography, Alert } from '@mui/material';
import ProductCard from './ProductCard';
import { useData } from '../context/useData';
import { useState, useEffect } from 'react';

const ITEMS_PER_PAGE = 9; // 3x3 grid

const ProductGrid = () => {
  const { filteredProducts, searchTerm, loading, error } = useData();
  const [page, setPage] = useState(1);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Use filtered products for display
  const productsToShow = filteredProducts;
  const totalPages = Math.ceil(productsToShow.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentProducts = productsToShow.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Show loading or error states
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading products...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading products: {error.message}
        </Alert>
      </Box>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No products found.</Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width: '100%',
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: '100%',
          px: 3,
        }}
      >

        <Grid 
          container 
          sx={{ 
            mt: 2, 
            mb: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            '& > .MuiGrid-item': {
              width: '100% !important',
              maxWidth: '100% !important',
              padding: '0 !important'
            }
          }}
        >
          {currentProducts.map((product) => (
            <Grid 
              key={product.id} 
            >
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
        
        {totalPages > 1 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 4, 
            mb: 4 
          }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton 
              showLastButton
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProductGrid;
