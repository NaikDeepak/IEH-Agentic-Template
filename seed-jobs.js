import 'dotenv/config';
import fetch from 'node-fetch';

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'india-emp-hub';
const API_KEY = process.env.VITE_FIREBASE_API_KEY;

if (!API_KEY) {
    console.error("VITE_FIREBASE_API_KEY is missing in .env");
    process.exit(1);
}

const jobs = [
    { title: "React Developer", desc: "Building UI with React and Tailwind" },
    { title: "Backend Engineer", desc: "Node.js and Firestore API development" },
    { title: "Data Scientist", desc: "Machine learning and Python analysis" }
];

const toDoubleValue = (val) => ({ doubleValue: val });

async function seed() {
    console.log(`Seeding to project: ${PROJECT_ID}`);

    for (const job of jobs) {
        // 1. Get Embedding
        console.log(`Generating embedding for: ${job.title}`);
        const embedRes = await fetch('http://localhost:8080/api/embedding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: `${job.title} ${job.desc}` })
        });

        if (!embedRes.ok) {
            console.error("Embedding failed:", await embedRes.text());
            continue;
        }

        const { embedding } = await embedRes.json();

        // Use MapValue format for Vector
        const vectorValue = {
            mapValue: {
                fields: {
                    __type__: { stringValue: "__vector__" },
                    value: {
                        arrayValue: {
                            values: embedding.map(toDoubleValue)
                        }
                    }
                }
            }
        };

        // 2. Write to Firestore via REST
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/jobs?key=${API_KEY}`;
        const doc = {
            fields: {
                title: { stringValue: job.title },
                description: { stringValue: job.desc },
                employer_id: { stringValue: "seed_script" },
                skills: { arrayValue: { values: [{ stringValue: "seed" }] } },
                embedding: vectorValue, // Testing this format
                created_at: { timestampValue: new Date().toISOString() },
                updated_at: { timestampValue: new Date().toISOString() },
                status: { stringValue: "open" }
            }
        };

        const writeRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doc)
        });

        if (!writeRes.ok) {
            console.error("Firestore Write Failed:", await writeRes.text());
        } else {
            const d = await writeRes.json();
            console.log("Wrote doc:", d.name);
        }
    }
}

seed();
