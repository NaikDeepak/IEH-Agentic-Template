import { createContext, type Context } from 'react';
import { type User as FirebaseUser } from 'firebase/auth';

export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: 'seeker' | 'employer' | 'admin' | null;
    employerRole?: 'owner' | 'recruiter' | 'hiring_manager';
    referralCode?: string;
    referredBy?: string | null;
    browniePoints?: number;
    phoneVerified?: boolean;
    linkedinVerified?: boolean;
    onboarding_complete?: boolean;
}

export interface AuthContextType {
    user: FirebaseUser | null;
    userData: UserData | null;
    loading: boolean;
    error: string | null;
    loginWithGoogle: (referralCode?: string) => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signupWithEmail: (email: string, password: string, displayName: string, referralCode?: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    sendVerificationEmail: () => Promise<void>;
    completeOnboarding: (extraData?: Record<string, string>) => Promise<void>;
    logout: () => Promise<void>;
    updateDisplayName: (name: string) => Promise<void>;
    verifyEmailUpdate: (newEmail: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
    refreshUserData: () => Promise<void>;
    clearError: () => void;
}

export const AuthContext: Context<AuthContextType | undefined> = createContext<AuthContextType | undefined>(undefined);
