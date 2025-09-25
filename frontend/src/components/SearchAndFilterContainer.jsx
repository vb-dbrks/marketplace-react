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
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          mt: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <SearchBar />
        </Box>
        <FilterBar />
      </Box>
      <Box sx={{ px: 3 }}>
        <FilterTags />
      </Box>
    </Box>
  );
};

export default SearchAndFilterContainer;