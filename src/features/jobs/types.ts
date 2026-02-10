import type { Timestamp, FieldValue } from "firebase/firestore";

export type JobStatus = 'active' | 'passive' | 'closed';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';

export interface ScreeningQuestion {
    question: string;
    hint?: string;
}

export interface JobPosting {
    id?: string;
    employer_id: string;
    company_id?: string;
    title: string;
    description: string;
    skills: string[];
    location: string;
    type: JobType;
    work_mode: WorkMode;
    experience: string;
    salary_range?: {
        min: number;
        max: number;
        currency: string;
    };
    contactEmail: string;
    company_bio?: string;
    status: JobStatus;
    screening_questions?: ScreeningQuestion[];
    lastActiveAt?: Timestamp | FieldValue;
    expiresAt?: Timestamp | FieldValue;
    created_at: Timestamp | FieldValue;
    updated_at: Timestamp | FieldValue;
    embedding?: number[]; // Vector embedding for search
}

export interface CreateJobInput {
    title: string;
    description: string;
    skills: string[];
    location: string;
    type: JobType;
    work_mode: WorkMode;
    experience: string;
    employer_id: string; // Ideally passed from Auth Context
    company_id?: string;
    company_bio?: string;
    contactEmail: string;
    salary_range?: {
        min: number;
        max: number;
        currency: string;
    };
    screening_questions?: ScreeningQuestion[];
}
