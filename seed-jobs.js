import 'dotenv/config';
import fetch from 'node-fetch';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'india-emp-hub';

// Initialize Firebase Admin with ADC (Application Default Credentials)
initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID
});

const db = getFirestore();

const jobs = [
    { title: "React Developer", desc: "Building UI with React and Tailwind" },
    { title: "Backend Engineer", desc: "Node.js and Firestore API development" },
    { title: "Data Scientist", desc: "Machine learning and Python analysis" }
];

async function seed() {
    console.log(`Seeding to project: ${PROJECT_ID}`);

    for (const job of jobs) {
        try {
            // 1. Get Embedding from Deployed Function
            console.log(`Generating embedding for: ${job.title}`);
            const embedRes = await fetch('https://api-3mpf6u7ciq-uc.a.run.app/embedding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: `${job.title} ${job.desc}` })
            });

            if (!embedRes.ok) {
                console.error("Embedding failed:", await embedRes.text());
                continue;
            }

            const { embedding } = await embedRes.json();

            // 2. Write to Firestore via Admin SDK
            const docRef = await db.collection('jobs').add({
                title: job.title,
                description: job.desc,
                employer_id: "seed_script",
                skills: ["seed"],
                // Use FieldValue.vector if supported, otherwise just array for now, 
                // but for vector search to work via Admin SDK writes, we usually need correct format.
                // However, the REST API query expects a specific format. 
                // Let's use FieldValue.vector() as we are on v13+
                embedding: FieldValue.vector(embedding),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: "open"
            });

            console.log("Wrote doc:", docRef.id);
        } catch (error) {
            console.error("Error seeding job:", error);
        }
    }
}

seed();
