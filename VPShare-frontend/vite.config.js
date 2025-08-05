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
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor';
          }
          // UI components - keep Material-UI together to avoid circular deps
          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'mui';
          }
          // Firebase
          if (id.includes('firebase')) {
            return 'firebase';
          }
          // Large utility libraries
          if (id.includes('framer-motion')) {
            return 'motion';
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
    chunkSizeWarningLimit: 1500
  }
})
