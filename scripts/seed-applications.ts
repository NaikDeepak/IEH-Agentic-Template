/**
 * Seed script to add sample applications to Firestore for ATS Kanban testing.
 *
 * Run with: npx tsx scripts/seed-applications.ts [jobId]
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const APPLICATIONS_COLLECTION = 'applications';
const JOBS_COLLECTION = 'jobs';

interface MockCandidate {
  name: string;
  role: string;
  email: string;
}

const mockCandidates: MockCandidate[] = [
  { name: 'Arjun Mehta', role: 'Senior Frontend Engineer', email: 'arjun.mehta@example.com' },
  { name: 'Priya Sharma', role: 'Full Stack Developer', email: 'priya.sharma@example.com' },
  { name: 'Rohan Gupta', role: 'Backend specialist', email: 'rohan.gupta@example.com' },
  { name: 'Ananya Iyer', role: 'UI/UX Enthusiast', email: 'ananya.iyer@example.com' },
  { name: 'Vikram Singh', role: 'DevOps & Cloud', email: 'vikram.singh@example.com' },
  { name: 'Sanya Malhotra', role: 'React Specialist', email: 'sanya.m@example.com' },
  { name: 'Ishaan Verma', role: 'Node.js Developer', email: 'ishaan.v@example.com' },
  { name: 'Kavita Reddy', role: 'Product Designer', email: 'kavita.r@example.com' }
];

const statuses = ['applied', 'screening', 'interview', 'offer', 'rejected'] as const;

async function seedApplications() {
  const jobId = process.argv[2];
  let targetJobId = jobId;

  if (!targetJobId) {
    console.log('No Job ID provided. Finding the first available job...');
    const jobSnap = await db.collection(JOBS_COLLECTION).limit(1).get();
    if (jobSnap.empty) {
      console.error('No jobs found in database. Please seed jobs first.');
      process.exit(1);
    }
    targetJobId = jobSnap.docs[0].id;
    console.log(`Using Job: ${jobSnap.docs[0].data().title} (${targetJobId})`);
  }

  // Get job details to get employer_id
  const jobDoc = await db.collection(JOBS_COLLECTION).doc(targetJobId).get();
  if (!jobDoc.exists) {
    console.error(`Job with ID ${targetJobId} not found.`);
    process.exit(1);
  }
  const jobData = jobDoc.data()!;
  const employerId = jobData.employer_id || 'seed-employer-1';

  console.log(`Seeding applications for Job ID: ${targetJobId}...\n`);

  const appsRef = db.collection(APPLICATIONS_COLLECTION);
  let created = 0;

  for (const candidate of mockCandidates) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const matchScore = Math.floor(Math.random() * 40) + 60; // 60-100 range

    const appData = {
      job_id: targetJobId,
      employer_id: employerId,
      candidate_id: `mock-user-${candidate.email.split('@')[0]}`,
      candidate_name: candidate.name,
      candidate_role: candidate.role,
      status: status,
      match_score: matchScore,
      answers: {
        "experience": "I have 5 years of experience in this field.",
        "interest": "I am very interested in this role because of the tech stack."
      },
      applied_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    };

    const docRef = await appsRef.add(appData);
    console.log(`✓ Created: ${candidate.name} -> ${status} (${docRef.id})`);
    created++;
  }

  console.log(`\nSeeding complete! Created ${created} applications.`);
}

seedApplications()
  .then(() => {
    console.log('\nScript finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed with error:', error);
    process.exit(1);
  });
