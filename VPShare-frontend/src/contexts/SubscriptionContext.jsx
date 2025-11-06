import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { checkSubscriptionStatus } from '../utils/subscriptionUtils';
import { isAdmin, getAdminSubscription } from '../utils/adminUtils';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscriptionData, setSubscriptionData] = useState({
    hasSubscription: false,
    plan: null,
    expiresAt: null,
    loading: true
  });

  const [user, setUser] = useState(null);

  // Check subscription status
  const checkSubscription = async () => {
    try {
      setSubscriptionData(prev => ({ ...prev, loading: true }));
      const status = await checkSubscriptionStatus();
      setSubscriptionData({
        ...status,
        loading: false
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionData({
        hasSubscription: false,
        plan: null,
        expiresAt: null,
        loading: false
      });
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const auth = getAuth();
    let unsubscribeDoc = null; // Store the document listener unsubscribe function
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Clean up previous document listener if it exists
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }
      
      if (currentUser) {
        // Check if user is admin and grant full access
        if (isAdmin(currentUser)) {
          setSubscriptionData(getAdminSubscription());
          return; // Skip normal subscription check for admins
        }
        
        await checkSubscription();
        
        // Set up real-time listener for subscription changes
        const db = getFirestore();
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        unsubscribeDoc = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            const subscription = userData.subscription;
            
            if (subscription) {
              const now = new Date();
              const expiresAt = subscription.expiresAt?.toDate();
              
              if (expiresAt && expiresAt > now) {
                setSubscriptionData({
                  hasSubscription: true,
                  plan: subscription.plan,
                  expiresAt: expiresAt,
                  status: subscription.status,
                  loading: false
                });
              } else {
                setSubscriptionData({
                  hasSubscription: false,
                  plan: null,
                  expiresAt: null,
                  status: 'expired',
                  loading: false
                });
              }
            } else {
              setSubscriptionData({
                hasSubscription: false,
                plan: null,
                expiresAt: null,
                status: 'none',
                loading: false
              });
            }
          }
        }, (error) => {
          // Only log error if user is still authenticated
          if (currentUser && auth.currentUser) {
            console.error('Error listening to subscription changes:', error);
          }
          // Set default state on error
          setSubscriptionData({
            hasSubscription: false,
            plan: null,
            expiresAt: null,
            status: 'error',
            loading: false
          });
        });
      } else {
        // User is logged out, set default state
        setSubscriptionData({
          hasSubscription: false,
          plan: null,
          expiresAt: null,
          status: 'logged_out',
          loading: false
        });
      }
    });

    // Cleanup function
    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  // Refresh subscription data
  const refreshSubscription = async () => {
    if (user) {
      await checkSubscription();
    }
  };

  const value = {
    ...subscriptionData,
    user,
    refreshSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
