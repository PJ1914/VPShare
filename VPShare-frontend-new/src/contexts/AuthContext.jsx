import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    linkWithPopup,
    unlink,
    fetchSignInMethodsForEmail,
    reauthenticateWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // 1. Check Admin Status (Custom Claims)
                    const tokenResult = await currentUser.getIdTokenResult();
                    currentUser.isAdmin = tokenResult.claims.role === 'admin' || tokenResult.claims.admin === true;

                    // 2. Fetch User Profile & Subscription from Firestore
                    const { doc, getDoc } = await import('firebase/firestore');
                    const { db } = await import('../config/firebase');
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        currentUser.username = userData.username || userData.userName;
                        currentUser.displayName = currentUser.displayName || userData.displayName;
                        
                        // Check Premium Status
                        const sub = userData.subscription;
                        if (sub && sub.status === 'active' && sub.expiresAt) {
                            // Handle Firestore Timestamp or Date string
                            const expiry = sub.expiresAt.toDate ? sub.expiresAt.toDate() : new Date(sub.expiresAt);
                            currentUser.isPremium = expiry > new Date();
                            currentUser.plan = sub.plan;
                        } else {
                            currentUser.isPremium = false;
                        }
                    } else {
                        currentUser.isPremium = false;
                    }
                } catch (error) {
                    console.error("Error fetching user profile in AuthContext:", error);
                    currentUser.isAdmin = false;
                    currentUser.isPremium = false;
                }
            }
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signup = async (email, password, name, username) => {
        // Validation: Check username uniqueness
        if (username) {
            try {
                const { collection, query, where, getDocs } = await import('firebase/firestore');
                const { db } = await import('../config/firebase');

                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('username', '==', username.toLowerCase()));
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    throw new Error("Username is already taken. Please choose another.");
                }
            } catch (error) {
                if (error.code === 'permission-denied') {
                    console.warn("Skipping username uniqueness check due to permission settings.");
                    // Proceed without throwing error
                } else {
                    throw error;
                }
            }
        }

        // Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update Profile
        await updateProfile(userCredential.user, {
            displayName: name
        });

        // Store username in Firestore
        if (username) {
            try {
                const { doc, setDoc } = await import('firebase/firestore');
                const { db } = await import('../config/firebase');

                await setDoc(doc(db, "users", userCredential.user.uid), {
                    username: username.toLowerCase(),
                    userName: username.toLowerCase(),
                    email: email,
                    displayName: name,
                    createdAt: new Date().toISOString()
                }, { merge: true });
            } catch (error) {
                console.error("Error saving username:", error);
            }
        }
        return userCredential;
    };

    const login = async (identifier, password) => {
        // Check if identifier is an email
        if (identifier.includes('@')) {
            return signInWithEmailAndPassword(auth, identifier, password);
        }

        // Handle username login
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const { db } = await import('../config/firebase');

            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '==', identifier.toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("Username not found");
            }

            const userDoc = querySnapshot.docs[0].data();
            if (!userDoc.email) {
                throw new Error("No email associated with this username");
            }

            return signInWithEmailAndPassword(auth, userDoc.email, password);
        } catch (error) {
            // Pass through the specific error or default
            throw error;
        }
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const loginWithGithub = async () => {
        const provider = new GithubAuthProvider();
        provider.addScope('repo'); // Required for Projects feature
        provider.addScope('read:user');

        try {
            const result = await signInWithPopup(auth, provider);
            // Capture the GitHub Access Token in case it's not set in custom claims
            const credential = GithubAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
                localStorage.setItem('github_access_token', credential.accessToken);
            }
            return result;
        } catch (error) {
            if (error.code === 'auth/account-exists-with-different-credential') {
                throw new Error("An account with this email already exists. Please sign in with your existing method (Google/Email) and link GitHub in settings.");
            }
            throw error;
        }
    };

    const linkGithub = async () => {
        if (!auth.currentUser) throw new Error("No user logged in");
        const provider = new GithubAuthProvider();
        provider.addScope('repo');
        provider.addScope('read:user');

        try {
            const result = await linkWithPopup(auth.currentUser, provider);
            // Capture the GitHub Access Token
            const credential = GithubAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
                localStorage.setItem('github_access_token', credential.accessToken);
            }
            return result;
        } catch (error) {
            console.error("Link GitHub Error:", error);
            throw error;
        }
    };

    const unlinkGithub = async () => {
        if (!auth.currentUser) throw new Error("No user logged in");

        // Find github provider
        const provider = auth.currentUser.providerData.find(
            p => p.providerId === 'github.com'
        );

        if (provider) {
            return unlink(auth.currentUser, provider.providerId);
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        user,
        loading,
        signup,
        login, // Updated to handle both email and username
        loginWithGoogle,
        loginWithGithub,
        linkGithub,
        unlinkGithub,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
