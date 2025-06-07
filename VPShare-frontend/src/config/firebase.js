// src/config/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA9Tl1vZWWNdXsowXHFdd8eZAv41GDGc-k",
  authDomain: "vpshare-495ec.firebaseapp.com",
  projectId: "vpshare-495ec",
  storageBucket: "vpshare-495ec.appspot.com", 
  messagingSenderId: "681336563143",
  appId: "1:681336563143:web:e52a232d9c3856f6ca65e2",
  measurementId: "G-EMVNJD9BM5"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app); 

export { app, auth, storage, analytics }; 
