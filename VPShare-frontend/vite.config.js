import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Generate a more unique timestamp for cache busting
const buildId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

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
    },
    // Additional server configuration for proper MIME types
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8'
    }
  },
  
  // Make sure sitemap is included in build
  publicDir: 'public',
  
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Node modules should be chunked together to avoid circular deps
          if (id.includes('node_modules')) {
            // Keep React ecosystem together
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor';
            }
            // Keep all UI libraries together to prevent circular dependencies
            if (id.includes('@mui') || id.includes('@emotion') || id.includes('framer-motion')) {
              return 'vendor';
            }
            // Firebase
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // Everything else from node_modules
            return 'vendor';
          }
        },
        // More aggressive cache busting with unique build ID
        entryFileNames: `assets/index-${buildId}-[hash].js`,
        chunkFileNames: `assets/[name]-${buildId}-[hash].js`,
        assetFileNames: 'assets/[name]-[hash].[ext]'
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
    chunkSizeWarningLimit: 2000,
    // Target modern browsers that support ES modules
    target: 'es2015'
  }
})
