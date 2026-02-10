import { config } from '../../config/index.js';
import { generateJD as genJD, generateJobAssist as genAssist, generateEmbedding as genEmbed } from '../../../lib/ai/generation.js';

export const generateJD = async (role, skills, location, type, workMode) => {
    return await genJD({ role, skills, location, type, workMode }, config.apiKey);
};

export const generateJobAssist = async (jd) => {
    return await genAssist(jd, config.apiKey);
};

export const getEmbedding = async (text) => {
    return await genEmbed(text, config.apiKey);
};
