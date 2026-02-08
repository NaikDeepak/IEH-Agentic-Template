import * as jobsService from './jobs.service.js';

export const searchJobs = async (req, res, next) => {
    try {
        const { query: searchQuery, location, limit = 10 } = req.body;

        if (!searchQuery || typeof searchQuery !== 'string') {
            const error = new Error("Query string is required");
            error.statusCode = 400;
            throw error;
        }

        const jobs = await jobsService.searchJobs(searchQuery, location, limit, req.authToken);
        res.json({ jobs });
    } catch (error) {
        next(error);
    }
};
