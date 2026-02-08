import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import * as Sentry from "@sentry/node";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleAuth } from "google-auth-library";
import nodemailer from "nodemailer";

dotenv.config({ path: ".env.production" });
dotenv.config();

// Debug: Check Environment Variables (only in non-production)
if (process.env.NODE_ENV !== 'production') {
    console.log("Server Startup: Checking Environment Variables...");
    console.log("API_KEY present:", !!(process.env.API_KEY || process.env.GEMINI_API_KEY));
    console.log("SENTRY_DSN present:", !!process.env.SENTRY_DSN);
    console.log("FIREBASE_CONFIG present:", !!process.env.FIREBASE_CONFIG);
}


// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

const app = express();

// Enable CORS for all routes
app.use(cors({ origin: true }));
app.use(express.json());

// Auth Middleware
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    req.authToken = null;
    req.user = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        req.authToken = token;

        try {
            const decodedToken = await getAuth().verifyIdToken(token);
            req.user = { ...decodedToken };

            try {
                const userDoc = await db.collection('users').doc(decodedToken.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    req.user.role = userData.role;
                    req.user.employerRole = userData.employerRole;
                }
            } catch (dbError) {
                console.warn(`Failed to fetch user profile for ${decodedToken.uid}:`, dbError.message);
            }
        } catch (error) {
            console.error('Token verification failed:', error.message);
        }
    }
    next();
};

const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.user.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

app.use(authMiddleware);

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

        const expandedText = (typeof response.text === 'function' ? response.text() : null) ||
            response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!expandedText) {
            console.error("Expand Query Response:", JSON.stringify(response, null, 2));
            // Fallback to original query instead of throwing if LLM fails
            console.warn("LLM response empty/invalid, using original query.");
            return originalQuery;
        }

        console.log(`Query Expansion (${context}): "${originalQuery}" -> "${expandedText.substring(0, 100)}..."`);
        return expandedText;
    } catch (error) {
        console.error("Error expanding query:", error);
        return originalQuery;
    }
};

// Helper to generate embedding (reusable)
// Helper to generate embedding (reusable)
export const generateEmbedding = async (text, apiKey) => {
    const ai = new GoogleGenAI({ apiKey });

    // Validated model from listModels()
    const model = "models/text-embedding-004";

    try {
        const response = await ai.models.embedContent({
            model: model,
            contents: [{ parts: [{ text }] }],
            config: {
                outputDimensionality: 1536
            }
        });

        if (response.embedding?.values) {
            console.log(`Generated embedding length: ${response.embedding.values.length}`);
            return response.embedding.values;
        }
        if (response.embeddings?.[0]?.values) {
            console.log(`Generated embedding length: ${response.embeddings[0].values.length}`);
            return response.embeddings[0].values;
        }
    } catch (error) {
        console.error(`Embedding failed with model ${model}:`, error.message);
        throw error;
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

            // Calculate Match Score
            // Handle both plain array and VectorValue object structure
            const vec = Array.isArray(unwrappedData.embedding)
                ? unwrappedData.embedding
                : unwrappedData.embedding?.value;

            let matchScore = 0;
            if (vec && Array.isArray(vec)) {
                // Cosine Similarity = Dot Product (for normalized vectors)
                const dotProduct = vec.reduce((sum, val, i) => sum + val * queryVector[i], 0);
                // Clamp to 0-100
                matchScore = Math.max(0, Math.min(100, Math.round(dotProduct * 100)));
            }

            // Remove large embedding vector from response
            delete unwrappedData.embedding;

            return { id, matchScore, ...unwrappedData };
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

        const text = typeof response.text === 'function' ? response.text() : response.candidates?.[0]?.content?.parts?.[0]?.text;
        res.json({ jd: text });
    } catch (error) {
        handleError(res, error, "generate job description");
    }
};

