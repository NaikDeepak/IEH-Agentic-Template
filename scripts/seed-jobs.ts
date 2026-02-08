/**
 * Seed script to add sample jobs to Firestore for UI testing.
 *
 * Run with: npx tsx scripts/seed-jobs.ts
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const JOBS_COLLECTION = 'jobs';
const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;

interface SeedJob {
  title: string;
  description: string;
  employer_id: string;
  location: string;
  type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
  work_mode: 'remote' | 'hybrid' | 'onsite';
  skills: string[];
  salary_range?: { min: number; max: number; currency: string };
  status: 'active' | 'passive';
}

const sampleJobs: SeedJob[] = [
  {
    title: 'Senior React Developer',
    description: 'We are looking for an experienced React developer to join our frontend team. You will be working on building scalable web applications using React, TypeScript, and modern tooling. Experience with state management (Redux/Zustand) and testing frameworks is required.',
    employer_id: 'seed-employer-1',
    location: 'Bangalore, India',
    type: 'full_time',
    work_mode: 'hybrid',
    skills: ['react', 'typescript', 'javascript', 'redux', 'tailwindcss'],
    salary_range: { min: 1500000, max: 2500000, currency: 'INR' },
    status: 'active'
  },
  {
    title: 'Node.js Backend Engineer',
    description: 'Join our backend team to build robust APIs and microservices. You will work with Node.js, Express, PostgreSQL, and Redis. Experience with cloud platforms (AWS/GCP) and containerization (Docker/Kubernetes) is a plus.',
    employer_id: 'seed-employer-1',
    location: 'Mumbai, India',
    type: 'full_time',
    work_mode: 'remote',
    skills: ['nodejs', 'express', 'postgresql', 'redis', 'docker'],
    salary_range: { min: 1200000, max: 2000000, currency: 'INR' },
    status: 'active'
  },
  {
    title: 'Full Stack Developer',
    description: 'Looking for a versatile full stack developer comfortable with both frontend and backend technologies. Tech stack includes React, Node.js, MongoDB, and AWS. You will be involved in the entire product development lifecycle.',
    employer_id: 'seed-employer-2',
    location: 'Hyderabad, India',
    type: 'full_time',
    work_mode: 'onsite',
    skills: ['react', 'nodejs', 'mongodb', 'aws', 'javascript'],
    salary_range: { min: 1000000, max: 1800000, currency: 'INR' },
    status: 'active'
  },
  {
    title: 'DevOps Engineer',
    description: 'We need a DevOps engineer to manage our CI/CD pipelines, infrastructure automation, and cloud resources. Experience with Terraform, Jenkins/GitHub Actions, and Kubernetes is essential. GCP experience preferred.',
    employer_id: 'seed-employer-2',
    location: 'Pune, India',
    type: 'full_time',
    work_mode: 'hybrid',
    skills: ['kubernetes', 'terraform', 'docker', 'gcp', 'jenkins'],
    salary_range: { min: 1400000, max: 2200000, currency: 'INR' },
    status: 'active'
  },
  {
    title: 'Python Data Engineer',
    description: 'Join our data team to build and maintain data pipelines. You will work with Python, Apache Spark, Airflow, and cloud data warehouses. Experience with ETL processes and data modeling is required.',
    employer_id: 'seed-employer-3',
    location: 'Chennai, India',
    type: 'full_time',
    work_mode: 'remote',
    skills: ['python', 'spark', 'airflow', 'sql', 'aws'],
    salary_range: { min: 1300000, max: 2100000, currency: 'INR' },
    status: 'active'
  },
  {
    title: 'UI/UX Designer',
    description: 'We are hiring a creative UI/UX designer to craft beautiful and intuitive user experiences. Proficiency in Figma, user research, and prototyping is required. Experience with design systems is a plus.',
    employer_id: 'seed-employer-3',
    location: 'Bangalore, India',
    type: 'full_time',
    work_mode: 'hybrid',
    skills: ['figma', 'ui design', 'ux research', 'prototyping', 'design systems'],
    salary_range: { min: 800000, max: 1500000, currency: 'INR' },
    status: 'active'
  },
  {
    title: 'QA Automation Engineer',
    description: 'Looking for a QA engineer to build and maintain our test automation framework. Experience with Selenium/Playwright, API testing, and CI integration is required. Knowledge of performance testing is a bonus.',
    employer_id: 'seed-employer-1',
    location: 'Noida, India',
    type: 'contract',
    work_mode: 'remote',
    skills: ['selenium', 'playwright', 'javascript', 'api testing', 'ci/cd'],
    salary_range: { min: 900000, max: 1400000, currency: 'INR' },
    status: 'passive'  // One passive job to show the difference
  },
  {
    title: 'Mobile Developer (React Native)',
    description: 'Build cross-platform mobile applications using React Native. You will work on both iOS and Android apps, integrating with REST APIs and native modules. Experience with app store deployments is required.',
    employer_id: 'seed-employer-2',
    location: 'Gurgaon, India',
    type: 'full_time',
    work_mode: 'hybrid',
    skills: ['react native', 'javascript', 'typescript', 'ios', 'android'],
    salary_range: { min: 1100000, max: 1900000, currency: 'INR' },
    status: 'active'
  }
];

async function seedJobs(): Promise<void> {
  console.log('Seeding jobs to Firestore...\n');

  const jobsRef = db.collection(JOBS_COLLECTION);
  const now = new Date();
  let created = 0;

  for (const job of sampleJobs) {
    // Calculate timestamps
    const lastActiveAt = Timestamp.now();
    const expiresAt = Timestamp.fromDate(new Date(now.getTime() + FOUR_DAYS_MS));

    // Create job document
    const jobData = {
      ...job,
      skills: job.skills.map(s => s.toLowerCase()),
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
      lastActiveAt,
      expiresAt,
      // Placeholder embedding (must be non-zero magnitude for cosine distance)
      // We use a unit vector [1, 0, 0...] to ensure valid vector math
      embedding: FieldValue.vector([1, ...new Array(767).fill(0)])
    };

    const docRef = await jobsRef.add(jobData);
    console.log(`✓ Created: ${job.title} (${docRef.id}) - ${job.status}`);
    created++;
  }

  console.log(`\nSeeding complete! Created ${created} jobs.`);
}

// Run the seed
seedJobs()
  .then(() => {
    console.log('\nScript finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed with error:', error);
    process.exit(1);
  });
