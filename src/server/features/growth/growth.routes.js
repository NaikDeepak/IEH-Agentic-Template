import express from 'express';
import * as growthController from './growth.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// Frontend calls POST (sends auth token in body/headers, no request body).
// Backend accepts both GET and POST to handle the method mismatch gracefully.
router.get('/referrals', requireAuth, growthController.getReferrals);
router.post('/referrals', requireAuth, growthController.getReferrals);

export default router;
