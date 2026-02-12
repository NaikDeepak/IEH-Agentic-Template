import express from 'express';
import * as aiController from './ai.controller.js';

const router = express.Router();

router.post('/generate-jd', aiController.generateJD);
router.post('/generate-job-assist', aiController.generateJobAssist);
router.post('/embedding', aiController.getEmbedding);
router.post('/analyze-resume', aiController.analyzeResume);
router.post('/interview-questions', aiController.generateInterviewQuestions);
router.post('/evaluate-answer', aiController.evaluateInterviewAnswer);
router.post('/assessment', aiController.generateAssessment);
router.post('/outreach', aiController.generateOutreach);
router.post('/skill-gap', aiController.analyzeSkillGap);

export default router;
