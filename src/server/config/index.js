import 'dotenv/config';

export const config = {
    port: process.env.PORT || 8001,
    env: process.env.NODE_ENV || 'development',
    apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY,
    sentryDsn: process.env.SENTRY_DSN,
    firebase: {
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'india-emp-hub',
        apiKey: process.env.VITE_FIREBASE_API_KEY,
    }
};

if (!config.apiKey) {
    console.warn("WARNING: GEMINI_API_KEY or API_KEY is not set. AI features will fail.");
}
