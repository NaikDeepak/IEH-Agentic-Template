import express from 'express';
import * as userController from './user.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

router.post('/onboard', requireAuth, userController.onboardUser);
router.post('/verify-phone', requireAuth, userController.verifyPhone);
router.post('/verify-linkedin', requireAuth, userController.verifyLinkedin);

export default router;
