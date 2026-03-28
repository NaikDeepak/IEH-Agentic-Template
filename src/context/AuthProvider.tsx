import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    deleteUser,
    type User as FirebaseUser
} from 'firebase/auth';
import {
    auth,
    googleProvider,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification
} from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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
                            referredBy: referredBy, // Will be null if not referred
                            onboarding_complete: false
                        };
                        setUserData(newUserData);

                        // Firestore Rules Compliance:
                        // Only send fields allowed by 'allow create' in firestore.rules.
                        // 'role' and 'onboarding_complete' are restricted and must be set by backend.
                        // 'browniePoints' must be 0 or absent.
                        // 'referredBy' is allowed.
                        const { role: _role, onboarding_complete: _oc, ...allowedFirestoreData } = newUserData;
                        
                        // Prevent unused variable warning
                        void _role;
                        void _oc;

                        await setDoc(
                            userDocRef,
                            {
                                ...allowedFirestoreData,
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
            const error = err as { code?: string; message?: string };
            console.error("Email Login Error:", error);
            const friendlyMessages: Record<string, string> = {
                'auth/operation-not-allowed': 'Email/Password login is not enabled. Please contact support.',
                'auth/user-not-found': 'No account found with this email address.',
                'auth/wrong-password': 'Incorrect password. Please try again.',
                'auth/invalid-credential': 'Invalid email or password.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
                'auth/user-disabled': 'This account has been disabled. Please contact support.',
            };
            setError((error.code && friendlyMessages[error.code]) ?? "Failed to sign in. Please check your credentials.");
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
            await sendEmailVerification(userCredential.user);
            
            // onAuthStateChanged fires before updateProfile finishes, leaving the firestore doc with null displayName.
            // We ensure it gets written by manually merging the displayName here.
            await setDoc(doc(db, 'users', userCredential.user.uid), { 
                displayName,
                uid: userCredential.user.uid,
                email: userCredential.user.email 
            }, { merge: true });
        } catch (err: unknown) {
            const error = err as { code?: string; message?: string };
            console.error("Email Signup Error:", error);
            if (error.code === 'auth/operation-not-allowed') {
                setError("Email/Password sign-in is not enabled in the Firebase Console. Please enable it.");
            } else {
                setError(error.message ?? "Failed to sign up with email.");
            }
            throw err;
        }
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        setError(null);
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (err: unknown) {
            const error = err as { code?: string; message?: string };
            console.error("Password Reset Error:", error);
            // Do NOT expose whether the email exists — return the same message for all cases
            // to prevent account enumeration via the Forgot Password UI.
            const friendlyMessages: Record<string, string> = {
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/too-many-requests': 'Too many requests. Please try again later.',
            };
            setError((error.code && friendlyMessages[error.code]) ?? "If an account exists for this email, a reset link has been sent.");
            throw err;
        }
    }, []);

    const sendVerificationEmail = useCallback(async () => {
        if (!auth.currentUser) {
            const noUserErr = new Error('No authenticated user to verify email for.');
            console.error('Verification Email Error:', noUserErr);
            setError('You must be signed in to verify your email.');
            throw noUserErr;
        }
        setError(null);
        try {
            await sendEmailVerification(auth.currentUser);
        } catch (err: unknown) {
            const error = err as { code?: string; message?: string };
            const friendlyMessages: Record<string, string> = {
                'auth/too-many-requests': 'Too many requests. Please wait a few minutes before trying again.',
            };
            setError((error.code && friendlyMessages[error.code]) ?? 'Failed to resend verification email.');
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

    const completeOnboarding = useCallback(async (extraData?: Record<string, string>) => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            onboarding_complete: true,
            ...(extraData ?? {})
        });
        await refreshUserData();
    }, [user, refreshUserData]);

    const updateDisplayName = useCallback(async (name: string) => {
        if (!user) return;
        setError(null);
        try {
            await updateProfile(user, { displayName: name });
            await setDoc(doc(db, 'users', user.uid), { displayName: name }, { merge: true });
            await refreshUserData();
        } catch (err: unknown) {
            const error = err as { message?: string };
            setError(error.message ?? 'Failed to update display name.');
            throw err;
        }
    }, [user, refreshUserData]);

    const deleteAccount = useCallback(async () => {
        if (!auth.currentUser) return;
        setError(null);
        try {
            // Delete the Firebase Auth account first. If this fails (e.g.
            // auth/requires-recent-login) the Firestore doc is left intact so the
            // user can still sign in and retry.
            // Subcollections (resumes, applications, etc.) require server-side cleanup —
            // tracked in docs/code-reviews/pr-26-review.md ISSUE-01.
            const uid = auth.currentUser.uid;
            await deleteUser(auth.currentUser);
            // Auth deletion succeeded — now remove the Firestore profile document.
            await deleteDoc(doc(db, 'users', uid));
        } catch (err: unknown) {
            const error = err as { code?: string; message?: string };
            if (error.code === 'auth/requires-recent-login') {
                setError('For security, please sign out and sign back in before deleting your account.');
            } else {
                setError(error.message ?? 'Failed to delete account.');
            }
            throw err;
        }
    }, []);

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
        resetPassword,
        sendVerificationEmail,
        completeOnboarding,
        logout,
        updateDisplayName,
        deleteAccount,
        refreshUserData,
        clearError
    }), [user, userData, loading, error, loginWithGoogle, loginWithEmail, signupWithEmail, resetPassword, sendVerificationEmail, completeOnboarding, logout, updateDisplayName, deleteAccount, refreshUserData, clearError]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
