import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    type User as FirebaseUser
} from 'firebase/auth';
import {
    auth,
    googleProvider,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AuthContext, type AuthContextType, type UserData } from './AuthContext';
import { updateProfile } from 'firebase/auth';
import { ReferralService } from '../features/growth/services/referralService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (user) {
                try {
                    // Force refresh to get latest custom claims
                    const tokenResult = await user.getIdTokenResult();
                    const claimRole = tokenResult.claims['role'] as 'seeker' | 'employer' | 'admin' | null;

                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data() as UserData;
                        const effectiveRole = claimRole ?? data.role ?? null;

                        setUserData({ ...data, role: effectiveRole });
                        await updateDoc(userDocRef, {
                            last_login: serverTimestamp()
                        });
                        
                        // Ensure user has a referral code
                        if (!data.referralCode) {
                            await ReferralService.ensureReferralCode(user.uid);
                            // Refresh data to get the new code
                            const updatedSnap = await getDoc(userDocRef);
                            setUserData(updatedSnap.data() as UserData);
                        }
                    } else {
                        // Check for referral code in session storage (passed from loginWithGoogle)
                        const pendingReferralCode = sessionStorage.getItem('pendingReferralCode');
                        let referredBy = null;

                        if (pendingReferralCode) {
                            referredBy = await ReferralService.getUserByReferralCode(pendingReferralCode);
                            sessionStorage.removeItem('pendingReferralCode');
                        }

                        const newUserData: UserData = {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            role: claimRole ?? null,
                            browniePoints: 0, // Initialize with 0 points
                            referredBy: referredBy ?? undefined
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

                        // Generate referral code for new user
                        await ReferralService.ensureReferralCode(user.uid);
                        const updatedSnap = await getDoc(userDocRef);
                        setUserData(updatedSnap.data() as UserData);
                    }
                } catch (err: unknown) {
                    const error = err as { code?: string; message?: string };
                    console.error("Auth Transition Error:", error);
                    setError(error.message ?? "An error occurred during authentication.");
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const loginWithGoogle = useCallback(async (referralCode?: string) => {
        setError(null);
        try {
            if (referralCode) {
                sessionStorage.setItem('pendingReferralCode', referralCode);
            }
            await signInWithPopup(auth, googleProvider);
        } catch (err: unknown) {
            const error = err as { message?: string };
            console.error("Google Sign-In Error:", error);
            setError(error.message ?? "Failed to sign in with Google.");
            throw err;
        }
    }, []);

    const loginWithEmail = useCallback(async (email: string, password: string) => {
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: unknown) {
            const error = err as { message?: string };
            console.error("Email Login Error:", error);
            setError(error.message ?? "Failed to sign in with email.");
            throw err;
        }
    }, []);

    const signupWithEmail = useCallback(async (email: string, password: string, displayName: string, referralCode?: string) => {
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName });

            // If a referral code was provided, link it
            if (referralCode) {
                const referrerUid = await ReferralService.getUserByReferralCode(referralCode);
                if (referrerUid) {
                    await updateDoc(doc(db, 'users', userCredential.user.uid), {
                        referredBy: referrerUid
                    });
                }
            }
        } catch (err: unknown) {
            const error = err as { message?: string };
            console.error("Email Signup Error:", error);
            setError(error.message ?? "Failed to sign up with email.");
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
            setError(error.message ?? "Failed to sign out.");
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
            setError(error.message ?? "Failed to refresh user data.");
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
        loginWithEmail,
        signupWithEmail,
        logout,
        refreshUserData,
        clearError
    }), [user, userData, loading, error, loginWithGoogle, loginWithEmail, signupWithEmail, logout, refreshUserData, clearError]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
