import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Stack,
  FormControlLabel,
  Checkbox,
  FormGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useData } from '../context/useData';

// Use relative path in production, full URL in dev
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

// Column configuration with all available fields
const ALL_COLUMNS = [
  { field: 'id', headerName: 'ID', width: 120, editable: false, required: false },
  { field: 'name', headerName: 'Product Name', width: 250, editable: true, required: true },
  { field: 'description', headerName: 'Description', width: 300, editable: true, required: true },
  { field: 'purpose', headerName: 'Purpose', width: 300, editable: true, required: true },
  { field: 'type', headerName: 'Type', width: 180, editable: true, required: true, type: 'singleSelect', valueOptions: [
    'Analytics Data Product', 'AI/ML Model', 'Dashboard', 'API', 'Dataset', 'Report'
  ]},
  { field: 'domain', headerName: 'Domain', width: 150, editable: true, required: true, type: 'singleSelect', valueOptions: [
    'Commercial', 'Clinical', 'Supply Chain', 'Safety', 'Finance', 'HR', 'IT', 'R&D'
  ]},
  { field: 'region', headerName: 'Region', width: 130, editable: true, required: true, type: 'singleSelect', valueOptions: [
    'Global', 'North America', 'EMEA', 'APAC', 'Japan'
  ]},
  { field: 'owner', headerName: 'Owner', width: 180, editable: true, required: true },
  { field: 'certified', headerName: 'Certified', width: 120, editable: true, type: 'singleSelect', valueOptions: [
    'Yes', 'No', 'In Progress', 'Digital X to populate'
  ]},
  { field: 'classification', headerName: 'Classification', width: 140, editable: true, required: true, type: 'singleSelect', valueOptions: [
    'Internal', 'Confidential', 'Restricted', 'Public'
  ]},
  { field: 'gxp', headerName: 'GXP Status', width: 120, editable: true, required: true, type: 'singleSelect', valueOptions: [
    'GXP', 'Non-GXP'
  ]},
  { field: 'interval_of_change', headerName: 'Update Frequency', width: 140, editable: true, type: 'singleSelect', valueOptions: [
    'Real-time', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'Other'
  ]},
  { 
    field: 'last_updated_date', 
    headerName: 'Last Updated', 
    width: 130, 
    editable: true, 
    required: true, 
    type: 'date',
    valueGetter: (params) => {
      const value = params.value;
      if (!value) return null;
      // Handle both string and Date object inputs
      if (value instanceof Date) return value;
      // Convert string to Date
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    },
    valueSetter: (params) => {
      const value = params.newValue;
      if (!value) return { ...params.row, last_updated_date: '' };
      // Convert Date to ISO string format
      const dateString = value instanceof Date ? value.toISOString().split('T')[0] : value;
      return { ...params.row, last_updated_date: dateString };
    }
  },
  { 
    field: 'first_publish_date', 
    headerName: 'First Published', 
    width: 140, 
    editable: true, 
    required: true, 
    type: 'date',
    valueGetter: (params) => {
      const value = params.value;
      if (!value) return null;
      // Handle both string and Date object inputs
      if (value instanceof Date) return value;
      // Convert string to Date
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    },
    valueSetter: (params) => {
      const value = params.newValue;
      if (!value) return { ...params.row, first_publish_date: '' };
      // Convert Date to ISO string format
      const dateString = value instanceof Date ? value.toISOString().split('T')[0] : value;
      return { ...params.row, first_publish_date: dateString };
    }
  },
  { 
    field: 'next_reassessment_date', 
    headerName: 'Next Reassessment', 
    width: 160, 
    editable: true, 
    required: true, 
    type: 'date',
    valueGetter: (params) => {
      const value = params.value;
      if (!value) return null;
      // Handle both string and Date object inputs
      if (value instanceof Date) return value;
      // Convert string to Date
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    },
    valueSetter: (params) => {
      const value = params.newValue;
      if (!value) return { ...params.row, next_reassessment_date: '' };
      // Convert Date to ISO string format
      const dateString = value instanceof Date ? value.toISOString().split('T')[0] : value;
      return { ...params.row, next_reassessment_date: dateString };
    }
  },
  { field: 'security_considerations', headerName: 'Security', width: 200, editable: true },
  { field: 'sub_domain', headerName: 'Sub Domain', width: 160, editable: true, required: true, type: 'singleSelect', valueOptions: [
    'Commercial', 'Clinical Research', 'Supply Chain', 'Drug Safety', 'Finance', 'HR', 'IT', 'R&D'
  ]},
  { field: 'databricks_url', headerName: 'Databricks URL', width: 200, editable: true, type: 'string' },
  { field: 'tableau_url', headerName: 'Tableau URL', width: 200, editable: true, type: 'string' },
  { field: 'qlik_url', headerName: 'Qlik URL', width: 200, editable: true, type: 'string' },
  { field: 'data_contract_url', headerName: 'Data Contract URL', width: 200, editable: true, type: 'string' },
  { field: 'tags', headerName: 'Tags', width: 200, editable: true, type: 'string' }
];

