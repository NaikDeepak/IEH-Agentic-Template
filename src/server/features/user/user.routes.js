import express from 'express';
import * as userController from './user.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

router.post('/onboard', requireAuth, userController.onboardUser);

export default router;
