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
                        try {
                            await updateDoc(userDocRef, {
                                last_login: serverTimestamp()
                            });
                        } catch (updateError) {
                            console.warn('Failed to update last_login (non-fatal):', updateError);
                        }

                        // Ensure user has a referral code
                        if (!data.referralCode) {
                            await ReferralService.ensureReferralCode(user.uid);
                            // Refresh data to get the new code
                            const updatedSnap = await getDoc(userDocRef);
                            const updatedData = updatedSnap.data() as UserData;
                            setUserData({
                                ...updatedData,
                                role: claimRole ?? updatedData.role ?? null
                            });
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
                            referredBy: referredBy // Will be null if not referred
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

                        // E2E BYPASS: Automatically onboard in emulator environment.
                        // SECURITY: Double-guarded — requires both the emulator env var AND
                        // that we are NOT in a production build. This prevents accidental
                        // activation if the env var is set in a staging/prod environment.
                        if (
                            !import.meta.env.PROD &&
                            import.meta.env['VITE_USE_FIREBASE_EMULATOR'] === 'true' &&
                            !claimRole
                        ) {
                            const assignedRole = user.email?.includes('employer') ? 'employer' : 'seeker';
                            const token = await user.getIdToken();

                            // Use the secure backend endpoint instead of a direct updateDoc.
                            // The new Firestore rules block client-side role writes, so this
                            // must go through the Admin SDK via the /api/user/onboard route.
                            const resp = await fetch('/api/user/onboard', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ role: assignedRole })
                            });

                            if (!resp.ok) {
                                throw new Error(`Onboard failed: ${resp.status}`);
                            }

                            // Ensure any server-set custom claims (e.g., role) are available immediately
                            await user.getIdToken(true);

                            // Refresh from Firestore to pick up server-assigned values
                            // (role, employerRole, onboarded_at set by Admin SDK)
                            const updatedSnap = await getDoc(userDocRef);
                            setUserData(updatedSnap.data() as UserData);
                        }

                        // Generate referral code for new user
                        await ReferralService.ensureReferralCode(user.uid);
                        const updatedSnap = await getDoc(userDocRef);
                        const updatedData = updatedSnap.data() as UserData;
                        setUserData({
                            ...updatedData,
                            role: claimRole ?? updatedData.role ?? null
                        });
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
            // Defer referral linking until the onAuthStateChanged "new user" bootstrap,
            // so we don't accidentally perform a failing `create` on `users/{uid}`.
            if (referralCode) {
                sessionStorage.setItem('pendingReferralCode', referralCode);
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName });
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
