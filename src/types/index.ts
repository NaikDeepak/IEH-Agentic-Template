import { Timestamp, FieldValue } from 'firebase/firestore';

export type ActivityStatus = 'active' | 'passive';

export type UserRole = 'seeker' | 'employer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;

  // Activity Tracking
  status: ActivityStatus;
  lastActiveAt: Timestamp | FieldValue;
  expiresAt: Timestamp | FieldValue; // When the user becomes passive

  // Metadata
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;

  // Optional profile fields (can be expanded later or imported from other feature types)
  skills?: string[];
  bio?: string;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;

  // Activity Tracking
  status: ActivityStatus;
  lastActiveAt: Timestamp | FieldValue;
  expiresAt: Timestamp | FieldValue; // When the job becomes passive

  // Metadata
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;

  // Job details
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'freelance';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
}
