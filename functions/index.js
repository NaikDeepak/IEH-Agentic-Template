import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import express from "express";
import { generateJD, generateJobAssist, expandQuery, generateEmbedding } from "./lib/ai/generation.js";
import * as Sentry from "@sentry/node";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

import { marketProxy } from "./src/marketProxy.js";
import * as aiProxy from "./src/ai/proxy.js";
import * as userHandlers from "./src/user/handlers.js";
import * as growthHandlers from "./src/growth/handlers.js";
import rateLimit from "express-rate-limit";

dotenv.config({ path: ".env.production" });
dotenv.config();

// Unified Constants for AI (Single Source of Truth) - Moved to src/lib/ai/generation.js


// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

const app = express();

// Enable CORS for allowed origins
const allowedOrigins = [
    "https://india-emp-hub.web.app",
    "https://india-emp-hub.firebaseapp.com",
    "https://india-emp-hub-dev.web.app",
    "https://india-emp-hub-dev.firebaseapp.com",
    "https://ieh.vercel.app" // Placeholder for Vercel domain
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl) - though we might want to tighten this for web-only
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.json());

// Debug: Log all requests (Only in non-production)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[API Request] ${req.method} ${req.originalUrl || req.url}`);
        console.log(`[API Headers]`, JSON.stringify(req.headers, null, 2));
        next();
    });
}

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
                // Prefer role from Custom Claims (Token) for performance and security
                if (decodedToken.role) {
                    req.user.role = decodedToken.role;
                } else {
                    // Fallback to Firestore during transition or for legacy users
                    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        req.user.role = userData.role;
                        req.user.employerRole = userData.employerRole;
                    }
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

// Rate limiter for AI proxy endpoints
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Initialize Sentry
if (process.env.SENTRY_DSN) {
    const isProd = process.env.NODE_ENV === 'production';
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        enableLogs: true,
        integrations: [
            Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
        ],
        tracesSampleRate: isProd ? 0.2 : 1.0,
    });
}

// Helper to handle errors with details
const handleError = (res, error, context) => {
    const isProd = process.env.NODE_ENV === "production";
    console.error(`${context} Error:`, error);

    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error);
    }

    res.status(500).json({
        error: `Failed to ${context}`,
        ...(isProd
            ? {}
            : { details: error?.message, stack: error?.stack }),
    });
};

// --- API Logic via Helper Functions ---

// Helper to expand query using LLM logic moved to src/lib/ai/generation.js

// Helper to generate embedding logic moved to src/lib/ai/generation.js

// Helper to run vector search via Firebase Admin SDK
const runVectorSearch = async (collectionName, queryVector, filters = [], limit = 10) => {
    if (!queryVector || !Array.isArray(queryVector)) {
        throw new Error("Invalid queryVector: must be an array");
    }

    console.log(`[VectorSearch] Running on ${collectionName}, vector length: ${queryVector.length}`);

    const collRef = db.collection(collectionName);
    const vectorValue = FieldValue.vector(queryVector);

    const vectorQuery = collRef.findNearest({
        vectorField: 'embedding',
        queryVector: vectorValue,
        limit: Number(limit),
        distanceMeasure: 'COSINE'
    });

    const snapshot = await vectorQuery.get();

    const results = snapshot.docs.map(doc => {
        const data = doc.data();

        // Unpack embedding — Admin SDK returns a VectorValue object
        let vec = data.embedding;
        if (vec && typeof vec.toArray === 'function') vec = vec.toArray();

        let matchScore = 0;
        if (Array.isArray(vec)) {
            const len = Math.min(vec.length, queryVector.length);
            const magA = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
            const magB = Math.sqrt(queryVector.reduce((s, v) => s + v * v, 0));
            if (magA && magB) {
                let dot = 0;
                for (let i = 0; i < len; i++) dot += vec[i] * queryVector[i];
                matchScore = Math.max(0, Math.min(100, Math.round((dot / (magA * magB)) * 100)));
            }
        }

        delete data.embedding;
        return { id: doc.id, matchScore, ...data };
    });

    // Apply post-filters (e.g. status === 'active')
    if (filters.length > 0) {
        return results.filter(item =>
            filters.every(filter => {
                if (filter.fieldFilter?.op === 'EQUAL') {
                    const field = filter.fieldFilter.field.fieldPath;
                    const val = filter.fieldFilter.value.stringValue;
                    return item[field] === val;
                }
                return true;
            })
        );
    }

    return results;
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
    return Sentry.startSpan({
        op: "ai.generate-jd",
        name: "Generate Job Description"
    }, async (span) => {
        try {
            const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
            const { role, skills, experience, location, type, workMode } = req.body;

            if (!role || typeof role !== 'string') {
                return res.status(400).json({ error: "Job Title (role) is required" });
            }

            span.setAttribute("role", role);

            if (!apiKey) {
                return res.status(500).json({ error: "Server configuration error: API Key missing" });
            }

            const data = await generateJD(req.body, apiKey);
            res.json(data);
        } catch (error) {
            handleError(res, error, "generate job description");
        }
    });
};

