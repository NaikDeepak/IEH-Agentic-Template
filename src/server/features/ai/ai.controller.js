import * as aiService from './ai.service.js';

export const generateJD = async (req, res, next) => {
    try {
        const { role, skills, experience } = req.body;
        if (!role || !skills || !experience) {
            const error = new Error("Missing required fields: role, skills, experience");
            error.statusCode = 400;
            throw error;
        }

        const jd = await aiService.generateJD(role, skills, experience);
        res.json({ jd });
    } catch (error) {
        next(error);
    }
};

export const getEmbedding = async (req, res, next) => {
    try {
        const rawText = req.body?.text;
        if (typeof rawText !== 'string' || !rawText.trim()) {
            const error = new Error("Text is required");
            error.statusCode = 400;
            throw error;
        }

        if (rawText.length > 5000) {
            const error = new Error("Text is too long");
            error.statusCode = 413;
            throw error;
        }

        const embedding = await aiService.getEmbedding(rawText.trim());
        res.json({ embedding });
    } catch (error) {
        next(error);
    }
};
