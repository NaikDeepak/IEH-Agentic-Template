import { Timestamp, FieldValue } from "firebase/firestore";

export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

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
}

export interface SubmitApplicationInput {
    job_id: string;
    employer_id: string;
    candidate_id: string;
    answers: Record<string, string>;
    match_score: number;
}