export const generateJobAssistHandler = async (req, res) => {
    return Sentry.startSpan({
        op: "ai.job-assist",
        name: "Generate Job Assistant Tips"
    }, async (span) => {
        try {
            const { jd } = req.body;
            const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

            if (!jd || typeof jd !== 'string') {
                return res.status(400).json({ error: "Job description (jd) is required" });
            }

            span.setAttribute("jd_length", jd.length);

            if (!apiKey) {
                return res.status(500).json({ error: "Server configuration error: API Key missing" });
            }

            const data = await generateJobAssist(jd, apiKey);
            res.json(data);
        } catch (error) {
            handleError(res, error, "generate job assist data");
        }
    });
};

export const embeddingHandler = async (req, res) => {
    return Sentry.startSpan({
        op: "ai.embedding",
        name: "Generate Text Embedding"
    }, async (span) => {
        try {
            const rawText = req.body?.text;
            if (typeof rawText !== "string") return res.status(400).json({ error: "Text is required" });

            const text = rawText.trim();
            if (!text) return res.status(400).json({ error: "Text is required" });
            if (text.length > 5000) return res.status(413).json({ error: "Text is too long" });

            span.setAttribute("text_length", text.length);

            const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
            if (!apiKey) return res.status(500).json({ error: "Server configuration error: Gemini API Key missing" });

            const values = await generateEmbedding(text, apiKey);
            res.json({ embedding: values });
        } catch (error) {
            handleError(res, error, "generate embedding");
        }
    });
};

export const searchJobsHandler = async (req, res) => {
    return Sentry.startSpan({
        op: "ai.search-jobs",
        name: "Semantic Job Search"
    }, async (span) => {
        try {
            const { query: searchQuery, limit = 10 } = req.body;
            if (!searchQuery || typeof searchQuery !== "string") return res.status(400).json({ error: "Query string is required" });

            span.setAttribute("query", searchQuery);

            const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
            if (!apiKey) return res.status(500).json({ error: "Server configuration error: Gemini API Key missing" });

            const expandedQuery = await expandQuery(searchQuery, "finding a job", apiKey);
            const queryVector = await generateEmbedding(expandedQuery, apiKey);
            const filters = [createFilter("status", "active")];
            const jobs = await runVectorSearch("jobs", queryVector, filters, limit);
            res.json({ jobs });
        } catch (error) {
            handleError(res, error, "search jobs");
        }
    });
};

export const suggestJobsHandler = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || typeof query !== 'string' || query.trim().length < 2) {
            return res.json({ suggestions: [] });
        }

        const SUGGEST_SCAN_LIMIT = 150;
        const SUGGEST_SKILL_WEIGHT = 0.4;
        const SUGGEST_MIN_SCORE = 0.1;

        const getTrigrams = (str) => {
            const s = '  ' + str.toLowerCase() + '  ';
            const trigrams = new Set();
            for (let i = 0; i < s.length - 2; i++) trigrams.add(s.slice(i, i + 3));
            return trigrams;
        };

        const trigramSimilarity = (a, b) => {
            const ta = getTrigrams(a);
            const tb = getTrigrams(b);
            let intersection = 0;
            ta.forEach(t => { if (tb.has(t)) intersection++; });
            return (2 * intersection) / (ta.size + tb.size);
        };

        const snapshot = await db.collection('jobs')
            .where('status', '==', 'active')
            .select('title', 'skills')
            .limit(SUGGEST_SCAN_LIMIT)
            .get();

        const q = query.toLowerCase();
        const seen = new Set();
        const suggestions = snapshot.docs
            .map(doc => {
                const { title = '', skills = [] } = doc.data();
                const skillText = Array.isArray(skills) ? skills.join(' ') : String(skills);
                const score = trigramSimilarity(q, title) + trigramSimilarity(q, skillText) * SUGGEST_SKILL_WEIGHT;
                return { title, score };
            })
            .filter(({ title, score }) => {
                if (score < SUGGEST_MIN_SCORE || seen.has(title.toLowerCase())) return false;
                seen.add(title.toLowerCase());
                return true;
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(({ title }) => title);

        res.json({ suggestions });
    } catch (error) {
        handleError(res, error, "suggest jobs");
    }
};

