import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'prop-types',
      'react-is',
      'clsx',
      'hoist-non-react-statics',
      'react-transition-group',
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-data-grid',
      'react-router-dom'
    ],
    force: true
  },
  resolve: {
    alias: {
      'prop-types': 'prop-types',
      'react-is': 'react-is',
      'clsx': 'clsx'
    }
  }
})
