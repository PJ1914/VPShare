import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { checkSubscriptionStatus } from '../utils/subscriptionUtils';

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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        await checkSubscription();
        
        // Set up real-time listener for subscription changes
        const db = getFirestore();
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnapshot) => {
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
          console.error('Error listening to subscription changes:', error);
        });
        
        // Return cleanup function for document listener
        return () => unsubscribeDoc();
      } else {
        setSubscriptionData({
          hasSubscription: false,
          plan: null,
          expiresAt: null,
          loading: false
        });
      }
    });

    return () => unsubscribe();
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