export const generateJobAssistHandler = async (req, res) => {
    try {
        const { jd } = req.body;
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

        if (!jd) {
            return res.status(400).json({ error: "Job description (jd) is required" });
        }

        if (!apiKey) {
            return res.status(500).json({ error: "Server configuration error: API Key missing" });
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
            You are an expert HR assistant. Based on the following Job Description (JD), provide two things in valid JSON format:
            1. Generate 3-5 screening questions to ask candidates during their application. Each should have a "question" and a "hint" (guidance for the candidate).
            2. Provide 3-5 optimization suggestions to improve the JD (e.g., clarity, missing details, tone).

            JD:
            ${jd}

            Return ONLY a JSON object:
            {
                "questions": [
                    { "question": "...", "hint": "..." }
                ],
                "suggestions": [
                    "...", "..."
                ]
            }
        `;

        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const text = typeof result.text === 'function' ? result.text() : result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error("Gemini response text is empty:", JSON.stringify(result, null, 2));
            throw new Error("Empty response from AI");
        }

        console.log("AI Raw Response:", text);

        // Extract JSON block if present (handles markdown code blocks ```json ... ```)
        let jsonStr = text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        try {
            const data = JSON.parse(jsonStr);
            res.json(data);
        } catch (parseError) {
            console.error("JSON Parse Error. Raw Text:", text);
            console.error("Attempted to parse:", jsonStr);
            throw new Error("AI returned invalid JSON format");
        }
    } catch (error) {
        handleError(res, error, "generate job assist data");
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

        // 1. Expand Query
        const expandedQuery = await expandQuery(searchQuery, "finding a job", apiKey);

        // 2. Generate Embedding
        const queryVector = await generateEmbedding(expandedQuery, apiKey);

        // 3. Run Vector Search with 'active' status filter
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

        // 1. Expand Query
        const expandedQuery = await expandQuery(searchQuery, "finding a candidate", apiKey);

        // 2. Generate Embedding
        const queryVector = await generateEmbedding(expandedQuery, apiKey);

        // 3. Run Vector Search with filters (status=active AND role=seeker)
        const filters = [
            createFilter("status", "active"),
            createFilter("role", "seeker")
        ];

        const candidatesRaw = await runVectorSearch("users", queryVector, filters, limit);

        // 4. Filter out sensitive data
        const candidates = candidatesRaw.map(c => {
            // whitelist public fields
            const {
                id, matchScore, displayName, bio, skills, experience,
                location, photoURL, jobTitle, availability,
                preferredRole, linkedIn, portfolio, github, status
            } = c;

            return {
                id, matchScore, displayName, bio, skills, experience,
                location, photoURL, jobTitle, availability,
                preferredRole, linkedIn, portfolio, github, status
            };
        });

        res.json({ candidates });
    } catch (error) {
        handleError(res, error, "search candidates");
    }
};


// --- Route Definitions ---

app.post("/ai/generate-jd", requireAuth, generateJdHandler);
app.post("/ai/generate-job-assist", requireAuth, generateJobAssistHandler);
app.post("/embedding", requireAuth, embeddingHandler);
app.post("/jobs/search", searchJobsHandler); // Public search allowed? Usually yes, but maybe strictly authenticated? Leaving public for now as per requirements usually, or auth? The frontend uses it. Frontend sends token. Let's keep it open or auth?
// The prompt said "Protect candidates/search".
app.post("/candidates/search", requireAuth, requireRole(['employer', 'admin']), searchCandidatesHandler);

// Keep /api prefix routes for backward compatibility/rewrite logic
app.post("/api/ai/generate-jd", requireAuth, generateJdHandler);
app.post("/api/ai/generate-job-assist", requireAuth, generateJobAssistHandler);
app.post("/api/embedding", requireAuth, embeddingHandler);
app.post("/api/jobs/search", searchJobsHandler);
app.post("/api/candidates/search", requireAuth, requireRole(['employer', 'admin']), searchCandidatesHandler);


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
