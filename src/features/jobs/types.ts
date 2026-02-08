import type { Timestamp, FieldValue } from "firebase/firestore";

export type JobStatus = 'active' | 'passive' | 'closed';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';

export interface JobPosting {
    id?: string;
    employer_id: string;
    title: string;
    description: string;
    skills: string[];
    location: string;
    type: JobType;
    work_mode: WorkMode;
    salary_range?: {
        min: number;
        max: number;
        currency: string;
    };
    contactEmail: string;
    status: JobStatus;
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
    employer_id: string; // Ideally passed from Auth Context
    contactEmail: string;
    salary_range?: {
        min: number;
        max: number;
        currency: string;
    };
}
