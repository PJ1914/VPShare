// Environment configuration for production readiness
export const config = {
  // Determine if we're in development mode
  isDevelopment: import.meta.env.MODE === 'development',
  
  // API endpoints
  api: {
    base: import.meta.env.VITE_API_BASE_URL,
    courses: import.meta.env.VITE_COURSES_API_URL,
    hackathon: import.meta.env.VITE_HACKATHON_API_URL,
    hackathonAdmin: import.meta.env.VITE_HACKATHON_ADMIN_API_URL,
    hackathonUtils: import.meta.env.VITE_HACKATHON_UTILS_API_URL,
    hackathonPayment: import.meta.env.VITE_HACKATHON_PAYMENT_API_URL,
    aiChatLocal: import.meta.env.VITE_AI_CHAT_API_URL_LOCAL
  },
  
  // Firebase configuration
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  },
  
  // Logging configuration
  logging: {
    // Disable console logging for cleaner production-like experience
    enableConsole: false,
    // Enable error tracking in production
    enableErrorTracking: import.meta.env.MODE === 'production',
    // Log levels: 'error', 'warn', 'info', 'debug'
    level: 'error'
  },
  
  // Feature flags
  features: {
    // Enable development tools and notices
    showDevTools: import.meta.env.MODE === 'development',
    // Enable fallback data for APIs
    enableFallbacks: true,
    // Enable mock data in development
    enableMockData: import.meta.env.MODE === 'development'
  }
};

// Logger utility for production-safe logging
export const logger = {
  error: (message, ...args) => {
    // Filter out all API-related errors in development
    if (config.isDevelopment && 
        (typeof message === 'string' && (
          message.includes('CORS') || 
          message.includes('Network Error') || 
          message.includes('net::ERR_FAILED') ||
          message.includes('API Error') ||
          message.includes('403') ||
          message.includes('Forbidden') ||
          message.includes('Invalid key=value pair')
        ) || 
        typeof message === 'object' && message && (
          message.message?.includes('Invalid key=value pair') ||
          message.message?.includes('403') ||
          message.message?.includes('Forbidden')
        ))) {
      return; // Suppress these errors in development
    }
    
    if (config.logging.enableConsole || config.logging.enableErrorTracking) {
      console.error(message, ...args);
    }
  },
  
  warn: (message, ...args) => {
    // Filter out all API-related warnings in development
    if (config.isDevelopment && 
        (message.includes('API not available') || 
         message.includes('Problem statements API') ||
         message.includes('Error getting auth token') ||
         message.includes('Network Error') ||
         message.includes('CORS'))) {
      return; // Suppress these warnings in development
    }
    
    if (config.logging.enableConsole && ['warn', 'info', 'debug'].includes(config.logging.level)) {
      console.warn(message, ...args);
    }
  },
  
  info: (message, ...args) => {
    // Suppress API-related info messages in development
    if (config.isDevelopment && 
        (message.includes('Using predefined problem statements') ||
         message.includes('API not available'))) {
      return; // Suppress these info messages in development
    }
    
    if (config.logging.enableConsole && ['info', 'debug'].includes(config.logging.level)) {
      console.log(message, ...args);
    }
  },
  
  debug: (message, ...args) => {
    if (config.logging.enableConsole && config.logging.level === 'debug') {
      console.log(message, ...args);
    }
  }
};

// API status checker
export const checkAPIAvailability = async (endpoint) => {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export default config;
