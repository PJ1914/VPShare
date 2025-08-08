import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Generate a completely unique build ID for NUCLEAR cache busting
const deploymentId = process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 8) || Math.random().toString(36).substr(2, 8)
const buildId = `NUCLEAR-${Date.now()}-${deploymentId}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to inject build timestamp into service worker
    {
      name: 'sw-cache-busting',
      generateBundle(options, bundle) {
        // Update service worker with new cache version
        if (bundle['sw.js']) {
          const swContent = bundle['sw.js'].source;
          bundle['sw.js'].source = swContent.replace(
            /const CACHE_VERSION = 'v' \+ Date\.now\(\);/,
            `const CACHE_VERSION = 'v${Date.now()}';`
          );
        }
      }
    }
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
    // Ensure public assets are copied (including sw.js)
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
  },

  // Development server configuration
  server: {
    port: 5173,
    host: true,
    mimeTypes: {
      'application/xml': ['xml']
    },
    // Ensure service worker is served with correct headers in dev
    headers: {
      'Service-Worker-Allowed': '/'
    }
  },

  // Preview server configuration (for production build testing)
  preview: {
    port: 4173,
    host: true,
    headers: {
      'Service-Worker-Allowed': '/'
    }
  }
})
