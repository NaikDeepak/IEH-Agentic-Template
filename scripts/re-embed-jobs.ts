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

const EMBEDDING_DIMENSION = 768;

// Helper to generate embedding using gemini-embedding-001 ensuring 768 dim via slicing
async function generateEmbedding(text: string): Promise<number[] | null> {
    if (!text.trim()) return null;

    try {
        const response = await ai.models.embedContent({
            model: "models/gemini-embedding-001",
            contents: [{ parts: [{ text }] }],
            outputDimensionality: EMBEDDING_DIMENSION
        });

        // Handle response variations
        let values: number[] | undefined;
        if (response.embedding?.values) {
            values = response.embedding.values;
        } else if (response.embeddings?.[0]?.values) {
            values = response.embeddings[0].values;
        }

        if (!values) {
            console.error("No embedding values in response");
            return null;
        }

        // Apply slicing if needed (e.g. if API ignores outputDimensionality and returns 3072)
        if (values.length > EMBEDDING_DIMENSION) {
            values = values.slice(0, EMBEDDING_DIMENSION);
        }

        console.log(`Generated embedding. Length: ${values.length}`);
        return values;
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
