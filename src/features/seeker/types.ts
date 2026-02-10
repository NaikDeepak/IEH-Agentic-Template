import { Timestamp, FieldValue } from "firebase/firestore";
import { Application as BaseApplication } from "../applications/types";

/**
 * Firestore Schema Expectations:
 * - users/{uid}/resumes: Parsed resume data and ATS scores.
 * - users/{uid}/applications: Reference to job applications (subcollection or pointers).
 * - users/{uid}/shortlist: Daily job recommendations.
 * - users/{uid}/skillGaps: Identified gaps and resources.
 */

export interface SeekerProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    bio?: string;
    skills: string[];
    headline?: string;
    currentLocation?: string;
    preferences: {
        roles: string[];
        locations: string[];
        remote: boolean;
        minSalary?: number;
    };
    onboarded: boolean;
    created_at: Timestamp | FieldValue;
    updated_at: Timestamp | FieldValue;
}

export interface ResumeAnalysisResult {
    id?: string;
    user_id: string;
    raw_text?: string;
    file_url?: string;
    filename?: string;
    score: number; // Overall ATS score
    sections: {
        contact: boolean;
        summary: boolean;
        experience: boolean;
        education: boolean;
        skills: boolean;
    };
    keywords: {
        found: string[];
        missing: string[];
    };
    suggestions: string[];
    parsed_data: {
        name?: string;
        email?: string;
        phone?: string;
        links?: string[];
        experience?: {
            company: string;
            role: string;
            duration: string;
            description: string[];
        }[];
        education?: {
            institution: string;
            degree: string;
            year: string;
        }[];
    };
    analyzed_at: Timestamp | FieldValue;
}

export interface Application extends BaseApplication {
    notes?: string;
    reminder_date?: Timestamp | FieldValue;
}

export interface SkillGap {
    id?: string;
    user_id: string;
    target_role: string;
    missing_skills: {
        name: string;
        importance: 'high' | 'medium' | 'low';
        description?: string;
    }[];
    resources: {
        title: string;
        url: string;
        type: 'course' | 'article' | 'video';
    }[];
    identified_at: Timestamp | FieldValue;
}

export interface ShortlistedJob {
    id?: string;
    user_id: string;
    job_id: string;
    score: number;
    reason: string;
    recommended_at: Timestamp | FieldValue;
}
