// Production console suppressor
// This file should be imported early in the application to suppress console warnings in production

import { config } from './environment';

// Only suppress console methods in production
if (!config.isDevelopment) {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    info: console.info,
    debug: console.debug
  };

  // Override console methods to suppress non-error output in production
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};

  // Keep console.error for important error tracking
  // console.error remains unchanged for error reporting

  // Optionally provide a way to restore console for debugging
  window.__restoreConsole = () => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
  };
}

// Suppress CORS and network errors in development too
if (config.isDevelopment) {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    
    // Suppress CORS, network, and API-related errors in development
    if (
      typeof message === 'string' && (
        message.includes('CORS policy') ||
        message.includes('Access to XMLHttpRequest') ||
        message.includes('net::ERR_FAILED') ||
        message.includes('Network Error') ||
        message.includes('has been blocked by CORS policy') ||
        message.includes('403 (Forbidden)') ||
        message.includes('API Error') ||
        message.includes('Invalid key=value pair') ||
        message.includes('missing equal-sign')
      )
    ) {
      return; // Suppress these errors in development
    }
    
    // Also suppress object-based API errors
    if (typeof message === 'object' && message && (
      message.message?.includes('Invalid key=value pair') ||
      message.message?.includes('missing equal-sign') ||
      message.message?.includes('403') ||
      message.message?.includes('Forbidden')
    )) {
      return; // Suppress these object errors too
    }
    
    // Allow other errors through
    originalError.apply(console, args);
  };
}

// Remove React DevTools warnings in production
if (!config.isDevelopment) {
  // Suppress React DevTools warnings
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    
    // Suppress specific React warnings in production
    if (
      typeof message === 'string' && (
        message.includes('Warning:') ||
        message.includes('React DevTools') ||
        message.includes('Download the React DevTools') ||
        message.includes('useEffect') ||
        message.includes('Act warnings') ||
        message.includes('StrictMode') ||
        message.includes('Failed to load resource') ||
        message.includes('via.placeholder') ||
        message.includes('x-rtb-fingerprint-id') ||
        message.includes('Razorpay') ||
        message.includes('mixed content') ||
        message.includes('CORS policy') && !message.includes('credentials')
      )
    ) {
      return;
    }
    
    // Allow actual errors through
    originalError.apply(console, args);
  };
}

export default {};
