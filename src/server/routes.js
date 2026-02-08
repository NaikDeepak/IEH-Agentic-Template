import express from 'express';
import aiRoutes from './features/ai/ai.routes.js';
import jobsRoutes from './features/jobs/jobs.routes.js';
import candidatesRoutes from './features/candidates/candidates.routes.js';

const router = express.Router();

router.use('/ai', aiRoutes);
router.use('/', aiRoutes); // Allow /api/embedding and /api/ai/embedding
router.use('/jobs', jobsRoutes);
router.use('/candidates', candidatesRoutes);

// Compatibility aliases for legacy frontend if needed, but we should aim for standardized routes.
// The frontend currently calls:
// /api/ai/generate-jd  -> /api/v1/ai/generate-jd
// /api/embedding -> /api/v1/ai/embedding
// /api/jobs/search -> /api/v1/jobs/search
// /api/candidates/search -> /api/v1/candidates/search

export default router;
