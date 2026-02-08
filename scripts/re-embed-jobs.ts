import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
    initializeApp();
}

const db = getFirestore();
const JOBS_COLLECTION = 'jobs';
const BATCH_SIZE = 100;

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
    console.error("Error: GEMINI_API_KEY or API_KEY is missing in environment variables.");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

// Helper to generate embedding using gemini-embedding-001 via REST to ensure 768 dim
async function generateEmbedding(text: string): Promise<number[] | null> {
    if (!text.trim()) return null;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: { parts: [{ text }] },
                    outputDimensionality: 768
                })
            }
        );

        if (!response.ok) {
            console.error(`API Error: ${response.status} ${await response.text()}`);
            return null;
        }

        const data = await response.json();
        const embedding = data.embedding?.values;

        if (!embedding) {
            console.error("Failed to generate embedding for text:", text.substring(0, 50) + "...");
            return null;
        }

        console.log(`Embedding generated. Length: ${embedding.length}`);
        return embedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        return null;
    }
}

async function reEmbedJobs() {
    console.log("Starting job re-embedding process...");

    // Fetch all jobs
    const snapshot = await db.collection(JOBS_COLLECTION).get();

    if (snapshot.empty) {
        console.log("No jobs found in database.");
        return;
    }

    console.log(`Found ${snapshot.size} jobs. Processing...`);

    let processedIdx = 0;
    let successIdx = 0;
    let batch = db.batch();
    let pendingUpdates = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();

        // Construct text to embed - combining important fields
        // This should match the logic used elsewhere if possible, or be comprehensive
        const textToEmbed = [
            data.title,
            data.description,
            Array.isArray(data.skills) ? data.skills.join(' ') : data.skills,
            data.location,
            data.type,
            data.work_mode
        ].filter(Boolean).join(' ');

        if (!textToEmbed) {
            console.warn(`Skipping doc ${doc.id}: No text content found.`);
            continue;
        }

        console.log(`Generating embedding for: ${data.title} (${doc.id})`);

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));

        const embedding = await generateEmbedding(textToEmbed);

        if (embedding) {
            const updateData = {
                embedding: FieldValue.vector(embedding),
                updated_at: FieldValue.serverTimestamp() // Optional: mark as updated
            };

            batch.update(doc.ref, updateData);
            pendingUpdates++;
            successIdx++;
        }

        processedIdx++;

        // Commit batch if limit reached
        if (pendingUpdates >= BATCH_SIZE) {
            await batch.commit();
            console.log(`Committed batch of ${pendingUpdates} updates.`);
            batch = db.batch();
            pendingUpdates = 0;
        }
    }

    // Commit remaining changes
    if (pendingUpdates > 0) {
        await batch.commit();
        console.log(`Committed final batch of ${pendingUpdates} updates.`);
    }

    console.log(`\nRe-embedding complete.`);
    console.log(`Total processed: ${processedIdx}`);
    console.log(`Successfully updated: ${successIdx}`);
}

reEmbedJobs()
    .then(() => {
        console.log("Script finished successfully.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Script failed:", error);
        process.exit(1);
    });
