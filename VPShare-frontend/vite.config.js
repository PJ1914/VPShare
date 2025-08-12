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
    host: true,
    mimeTypes: {
      'application/xml': ['xml']
    },
    // Ensure service worker is served with correct headers in dev
    headers: {
      'Service-Worker-Allowed': '/'
    }
  },

  // Make sure sitemap is included in build
  publicDir: 'public',
  
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor libraries optimization (improves caching)
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor';
            }
            // Firebase libraries  
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // UI libraries
            if (id.includes('@mui') || id.includes('@emotion') || id.includes('framer-motion')) {
              return 'ui-libs';
            }
            // Everything else from node_modules
            return 'vendor';
          }
        },
        // Enhanced chunk naming for better performance
        entryFileNames: `assets/index-${buildId}-[hash].js`,
        chunkFileNames: `assets/[name]-${buildId}-[hash].js`,
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Performance optimizations without affecting styling
    copyPublicDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
    target: 'es2015'
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
