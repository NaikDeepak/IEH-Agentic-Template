import express from 'express';
import * as candidatesController from './candidates.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = express.Router();

router.post('/search', requireAuth, requireRole(['employer', 'admin']), candidatesController.searchCandidates);

export default router;
