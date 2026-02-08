import express from 'express';
import * as jobsController from './jobs.controller.js';

const router = express.Router();

router.post('/search', jobsController.searchJobs);

export default router;
