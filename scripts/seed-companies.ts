/**
 * Seed script to add sample companies to Firestore for UI testing.
 *
 * Run with: npx tsx scripts/seed-companies.ts
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const COMPANIES_COLLECTION = 'companies';

interface SeedCompany {
  id?: string;
  name: string;
  bio: string;
  tagline: string;
  website: string;
  video_url: string;
  location: string;
  employer_ids: string[];
  tech_stack: string[];
}

const sampleCompanies: SeedCompany[] = [
  {
    name: 'TechFlow Solutions',
    bio: 'TechFlow Solutions is a leading digital transformation partner for global enterprises. We specialize in building scalable cloud-native applications and AI-driven solutions. Our culture is built on innovation, continuous learning, and work-life balance.',
    tagline: 'Innovating for the Future',
    website: 'https://techflow.example.com',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
    location: 'Bangalore, India',
    employer_ids: ['seed-employer-1'],
    tech_stack: ['React', 'Node.js', 'AWS', 'Python']
  },
  {
    name: 'CloudNative Systems',
    bio: 'We are a product-based company focused on simplifying cloud infrastructure management. Our platform helps developers deploy and scale applications with ease. We are a remote-first company with a diverse team distributed across India.',
    tagline: 'Cloud Made Simple',
    website: 'https://cloudnative.example.com',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    location: 'Mumbai, India',
    employer_ids: ['seed-employer-2'],
    tech_stack: ['Go', 'Kubernetes', 'GCP', 'Vue.js']
  },
  {
    name: 'DataMinds Analytics',
    bio: 'DataMinds is a data science consultancy helping businesses unlock the value of their data. We work with Fortune 500 companies to implement machine learning models and predictive analytics. We are looking for curious minds to join our team.',
    tagline: 'Turning Data into Insights',
    website: 'https://dataminds.example.com',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    location: 'Hyderabad, India',
    employer_ids: ['seed-employer-3'],
    tech_stack: ['Python', 'TensorFlow', 'Spark', 'React']
  }
];

async function seedCompanies(): Promise<void> {
  console.log('Seeding companies to Firestore...\n');

  const companiesRef = db.collection(COMPANIES_COLLECTION);
  let created = 0;

  for (const company of sampleCompanies) {
    // Check if company already exists for this employer to avoid duplicates
    const snapshot = await companiesRef.where('employer_ids', 'array-contains', company.employer_ids[0]).get();

    const companyData = {
      ...company,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    };

    if (!snapshot.empty) {
      // Update existing
      const docId = snapshot.docs[0].id;
      await companiesRef.doc(docId).update({
        ...company,
        updated_at: FieldValue.serverTimestamp()
      });
      console.log(`✓ Updated: ${company.name} (${docId})`);
    } else {
      // Create new
      const docRef = await companiesRef.add(companyData);
      console.log(`✓ Created: ${company.name} (${docRef.id})`);
    }

    created++;
  }

  console.log(`\nSeeding complete! Processed ${created} companies.`);
}

// Run the seed
seedCompanies()
  .then(() => {
    console.log('\nScript finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed with error:', error);
    process.exit(1);
  });
