import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/index.js';
import { CONSTANTS } from '../../config/constants.js';
import { generateEmbedding } from '../../lib/gemini.js';

const ai = new GoogleGenAI({ apiKey: config.apiKey });

export const generateJD = async (role, skills, experience) => {
    const response = await ai.models.generateContent({
        model: CONSTANTS.AI.MODEL_FAST,
        contents: `Generate a professional job description for a ${role} with skills: ${skills} and experience: ${experience}.`,
    });
    return response.text;
};

export const getEmbedding = async (text) => {
    return await generateEmbedding(text);
};
