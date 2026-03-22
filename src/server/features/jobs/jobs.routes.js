import express from 'express';
import * as jobsController from './jobs.controller.js';

const router = express.Router();

router.post('/search', jobsController.searchJobs);
router.get('/suggest', jobsController.suggestJobs);

export default router;
