import express from 'express';
import * as aiController from './ai.controller.js';

const router = express.Router();

router.post('/generate-jd', aiController.generateJD);
router.post('/generate-job-assist', aiController.generateJobAssist);
router.post('/embedding', aiController.getEmbedding);

export default router;
