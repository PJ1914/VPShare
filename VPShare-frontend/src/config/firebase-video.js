// src/config/firebase-video.js
// Separate Firebase instance for Video Generation
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const videoFirebaseConfig = {
  apiKey: "AIzaSyDELZvaIMpjmza7-pR1-Gnyjyq6MKZSOu8",
  authDomain: "videodemo-52cdd.firebaseapp.com",
  projectId: "videodemo-52cdd",
  storageBucket: "videodemo-52cdd.firebasestorage.app",
  messagingSenderId: "589521187290",
  appId: "1:589521187290:web:f0f5a29e84ca01daad90e3",
  measurementId: "G-VX7DFELMK7"
};

// Initialize separate Firebase app for video generation
const videoApp = initializeApp(videoFirebaseConfig, 'videoApp');
export const videoDb = getFirestore(videoApp);
