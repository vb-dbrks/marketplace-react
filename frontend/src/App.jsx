import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme, Toolbar } from '@mui/material';
import SearchAndFilterContainer from './components/SearchAndFilterContainer';
import ProductGrid from './components/ProductGrid';
import Banner from './components/Banner';
import Breadcrumbs from './components/Breadcrumbs';
import ProductDetail from './components/ProductDetail';
import DataProductAuthoring from './components/DataProductAuthoring';
import AddNewProduct from './components/AddNewProduct';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <DataProvider>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            width: '100vw',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            <Banner />
            <Box sx={{ 
              flexGrow: 1,
              width: '100%',
              mt: '72px', // Updated height of the enhanced banner
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch'
            }}>
              <Breadcrumbs />
              <Routes>
                <Route path="/" element={
                  <>
                    <SearchAndFilterContainer />
                    <ProductGrid />
                  </>
                } />
                <Route path="/authoring" element={
                  <ProtectedRoute requireAdmin={true}>
                    <DataProductAuthoring />
                  </ProtectedRoute>
                } />
                <Route path="/authoring/add" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddNewProduct />
                  </ProtectedRoute>
                } />
                <Route path="/:id" element={<ProductDetail />} />
              </Routes>
            </Box>
          </Box>
          </DataProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
