import * as aiService from './ai.service.js';

export const generateJD = async (req, res, next) => {
    try {
        const { role, skills, location, type, workMode } = req.body;

        // Log received fields for debugging
        console.log('[ai.controller] generateJD request:', { role, skills, location, type, workMode });

        if (!role) {
            const error = new Error("Job Title (role) is required");
            error.statusCode = 400;
            throw error;
        }

        // Provide defaults for optional fields if they are missing or null
        const safeSkills = skills || "";
        const safeLocation = location || "";
        const safeType = type || "";
        const safeWorkMode = workMode || "";

        const result = await aiService.generateJD(role, safeSkills, safeLocation, safeType, safeWorkMode);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const generateJobAssist = async (req, res, next) => {
    try {
        const { jd } = req.body;
        if (!jd) {
            const error = new Error("Job Description (jd) is required");
            error.statusCode = 400;
            throw error;
        }

        const assistData = await aiService.generateJobAssist(jd);
        res.json(assistData);
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
