import { useState, useCallback } from 'react';
import cacheService from '../utils/cacheService';

/**
 * Custom hook for Firebase-based caching
 * Provides easy access to cache operations with loading states
 */
export const useCache = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get cached data
  const getCache = useCallback(async (key, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cacheService.getCache(key, options);
      return result;
    } catch (err) {
      setError(err);
      console.warn(`Cache get error for ${key}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Set cached data
  const setCache = useCallback(async (key, data, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cacheService.setCache(key, data, options);
      return result;
    } catch (err) {
      setError(err);
      console.warn(`Cache set error for ${key}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear specific cache
  const clearCache = useCallback(async (key) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cacheService.clearCache(key);
      return result;
    } catch (err) {
      setError(err);
      console.warn(`Cache clear error for ${key}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear all user cache
  const clearUserCache = useCallback(async (userId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cacheService.clearUserCache(userId);
      return result;
    } catch (err) {
      setError(err);
      console.warn('Clear user cache error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if cache is valid
  const isCacheValid = useCallback(async (key, maxAge) => {
    try {
      const result = await cacheService.isCacheValid(key, maxAge);
      return result;
    } catch (err) {
      setError(err);
      console.warn(`Cache validity check error for ${key}:`, err);
      return false;
    }
  }, []);

  // Get cache info
  const getCacheInfo = useCallback(async (key) => {
    try {
      const result = await cacheService.getCacheInfo(key);
      return result;
    } catch (err) {
      setError(err);
      console.warn(`Cache info error for ${key}:`, err);
      return { exists: false, error: err.message };
    }
  }, []);

  return {
    getCache,
    setCache,
    clearCache,
    clearUserCache,
    isCacheValid,
    getCacheInfo,
    loading,
    error
  };
};

export default useCache;
