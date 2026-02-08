import * as candidatesService from './candidates.service.js';

export const searchCandidates = async (req, res, next) => {
    try {
        const { query: searchQuery, limit = 10 } = req.body;

        if (!searchQuery || typeof searchQuery !== 'string') {
            const error = new Error("Query string is required");
            error.statusCode = 400;
            throw error;
        }

        const candidates = await candidatesService.searchCandidates(searchQuery, limit, req.authToken);
        res.json({ candidates });
    } catch (error) {
        next(error);
    }
};
