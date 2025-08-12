import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Generate a completely unique build ID for NUCLEAR cache busting
const deploymentId = process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 8) || Math.random().toString(36).substr(2, 8)
const buildId = `NUCLEAR-${Date.now()}-${deploymentId}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  // Keep plugins minimal while debugging chunking issues
  ],
  
  // Ensure React is properly resolved
  resolve: {
    alias: {
      'react': 'react',
      'react-dom': 'react-dom'
    }
  },

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
      external: [],
      output: {
        // Ensure proper order of chunk loading
        inlineDynamicImports: false,
        manualChunks(id) {
          // Vendor libraries optimization (improves caching)
          if (id.includes('node_modules')) {
            // React ecosystem - keep React core together
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // React router in separate chunk
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // Firebase libraries  
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // UI libraries - co-locate with React to avoid runtime import issues
            if (id.includes('@mui') || id.includes('@emotion') || id.includes('framer-motion')) {
              return 'react-vendor';
            }
            // Everything else from node_modules
            return 'vendor';
          }
          // Keep all context files with the main app chunk to ensure React is available
          if (id.includes('/contexts/') || id.includes('\\contexts\\')) {
            return undefined; // Let Vite handle this automatically
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
    target: 'es2020'
  },

  // Pre-bundle deps to ensure stable module graph
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion'
    ]
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
