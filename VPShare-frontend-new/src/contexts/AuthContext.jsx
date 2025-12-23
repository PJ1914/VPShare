import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
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
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        user,
        loading,
        signup,
        login, // Updated to handle both email and username
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
