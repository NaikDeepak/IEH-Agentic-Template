import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import * as Sentry from "@sentry/node";

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

app.post('/api/embedding', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Use GEMINI_API_KEY if available (preferred for this specific feature based on prior context), 
        // fallback to API_KEY.
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

        if (!apiKey) {
            console.error('Missing API Key for embedding');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.embedContent({
            model: "text-embedding-004",
            contents: [
                {
                    parts: [{ text }],
                },
            ],
        });

        if (!response || !response.embeddings || !response.embeddings[0] || !response.embeddings[0].values) {
            throw new Error("Invalid embedding response from Gemini API");
        }

        res.json({ embedding: response.embeddings[0].values });

    } catch (error) {
        console.error('Embedding Generation Error:', error);
        Sentry.captureException(error);
        res.status(500).json({ error: 'Failed to generate embedding' });
    }
});

// All other GET requests serve the index.html (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
