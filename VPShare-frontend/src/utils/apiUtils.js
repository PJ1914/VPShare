// API Utilities for error handling and retry logic
import axios from 'axios';

// Create axios instance with default configuration
export const createApiClient = (baseURL, options = {}) => {
  const client = axios.create({
    baseURL,
    timeout: 15000, // 15 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  });

  // Request interceptor for adding auth headers
  client.interceptors.request.use(
    (config) => {
      // Add request ID for tracking
      config.metadata = { requestId: Date.now() + Math.random() };
      
      if (import.meta.env.DEV) {
        console.log(`API Request [${config.metadata.requestId}]:`, {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: config.headers
        });
      }
      
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => {
      if (import.meta.env.DEV) {
        console.log(`API Response [${response.config.metadata?.requestId}]:`, {
          status: response.status,
          data: response.data
        });
      }
      return response;
    },
    (error) => {
      const requestId = error.config?.metadata?.requestId;
      
      if (import.meta.env.DEV) {
        console.error(`API Error [${requestId}]:`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
      }

      // Handle specific error cases
      if (error.response?.status === 403) {
        console.warn('Access forbidden - checking authentication');
      } else if (error.response?.status === 500) {
        console.error('Server error - service may be down');
      } else if (error.code === 'ECONNABORTED') {
        console.error('Request timeout - server may be overloaded');
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Retry utility for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication errors or client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.warn(`Request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
    }
  }
  
  throw lastError;
};

// Generate fallback SVG images
export const generateFallbackImage = (width = 150, height = 150, text = 'No Image') => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f1f5f9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg-gradient)"/>
      <text x="${width/2}" y="${height/2}" text-anchor="middle" fill="#64748b" font-size="14" dy="0.3em">${text}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Generate profile avatar placeholder
export const generateProfileAvatar = (name = 'User', size = 150) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = [
    ['#1e40af', '#3b82f6'],
    ['#10b981', '#34d399'],
    ['#f59e0b', '#fbbf24'],
    ['#ef4444', '#f87171'],
    ['#8b5cf6', '#a78bfa'],
    ['#06b6d4', '#67e8f9']
  ];
  const colorPair = colors[name.length % colors.length];
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="avatar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colorPair[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colorPair[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#avatar-gradient)"/>
      <text x="${size/2}" y="${size/2}" text-anchor="middle" fill="white" font-size="${size/4}" font-weight="600" dy="0.3em">${initials}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Check if URL is accessible
export const checkImageUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

// Handle API errors with user-friendly messages
export const getErrorMessage = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication failed. Please log in again.';
      case 403:
        return 'Access denied. You may not have permission for this action.';
      case 404:
        return 'Resource not found. The requested item may have been moved or deleted.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later or contact support.';
      case 502:
        return 'Service temporarily unavailable. Please try again in a few minutes.';
      case 503:
        return 'Service maintenance in progress. Please try again later.';
      default:
        return error.response.data?.message || `Server error (${error.response.status}). Please try again.`;
    }
  } else if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please check your internet connection and try again.';
  } else if (error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your internet connection.';
  } else {
    return error.message || 'An unexpected error occurred. Please try again.';
  }
};

// API endpoints configuration
export const API_ENDPOINTS = {
  courses: import.meta.env.VITE_COURSES_API_URL,
  payment: import.meta.env.VITE_PAYMENT_API_URL,
  chat: import.meta.env.VITE_CHAT_API_URL
};

export default {
  createApiClient,
  retryRequest,
  generateFallbackImage,
  generateProfileAvatar,
  checkImageUrl,
  getErrorMessage,
  API_ENDPOINTS
};
