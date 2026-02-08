/**
 * Backfill script to add missing lastActiveAt and expiresAt fields to existing jobs.
 *
 * Run with: npx tsx scripts/backfill-job-timestamps.ts
 *
 * This script:
 * 1. Finds all jobs missing lastActiveAt or expiresAt
 * 2. Sets lastActiveAt to created_at (or now if missing)
 * 3. Sets expiresAt to lastActiveAt + 4 days
 * 4. Uses batch writes for efficiency (max 500 per batch)
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
// Uses GOOGLE_APPLICATION_CREDENTIALS env var or default credentials
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const JOBS_COLLECTION = 'jobs';
const BATCH_SIZE = 500;
const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;

interface JobDoc {
  id: string;
  created_at?: Timestamp | { _seconds: number; _nanoseconds: number } | Date;
  lastActiveAt?: Timestamp;
  expiresAt?: Timestamp;
  status?: string;
}

/**
 * Convert various timestamp formats to a Date object
 */
function toDate(value: unknown): Date {
  if (!value) {
    return new Date();
  }

  // Firestore Timestamp object
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  // Raw Firestore timestamp with _seconds/_nanoseconds
  if (typeof value === 'object' && value !== null && '_seconds' in value) {
    const ts = value as { _seconds: number; _nanoseconds: number };
    return new Date(ts._seconds * 1000 + ts._nanoseconds / 1000000);
  }

  // Already a Date
  if (value instanceof Date) {
    return value;
  }

  // String or number
  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }

  // Fallback
  return new Date();
}

async function backfillJobTimestamps(): Promise<void> {
  console.log('Starting job timestamp backfill...\n');

  const jobsRef = db.collection(JOBS_COLLECTION);
  const snapshot = await jobsRef.get();

  if (snapshot.empty) {
    console.log('No jobs found in database.');
    return;
  }

  console.log(`Found ${snapshot.size} total jobs. Checking for missing fields...\n`);

  const jobsToUpdate: JobDoc[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data() as Omit<JobDoc, 'id'>;

    // Check if either field is missing
    if (!data.lastActiveAt || !data.expiresAt) {
      jobsToUpdate.push({
        id: doc.id,
        ...data
      });
    }
  });

  if (jobsToUpdate.length === 0) {
    console.log('All jobs already have lastActiveAt and expiresAt fields. Nothing to backfill.');
    return;
  }

  console.log(`Found ${jobsToUpdate.length} jobs needing backfill:\n`);

  // Process in batches of 500 (Firestore limit)
  let batchCount = 0;
  let totalUpdated = 0;

  for (let i = 0; i < jobsToUpdate.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const batchJobs = jobsToUpdate.slice(i, i + BATCH_SIZE);
    batchCount++;

    console.log(`Processing batch ${batchCount} (${batchJobs.length} jobs)...`);

    for (const job of batchJobs) {
      const docRef = jobsRef.doc(job.id);

      // Use created_at as the base, or now if missing
      const baseDate = toDate(job.created_at);

      // Calculate expiration (4 days from base time)
      const expirationDate = new Date(baseDate.getTime() + FOUR_DAYS_MS);

      const updates: Record<string, Timestamp> = {};

      if (!job.lastActiveAt) {
        updates.lastActiveAt = Timestamp.fromDate(baseDate);
        console.log(`  - ${job.id}: Setting lastActiveAt to ${baseDate.toISOString()}`);
      }

      if (!job.expiresAt) {
        updates.expiresAt = Timestamp.fromDate(expirationDate);
        console.log(`  - ${job.id}: Setting expiresAt to ${expirationDate.toISOString()}`);
      }

      batch.update(docRef, updates);
      totalUpdated++;
    }

    // Commit the batch
    await batch.commit();
    console.log(`Batch ${batchCount} committed.\n`);
  }

  console.log(`\nBackfill complete!`);
  console.log(`Updated ${totalUpdated} jobs across ${batchCount} batch(es).`);
}

// Run the backfill
backfillJobTimestamps()
  .then(() => {
    console.log('\nScript finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed with error:', error);
    process.exit(1);
  });
