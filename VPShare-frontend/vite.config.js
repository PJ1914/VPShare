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
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          motion: ['framer-motion']
        }
      }
    },
    // Ensure public assets are copied
    copyPublicDir: true,
    // Ensure proper asset handling
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser'
  }
})
