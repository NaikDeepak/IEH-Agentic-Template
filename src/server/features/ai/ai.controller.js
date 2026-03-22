import * as aiService from './ai.service.js';

export const generateJD = async (req, res, next) => {
    try {
        const { role, skills, experience, location, type, workMode, companyContext } = req.body;

        // Log received fields for debugging
        console.log('[ai.controller] generateJD request:', { role, skills, experience, location, type, workMode, hasCompanyContext: !!companyContext });

        if (!role) {
            const error = new Error("Job Title (role) is required");
            error.statusCode = 400;
            throw error;
        }

        const job = {
            role,
            skills: skills || "",
            experience: experience || "",
            location: location || "",
            type: type || "",
            workMode: workMode || ""
        };

        const result = await aiService.generateJD(job, companyContext);
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

export const buildCV = async (req, res, next) => {
    try {
        const { name, targetRole, skills, experienceBullets, educationBullets, extraContext } = req.body;

        if (!targetRole || typeof targetRole !== 'string' || !targetRole.trim()) {
            const error = new Error("Target role is required");
            error.statusCode = 400;
            throw error;
        }

        // Validate shapes and enforce size limits to prevent oversized prompts / cost abuse
        const MAX_SHORT = 200;
        const MAX_LONG = 3000;

        if (name && (typeof name !== 'string' || name.length > MAX_SHORT)) {
            const error = new Error(`name must be a string under ${MAX_SHORT} characters`);
            error.statusCode = 400;
            throw error;
        }
        if (targetRole.length > MAX_SHORT) {
            const error = new Error(`targetRole must be under ${MAX_SHORT} characters`);
            error.statusCode = 400;
            throw error;
        }
        if (skills !== undefined && !Array.isArray(skills)) {
            const error = new Error("skills must be an array of strings");
            error.statusCode = 400;
            throw error;
        }
        if (Array.isArray(skills) && (skills.length > 50 || skills.some(s => typeof s !== 'string' || s.length > 100))) {
            const error = new Error("skills must be an array of up to 50 strings, each under 100 characters");
            error.statusCode = 400;
            throw error;
        }
        if (experienceBullets && (typeof experienceBullets !== 'string' || experienceBullets.length > MAX_LONG)) {
            const error = new Error(`experienceBullets must be a string under ${MAX_LONG} characters`);
            error.statusCode = 400;
            throw error;
        }
        if (educationBullets && (typeof educationBullets !== 'string' || educationBullets.length > MAX_LONG)) {
            const error = new Error(`educationBullets must be a string under ${MAX_LONG} characters`);
            error.statusCode = 400;
            throw error;
        }
        if (extraContext && (typeof extraContext !== 'string' || extraContext.length > MAX_LONG)) {
            const error = new Error(`extraContext must be a string under ${MAX_LONG} characters`);
            error.statusCode = 400;
            throw error;
        }

        const result = await aiService.buildCV({ name, targetRole, skills, experienceBullets, educationBullets, extraContext });
        res.json(result);
    } catch (error) {
        next(error);
    }
};
