import express from 'express';
import * as candidatesController from './candidates.controller.js';

const router = express.Router();

router.post('/search', candidatesController.searchCandidates);

export default router;
