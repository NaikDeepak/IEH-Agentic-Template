import React, { useEffect, useState, useRef } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    type User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AuthContext, type AuthContextType, type UserData } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const didInitRef = useRef(false);

    useEffect(() => {
        // Prevent duplicate Firestore writes in dev StrictMode
        if (didInitRef.current) return;
        didInitRef.current = true;

        let isMounted = true;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!isMounted) return;
            setUser(user);

            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (!isMounted) return;

                    if (userDoc.exists()) {
                        setUserData(userDoc.data() as UserData);
                        await updateDoc(userDocRef, {
                            last_login: serverTimestamp()
                        });
                    } else {
                        const newUserData: UserData = {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            role: null,
                        };
                        setUserData(newUserData);

                        await setDoc(userDocRef, {
                            ...newUserData,
                            last_login: serverTimestamp(),
                            created_at: serverTimestamp()
                        }, { merge: true });
                    }
                } catch (err: unknown) {
                    const error = err as { code?: string; message?: string };
                    console.error("Firestore Error:", error);
                    if (error.code === 'unavailable' || error.message?.includes('offline')) {
                        console.warn("Firestore database might not be initialized or API is disabled in this project.");
                    }
                }
            } else {
                setUserData(null);
            }

            if (isMounted) setLoading(false);
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
            throw error;
        }
    };

    const refreshUserData = async () => {
        if (!user) return;
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setUserData(userDoc.data() as UserData);
            }
        } catch (error) {
            console.error("Error refreshing user data:", error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        userData,
        loading,
        loginWithGoogle,
        logout,
        refreshUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
