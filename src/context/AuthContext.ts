import { createContext, type Context } from 'react';
import { type User as FirebaseUser } from 'firebase/auth';

export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: 'seeker' | 'employer' | 'admin' | null;
    employerRole?: 'owner' | 'recruiter' | 'hiring_manager';
}

export interface AuthContextType {
    user: FirebaseUser | null;
    userData: UserData | null;
    loading: boolean;
    error: string | null;
    loginWithGoogle: () => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signupWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUserData: () => Promise<void>;
    clearError: () => void;
}

export const AuthContext: Context<AuthContextType | undefined> = createContext<AuthContextType | undefined>(undefined);
