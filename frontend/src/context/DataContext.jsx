import { createContext, useState, useMemo, useEffect } from 'react';

// Use same API configuration as utils/api.js
const getApiUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return '';
};
const API_URL = getApiUrl();

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
    console.log('DataContext: Fetching products from:', `${API_URL}/api/data-products`);
    fetch(`${API_URL}/api/data-products`)
      .then(res => {
        console.log('DataContext: API response status:', res.status);
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('DataContext: Received products:', data);
        // Ensure data is an array before setting products
        if (Array.isArray(data)) {
          console.log('DataContext: Setting products array with length:', data.length);
          setProducts(data);
        } else {
          console.error('DataContext: Received data is not an array:', typeof data, data);
          setProducts([]); // Set empty array as fallback
          setError(new Error('Invalid data format received from API'));
        }
      })
      .catch(err => {
        console.error('DataContext: API error:', err);
        setError(err);
        setProducts([]); // Set empty array on error to prevent filter issues
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter products based on active filters and search term
  const filteredProducts = useMemo(() => {
    // Ensure products is an array before filtering
    if (!Array.isArray(products)) {
      console.warn('DataContext: products is not an array, returning empty array');
      return [];
    }
    
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
      .then(res => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        // Ensure data is an array before setting products
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('DataContext: Received data is not an array:', typeof data, data);
          setProducts([]); // Set empty array as fallback
          setError(new Error('Invalid data format received from API'));
        }
      })
      .catch(err => {
        setError(err);
        setProducts([]); // Set empty array on error to prevent filter issues
      })
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
    reloadProducts, // expose reload function
    retryLoading: () => {
      setError(null);
      reloadProducts();
    }
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export default DataContext;
export { DataProvider };
