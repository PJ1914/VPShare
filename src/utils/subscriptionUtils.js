import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Check if user has an active subscription
 * @returns {Promise<{hasSubscription: boolean, plan: string|null, expiresAt: Date|null}>}
 */
export const checkSubscriptionStatus = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return { hasSubscription: false, plan: null, expiresAt: null };
    }

    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
        subscription: null
      });
      return { hasSubscription: false, plan: null, expiresAt: null };
    }

    const userData = userDoc.data();
    const subscription = userData.subscription;
    
    if (!subscription || !subscription.expiresAt) {
      return { hasSubscription: false, plan: null, expiresAt: null };
    }

    // Check if subscription is active
    const now = new Date();
    const expiresAt = subscription.expiresAt?.toDate ? subscription.expiresAt.toDate() : new Date(subscription.expiresAt);
    
    if (expiresAt && expiresAt > now && subscription.status === 'active') {
      return {
        hasSubscription: true,
        plan: subscription.plan,
        expiresAt: expiresAt,
        status: subscription.status
      };
    }

    // If subscription has expired, update status
    if (expiresAt && expiresAt <= now && subscription.status === 'active') {
      await updateDoc(userDocRef, {
        'subscription.status': 'expired'
      });
    }

    return { hasSubscription: false, plan: null, expiresAt: null, status: 'expired' };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { hasSubscription: false, plan: null, expiresAt: null };
  }
};

/**
 * Check if user can access a specific module
 * @param {number} moduleIndex - Index of the module (0-based)
 * @param {boolean} hasSubscription - Whether user has active subscription
 * @returns {boolean}
 */
export const canAccessModule = (moduleIndex, hasSubscription) => {
  // Free users can access first 2 modules (index 0 and 1)
  const FREE_MODULE_LIMIT = 2;
  
  if (hasSubscription) {
    return true; // Subscribers can access all modules
  }
  
  return moduleIndex < FREE_MODULE_LIMIT;
};

/**
 * Get the subscription upgrade message
 * @param {number} moduleIndex - Index of the restricted module
 * @returns {string}
 */
export const getSubscriptionMessage = (moduleIndex) => {
  return `This is module ${moduleIndex + 1}. Subscribe to unlock all course content and continue your learning journey!`;
};

/**
 * Check if user can access course content
 * @param {Object} course - Course object
 * @param {boolean} hasSubscription - Whether user has active subscription
 * @returns {Object} - Access information
 */
export const getCourseAccess = (course, hasSubscription) => {
  if (!course || !course.modules) {
    return { canAccess: false, freeModules: 0, totalModules: 0 };
  }

  const totalModules = course.modules.length;
  const FREE_MODULE_LIMIT = 2;
  const freeModules = Math.min(FREE_MODULE_LIMIT, totalModules);

  return {
    canAccess: hasSubscription,
    freeModules: freeModules,
    totalModules: totalModules,
    hasFullAccess: hasSubscription,
    restrictedModules: hasSubscription ? 0 : Math.max(0, totalModules - freeModules)
  };
};
