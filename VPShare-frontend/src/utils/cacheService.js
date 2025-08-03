import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

class CacheService {
  constructor() {
    this.db = getFirestore();
    this.fallbackStorage = typeof window !== 'undefined' ? localStorage : null;
    this.CACHE_COLLECTION = 'userCache';
    this.DEFAULT_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
  }

  // Generate cache key with user context
  generateCacheKey(key, userId = null) {
    const auth = getAuth();
    const currentUserId = userId || auth.currentUser?.uid || 'anonymous';
    return `${currentUserId}_${key}`;
  }

  // Get cached data from Firebase Firestore
  async getCache(key, options = {}) {
    try {
      const { maxAge = this.DEFAULT_CACHE_DURATION, fallbackToLocal = true } = options;
      const cacheKey = this.generateCacheKey(key);
      
      // Try Firebase first
      const cacheDoc = doc(this.db, this.CACHE_COLLECTION, cacheKey);
      const cacheSnap = await getDoc(cacheDoc);
      
      if (cacheSnap.exists()) {
        const cacheData = cacheSnap.data();
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - cacheData.timestamp < maxAge) {
          console.log(`Cache hit for ${key} from Firebase`);
          return {
            data: cacheData.data,
            timestamp: cacheData.timestamp,
            source: 'firebase'
          };
        } else {
          // Cache expired, delete it
          await deleteDoc(cacheDoc);
          console.log(`Cache expired for ${key}, removed from Firebase`);
        }
      }
      
      // Fallback to localStorage if Firebase fails or no data
      if (fallbackToLocal && this.fallbackStorage) {
        return this.getLocalCache(key, { maxAge });
      }
      
      return null;
    } catch (error) {
      console.warn(`Error getting cache for ${key} from Firebase:`, error);
      
      // Fallback to localStorage
      if (this.fallbackStorage) {
        return this.getLocalCache(key, options);
      }
      
      return null;
    }
  }

  // Set cached data in Firebase Firestore
  async setCache(key, data, options = {}) {
    try {
      const { 
        maxAge = this.DEFAULT_CACHE_DURATION, 
        saveToLocal = true,
        metadata = {} 
      } = options;
      
      const cacheKey = this.generateCacheKey(key);
      const timestamp = Date.now();
      
      const cacheData = {
        data,
        timestamp,
        maxAge,
        key: cacheKey,
        userId: getAuth().currentUser?.uid || 'anonymous',
        metadata,
        version: '1.0.0'
      };
      
      // Save to Firebase
      const cacheDoc = doc(this.db, this.CACHE_COLLECTION, cacheKey);
      await setDoc(cacheDoc, cacheData);
      
      console.log(`Cache set for ${key} in Firebase`);
      
      // Also save to localStorage as backup
      if (saveToLocal && this.fallbackStorage) {
        this.setLocalCache(key, data, { maxAge, timestamp });
      }
      
      return true;
    } catch (error) {
      console.warn(`Error setting cache for ${key} in Firebase:`, error);
      
      // Fallback to localStorage
      if (this.fallbackStorage) {
        return this.setLocalCache(key, data, options);
      }
      
      return false;
    }
  }

  // Clear specific cache
  async clearCache(key) {
    try {
      const cacheKey = this.generateCacheKey(key);
      
      // Clear from Firebase
      const cacheDoc = doc(this.db, this.CACHE_COLLECTION, cacheKey);
      await deleteDoc(cacheDoc);
      
      // Clear from localStorage
      if (this.fallbackStorage) {
        this.fallbackStorage.removeItem(`cache_${cacheKey}`);
      }
      
      console.log(`Cache cleared for ${key}`);
      return true;
    } catch (error) {
      console.warn(`Error clearing cache for ${key}:`, error);
      return false;
    }
  }

  // Clear all user caches
  async clearUserCache(userId = null) {
    try {
      const auth = getAuth();
      const currentUserId = userId || auth.currentUser?.uid;
      
      if (!currentUserId) {
        console.warn('No user ID provided for cache clearing');
        return false;
      }
      
      // Query all caches for this user
      const cacheQuery = query(
        collection(this.db, this.CACHE_COLLECTION),
        where('userId', '==', currentUserId)
      );
      
      const querySnapshot = await getDocs(cacheQuery);
      const deletePromises = [];
      
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      
      // Clear localStorage for this user
      if (this.fallbackStorage) {
        const keys = Object.keys(this.fallbackStorage);
        keys.forEach(key => {
          if (key.startsWith(`cache_${currentUserId}_`)) {
            this.fallbackStorage.removeItem(key);
          }
        });
      }
      
      console.log(`All caches cleared for user ${currentUserId}`);
      return true;
    } catch (error) {
      console.warn('Error clearing user cache:', error);
      return false;
    }
  }

  // LocalStorage fallback methods
  getLocalCache(key, options = {}) {
    try {
      if (!this.fallbackStorage) return null;
      
      const { maxAge = this.DEFAULT_CACHE_DURATION } = options;
      const cacheKey = this.generateCacheKey(key);
      const cached = this.fallbackStorage.getItem(`cache_${cacheKey}`);
      
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      const now = Date.now();
      
      if (now - cacheData.timestamp < maxAge) {
        console.log(`Cache hit for ${key} from localStorage`);
        return {
          data: cacheData.data,
          timestamp: cacheData.timestamp,
          source: 'localStorage'
        };
      } else {
        // Cache expired
        this.fallbackStorage.removeItem(`cache_${cacheKey}`);
        console.log(`Cache expired for ${key}, removed from localStorage`);
        return null;
      }
    } catch (error) {
      console.warn(`Error getting local cache for ${key}:`, error);
      return null;
    }
  }

  setLocalCache(key, data, options = {}) {
    try {
      if (!this.fallbackStorage) return false;
      
      const { maxAge = this.DEFAULT_CACHE_DURATION, timestamp = Date.now() } = options;
      const cacheKey = this.generateCacheKey(key);
      
      const cacheData = {
        data,
        timestamp,
        maxAge,
        key: cacheKey
      };
      
      this.fallbackStorage.setItem(`cache_${cacheKey}`, JSON.stringify(cacheData));
      console.log(`Cache set for ${key} in localStorage`);
      return true;
    } catch (error) {
      console.warn(`Error setting local cache for ${key}:`, error);
      return false;
    }
  }

  // Check if cache exists and is valid
  async isCacheValid(key, maxAge = this.DEFAULT_CACHE_DURATION) {
    const cached = await this.getCache(key, { maxAge });
    return cached !== null;
  }

  // Get cache metadata
  async getCacheInfo(key) {
    try {
      const cacheKey = this.generateCacheKey(key);
      const cacheDoc = doc(this.db, this.CACHE_COLLECTION, cacheKey);
      const cacheSnap = await getDoc(cacheDoc);
      
      if (cacheSnap.exists()) {
        const data = cacheSnap.data();
        return {
          exists: true,
          timestamp: data.timestamp,
          age: Date.now() - data.timestamp,
          maxAge: data.maxAge,
          isExpired: (Date.now() - data.timestamp) > data.maxAge,
          source: 'firebase'
        };
      }
      
      return { exists: false };
    } catch (error) {
      console.warn(`Error getting cache info for ${key}:`, error);
      return { exists: false, error: error.message };
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;

// Export specific methods for easier importing
export const {
  getCache,
  setCache,
  clearCache,
  clearUserCache,
  isCacheValid,
  getCacheInfo
} = cacheService;
