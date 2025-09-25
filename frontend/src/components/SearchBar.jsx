import { TextField, InputAdornment, IconButton, Box, Typography, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useData } from '../context/useData';
import { useState, useEffect } from 'react';

const SearchBar = () => {
  const { searchTerm, setSearchTerm, filteredProducts } = useData();
  const [isSearching, setIsSearching] = useState(false);

  const handleClear = () => {
    setSearchTerm('');
  };

  // Simulate search delay for animation
  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300); // 300ms search animation
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm]);

  return (
    <Box>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search data products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} edge="end">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            borderRadius: 2,
            backgroundColor: 'white',
            '&:hover': {
              backgroundColor: 'white',
            },
            height: '40px',
          },
        }}
      />
      
      {/* Search hint with animated icon */}
      {searchTerm && (
        <Box sx={{ 
          mt: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1 
        }}>
          {isSearching ? (
            <>
              <CircularProgress size={16} sx={{ color: 'primary.main' }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 'medium'
                }}
              >
                Searching...
              </Typography>
            </>
          ) : filteredProducts.length > 0 ? (
            <>
              <CheckCircleIcon 
                sx={{ 
                  fontSize: 16, 
                  color: 'success.main',
                  animation: 'fadeIn 0.3s ease-in'
                }} 
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'success.main',
                  fontWeight: 'medium'
                }}
              >
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </Typography>
            </>
          ) : (
            <>
              <WarningIcon 
                sx={{ 
                  fontSize: 16, 
                  color: 'warning.main',
                  animation: 'fadeIn 0.3s ease-in'
                }} 
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'warning.main',
                  fontWeight: 'medium'
                }}
              >
                No products found - try a different search term
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;
