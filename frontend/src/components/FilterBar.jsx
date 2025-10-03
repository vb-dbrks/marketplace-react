import { Box, FormControl, InputLabel, Select, MenuItem, Chip, IconButton } from '@mui/material';
import { FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useData } from '../context/useData';

const FilterBar = () => {
  const { filters, setFilters, allProducts } = useData();

  // Get unique values for each filter
  const getUniqueValues = (field) => 
    [...new Set(allProducts.map(product => product[field]))].sort();

  const types = getUniqueValues('type');
  const domains = getUniqueValues('domain');
  const regions = getUniqueValues('region');
  const classifications = getUniqueValues('classification');

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      type: '',
      domain: '',
      region: '',
      classification: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const filterConfigs = [
    { field: 'type', label: 'Type', options: types, minWidth: 120 },
    { field: 'domain', label: 'Domain', options: domains, minWidth: 140 },
    { field: 'region', label: 'Region', options: regions, minWidth: 120 },
    { field: 'classification', label: 'Classification', options: classifications, minWidth: 160 }
  ];

  return (
    <Box sx={{
      display: 'flex',
      gap: { xs: 1, sm: 2 }, // Smaller gap on mobile
      alignItems: 'center',
      justifyContent: { xs: 'center', lg: 'flex-end' }, // Center on mobile
      flexWrap: 'wrap',
      width: '100%',
    }}>
      {/* Filter Icon */}
      <FilterIcon sx={{ 
        color: hasActiveFilters ? '#E31837' : '#666',
        fontSize: 20,
        transition: 'color 0.2s ease-in-out'
      }} />

      {/* Filter Dropdowns */}
      {filterConfigs.map(({ field, label, options, minWidth }) => (
        <FormControl 
          key={field}
          size="medium"
          sx={{ 
            minWidth: { xs: 100, sm: minWidth }, // Smaller on mobile
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '2px solid transparent',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                border: '2px solid rgba(227, 24, 55, 0.2)',
              },
              '&.Mui-focused': {
                boxShadow: '0 4px 20px rgba(227, 24, 55, 0.15)',
                border: '2px solid rgba(227, 24, 55, 0.3)',
                transform: 'translateY(-1px)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              height: '56px',
            },
            '& .MuiInputLabel-root': {
              fontWeight: 600,
              color: '#666',
              backgroundColor: 'white',
              padding: '0 8px',
              '&.Mui-focused': {
                color: '#E31837',
              },
              '&.MuiInputLabel-shrink': {
                backgroundColor: 'white',
                padding: '0 8px',
                borderRadius: '4px',
              }
            }
          }}
        >
          <InputLabel>{label}</InputLabel>
          <Select
            value={filters[field]}
            label={label}
            onChange={handleFilterChange(field)}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  mt: 1,
                  '& .MuiMenuItem-root': {
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(227, 24, 55, 0.08)',
                      color: '#E31837',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(227, 24, 55, 0.12)',
                      color: '#E31837',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(227, 24, 55, 0.16)',
                      }
                    }
                  }
                }
              }
            }}
          >
            <MenuItem value="">
              <em>All {label}s</em>
            </MenuItem>
            {options.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <IconButton
          onClick={clearAllFilters}
          sx={{
            backgroundColor: 'rgba(227, 24, 55, 0.08)',
            color: '#E31837',
            borderRadius: '12px',
            width: 56,
            height: 56,
            '&:hover': {
              backgroundColor: 'rgba(227, 24, 55, 0.15)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <ClearIcon />
        </IconButton>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 1 }}>
          {Object.entries(filters).map(([field, value]) => 
            value && (
              <Chip
                key={field}
                label={`${field}: ${value}`}
                size="small"
                onDelete={() => handleFilterChange(field)({ target: { value: '' } })}
                sx={{
                  backgroundColor: 'rgba(227, 24, 55, 0.1)',
                  color: '#E31837',
                  borderRadius: '8px',
                  fontWeight: 600,
                  '& .MuiChip-deleteIcon': {
                    color: '#E31837',
                    '&:hover': {
                      color: '#B91C3C',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(227, 24, 55, 0.15)',
                  }
                }}
              />
            )
          )}
        </Box>
      )}
    </Box>
  );
};

export default FilterBar;
