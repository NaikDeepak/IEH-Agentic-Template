import * as jobsService from './jobs.service.js';

export const suggestJobs = async (req, res, next) => {
    try {
        const query = req.query.q;
        if (!query || typeof query !== 'string') {
            return res.json({ suggestions: [] });
        }
        const suggestions = await jobsService.getJobSuggestions(query);
        res.json({ suggestions });
    } catch (error) {
        next(error);
    }
};

export const searchJobs = async (req, res, next) => {
    try {
        const { query: searchQuery, location, city, jobType, experienceLevel, salaryMin, limit = 10 } = req.body;

        if (!searchQuery || typeof searchQuery !== 'string') {
            const error = new Error("Query string is required");
            error.statusCode = 400;
            throw error;
        }

        const parsedSalaryMin = salaryMin != null ? Number(salaryMin) : 0;
        const parsedLimit = Number(limit) || 10;
        const jobs = await jobsService.searchJobs(searchQuery, location, parsedLimit, req.authToken, { city, jobType, experienceLevel, salaryMin: parsedSalaryMin });
        res.json({ jobs });
    } catch (error) {
        next(error);
    }
};
