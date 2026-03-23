import express from 'express';
import * as aiController from './ai.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// All AI routes invoke paid Gemini generation — require a verified Firebase ID token.
router.post('/generate-jd', requireAuth, aiController.generateJD);
router.post('/generate-job-assist', requireAuth, aiController.generateJobAssist);
router.post('/embedding', requireAuth, aiController.getEmbedding);
router.post('/analyze-resume', requireAuth, aiController.analyzeResume);
router.post('/interview-questions', requireAuth, aiController.generateInterviewQuestions);
router.post('/evaluate-answer', requireAuth, aiController.evaluateInterviewAnswer);
router.post('/assessment', requireAuth, aiController.generateAssessment);
router.post('/outreach', requireAuth, aiController.generateOutreach);
router.post('/skill-gap', requireAuth, aiController.analyzeSkillGap);
router.post('/build-cv', requireAuth, aiController.buildCV);

export default router;
