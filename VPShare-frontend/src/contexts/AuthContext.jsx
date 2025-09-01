import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [authTimeout, setAuthTimeout] = useState(null);
  const [returnPath, setReturnPath] = useState(null); // Track where user should return after login
  
  const { showNotification, showHackathonNotification, showLoginPrompt } = useNotification();

  // Fast auth state detection with timeout handling
  useEffect(() => {
    // Set a maximum wait time for auth state (prevent long loading)
    const timeoutId = setTimeout(() => {
      if (initialLoad) {
        setLoading(false);
        setInitialLoad(false);
        console.log('Auth timeout reached, proceeding without user');
      }
    }, 3000); // 3 second maximum wait

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(timeoutId);
      
      if (firebaseUser) {
        // User is signed in - fast user object creation
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          creationTime: firebaseUser.metadata.creationTime,
          lastSignInTime: firebaseUser.metadata.lastSignInTime,
          isNewUser: checkIfNewUser(firebaseUser)
        };
        
        setUser(userData);
        
        // Welcome notification for new users only
        if (userData.isNewUser && !localStorage.getItem(`welcomed_${userData.uid}`)) {
          showNotification({
            type: 'success',
            title: '🎉 Welcome to CodeTapasya!',
            message: `Hi ${userData.displayName}! Explore our courses and join the hackathon.`,
            duration: 6000,
            action: {
              label: 'Explore Courses',
              onClick: () => window.location.href = '/courses'
            }
          });
          localStorage.setItem(`welcomed_${userData.uid}`, 'true');
        }
      } else {
        // No user - show hackathon notification for non-logged users only
        setUser(null);
        
        // Show hackathon notification only on specific pages and for new sessions
        const currentPath = window.location.pathname;
        const sessionKey = `hackathon_shown_${Date.now()}`;
        const lastShown = localStorage.getItem('last_hackathon_notification');
        const now = Date.now();
        
        if (!lastShown || (now - parseInt(lastShown)) > 24 * 60 * 60 * 1000) { // 24 hours
          if (['/hackathon', '/courses', '/'].includes(currentPath)) {
            setTimeout(() => {
              showHackathonNotification();
              localStorage.setItem('last_hackathon_notification', now.toString());
            }, 2000); // Delay to avoid overwhelming
          }
        }
      }
      
      setLoading(false);
      setInitialLoad(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      clearTimeout(timeoutId);
      setLoading(false);
      setInitialLoad(false);
      setUser(null);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  // Check if user is new (signed up in last 5 minutes)
  const checkIfNewUser = (firebaseUser) => {
    if (!firebaseUser.metadata.creationTime || !firebaseUser.metadata.lastSignInTime) {
      return false;
    }
    
    const creationTime = new Date(firebaseUser.metadata.creationTime).getTime();
    const lastSignIn = new Date(firebaseUser.metadata.lastSignInTime).getTime();
    
    // If creation and last sign in are within 5 minutes, consider as new user
    return Math.abs(lastSignIn - creationTime) < 5 * 60 * 1000;
  };

  // Enhanced sign out with cleanup
  const signOut = async () => {
    try {
      // Clear any pending timeouts
      if (authTimeout) {
        clearTimeout(authTimeout);
        setAuthTimeout(null);
      }
      
      // Clear local storage items
      const userUid = user?.uid;
      if (userUid) {
        localStorage.removeItem(`welcomed_${userUid}`);
      }
      
      await firebaseSignOut(auth);
      setUser(null);
      setReturnPath(null);
      
      showNotification({
        type: 'info',
        title: 'Signed Out',
        message: 'You have been successfully signed out.',
        duration: 3000
      });
    } catch (error) {
      console.error('Sign out error:', error);
      showNotification({
        type: 'error',
        title: 'Sign Out Error',
        message: 'There was an issue signing out. Please try again.',
        duration: 4000
      });
    }
  };

  // Set return path for navigation after login
  const setLoginReturnPath = (path) => {
    setReturnPath(path);
    // Store in sessionStorage so it persists across page reloads during auth
    sessionStorage.setItem('loginReturnPath', path);
  };

  // Get and clear return path
  const getAndClearReturnPath = () => {
    const path = returnPath || sessionStorage.getItem('loginReturnPath') || '/dashboard';
    setReturnPath(null);
    sessionStorage.removeItem('loginReturnPath');
    return path;
  };

  // Dynamic login prompt based on context
  const showContextualLoginPrompt = (context = 'general') => {
    if (user) return; // Don't show if already logged in
    
    const prompts = {
      hackathon: {
        title: '🚀 Join the Hackathon!',
        message: 'Sign in to register for CodeKurukshetra Hackathon and compete for amazing prizes!',
        action: { label: 'Sign In to Register', onClick: () => window.location.href = '/login' }
      },
      courses: {
        title: '📚 Access Premium Courses',
        message: 'Sign in to unlock all courses and track your learning progress.',
        action: { label: 'Sign In Now', onClick: () => window.location.href = '/login' }
      },
      dashboard: {
        title: '🎯 Access Your Dashboard',
        message: 'Sign in to view your progress, assignments, and personalized content.',
        action: { label: 'Sign In', onClick: () => window.location.href = '/login' }
      },
      general: {
        title: 'Sign In Required',
        message: 'Please sign in to access this feature.',
        action: { label: 'Sign In', onClick: () => window.location.href = '/login' }
      }
    };
    
    const prompt = prompts[context] || prompts.general;
    showNotification({
      type: 'info',
      ...prompt,
      duration: 5000
    });
  };

  // Fast loading state for better UX
  const isQuickLoad = loading && !initialLoad;

  const value = {
    user,
    loading: isQuickLoad, // Use quick load for better UX
    initialLoad,
    signOut,
    setLoginReturnPath,
    getAndClearReturnPath,
    showContextualLoginPrompt,
    isAuthenticated: !!user,
    isNewUser: user?.isNewUser || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
