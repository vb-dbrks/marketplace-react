import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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

  return (
    <Box sx={{
      display: 'flex',
      gap: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexWrap: 'nowrap',
    }}>
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Type</InputLabel>
        <Select
          value={filters.type}
          label="Type"
          onChange={handleFilterChange('type')}
        >
          <MenuItem value="">All</MenuItem>
          {types.map(type => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Domain</InputLabel>
        <Select
          value={filters.domain}
          label="Domain"
          onChange={handleFilterChange('domain')}
        >
          <MenuItem value="">All</MenuItem>
          {domains.map(domain => (
            <MenuItem key={domain} value={domain}>{domain}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Region</InputLabel>
        <Select
          value={filters.region}
          label="Region"
          onChange={handleFilterChange('region')}
        >
          <MenuItem value="">All</MenuItem>
          {regions.map(region => (
            <MenuItem key={region} value={region}>{region}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Classification</InputLabel>
        <Select
          value={filters.classification}
          label="Classification"
          onChange={handleFilterChange('classification')}
        >
          <MenuItem value="">All</MenuItem>
          {classifications.map(classification => (
            <MenuItem key={classification} value={classification}>{classification}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default FilterBar;
