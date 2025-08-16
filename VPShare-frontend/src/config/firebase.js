// src/config/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
const auth = getAuth(app);
auth.useDeviceLanguage(); 
const storage = getStorage(app);
const db = getFirestore(app);

// Initialize analytics with error handling for browser compatibility
let analytics = null;
const initAnalytics = async () => {
  try {
    // Skip analytics for problematic browsers to prevent loading issues
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    const isSafari = navigator.userAgent.toLowerCase().includes('safari') && !navigator.userAgent.toLowerCase().includes('chrome');
    
    if (isFirefox || isSafari) {
      console.log('Skipping Firebase Analytics in Firefox/Safari for compatibility');
      return;
    }
    
    // Check if analytics is supported in the current browser
    const supported = await isSupported();
    if (supported && typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    } else {
      console.log('Firebase Analytics not supported in this browser');
    }
  } catch (error) {
    console.log('Analytics initialization failed:', error.message);
    // Silently fail for problematic browsers
  }
};

// Initialize analytics asynchronously
initAnalytics();

export { app, auth, storage, db, analytics };
