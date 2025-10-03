// Generic color theme for Data Marketplace
// Customize these colors to match your organization's branding

export const colors = {
  // Primary brand color (customize this to your brand)
  primary: {
    main: '#1976d2',      // Material UI default blue
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#fff'
  },
  
  // Secondary accent color
  secondary: {
    main: '#00a651',      // Green for success states
    light: '#4caf50',
    dark: '#388e3c',
    contrastText: '#fff'
  },
  
  // Status colors
  success: '#00a651',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  
  // Neutral colors
  text: {
    primary: '#333',
    secondary: '#666',
    disabled: '#999'
  },
  
  // Background colors
  background: {
    default: '#f5f5f5',
    paper: '#ffffff'
  },
  
  // Component-specific colors
  components: {
    searchBar: {
      focus: '#1976d2',
      hover: 'rgba(25, 118, 210, 0.08)'
    },
    filters: {
      active: '#1976d2',
      hover: 'rgba(25, 118, 210, 0.08)'
    },
    buttons: {
      primary: '#1976d2',
      hover: '#1565c0'
    }
  }
};

export default colors;
