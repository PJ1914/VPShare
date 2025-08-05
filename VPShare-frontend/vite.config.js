import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Sitemap will be generated at build time
  ],
  
  // Ensure XML files are served with correct MIME type
  server: {
    port: 5173,
    mimeTypes: {
      'application/xml': ['xml']
    }
  },
  
  // Make sure sitemap is included in build
  publicDir: 'public',
  
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React libraries
          if (id.includes('react')) {
            return 'vendor';
          }
          // Router
          if (id.includes('react-router')) {
            return 'router';
          }
          // UI components
          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'ui';
          }
          // Animation
          if (id.includes('framer-motion')) {
            return 'motion';
          }
          // Firebase
          if (id.includes('firebase') || id.includes('react-firebase-hooks')) {
            return 'firebase';
          }
          // Charts and data
          if (id.includes('@mui/x-data-grid')) {
            return 'charts';
          }
          // Utilities
          if (id.includes('axios') || id.includes('date-fns') || id.includes('lodash')) {
            return 'utils';
          }
        }
      }
    },
    // Ensure public assets are copied
    copyPublicDir: true,
    // Ensure proper asset handling
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    // Output to dist directory (matches vercel.json)
    outDir: 'dist',
    // Increase chunk size warning limit for large apps
    chunkSizeWarningLimit: 1000
  }
})
