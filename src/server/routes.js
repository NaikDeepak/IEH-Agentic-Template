import express from 'express';
import * as aiController from './features/ai/ai.controller.js';
import aiRoutes from './features/ai/ai.routes.js';
import jobsRoutes from './features/jobs/jobs.routes.js';
import candidatesRoutes from './features/candidates/candidates.routes.js';
import userRoutes from './features/user/user.routes.js';

const router = express.Router();

// Standardized routes
router.use('/ai', aiRoutes);
router.use('/user', userRoutes);

// Compatibility aliases for legacy frontend
// These allow /api/v1/embedding and /api/v1/generate-jd to still work
router.post('/embedding', aiController.getEmbedding);
router.post('/generate-jd', aiController.generateJD);

router.use('/jobs', jobsRoutes);
router.use('/candidates', candidatesRoutes);

// Compatibility aliases for legacy frontend if needed, but we should aim for standardized routes.
// The frontend currently calls:
// /api/ai/generate-jd  -> /api/v1/ai/generate-jd
// /api/embedding -> /api/v1/ai/embedding
// /api/jobs/search -> /api/v1/jobs/search
// /api/candidates/search -> /api/v1/candidates/search

export default router;
