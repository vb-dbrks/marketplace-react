import { createContext, useState, useMemo, useEffect } from 'react';

// Use relative path in production, full URL in dev
const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:8000') : '';

// Create the context
const DataContext = createContext();

// Create a provider component
function DataProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    domain: '',
    region: '',
    classification: '',
    tags: ''
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from the backend API
  useEffect(() => {
    fetch(`${API_URL}/api/data-products`)
      .then(res => res.json())
      .then(setProducts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // Filter products based on active filters and search term
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesFilters = Object.entries(filters).every(([field, value]) => {
        if (!value) return true; // Skip empty filters
        const filterValue = String(value).toLowerCase();
        if (field === 'tags') {
          // For tags, check if the product has the selected tag (case-insensitive)
          return product.tags && product.tags.some(tag => 
            tag.toLowerCase() === filterValue
          );
        }
        // For other fields, do a case-insensitive comparison
        return String(product[field]).toLowerCase() === filterValue;
      });

      // Check if product matches search term - search ALL fields
      const matchesSearch = !searchTerm || (() => {
        const searchLower = searchTerm.toLowerCase();
        
        // Define all searchable fields
        const searchableFields = [
          'id', 'name', 'description', 'purpose', 'type', 'domain', 'region', 
          'owner', 'certified', 'classification', 'gxp', 'interval_of_change',
          'last_updated_date', 'first_publish_date', 'next_reassessment_date',
          'security_considerations', 'business_function', 'databricks_url',
          'tableau_url', 'ai_bi_genie_url', 'request_access_url'
        ];
        
        // Search through all text fields
        for (const field of searchableFields) {
          if (product[field] && String(product[field]).toLowerCase().includes(searchLower)) {
            return true;
          }
        }
        
        // Search through tags array
        if (product.tags && Array.isArray(product.tags)) {
          if (product.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
            return true;
          }
        }
        
        return false;
      })();

      return matchesFilters && matchesSearch;
    });
  }, [products, filters, searchTerm]);

  const removeFilter = (field) => {
    setFilters(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  // Add a function to reload products from the backend
  const reloadProducts = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/data-products`)
      .then(res => res.json())
      .then(setProducts)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  // Removed auto-refresh to prevent overwriting local changes
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     reloadProducts();
  //   }, 10000); // 10 seconds
  //   return () => clearInterval(interval);
  // }, []);

  const value = {
    allProducts: products, // Use actual products array for editing
    filteredProducts, // Expose filtered products separately
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    selectedTypes,
    setSelectedTypes,
    selectedDomains,
    setSelectedDomains,
    filters,
    setFilters,
    removeFilter,
    loading,
    error,
    setProducts, // for authoring page to update
    reloadProducts // expose reload function
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export default DataContext;
export { DataProvider };
