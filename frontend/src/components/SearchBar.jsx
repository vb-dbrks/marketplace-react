import { TextField, InputAdornment, IconButton, Box, Typography, CircularProgress, Fade, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useData } from '../context/useData';
import { useState, useEffect } from 'react';
import colors from '../theme/colors';

const SearchBar = () => {
  const { searchTerm, setSearchTerm, filteredProducts } = useData();
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setSearchTerm('');
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
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
    <Box sx={{ position: 'relative' }}>
      {/* Enhanced Search Input */}
      <TextField
        variant="outlined"
        sx={{ 
          width: { xs: '100%', sm: '750px', md: '900px' }, // 50% larger: 500->750, 600->900
          minWidth: '450px' // 50% larger minimum width: 300->450
        }}
        placeholder="Search data products, domains, owners..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon 
                sx={{ 
                  color: isFocused ? '#E31837' : 'action.main',
                  transition: 'color 0.2s ease-in-out'
                }} 
              />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton 
                onClick={handleClear} 
                edge="end"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(227, 24, 55, 0.08)',
                    color: '#E31837'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            borderRadius: '16px',
            backgroundColor: 'white',
            boxShadow: isFocused 
              ? '0 4px 20px rgba(227, 24, 55, 0.15)' 
              : '0 2px 8px rgba(0,0,0,0.08)',
            border: isFocused 
              ? '2px solid rgba(227, 24, 55, 0.3)' 
              : '2px solid transparent',
            '&:hover': {
              backgroundColor: 'white',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            height: '56px',
            fontSize: '1rem',
            fontWeight: 500,
            transition: 'all 0.3s ease-in-out',
            transform: isFocused ? 'translateY(-2px)' : 'translateY(0)',
          },
        }}
        InputLabelProps={{
          sx: {
            fontSize: '1rem',
            fontWeight: 500,
          }
        }}
      />
      
      {/* Enhanced Search Results Display */}
      <Fade in={!!searchTerm} timeout={300}>
        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1 
        }}>
          {/* Left side - Search status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isSearching ? (
              <>
                <CircularProgress 
                  size={18} 
                  sx={{ 
                    color: '#E31837',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} 
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#E31837',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  Searching...
                </Typography>
              </>
            ) : filteredProducts.length > 0 ? (
              <>
                <CheckCircleIcon 
                  sx={{ 
                    fontSize: 18, 
                    color: '#00A651',
                    animation: 'bounceIn 0.5s ease-out'
                  }} 
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#00A651',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                </Typography>
              </>
            ) : searchTerm ? (
              <>
                <WarningIcon 
                  sx={{ 
                    fontSize: 18, 
                    color: '#FF9800',
                    animation: 'shake 0.5s ease-in-out'
                  }} 
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#FF9800',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  No products found
                </Typography>
              </>
            ) : null}
          </Box>

          {/* Right side - Search term chip */}
          {searchTerm && (
            <Chip
              icon={<TrendingUpIcon />}
              label={`"${searchTerm}"`}
              variant="outlined"
              size="small"
              sx={{
                backgroundColor: 'rgba(227, 24, 55, 0.05)',
                borderColor: 'rgba(227, 24, 55, 0.3)',
                color: '#E31837',
                fontWeight: 600,
                '& .MuiChip-icon': {
                  color: '#E31837'
                },
                '&:hover': {
                  backgroundColor: 'rgba(227, 24, 55, 0.1)',
                }
              }}
            />
          )}
        </Box>
      </Fade>

      {/* Search suggestions for no results */}
      {searchTerm && !isSearching && filteredProducts.length === 0 && (
        <Fade in timeout={500}>
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: 'rgba(255, 152, 0, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 152, 0, 0.2)'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666',
                fontWeight: 500,
                mb: 1
              }}
            >
              Try searching for:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['Analytics', 'Commercial', 'Sales', 'Marketing', 'Finance'].map((suggestion) => (
                <Chip
                  key={suggestion}
                  label={suggestion}
                  size="small"
                  variant="outlined"
                  onClick={() => setSearchTerm(suggestion)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(227, 24, 55, 0.08)',
                      borderColor: '#E31837',
                      color: '#E31837'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Fade>
      )}

      {/* Add custom animations */}
      <style>
        {`
          @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default SearchBar;
