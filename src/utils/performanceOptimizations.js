// Performance optimizations that don't affect styling
// This file contains build-time optimizations only

// Tree-shaking helper - Import only what you need from large libraries
export const optimizeImports = {
  // Lodash optimization - import individual functions instead of full library
  lodash: {
    // Instead of: import _ from 'lodash'
    // Use: import { debounce, throttle } from 'lodash'
    recommended: ['debounce', 'throttle', 'cloneDeep', 'merge']
  },
  
  // Material-UI optimization
  mui: {
    // Instead of: import { Button } from '@mui/material'
    // Use: import Button from '@mui/material/Button'
    recommended: 'individual imports for smaller bundle'
  },
  
  // React Icons optimization
  reactIcons: {
    // Instead of: import { FaHome, FaUser } from 'react-icons/fa'
    // Use: import FaHome from 'react-icons/fa/FaHome'
    recommended: 'individual imports when possible'
  }
};

// Bundle analyzer configuration (for development only)
export const bundleAnalysis = {
  enabled: import.meta.env.VITE_NODE_ENV === 'development' || import.meta.env.DEV,
  reportPath: './bundle-analysis.html'
};

// Performance monitoring constants
export const performanceMetrics = {
  // Core Web Vitals targets
  LCP_TARGET: 2500, // Largest Contentful Paint (ms)
  FID_TARGET: 100,  // First Input Delay (ms)
  CLS_TARGET: 0.1,  // Cumulative Layout Shift
  
  // Bundle size targets
  MAIN_BUNDLE_TARGET: 500000,      // 500KB
  VENDOR_BUNDLE_TARGET: 1000000,   // 1MB
  TOTAL_BUNDLE_TARGET: 2000000     // 2MB
};

// Preload configuration for critical resources
export const preloadConfig = {
  fonts: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
  ],
  criticalImages: [
    '/assets/CT Logo.png',
    '/assets/Login-Img.png'
  ]
};

// Service Worker optimization settings
export const serviceWorkerConfig = {
  cacheFirst: [
    '/assets/images/',
    '/assets/fonts/',
    'https://fonts.googleapis.com/',
    'https://fonts.gstatic.com/'
  ],
  networkFirst: [
    '/api/',
    'https://vpshare-api.vercel.app/'
  ],
  staleWhileRevalidate: [
    '/assets/js/',
    '/assets/css/'
  ]
};

// Export optimization utilities
export default {
  optimizeImports,
  bundleAnalysis,
  performanceMetrics,
  preloadConfig,
  serviceWorkerConfig
};
