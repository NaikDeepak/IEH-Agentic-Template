import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import * as Sentry from "@sentry/node";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleAuth } from "google-auth-library";

dotenv.config({ path: ".env.production" });
dotenv.config();

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

const app = express();

// Enable CORS for all routes
app.use(cors({ origin: true }));
app.use(express.json());

// Initialize Sentry
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 1.0,
    });
}

// Helper to handle errors with details
const handleError = (res, error, context) => {
    console.error(`${context} Error:`, error);
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error);
    }
    const isProd = process.env.NODE_ENV === "production";

    res.status(500).json({
        error: `Failed to ${context}`,
        ...(isProd
            ? {}
            : { details: error?.message, stack: error?.stack }),
    });
};

// --- API Logic via Helper Functions ---

// Helper to generate embedding (reusable)
const generateEmbedding = async (text, apiKey) => {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: [{ parts: [{ text }] }],
    });
    if (response.embedding?.values) {
        return response.embedding.values;
    }
    // Fallback for different SDK return shapes just in case
    if (response.embeddings?.[0]?.values) {
        return response.embeddings[0].values;
    }

    throw new Error("Invalid embedding response from Gemini API");
};

// --- Route Handlers ---

const generateJdHandler = async (req, res) => {
    try {
        const { role, skills, experience } = req.body;
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Server configuration error: API Key missing" });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Using gemini-2.0-flash as per cost-optimization rules
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `Generate a professional job description for a ${role} with skills: ${skills} and experience: ${experience}.`,
        });

        res.json({ jd: response.text() || response.data?.candidates?.[0]?.content?.parts?.[0]?.text });
    } catch (error) {
        handleError(res, error, "generate job description");
    }
};

const embeddingHandler = async (req, res) => {
    try {
        const rawText = req.body?.text;

        if (typeof rawText !== "string") {
            return res.status(400).json({ error: "Text is required" });
        }

        const text = rawText.trim();
        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        if (text.length > 5000) {
            return res.status(413).json({ error: "Text is too long" });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Server configuration error: Gemini API Key missing" });
        }

        const values = await generateEmbedding(text, apiKey);
        res.json({ embedding: values });
    } catch (error) {
        handleError(res, error, "generate embedding");
    }
};

const searchJobsHandler = async (req, res) => {
    try {
        const { query: searchQuery, limit = 10 } = req.body;

        if (!searchQuery || typeof searchQuery !== "string") {
            return res.status(400).json({ error: "Query string is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Server configuration error: Gemini API Key missing" });
        }

        // 1. Generate Embedding
        const queryVector = await generateEmbedding(searchQuery, apiKey);

        // 2. Call Firestore REST API for Vector Search
        const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "india-emp-hub";
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

        // Using Web API Key for public access
        const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;

        let fetchUrl = url;
        if (firebaseApiKey) {
            fetchUrl += `?key=${firebaseApiKey}`;
        }

        const auth = new GoogleAuth({
            scopes: "https://www.googleapis.com/auth/cloud-platform"
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        const token = typeof accessToken === "string" ? accessToken : accessToken?.token;

        if (!token) {
            throw new Error("Failed to acquire access token for Firestore REST API");
        }

        const response = await fetch(fetchUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                structuredQuery: {
                    from: [{ collectionId: "jobs" }],
                    findNearest: {
                        vectorField: { fieldPath: "embedding" },
                        queryVector: {
                            mapValue: {
                                fields: {
                                    __type__: { stringValue: "__vector__" },
                                    value: {
                                        arrayValue: {
                                            values: queryVector.map((v) => ({ doubleValue: v })),
                                        },
                                    },
                                },
                            },
                        },
                        distanceMeasure: "COSINE",
                        limit: Number(limit),
                    },
                },
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Firestore REST API failed: ${response.status} ${errText}`);
        }

        const data = await response.json();

        // 3. Transform response to clean objects
        const jobs = data
            .filter((item) => item.document) // Filter out metadata items
            .map((item) => {
                const doc = item.document;
                const id = doc.name.split("/").pop();
                const fields = doc.fields || {};

                // Helper to unwrap Firestore JSON syntax
                const unwrap = (field) => {
                    const key = Object.keys(field)[0];
                    if (key === "stringValue") return field.stringValue;
                    if (key === "integerValue") return Number(field.integerValue);
                    if (key === "doubleValue") return Number(field.doubleValue);
                    if (key === "booleanValue") return field.booleanValue;
                    if (key === "arrayValue") return (field.arrayValue.values || []).map(unwrap);
                    if (key === "mapValue")
                        return Object.fromEntries(
                            Object.entries(field.mapValue.fields || {}).map(([k, v]) => [
                                k,
                                unwrap(v),
                            ])
                        );
                    return null;
                };

                const unwrappedData = Object.fromEntries(
                    Object.entries(fields).map(([k, v]) => [k, unwrap(v)])
                );

                // Remove large embedding vector from response
                delete unwrappedData.embedding;

                return { id, ...unwrappedData };
            });

        res.json({ jobs });
    } catch (error) {
        handleError(res, error, "search jobs");
    }
};

// --- Route Definitions ---

app.post("/ai/generate-jd", generateJdHandler);
app.post("/embedding", embeddingHandler);
app.post("/jobs/search", searchJobsHandler);

// Keep /api prefix routes for backward compatibility/rewrite logic
app.post("/api/ai/generate-jd", generateJdHandler);
app.post("/api/embedding", embeddingHandler);
app.post("/api/jobs/search", searchJobsHandler);

// Expose the Express API as a single Cloud Function
export const api = onRequest(app);