// Predefined tag options
const PREDEFINED_TAGS = [
  'Analytics', 'Budget', 'Planning', 'Clinical', 'Trials', 'Supply Chain', 'Logistics',
  'Safety', 'Pharmacovigilance', 'Finance', 'HR', 'IT', 'R&D', 'Commercial', 'Research'
];

function ColumnSelector({ open, onClose, columns, selectedColumns, onColumnToggle, onSelectAll, onClearAll }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Columns to Display</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={onSelectAll} size="small">
              Select All
            </Button>
            <Button variant="outlined" onClick={onClearAll} size="small">
              Clear All
            </Button>
          </Stack>
        </Box>
        <FormGroup>
          <Grid container spacing={2}>
            {columns.map((column) => (
              <Grid item xs={12} sm={6} md={4} key={column.field}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedColumns.includes(column.field)}
                      onChange={() => onColumnToggle(column.field)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {column.headerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {column.field}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default function DataProductAuthoring() {
  const navigate = useNavigate();
  const { allProducts, setProducts, reloadProducts, loading, error } = useData();
  const [selectedColumns, setSelectedColumns] = useState(() => 
    ALL_COLUMNS.slice(0, 8).map(col => col.field) // Start with first 8 columns
  );
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Ensure selectedColumns is always valid
  useEffect(() => {
    if (!selectedColumns || selectedColumns.length === 0) {
      setSelectedColumns(['id', 'name', 'description', 'type', 'domain']);
    }
  }, [selectedColumns]);

  const handleColumnToggle = (field) => {
    setSelectedColumns(prev => {
      const newSelection = prev.includes(field) 
        ? prev.filter(col => col !== field)
        : [...prev, field];
      
      // Ensure we always have at least one column selected to prevent blank screen
      if (newSelection.length === 0) {
        return ['id', 'name']; // Always keep at least ID and name visible
      }
      
      return newSelection;
    });
  };

  const handleSelectAllColumns = () => {
    setSelectedColumns(ALL_COLUMNS.map(col => col.field));
  };

  const handleClearAllColumns = () => {
    // Don't allow clearing all columns - keep at least ID and name
    setSelectedColumns(['id', 'name']);
  };

  const handleSave = async (updatedProduct) => {
    try {
      console.log('handleSave called with:', updatedProduct);
      console.log('Current allProducts before update:', allProducts);
      
      // Handle tags conversion for editing
      if (updatedProduct.tags && typeof updatedProduct.tags === 'string') {
        updatedProduct.tags = updatedProduct.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      
      // Update local state immediately for better UX
      const updated = allProducts.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      );
      
      console.log('Updated products array:', updated);
      setProducts(updated);
      
      // Show success message immediately
      showSnackbar('Saving changes...', 'info');
      
      // Make API call
      const response = await fetch(`${API_URL}/api/data-products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('API response:', responseData);
      
      // Don't reload products - keep local state for better UX
      // await reloadProducts();
      showSnackbar('Product updated successfully');
      
      console.log('Products updated, current state:', updated);
    } catch (error) {
      console.error('Error updating product:', error);
      showSnackbar('Failed to update product', 'error');
      // Revert local state on error
      await reloadProducts();
    }
  };


  const handleDelete = async (product) => {
    try {
      const updated = allProducts.filter(p => p.id !== product.id);
      setProducts(updated);
      
      await fetch(`${API_URL}/api/data-products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      
      await reloadProducts();
      setDeletingProduct(null);
      showSnackbar('Product deleted successfully');
    } catch {
      showSnackbar('Failed to delete product', 'error');
    }
  };

  const handleView = (product) => {
    window.location.href = `/${product.id}`;
  };

  // Create columns for DataGrid based on selected columns
  const columns = useMemo(() => {
    try {
      // Ensure we have valid columns
      if (!selectedColumns || selectedColumns.length === 0) {
        console.warn('No columns selected, using default columns');
        setSelectedColumns(['id', 'name', 'description', 'type', 'domain']);
        return [];
      }

      const baseColumns = [
        {
          field: 'actions',
          headerName: 'Actions',
          width: 150,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <Stack direction="row" spacing={1}>
              <Tooltip title="View Details">
                <IconButton size="small" onClick={() => handleView(params.row)}>
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => setDeletingProduct(params.row)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )
        }
      ];

      const selectedCols = ALL_COLUMNS.filter(col => selectedColumns.includes(col.field))
        .map(col => ({
          ...col,
          editable: col.editable !== false,
          type: col.type === 'singleSelect' ? 'singleSelect' : 
                col.type === 'date' ? 'date' : 'string',
          valueOptions: col.valueOptions || undefined
        }));
      
      // Ensure we have at least some data columns
      if (selectedCols.length === 0) {
        console.warn('No valid columns found, using default columns');
        return [
          {
            field: 'id',
            headerName: 'ID',
            width: 120,
            editable: false
          },
          {
            field: 'name',
            headerName: 'Product Name',
            width: 250,
            editable: true
          },
          ...baseColumns
        ];
      }
      
      return [...selectedCols, ...baseColumns];
    } catch (error) {
      console.error('Error creating columns:', error);
      // Return fallback columns if there's an error
      return [
        {
          field: 'id',
          headerName: 'ID',
          width: 120,
          editable: false
        },
        {
          field: 'name',
          headerName: 'Product Name',
          width: 250,
          editable: true
        },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 150,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <Stack direction="row" spacing={1}>
              <Tooltip title="View Details">
                <IconButton size="small" onClick={() => handleView(params.row)}>
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => setDeletingProduct(params.row)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )
        }
      ];
    }
  }, [selectedColumns]);

  // Prepare data for DataGrid
  const rows = useMemo(() => {
    return allProducts.map(product => ({
      ...product,
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '',
      last_updated_date: product.last_updated_date || '',
      first_publish_date: product.first_publish_date || '',
      next_reassessment_date: product.next_reassessment_date || ''
    }));
  }, [allProducts]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <Typography variant="h6">Loading products...</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <Alert severity="error">Error loading products: {error}</Alert>
    </Box>
  );

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Data Product Authoring
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setShowColumnSelector(true)}
          >
            Column Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              console.log('🚀 Add New Product button clicked!');
              console.log('🧭 Current location:', window.location.href);
              console.log('📍 Navigating to /authoring/add');
              navigate('/authoring/add');
              console.log('✅ Navigate function called');
            }}
          >
            Add New Product
          </Button>
        </Stack>
      </Box>

      {/* DataGrid */}
      <Paper elevation={1} sx={{ height: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          processRowUpdate={(newRow, oldRow) => {
            console.log('Process row update:', { newRow, oldRow });
            
            // Get the original product data
            const originalProduct = allProducts.find(p => p.id === newRow.id);
            if (!originalProduct) {
              console.error('Original product not found for ID:', newRow.id);
              return oldRow;
            }
            
            // Create updated product with proper data types
            const updatedProduct = { ...originalProduct };
            
            // Update only the changed fields
            Object.keys(newRow).forEach(field => {
              if (newRow[field] !== oldRow[field]) {
                if (field === 'tags') {
                  // Convert comma-separated string back to array
                  if (typeof newRow[field] === 'string') {
                    updatedProduct.tags = newRow[field].split(',').map(t => t.trim()).filter(Boolean);
                  } else {
                    updatedProduct.tags = newRow[field];
                  }
                } else {
                  updatedProduct[field] = newRow[field];
                }
              }
            });
            
            // Update the last_updated_date to current time
            updatedProduct.last_updated_date = new Date().toISOString().split('T')[0];
            
            console.log('Updated product from processRowUpdate:', updatedProduct);
            
            // Save the updated product
            handleSave(updatedProduct);
            
            return newRow;
          }}
          onRowUpdateError={(error) => {
            console.error('Row update error:', error);
            showSnackbar('Error updating row: ' + error.message, 'error');
          }}
          slots={{
            toolbar: GridToolbar
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
              showColumnSelector: false,
              showDensitySelector: true,
              showColumnMenu: false
            }
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #e0e0e0'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: '2px solid #e0e0e0'
            }
          }}
        />
      </Paper>

      {/* Column Selector Dialog */}
      {showColumnSelector && (
        <ColumnSelector
          open={showColumnSelector}
          onClose={() => setShowColumnSelector(false)}
          columns={ALL_COLUMNS}
          selectedColumns={selectedColumns}
          onColumnToggle={handleColumnToggle}
          onSelectAll={handleSelectAllColumns}
          onClearAll={handleClearAllColumns}
        />
      )}


      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingProduct} onClose={() => setDeletingProduct(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingProduct(null)}>Cancel</Button>
          <Button 
            onClick={() => handleDelete(deletingProduct)} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
