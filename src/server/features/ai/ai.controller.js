import * as aiService from './ai.service.js';

export const generateJD = async (req, res, next) => {
    try {
        const { role, skills, experience, location, type, workMode } = req.body;

        // Log received fields for debugging
        console.log('[ai.controller] generateJD request:', { role, skills, experience, location, type, workMode });

        if (!role) {
            const error = new Error("Job Title (role) is required");
            error.statusCode = 400;
            throw error;
        }

        // Provide defaults for optional fields if they are missing or null
        const safeSkills = skills || "";
        const safeExperience = experience || "";
        const safeLocation = location || "";
        const safeType = type || "";
        const safeWorkMode = workMode || "";

        const result = await aiService.generateJD(role, safeSkills, safeExperience, safeLocation, safeType, safeWorkMode);
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

export const analyzeResume = async (req, res, next) => {
    try {
        const { promptParts, systemPrompt } = req.body;
        if (!promptParts || !systemPrompt) {
            const error = new Error("Prompt parts and system prompt are required");
            error.statusCode = 400;
            throw error;
        }

        const result = await aiService.analyzeResume(promptParts, systemPrompt);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const generateInterviewQuestions = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            const error = new Error("Prompt is required");
            error.statusCode = 400;
            throw error;
        }
        const result = await aiService.generateInterviewQuestions(prompt);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const evaluateInterviewAnswer = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            const error = new Error("Prompt is required");
            error.statusCode = 400;
            throw error;
        }
        const result = await aiService.evaluateInterviewAnswer(prompt);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const generateAssessment = async (req, res, next) => {
    try {
        const { skill, systemPrompt } = req.body;
        if (!skill || !systemPrompt) {
            const error = new Error("Skill and systemPrompt are required");
            error.statusCode = 400;
            throw error;
        }
        const result = await aiService.generateAssessment(skill, systemPrompt);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const generateOutreach = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            const error = new Error("Prompt is required");
            error.statusCode = 400;
            throw error;
        }
        const result = await aiService.generateOutreach(prompt);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const analyzeSkillGap = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            const error = new Error("Prompt is required");
            error.statusCode = 400;
            throw error;
        }
        const result = await aiService.analyzeSkillGap(prompt);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
