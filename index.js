import express from 'express';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import * as Sentry from "@sentry/node";
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
// This automatically uses GOOGLE_APPLICATION_CREDENTIALS or default credentials in Cloud Run
initializeApp();
const db = getFirestore();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Initialize Sentry for Backend if DSN is available
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 1.0,
    });
}

app.use(express.json());

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Skeleton for AI endpoints (Gemini)
app.post('/api/ai/generate-jd', async (req, res) => {
    try {
        const { role, skills, experience } = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // Using gemini-2.0-flash as per cost-optimization rules
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Generate a professional job description for a ${role} with skills: ${skills} and experience: ${experience}.`,
        });

        res.json({ jd: response.text });
    } catch (error) {
        console.error('AI JD Generation Error:', error);
        Sentry.captureException(error);
        res.status(500).json({ error: 'Failed to generate job description' });
    }
});

// Helper to generate embedding (reusable)
const generateEmbedding = async (text, apiKey) => {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: [{ parts: [{ text }] }],
    });
    if (!response?.embeddings?.[0]?.values) {
        throw new Error("Invalid embedding response from Gemini API");
    }
    return response.embeddings[0].values;
};

export const embeddingHandler = async (req, res) => {
    try {
        const rawText = req.body?.text;

        if (typeof rawText !== 'string') {
            return res.status(400).json({ error: 'Text is required' });
        }

        const text = rawText.trim();
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        if (text.length > 5000) {
            return res.status(413).json({ error: 'Text is too long' });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const values = await generateEmbedding(text, apiKey);
        res.json({ embedding: values });

    } catch (error) {
        console.error('Embedding Generation Error:', error);
        Sentry.captureException(error);
        res.status(500).json({ error: 'Failed to generate embedding' });
    }
};

export const searchJobsHandler = async (req, res) => {
    try {
        const { query: searchQuery, limit = 10 } = req.body;

        if (!searchQuery || typeof searchQuery !== 'string') {
            return res.status(400).json({ error: 'Query string is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // 1. Generate Embedding
        const queryVector = await generateEmbedding(searchQuery, apiKey);

        // 2. Call Firestore REST API for Vector Search
        const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'india-emp-hub';
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

        // Using Web API Key for public access (since rules allow read)
        const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY;

        const response = await fetch(`${url}?key=${firebaseApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                structuredQuery: {
                    from: [{ collectionId: 'jobs' }],
                    findNearest: {
                        vectorField: { fieldPath: 'embedding' },
                        queryVector: {
                            mapValue: {
                                fields: {
                                    __type__: { stringValue: "__vector__" },
                                    value: {
                                        arrayValue: {
                                            values: queryVector.map(v => ({ doubleValue: v }))
                                        }
                                    }
                                }
                            }
                        },
                        distanceMeasure: 'COSINE',
                        limit: Number(limit)
                    }
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Firestore REST API failed: ${response.status} ${errText}`);
        }

        const data = await response.json();

        // 3. Transform response to clean objects
        // REST API returns [{document: {name, fields: {...}, createTime, ...}}, {readTime: ...}]
        const jobs = data
            .filter(item => item.document) // Filter out metadata items
            .map(item => {
                const doc = item.document;
                const id = doc.name.split('/').pop();
                const fields = doc.fields || {};

                // Helper to unwrap Firestore JSON syntax
                const unwrap = (field) => {
                    const key = Object.keys(field)[0];
                    if (key === 'stringValue') return field.stringValue;
                    if (key === 'integerValue') return Number(field.integerValue);
                    if (key === 'doubleValue') return Number(field.doubleValue);
                    if (key === 'booleanValue') return field.booleanValue;
                    if (key === 'arrayValue') return (field.arrayValue.values || []).map(unwrap);
                    if (key === 'mapValue') return Object.fromEntries(Object.entries(field.mapValue.fields || {}).map(([k, v]) => [k, unwrap(v)]));
                    return null;
                };

                const unwrappedData = Object.fromEntries(
                    Object.entries(fields).map(([k, v]) => [k, unwrap(v)])
                );

                return { id, ...unwrappedData };
            });

        res.json({ jobs });

    } catch (error) {
        console.error('Job Search Error:', error);
        Sentry.captureException(error);
        res.status(500).json({ error: 'Failed to search jobs' });
    }
};

app.post('/api/embedding', embeddingHandler);
app.post('/api/jobs/search', searchJobsHandler);

// All other GET requests serve the index.html (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Create a named export for the app as well
export { app };

// Only listen if run directly (ESM check)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
