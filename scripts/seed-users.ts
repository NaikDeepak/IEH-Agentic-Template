/**
 * Seed script to add sample job seekers (candidates) to Firestore for UI testing.
 *
 * Run with: npx tsx scripts/seed-users.ts
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const USERS_COLLECTION = 'users';
const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;

interface SeedUser {
  id?: string; // Optional manual ID
  displayName: string;
  email: string;
  role: 'seeker' | 'employer' | 'admin';
  status: 'active' | 'passive';
  jobTitle: string;
  location: string;
  bio: string;
  skills: string[];
  experience: string; // e.g. "5 years" or text description
  availability: 'immediate' | '2_weeks' | '1_month';
  photoURL?: string;
}

const sampleUsers: SeedUser[] = [
  {
    id: 'seed-candidate-1',
    displayName: 'Aarav Patel',
    email: 'aarav.patel@example.com',
    role: 'seeker',
    status: 'active',
    jobTitle: 'Senior React Developer',
    location: 'Bangalore, India',
    bio: 'Passionate frontend developer with 6 years of experience building responsive web applications. Expert in React ecosystem and performance optimization.',
    skills: ['react', 'typescript', 'redux', 'next.js', 'tailwindcss', 'graphql'],
    experience: '6 Years',
    availability: 'immediate',
    photoURL: 'https://ui-avatars.com/api/?name=Aarav+Patel&background=random'
  },
  {
    id: 'seed-candidate-2',
    displayName: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    role: 'seeker',
    status: 'active',
    jobTitle: 'Full Stack Engineer',
    location: 'Mumbai, India',
    bio: 'Full stack engineer who loves solving complex backend problems. Experienced in Node.js, Microservices, and Cloud Infrastructure.',
    skills: ['node.js', 'express', 'postgresql', 'aws', 'docker', 'redis'],
    experience: '4 Years',
    availability: '2_weeks',
    photoURL: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=random'
  },
  {
    id: 'seed-candidate-3',
    displayName: 'Rohan Gupta',
    email: 'rohan.gupta@example.com',
    role: 'seeker',
    status: 'active',
    jobTitle: 'Data Scientist',
    location: 'Hyderabad, India',
    bio: 'Data scientist with a strong background in statistical modeling and machine learning. Experienced in building recommendation engines and predictive models.',
    skills: ['python', 'machine learning', 'tensorflow', 'sql', 'pandas', 'scikit-learn'],
    experience: '3 Years',
    availability: '1_month',
    photoURL: 'https://ui-avatars.com/api/?name=Rohan+Gupta&background=random'
  },
  {
    id: 'seed-candidate-4',
    displayName: 'Neha Singh',
    email: 'neha.singh@example.com',
    role: 'seeker',
    status: 'active',
    jobTitle: 'UI/UX Designer',
    location: 'Pune, India',
    bio: 'Creative designer focused on user-centric digital experiences. Proficient in creating design systems, wireframes, and high-fidelity prototypes.',
    skills: ['figma', 'adobe xd', 'user research', 'prototyping', 'interaction design'],
    experience: '5 Years',
    availability: 'immediate',
    photoURL: 'https://ui-avatars.com/api/?name=Neha+Singh&background=random'
  },
  {
    id: 'seed-candidate-5',
    displayName: 'Vikram Malhotra',
    email: 'vikram.m@example.com',
    role: 'seeker',
    status: 'active',
    jobTitle: 'DevOps Engineer',
    location: 'Gurgaon, India',
    bio: 'DevOps specialist ensuring reliable and scalable infrastructure. Expert in CI/CD automation and container orchestration.',
    skills: ['kubernetes', 'terraform', 'jenkins', 'azure', 'bash scripting'],
    experience: '7 Years',
    availability: '2_weeks',
    photoURL: 'https://ui-avatars.com/api/?name=Vikram+Malhotra&background=random'
  },
  {
    id: 'seed-candidate-6',
    displayName: 'Ananya Desai',
    email: 'ananya.d@example.com',
    role: 'seeker',
    status: 'passive', // Passive candidate (should filter out in active search)
    jobTitle: 'Product Manager',
    location: 'Delhi, India',
    bio: 'Product manager with a track record of launching successful B2B SaaS products. Strong in roadmap planning and stakeholder management.',
    skills: ['product management', 'agile', 'jira', 'user stories', 'strategy'],
    experience: '8 Years',
    availability: '1_month',
    photoURL: 'https://ui-avatars.com/api/?name=Ananya+Desai&background=random'
  }
];

async function seedUsers(): Promise<void> {
  console.log('Seeding users (candidates) to Firestore...\n');

  const usersRef = db.collection(USERS_COLLECTION);
  const now = new Date();
  let created = 0;

  for (const user of sampleUsers) {
    // Calculate timestamps
    const lastActiveAt = Timestamp.now();
    // Expiration logic: 4 days from now if active
    const expiresAt = Timestamp.fromDate(new Date(now.getTime() + FOUR_DAYS_MS));

    // Create user document
    const userData = {
      ...user,
      // Normalize skills for basic search/display
      skills: user.skills.map(s => s.toLowerCase()),
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
      lastActiveAt,
      expiresAt,
      // Placeholder embedding (must be non-zero magnitude for cosine distance)
      // We use a unit vector [1, 0, 0...] to ensure valid vector math
      embedding: FieldValue.vector([1, ...new Array(767).fill(0)])
    };

    // Remove the id from the data payload, use it for document ID
    const { id, ...dataToSave } = userData;

    if (id) {
        await usersRef.doc(id).set(dataToSave);
        console.log(`✓ Created/Updated: ${user.displayName} (${id}) - ${user.status}`);
    } else {
        const docRef = await usersRef.add(dataToSave);
        console.log(`✓ Created: ${user.displayName} (${docRef.id}) - ${user.status}`);
    }

    created++;
  }

  console.log(`\nSeeding complete! Processed ${created} users.`);
}

// Run the seed
seedUsers()
  .then(() => {
    console.log('\nScript finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed with error:', error);
    process.exit(1);
  });
