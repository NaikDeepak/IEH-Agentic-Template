import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { ActivityStatus } from '../types';

const ACTIVITY_DEBOUNCE_MS = 60 * 60 * 1000; // 1 hour
const ACTIVITY_EXPIRATION_DAYS = 4;

/**
 * Calculates the expiration date for active status (now + 4 days)
 */
const getExpirationTimestamp = (): Timestamp => {
  const date = new Date();
  date.setDate(date.getDate() + ACTIVITY_EXPIRATION_DAYS);
  return Timestamp.fromDate(date);
};

/**
 * Updates the user's lastActiveAt and expiresAt timestamps in Firestore.
 * Debounced to run at most once per hour per user.
 */
export const trackUserActivity = async (userId: string): Promise<void> => {
  if (!userId) return;

  const storageKey = `last_active_user_${userId}`;
  const lastTracked = localStorage.getItem(storageKey);
  const now = Date.now();

  if (lastTracked && now - parseInt(lastTracked, 10) < ACTIVITY_DEBOUNCE_MS) {
    return;
  }

  try {
    const userRef = doc(db, 'users', userId);
    // Use setDoc with merge to avoid 'document not found' errors on new registrations
    // but note that create rules might still block if required fields like 'email' aren't present.
    // However, if the doc already exists, this is identical to updateDoc.
    await updateDoc(userRef, {
      status: 'active' as ActivityStatus,
      lastActiveAt: serverTimestamp(),
      expiresAt: getExpirationTimestamp()
    });
    localStorage.setItem(storageKey, now.toString());
  } catch {
    // Fail silently - common on new registrations before user doc is fully created
    if (import.meta.env.DEV) {
      console.warn('Activity tracking deferred (user doc may not exist yet)');
    }
  }
};

/**
 * Updates a job's lastActiveAt and expiresAt timestamps in Firestore.
 * This should be called when an employer interacts with a specific job (e.g. views applicants).
 * Debounced to run at most once per hour per job.
 */
export const trackJobActivity = async (jobId: string): Promise<void> => {
  if (!jobId) return;

  const storageKey = `last_active_job_${jobId}`;
  const lastTracked = localStorage.getItem(storageKey);
  const now = Date.now();

  if (lastTracked && now - parseInt(lastTracked, 10) < ACTIVITY_DEBOUNCE_MS) {
    return;
  }

  try {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, {
      status: 'active' as ActivityStatus,
      lastActiveAt: serverTimestamp(),
      expiresAt: getExpirationTimestamp()
    });
    localStorage.setItem(storageKey, now.toString());
  } catch (error) {
    console.error('Error tracking job activity:', error);
  }
};
