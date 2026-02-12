import { Timestamp, FieldValue } from "firebase/firestore";

export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';

export interface Application {
    id?: string;
    job_id: string;
    employer_id: string;
    candidate_id: string;
    candidate_name?: string;
    candidate_role?: string;
    status: ApplicationStatus;
    answers: Record<string, string>;
    match_score: number;
    applied_at: Timestamp | FieldValue;
    updated_at: Timestamp | FieldValue;
    needsFollowUp?: boolean;
    nudgeReason?: string;
}

export interface SubmitApplicationInput {
    job_id: string;
    employer_id: string;
    candidate_id: string;
    candidate_name: string;
    candidate_role: string;
    answers: Record<string, string>;
    match_score: number;
}
