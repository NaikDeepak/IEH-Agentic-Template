import express from 'express';
import * as aiController from './ai.controller.js';

const router = express.Router();

router.post('/generate-jd', aiController.generateJD);
router.post('/embedding', aiController.getEmbedding); // Keeping generic /embedding under /ai prefix? Or global?
// Original was /api/ai/generate-jd and /api/embedding.
// Providing consistent /api/v1/ai/embedding seems reasonable.
// If valid backward compatibility is needed, we will handle that in app.js or routes.js

export default router;