export const searchCandidatesHandler = async (req, res) => {
    return Sentry.startSpan({
        op: "ai.search-candidates",
        name: "Semantic Candidate Search"
    }, async (span) => {
        try {
            const { query: searchQuery, limit = 10 } = req.body;
            if (!searchQuery || typeof searchQuery !== "string") return res.status(400).json({ error: "Query string is required" });

            span.setAttribute("query", searchQuery);

            const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
            if (!apiKey) return res.status(500).json({ error: "Server configuration error: Gemini API Key missing" });

            const expandedQuery = await expandQuery(searchQuery, "finding a candidate", apiKey);
            const queryVector = await generateEmbedding(expandedQuery, apiKey);

            const filters = [
                createFilter("status", "active"),
                createFilter("role", "seeker")
            ];

            const candidatesRaw = await runVectorSearch("users", queryVector, filters, limit);

            const candidates = candidatesRaw.map(c => {
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
    });
};


// --- Route Definitions ---

app.post("/ai/generate-jd", requireAuth, generateJdHandler);
app.post("/ai/generate-job-assist", requireAuth, generateJobAssistHandler);
app.post("/embedding", requireAuth, embeddingHandler);
app.get("/jobs/suggest", suggestJobsHandler);
app.post("/jobs/search", searchJobsHandler);
app.post("/candidates/search", requireAuth, requireRole(['employer', 'admin']), searchCandidatesHandler);

// Keep /api prefix routes for backward compatibility/rewrite logic
app.post("/api/ai/generate-jd", requireAuth, generateJdHandler);
app.post("/api/ai/generate-job-assist", requireAuth, generateJobAssistHandler);
app.post("/api/ai/embedding", requireAuth, embeddingHandler);
app.post("/api/embedding", requireAuth, embeddingHandler);
app.get("/api/jobs/suggest", suggestJobsHandler);
app.post("/api/jobs/search", searchJobsHandler);
app.post("/api/candidates/search", requireAuth, requireRole(['employer', 'admin']), searchCandidatesHandler);

// AI Proxy Routes (Authenticated)
app.post("/api/ai/analyze-resume", requireAuth, aiLimiter, aiProxy.analyzeResumeProxy);
app.post("/api/ai/skill-gap", requireAuth, aiLimiter, aiProxy.analyzeSkillGapProxy);
app.post("/api/ai/interview-questions", requireAuth, aiLimiter, aiProxy.generateQuestionsProxy);
app.post("/api/ai/evaluate-answer", requireAuth, aiLimiter, aiProxy.evaluateAnswerProxy);
app.post("/api/ai/assessment", requireAuth, aiLimiter, aiProxy.generateAssessmentProxy);
app.post("/api/ai/outreach", requireAuth, aiLimiter, aiProxy.generateOutreachProxy);

// User & Onboarding Routes
app.post("/api/user/onboard", requireAuth, userHandlers.onboardUser);
app.post("/api/user/verify-phone", requireAuth, userHandlers.verifyPhone);

// Growth Routes
app.get("/api/growth/referrals", requireAuth, growthHandlers.getReferrals);
app.post("/api/growth/referrals", requireAuth, growthHandlers.getReferrals);


// Expose the Express API as a single Cloud Function
export const api = onRequest(app);
export { marketProxy };

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

// --- Firestore Triggers ---
export * from "./src/triggers/onApplicationCreate.js";
export * from "./src/triggers/onJobCreate.js";
export * from "./src/triggers/onUserUpdate.js";

