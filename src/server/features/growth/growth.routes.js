import express from 'express';
import * as growthController from './growth.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

router.get('/referrals', requireAuth, growthController.getReferrals);

export default router;
