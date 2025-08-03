import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import cacheService from '../utils/cacheService';

const CacheContext = createContext();

export const useGlobalCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useGlobalCache must be used within a CacheProvider');
  }
  return context;
};

export const CacheProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cacheStats, setCacheStats] = useState({
    totalCaches: 0,
    lastClearTime: null,
    cacheHits: 0,
    cacheMisses: 0
  });

  // Monitor auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser !== user) {
        if (user && currentUser && user.uid !== currentUser.uid) {
          // User changed, clear previous user's cache stats
          console.log('User changed in cache context, resetting stats');
          setCacheStats({
            totalCaches: 0,
            lastClearTime: null,
            cacheHits: 0,
            cacheMisses: 0
          });
        }
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Enhanced cache methods with stats tracking
  const getCache = useCallback(async (key, options = {}) => {
    try {
      const result = await cacheService.getCache(key, options);
      
      if (result) {
        setCacheStats(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
        console.log(`Cache hit for ${key} from ${result.source}`);
      } else {
        setCacheStats(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
        console.log(`Cache miss for ${key}`);
      }
      
      return result;
    } catch (error) {
      setCacheStats(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
      console.warn(`Cache error for ${key}:`, error);
      return null;
    }
  }, []);

  const setCache = useCallback(async (key, data, options = {}) => {
    try {
      const result = await cacheService.setCache(key, data, options);
      
      if (result) {
        setCacheStats(prev => ({ ...prev, totalCaches: prev.totalCaches + 1 }));
        console.log(`Cache set for ${key}`);
      }
      
      return result;
    } catch (error) {
      console.warn(`Cache set error for ${key}:`, error);
      return false;
    }
  }, []);

  const clearCache = useCallback(async (key) => {
    try {
      const result = await cacheService.clearCache(key);
      
      if (result) {
        setCacheStats(prev => ({ 
          ...prev, 
          lastClearTime: new Date(),
          totalCaches: Math.max(0, prev.totalCaches - 1)
        }));
        console.log(`Cache cleared for ${key}`);
      }
      
      return result;
    } catch (error) {
      console.warn(`Cache clear error for ${key}:`, error);
      return false;
    }
  }, []);

  const clearUserCache = useCallback(async (userId = null) => {
    try {
      const result = await cacheService.clearUserCache(userId);
      
      if (result) {
        setCacheStats({
          totalCaches: 0,
          lastClearTime: new Date(),
          cacheHits: 0,
          cacheMisses: 0
        });
        console.log('All user cache cleared');
      }
      
      return result;
    } catch (error) {
      console.warn('Clear user cache error:', error);
      return false;
    }
  }, []);

  const isCacheValid = useCallback(async (key, maxAge) => {
    try {
      return await cacheService.isCacheValid(key, maxAge);
    } catch (error) {
      console.warn(`Cache validity check error for ${key}:`, error);
      return false;
    }
  }, []);

  const getCacheInfo = useCallback(async (key) => {
    try {
      return await cacheService.getCacheInfo(key);
    } catch (error) {
      console.warn(`Cache info error for ${key}:`, error);
      return { exists: false, error: error.message };
    }
  }, []);

  // Preload critical caches on app startup
  const preloadCriticalCaches = useCallback(async () => {
    if (!user?.uid) return;

    console.log('Preloading critical caches...');
    
    const criticalCaches = [
      'dashboard_courses',
      'dashboard_progress',
      'dashboard_stats'
    ];

    const preloadPromises = criticalCaches.map(async (key) => {
      try {
        const cached = await getCache(key, { maxAge: 30 * 60 * 1000 }); // 30 minutes
        return { key, exists: !!cached };
      } catch (error) {
        console.warn(`Preload error for ${key}:`, error);
        return { key, exists: false, error };
      }
    });

    const results = await Promise.all(preloadPromises);
    const existingCaches = results.filter(r => r.exists).length;
    
    console.log(`Preloaded ${existingCaches}/${criticalCaches.length} critical caches`);
  }, [user, getCache]);

  // Preload on user change
  useEffect(() => {
    if (user?.uid) {
      preloadCriticalCaches();
    }
  }, [user, preloadCriticalCaches]);

  const value = {
    // Cache operations
    getCache,
    setCache,
    clearCache,
    clearUserCache,
    isCacheValid,
    getCacheInfo,
    
    // Cache management
    preloadCriticalCaches,
    
    // Cache stats
    cacheStats,
    
    // User info
    user
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};

export default CacheProvider;
