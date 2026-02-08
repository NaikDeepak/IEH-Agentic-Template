import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import routes from './routes.js';

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// We are in src/server, so build is in ../../dist or similar.
// Actually, index.js is in root, dist is in root.
// So relative to src/server, dist is ../../dist
const DIST_PATH = path.join(__dirname, '../../dist');

const app = express();

// Standard Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(authMiddleware);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Mount Routes
// Mobile App should use /api/v1
app.use('/api/v1', routes);

// Generic /api fallback for backward compatibility
app.use('/api', routes);

// Serve Static Files (SPA)
app.use(express.static(DIST_PATH));

// Catch-all for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
});

// Error Handler (must be last)
app.use(errorHandler);

export { app };
