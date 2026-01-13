import type { Timestamp, FieldValue } from "firebase/firestore";

export type UserRole = 'admin' | 'employer' | 'seeker';
export type UserStatus = 'ACTIVE' | 'PASSIVE';

export interface Education {
    institution: string;
    degree: string;
    field?: string;
    startYear?: number;
    endYear?: number;
}

export interface Experience {
    company: string;
    title: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;

    // Candidate Specific
    skills?: string[];
    resume_url?: string;
    parsed_data?: {
        summary?: string;
        education?: Education[];
        experience?: Experience[];
    };
    embedding?: number[]; // Vector embedding for search matching

    // System
    status: UserStatus;
    last_login: Timestamp | FieldValue;
    created_at: Timestamp | FieldValue;
    updated_at: Timestamp | FieldValue;
}

export interface UpdateProfileInput {
    displayName?: string;
    skills?: string[];
    bio?: string; // Summary
    resume_url?: string;
}
