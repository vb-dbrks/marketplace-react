import { Box } from '@mui/material';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import FilterTags from './FilterTags';

const SearchAndFilterContainer = () => {
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
          px: { xs: 2, sm: 3 }, // Responsive padding
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' }, // Stack on mobile, row on desktop
          alignItems: { xs: 'stretch', lg: 'center' }, // Stretch on mobile, center on desktop
          justifyContent: { xs: 'center', lg: 'space-between' }, // Center on mobile, space-between on desktop
          gap: { xs: 2, lg: 3 }, // Smaller gap on mobile
          mb: 2,
          mt: 2,
          minHeight: '56px', // Ensure consistent height
        }}
      >
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', lg: 'flex-start' }, // Center on mobile
          width: { xs: '100%', lg: 'auto' }, // Full width on mobile
        }}>
          <SearchBar />
        </Box>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', lg: 'flex-end' }, // Center on mobile
          height: '56px',
          width: { xs: '100%', lg: 'auto' }, // Full width on mobile
          flexWrap: 'wrap', // Allow wrapping on smaller screens
          gap: 1,
        }}>
          <FilterBar />
        </Box>
      </Box>
      <Box sx={{ px: 3 }}>
        <FilterTags />
      </Box>
    </Box>
  );
};

export default SearchAndFilterContainer;