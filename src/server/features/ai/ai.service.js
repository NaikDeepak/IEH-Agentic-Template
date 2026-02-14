import { config } from '../../config/index.js';
import {
    generateJD as genJD,
    generateJobAssist as genAssist,
    generateEmbedding as genEmbed,
    analyzeResume as genAnalyze,
    generateInterviewQuestions as genInterview,
    evaluateInterviewAnswer as genEvaluate,
    generateSkillAssessment as genAssessment,
    generateOutreachMessage as genOutreach,
    analyzeSkillGap as genSkillGap
} from '../../../lib/ai/generation.js';

export const generateJD = async (job, companyContext) => {
    return await genJD({ job, companyContext }, config.apiKey);
};

export const generateJobAssist = async (jd) => {
    return await genAssist(jd, config.apiKey);
};

export const getEmbedding = async (text) => {
    return await genEmbed(text, config.apiKey);
};

export const analyzeResume = async (promptParts, systemPrompt) => {
    return await genAnalyze(promptParts, systemPrompt, config.apiKey);
};

export const generateInterviewQuestions = async (prompt) => {
    return await genInterview(prompt, config.apiKey);
};

export const evaluateInterviewAnswer = async (prompt) => {
    return await genEvaluate(prompt, config.apiKey);
};

export const generateAssessment = async (skill, systemPrompt) => {
    return await genAssessment(skill, systemPrompt, config.apiKey);
};

export const generateOutreach = async (prompt) => {
    return await genOutreach(prompt, config.apiKey);
};

export const analyzeSkillGap = async (prompt) => {
    return await genSkillGap(prompt, config.apiKey);
};
