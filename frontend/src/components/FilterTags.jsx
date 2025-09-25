import { Box, Chip } from '@mui/material';
import { useData } from '../context/useData';

const FilterTags = () => {
  const { filters, removeFilter } = useData();

  const activeFilters = Object.entries(filters).filter(([, value]) => value !== '');

  if (activeFilters.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2, mb: 2 }}>
      {activeFilters.map(([field, value]) => (
        <Chip
          key={`${field}-${value}`}
          label={`${field}: ${value}`}
          onDelete={() => removeFilter(field)}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ))}
    </Box>
  );
};

export default FilterTags;
