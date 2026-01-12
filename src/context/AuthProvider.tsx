import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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

                        await setDoc(
                            userDocRef,
                            {
                                ...newUserData,
                                last_login: serverTimestamp(),
                                created_at: serverTimestamp()
                            },
                            { merge: true }
                        );
                    }
                } catch (err: unknown) {
                    const error = err as { code?: string; message?: string };
                    console.error("Firestore Error:", error);
                    setError(error.message || "An error occurred while fetching user data.");
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

    const loginWithGoogle = useCallback(async () => {
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: unknown) {
            const error = err as { message?: string };
            console.error("Google Sign-In Error:", error);
            setError(error.message || "Failed to sign in with Google.");
            throw err;
        }
    }, []);

    const logout = useCallback(async () => {
        setError(null);
        try {
            await signOut(auth);
        } catch (err: unknown) {
            const error = err as { message?: string };
            console.error("Logout Error:", error);
            setError(error.message || "Failed to sign out.");
            throw err;
        }
    }, []);

    const refreshUserData = useCallback(async () => {
        if (!user) return;
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setUserData(userDoc.data() as UserData);
            }
        } catch (err: unknown) {
            const error = err as { message?: string };
            console.error("Error refreshing user data:", error);
            setError(error.message || "Failed to refresh user data.");
            throw err;
        }
    }, [user]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value: AuthContextType = useMemo(() => ({
        user,
        userData,
        loading,
        error,
        loginWithGoogle,
        logout,
        refreshUserData,
        clearError
    }), [user, userData, loading, error, loginWithGoogle, logout, refreshUserData, clearError]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
