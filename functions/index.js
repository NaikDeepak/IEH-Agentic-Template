import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import * as Sentry from "@sentry/node";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleAuth } from "google-auth-library";
import nodemailer from "nodemailer";

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

// Helper to expand query using LLM
export const expandQuery = async (originalQuery, context, apiKey) => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const target = context === "finding a job" ? "job" : "candidate";
        const prompt = `You are an expert IT recruiter in India. Expand this search query into a detailed semantic description of the ideal ${target}. Include related skills, tools, and alternative titles. Keep it under 100 words. Query: ${originalQuery}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const expandedText = response.text() || response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!expandedText) {
             throw new Error("Empty response from LLM");
        }

        console.log(`Query Expansion (${context}): "${originalQuery}" -> "${expandedText.substring(0, 100)}..."`);
        return expandedText;
    } catch (error) {
        console.warn(`Query expansion failed for "${originalQuery}". Using original query. Error: ${error.message}`);
        return originalQuery;
    }
};

// Helper to generate embedding (reusable)
export const generateEmbedding = async (text, apiKey) => {
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

// Helper to run vector search via Firestore REST API
const runVectorSearch = async (collectionName, queryVector, filters = [], limit = 10) => {
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

    // Construct structured query
    const structuredQuery = {
        from: [{ collectionId: collectionName }],
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
    };

    // Add filters if present
    if (filters.length > 0) {
        if (filters.length === 1) {
            structuredQuery.where = filters[0];
        } else {
            structuredQuery.where = {
                compositeFilter: {
                    op: "AND",
                    filters: filters
                }
            };
        }
    }

    const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ structuredQuery }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Firestore REST API failed: ${response.status} ${errText}`);
    }

    const data = await response.json();

    // Transform response
    return data
        .filter((item) => item.document)
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
                if (key === "timestampValue") return field.timestampValue;
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
};

// Helper to construct equality filter
const createFilter = (field, value) => ({
    fieldFilter: {
        field: { fieldPath: field },
        op: "EQUAL",
        value: { stringValue: value }
    }
});

// --- Route Handlers ---

export const generateJdHandler = async (req, res) => {
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

export const embeddingHandler = async (req, res) => {
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

export const searchJobsHandler = async (req, res) => {
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

        // 2. Run Vector Search with 'active' status filter
        const filters = [createFilter("status", "active")];
        const jobs = await runVectorSearch("jobs", queryVector, filters, limit);

        res.json({ jobs });
    } catch (error) {
        handleError(res, error, "search jobs");
    }
};

export const searchCandidatesHandler = async (req, res) => {
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

        // 2. Run Vector Search with filters (status=active AND role=seeker)
        const filters = [
            createFilter("status", "active"),
            createFilter("role", "seeker")
        ];

        const candidatesRaw = await runVectorSearch("users", queryVector, filters, limit);

        // 3. Filter out sensitive data
        const candidates = candidatesRaw.map(c => {
            // whitelist public fields
            const {
                id, displayName, bio, skills, experience,
                location, photoURL, jobTitle, availability,
                preferredRole, linkedIn, portfolio, github
            } = c;

            return {
                id, displayName, bio, skills, experience,
                location, photoURL, jobTitle, availability,
                preferredRole, linkedIn, portfolio, github
            };
        });

        res.json({ candidates });
    } catch (error) {
        handleError(res, error, "search candidates");
    }
};


// --- Route Definitions ---

app.post("/ai/generate-jd", generateJdHandler);
app.post("/embedding", embeddingHandler);
app.post("/jobs/search", searchJobsHandler);
app.post("/candidates/search", searchCandidatesHandler);

// Keep /api prefix routes for backward compatibility/rewrite logic
app.post("/api/ai/generate-jd", generateJdHandler);
app.post("/api/embedding", embeddingHandler);
app.post("/api/jobs/search", searchJobsHandler);
app.post("/api/candidates/search", searchCandidatesHandler);


// Expose the Express API as a single Cloud Function
export const api = onRequest(app);

// --- Scheduled Functions ---

export const reaper = onSchedule("every 24 hours", async (event) => {
    const now = new Date();
    const batchLimit = 500;

    console.log(`Reaper started at ${now.toISOString()}`);

    try {
        // 1. Send Expiration Warnings (24-48h window)
        const sendWarnings = async () => {
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.log("Skipping email warnings: Missing credentials.");
                return 0;
            }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

            const processWarning = async (collectionName, typeName) => {
                const ref = db.collection(collectionName);
                // Find items expiring tomorrow (between 24h and 48h from now)
                const snapshot = await ref
                    .where("status", "==", "active")
                    .where("expiresAt", ">", tomorrow)
                    .where("expiresAt", "<", dayAfter)
                    .get();

                if (snapshot.empty) return 0;

                let sent = 0;
                const emails = [];

                for (const doc of snapshot.docs) {
                    const data = doc.data();
                    // Try common email fields
                    const recipient = data.email || data.contactEmail || data.applicationEmail;

                    if (recipient) {
                        const subject = `Action Required: Your ${typeName} will expire soon`;
                        const html = `
                            <div style="font-family: sans-serif; padding: 20px;">
                                <h2>Your ${typeName} is expiring</h2>
                                <p>Your active ${typeName} will expire in approximately 24 hours and become invisible to users.</p>
                                <p><strong>Action Required:</strong> Log in to the platform to renew your activity status.</p>
                                <p style="margin-top: 20px; color: #666;">India Emp Hub Notification</p>
                            </div>
                        `;

                        emails.push(
                            transporter.sendMail({
                                from: `"India Emp Hub" <${process.env.EMAIL_USER}>`,
                                to: recipient,
                                subject,
                                html
                            }).catch(err => {
                                console.error(`Failed to email ${recipient} for doc ${doc.id}:`, err);
                            })
                        );
                        sent++;
                    }
                }
                await Promise.all(emails);
                return sent;
            };

            const [jobsWarned, usersWarned] = await Promise.all([
                processWarning("jobs", "Job Posting"),
                processWarning("users", "Profile")
            ]);

            console.log(`Warnings sent. Jobs: ${jobsWarned}, Users: ${usersWarned}`);
            return jobsWarned + usersWarned;
        };

        await sendWarnings();

        // 2. Demote Expired Items
        const processCollection = async (collectionName) => {
            const ref = db.collection(collectionName);
            const snapshot = await ref
                .where("status", "==", "active")
                .where("expiresAt", "<", now)
                .get();

            if (snapshot.empty) {
                console.log(`No expired ${collectionName} found.`);
                return 0;
            }

            let count = 0;
            let batch = db.batch();
            let operationCount = 0;

            for (const doc of snapshot.docs) {
                batch.update(doc.ref, {
                    status: "passive",
                    updatedAt: now
                });
                operationCount++;
                count++;

                if (operationCount >= batchLimit) {
                    await batch.commit();
                    batch = db.batch();
                    operationCount = 0;
                }
            }

            if (operationCount > 0) {
                await batch.commit();
            }

            console.log(`Demoted ${count} ${collectionName} to passive.`);
            return count;
        };

        const [jobsDemoted, usersDemoted] = await Promise.all([
            processCollection("jobs"),
            processCollection("users")
        ]);

        console.log(`Reaper finished. Jobs: ${jobsDemoted}, Users: ${usersDemoted}`);

    } catch (error) {
        console.error("Reaper failed:", error);
        if (process.env.SENTRY_DSN) {
            Sentry.captureException(error);
        }
    }
});
